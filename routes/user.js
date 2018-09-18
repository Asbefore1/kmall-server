const Router=require('express').Router;
const router=Router();
const UserModel=require('../models/user.js');
const ProductModel=require('../models/product.js');
const hmac=require('../util/hmac.js');




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
			result.code=1;
			result.errmessage='该用户已存在,请重新注册用户';
			res.json(result);
		}else{//没有注册过就插入存到数据库
			new UserModel({
				username:body.username,
				phone:body.phone,
				email:body.email,
				password:hmac(body.password),
				isAdmin:false
			})
			.save((err,newUser)=>{
				if(!err){//插入数据库成功
					res.json(result);
				}else{//插入数据库失败
					result.code=1;
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
	.findOne({username:body.username,password:hmac(body.password),isAdmin:false})//返回一个promise对象
	.then((user)=>{//user就是查出来的用户名和密码这个对象
		if(user){
			req.session.userInfo={//在前台layout使用
				_id:user._id,
				username:user.username,
				isAdmin:user.isAdmin
			}
			res.json(result);  //code  errmessage 
			// console.log(result)
		}else{
			result.code=1,
			result.errmessage='用户名或密码错误',
			res.json(result);
		}
	})
})


//判断用户名是否已注册
router.get('/checkUsername',(req,res)=>{
	let username=req.query.username;
	UserModel  //数据库里查找用户名
	.findOne({username:username})//返回一个promise对象
	.then((username)=>{//该用户名已被注册
		if(username){
			res.json({
				code:1,
				errmessage:'该用户名已被注册,请重新输入用户名'
			})
		}else{
			res.json({
				code:0,
			})
		}
	})
})


//获取用户信息展示在nav前台页面
router.get('/userInfo',(req,res)=>{
	if(req.userInfo._id){
		res.json({
			code:0,
			data:req.userInfo
		})
	}else{
		res.json({
			code:1,//不做任何处理
		})
	}	
})



//权限控制(只有登录有用户信息(登录过了)才可以做下面的操作)
router.use((req,res,next)=>{
	if(req.userInfo._id){	
		next();
	}else{
		res.send({
			code:10
		})
	}
})



//获取用户中心的信息展示在用户中心页面中
router.get('/userCenterInfo',(req,res)=>{
	// console.log(req.userInfo)
	if(req.userInfo._id){
		UserModel.findById(req.userInfo._id,'username phone email')
		.then(user=>{
			// console.log(user)
			res.json({
				code:0,
				data:user
			})
		})		
	}else{
		res.json({
			code:1,//不做任何处理
		})
	}	
})

router.put('/updatePassword',(req,res)=>{
	// console.log(req.body.password)//是更新后的密码
	UserModel.update({_id:req.userInfo._id},{password:hmac(req.body.password)})
	.then(raw=>{
		res.json({
			code:0,
			dada:{
				message:'修改密码成功'
			}
		})
	})
	.catch(e=>{
		res.json({
			code:1,
			errmessage:'修改密码失败'
		})
	})
})



// so far so good















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





module.exports=router;