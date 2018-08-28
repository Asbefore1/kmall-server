const Router = require('express').Router;
const hmac=require('../util/hmac.js');
const UserModel = require('../models/user.js');
const CommentModel = require('../models/comment.js');
const pagination = require('../util/pagination.js');
const multer = require('multer');
const upload = multer({ dest: 'public/uploads/' });
const fs = require('fs');
const path = require('path');

const router = Router();

/*
//服务器是3001端口,在地址栏输入3001找数据
router.get('/init',(req,res,next)=>{
	//插入管理员到数据库
	new UserModel({
		username:'admin',
		password:hmac('admin'),
		isAdmin:true
	})
	.save((err,newUser)=>{
		if(!err){
			res.send('ok')
		}else{
			res.send('err')
		}
	})
})
*/


//用户登录
router.post('/login',(req,res)=>{
	// console.log(req.body);
	let body=req.body;
	// console.log('1:::',body)
	// console.log('2:::',req.body)
	//定义返回数据
	let result={
		code:0,//0代表成功
		errmessage:''
	}
	UserModel  //数据库里查找用户名和密码
	.findOne({username:body.username,password:hmac(body.password),isAdmin:true})//返回一个promise对象
	.then((user)=>{//user就是查出来的用户名和密码这个对象
		if(user){		
			req.session.userInfo={//在前台layout使用
				_id:user._id,
				username:user.username,
				isAdmin:user.isAdmin
			}
			result.data={
				username:user.username
			}
			//返回给前端
			res.json(result);  //result.code  result.errmessage  result.data
			// console.log(result.data)//result包含了code:0,errmessage:'',data: { username: 'admin' }
			// console.log(req.session.userInfo)
		}else{//发送ajax失败
			result.code=1,
			result.errmessage='用户名或密码错误',
			res.json(result);
		}
	})
})

//权限控制
router.use((req,res,next)=>{
	if(req.userInfo.isAdmin){	
		next();
	}else{
		res.send({
			code:10
		})
	}
})


//获取首页用户数订单数
router.get('/count',(req,res)=>{
	res.json({
		code:0,
		data:{
			usernum:500,
			ordernum:501,
			pronum:502
		}
	})
})


//用户列表获取用户信息
router.get('/users',(req,res)=>{
	let options = {
		page:req.query.page,//从前台拿到当前页 //query是一个对象
		model:UserModel, //操作的数据模型
		query:{}, //查询条件,查询所有
		projection:'-password -__v -updatedAt',//投影
		sort:{_id:-1} //排序
	}
	pagination(options)
	.then((result)=>{
		// console.log('result....',result)
		res.json({
			code:0,
			data:{
				current:result.current,
				pageSize:result.pageSize,
				total:result.total,
				list:result.list
			}
		})
	})
	
})


//so far so good...
















//显示用户列表
router.get('/users',(req,res)=>{

	//获取所有用户的信息,分配给模板

	let options = {
		page: req.query.page,//需要显示的页码
		model:UserModel, //操作的数据模型
		query:{}, //查询条件,查询所有
		projection:'_id username isAdmin', //投影，
		sort:{_id:-1} //排序
	}
	// console.log(req.query)//req上有query方法,拿到去掉?后面的对象{page:'2'}
	pagination(options)
	.then((data)=>{
		res.render('admin/user_list',{
			userInfo:req.userInfo,
			users:data.docs,
			page:data.page,
			list:data.list,
			pages:data.pages,
			url:'/admin/users'
		});	
		console.log(data)
	})
})


//显示管理员首页
router.get('/',(req,res)=>{
	res.render('admin/index',{//render渲染页面
		userInfo:req.userInfo
	})
})

//添加文章是处理图片上传
router.post('/uploadImages',upload.single('upload'),(req,res)=>{
	let path = "/uploads/"+req.file.filename;
	res.json({
		uploaded:true,
        url:path
	})
})


//显示用户评论列表
router.get('/comments',(req,res)=>{
	CommentModel.getPaginationComments(req)
	.then(data=>{
		res.render('admin/comment_list',{
			userInfo:req.userInfo,
			comments:data.docs,
			page:data.page,
			pages:data.pages,
			list:data.list
		})
	})
})


//删除评论
router.get("/comment/delete/:id",(req,res)=>{
	let id = req.params.id;
	CommentModel.remove({_id:id},(err,raw)=>{
		if(!err){
			res.render('admin/success',{
				userInfo:req.userInfo,
				message:'删除评论成功',
				url:'/admin/comments'
			})				
		}else{
	 		res.render('admin/error',{
				userInfo:req.userInfo,
				message:'删除评论失败,数据库操作失败'
			})				
		}		
	})

});


//显示站点管理页面
router.get("/site",(req,res)=>{
	let filePath = path.normalize(__dirname + '/../site-info.json');
	fs.readFile(filePath,(err,data)=>{
		if(!err){
			let site = JSON.parse(data);
			res.render('admin/site',{
				userInfo:req.userInfo,
				site:site
			})
		}else{
			console.log(err)
		}
	})

})


//处理修改网站配置请求
router.post("/site",(req,res)=>{
	let body=req.body;
	let site={
		author:{
			name:body.author.name,
			intro:body.author.intro,
			image:body.author.image,
			wechat:body.author.wechat
		},
		ads:{
			url:body.url,
			paht:body.path
		},
		icp:body.icp
	};

	site.carouseles=[];

	if(body.carouselUrl.length>0 && typeof body.carouselUrl){
		for(let i=0;i<body.carouselUrl.length;i++){

		}
	}else{
		site.carouseles.push()
	}


	site.ads=[];

	if(body.adUrl.length>0 && typeof body.adUrl){
		for(let i=0;i<body.adUrl.length;i++){

		}
	}else{
		site.carouseles.push()
	}
	
})


//显示修改密码页面
router.get('/password',(req,res)=>{
	res.render('admin/password',{
		userInfo:req.userInfo
	})
})


//修改密码处理页面
router.post('/password',(req,res)=>{
	// console.log(req.body)
	UserModel.update({_id:req.userInfo._id},{
		password:hmac(req.body.password)
	})
	.then(raw=>{
		req.session.destroy();
		res.render('admin/success',{
			userInfo:req.userInfo,
			message:'修改密码成功',
			url:'/'
		})	
	})
})

module.exports = router;