const mongoose = require('mongoose');
const pagination=require('../util/pagination.js');
const ProductSchema = new mongoose.Schema({
    sonId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Category'//关联查询用到
    },
    Image:{
        type:String
    },
    description:{
        type:String
    },
    detail:{
        type:String
    },
    name:{
        type:String
    },
    price:{
        type:String
    },   
    stock:{
        type:String
    },
    order:{
      	type:Number,
      	default:0
    },
    status:{
        type:String,
        default:'0'//0是在售 1是下架
    }
},
    {
        timestamps:true //createdAt and updatedAt什么时间注册,什么时间更新
    });

//静态方法
ProductSchema.statics.getPaginationCategories = function(currentPage,query={}){
    return new Promise((resolve,reject)=>{
        let options = {
            page:currentPage,//从前台拿到当前页 //query是一个对象
            model:this, //操作的数据模型
            query:query, //查询条件,查询所有
            projection:'name _id price order status',//投影
            sort:{_id:1}, //排序
            // populate:[{path:'sonId',select:'_id pid'}]//关联查询
        }
        pagination(options)
        .then((data)=>{
            resolve(data); 
        })
    })
}

const ProductModel = mongoose.model('Product', ProductSchema);

module.exports = ProductModel;