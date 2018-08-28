const mongoose = require('mongoose');

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
},{
  timestamps:true //createdAt and updatedAt什么时间注册,什么时间更新
});


const CategoryModel = mongoose.model('Category', CategorySchema);

module.exports = CategoryModel;