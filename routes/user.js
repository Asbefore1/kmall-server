const Router=require('express').Router;
const router=Router();
const UserModel=require('../models/user.js');
const hmac=require('../util/hmac.js');

/*
//插入用户信息(在地址栏里面直接输入使用get请求)
//服务器是3001端口,在地址栏输入3001找数据
router.get('/init',(req,res)=>{
	const users=[];
	for(let i=0;i<100;i++){
		users.push({
			username:'test'+i,
			password:hmac('test'+i),
			isAdmin:false,
			email:'test'+i+'@jingdong.com',
			phone:'156038000'+i
		})
	}
	UserModel.create(users)
	.then((result)=>{
		res.send('ok')
	})
	.catch((err)=>{
		res.send('err::::',err)
	})
})
*/









//注册用户
router.post('/register',(req,res)=>{
	// console.log(req.body);
	let body=req.body;
	//定义返回数据
	let	result={
		code:0,//0代表成功
		errmessage:'',	
	}
	UserModel
	.findOne({username:body.username})//返回一个promise对象
	.then((user)=>{
		if(user){//已经有该用户
			result.code=10;
			result.errmessage='该用户已存在,请重新注册用户';
			res.json(result);
		}else{//没有注册过就插入存到数据库
			new UserModel({
				username:body.username,
				password:hmac(body.password),
				// isAdmin:true
			})
			.save((err,newUser)=>{
				if(!err){//插入数据库成功
					res.json(result);
				}else{//插入数据库失败
					result.code=10;
					result.errmessage='注册失败';
					res.json(result);
				}
			})
		}
	})
})


//登录用户
router.post('/login',(req,res)=>{
	// console.log(req.body);
	let body=req.body;
	//定义返回数据
	let result={
		code:0,//0代表成功
		errmessage:''
	}
	UserModel  //数据库里查找用户名和密码
	.findOne({username:body.username,password:hmac(body.password)})//返回一个promise对象
	.then((user)=>{//user就是查出来的用户名和密码这个对象
		if(user){
			/*
			result.data={//获取到数据库里的数据
				_id:user._id,
				username:user.username,
				isAdmin:user.isAdmin
			}
			//设置cookies
			req.cookies.set('userInfo',JSON.stringify(result.data));
			res.json(result)
			//把带cookies的数据(键就是userinfo,id就是值)和result里面的数据返回到前端页面
			*/
		
			req.session.userInfo={//在前台layout使用
				_id:user._id,
				username:user.username,
				isAdmin:user.isAdmin
			}
			res.json(result);  //result.code  result.errmessage  result.data
			// console.log(result)
		}else{
			result.code=10,
			result.errmessage='用户名或密码错误',
			res.json(result);
		}
	})
})


//退出处理
router.get('/logout',(req,res)=>{
	// console.log('ssssss')
	let result={
		code:0,//0代表成功
		errmessage:''
	}
	// req.cookies.set('userInfo',null);
	req.session.destroy();
	res.json(result);
})
module.exports=router;