const mongoose = require('mongoose');
const pagination=require('../util/pagination.js');

const CommentSchema = new mongoose.Schema({
  article:{
  	type:mongoose.Schema.Types.ObjectId,
  	ref:'Article'//关联查询用到
  },
  user:{
    type:mongoose.Schema.Types.ObjectId,
    ref:'User'
  },
  content:{
  	type:String
  }, 
  createdAt:{
  	type:Date,
  	default:Date.now
  }
})



CommentSchema.statics.getPaginationComments = function(req,query={}){//做成静态方法
    return new Promise((resolve,reject)=>{
      let options = {
        page:req.query.page,//需要显示的页码
        model:this, //CommentModel来调,是CommentModel上静态方法
        query:query, //查询条件
        projection:'-__v', //投影，
        sort:{_id:-1}, //排序
        populate:[{path:'article',select:'title'},{path:'user',select:'username'}]
      }
      pagination(options)
      .then((data)=>{
        resolve(data); 
      })
    })
}

const CommentModel = mongoose.model('Comment', CommentSchema);

module.exports = CommentModel;