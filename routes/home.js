const Router=require('express').Router;
const hmac=require('../util/hmac.js');
const UserModel=require('../models/user.js');
const CategoryModel=require('../models/category.js');
const CommentModel=require('../models/comment.js');
const ArticleModel=require('../models/article.js');
const pagination=require('../util/pagination.js');
const router=Router();


//显示博客首页
router.use((req,res,next)=>{
	if(!req.userInfo.isAdmin){	
		next();
	}else{
		res.send('<h1>请用管理员账号登录</h1>')
	}
})


//显示用户首页
router.get('/',(req,res)=>{
	res.render('home/index',{
		userInfo:req.userInfo
	})
})


//显示用户评论列表
router.get('/comments',(req,res)=>{
	CommentModel.getPaginationComments(req,{user:req.userInfo._id})
	.then(data=>{
		res.render('home/comment_list',{
			userInfo:req.userInfo,
			comments:data.docs,
			page:data.page,
			pages:data.pages,
			list:data.list,
			url:'/home/comments'
		})
	})
})


//删除评论
router.get("/comment/delete/:id",(req,res)=>{
	let id = req.params.id;
	CommentModel.remove({_id:id},{user:req.userInfo._id},(err,raw)=>{
		if(!err){
			res.render('home/success',{
				userInfo:req.userInfo,
				message:'删除评论成功',
				url:'/admin/comments'
			})				
		}else{
	 		res.render('home/error',{
				userInfo:req.userInfo,
				message:'删除评论失败,数据库操作失败'
			})				
		}		
	})
})



//显示修改密码页面
router.get('/password',(req,res)=>{
	res.render('home/password',{
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
		res.render('home/success',{
			userInfo:req.userInfo,
			message:'修改密码成功',
			url:'/'
		})	
	})
})

module.exports=router;