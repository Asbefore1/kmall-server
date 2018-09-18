const mongoose = require('mongoose');

//每一个产品
const cartItemSchema=new mongoose.Schema({
  product:{
    type:mongoose.Schema.Types.ObjectId,
    ref:'Product'//关联查询用到
  },
  count:{
    type:Number,
    default:0
  },
  individualPrice:{
    type:Number,
    default:0
  },
  checked:{
    type:Boolean,
    default:true
  }
})


const cartSchema=new mongoose.Schema({
  cartList:{//每一个产品
    type:[cartItemSchema]//是一个数组
  },
  allChecked:{
    type:Boolean,
    default:true
  },
  totalCartPrice:{
    type:Number,
    default:0
  }
})


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
  },
  cart:{
    type:cartSchema
  }
},{
  timestamps:true //createdAt and updatedAt什么时间注册,什么时间更新
});


const UserModel = mongoose.model('User', UserSchema);

module.exports = UserModel;