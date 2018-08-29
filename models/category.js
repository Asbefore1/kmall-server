const mongoose = require('mongoose');
const pagination=require('../util/pagination.js');
const CategorySchema = new mongoose.Schema({
    name:{
        type:String
    },
    order:{
      	type:Number,
      	default:0
    },
    pid:{
      	type:String
    }
},
{
    timestamps:true //createdAt and updatedAt什么时间注册,什么时间更新
});

//静态方法
CategorySchema.statics.getPaginationCategories = function(currentPage,query={}){
    return new Promise((resolve,reject)=>{
        let options = {
            page:currentPage,//从前台拿到当前页 //query是一个对象
            model:this, //操作的数据模型
            query:query, //查询条件,查询所有
            projection:'_id name order pid',//投影
            sort:{_id:1} //排序
        }
        pagination(options)
        .then((data)=>{
            resolve(data); 
        })
    })
}

const CategoryModel = mongoose.model('Category', CategorySchema);

module.exports = CategoryModel;