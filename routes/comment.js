const Router=require('express').Router;
const CommentModel=require('../models/comment.js');
const router=Router();


//添加评论
router.post('/add',(req,res)=>{
	let body=req.body;
	// console.log(body)//包含文章的id和输入的内容
	new CommentModel({//向数据库插入数据
		article:body.id,
		user:req.userInfo._id,
		content:body.content
	})
	.save()
	.then(comment=>{
		CommentModel.getPaginationComments(req,{article:body.id})
		.then(data=>{//向前台返回的数据
			res.json({
				code:0,
				data:data
			})
		})
	})	
})




//显示评论列表页面
router.get('/list',(req,res)=>{
	let article = req.query.id;
	let query = {};
	if(article){
		query.article = article;
	}
	CommentModel.getPaginationComments(req,query)
	.then((data)=>{
		res.json({
			code:'0',
			data:data
		})
	})
})



module.exports=router;