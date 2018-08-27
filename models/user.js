const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  username:{
  	type:String
  },
  password:{
  	type:String
  },
  isAdmin:{//判断是不是管理员
  	type:Boolean,
  	default:false
  },
  email:{
    type:String,
  },
  phone:{
    type:String
  }
},{
  timestamps:true //createdAt and updatedAt什么时间注册,什么时间更新
});


const UserModel = mongoose.model('User', UserSchema);

module.exports = UserModel;