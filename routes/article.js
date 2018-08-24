const Router=require('express').Router;
const UserModel=require('../models/user.js');
const CategoryModel=require('../models/category.js');
const ArticleModel=require('../models/article.js');
const pagination=require('../util/pagination.js');
const router=Router();



//显示博客首页
router.use((req,res,next)=>{
	if(req.userInfo.isAdmin){	
		next();
	}else{
		res.send('<h1>请用管理员身份登录</h1>')
	}
})



//显示文章列表页面
router.get('/',(req,res)=>{
	/*
	ArticleModel.find()
	//在category中挑选出name
	.populate({path:'category',select:'name'})
	.populate({path:'user',select:'username'})
	.then(docs=>{
		console.log(docs)
	})
	*/
	ArticleModel.getPaginationArticles(req)
	.then((data)=>{//成功
		// console.log(data.docs)//有分类的id和每篇文章自己的id
		res.render('admin/article_list',{
			userInfo:req.userInfo,
			articles:data.docs,//每页有两个对象[{qwy,admin}],[{test1,test2}]
			page:data.page,//当前是第几页
			list:data.list,//[1,2,3,4]
			pages:data.pages,
			url:'/article'
		})
	})
})




//显示新增页面
router.get('/add',(req,res)=>{
	CategoryModel.find({},'_id name')
	.sort({order:1})//升序
	.then((categories)=>{
		res.render('admin/article_add_edit',{
			userInfo:req.userInfo,
			categories:categories
		})
	})
	// console.log(CategoryModel.find({}))
})


//处理新增请求
router.post('/add',(req,res)=>{	
	// console.log(req.body)
	let body=req.body;//使用了app.js里面的post请求的中间件
	// console.log(body)
	new ArticleModel({
		category:body.category,
		user:req.userInfo._id,
		title:body.title,
		content:body.content,
		intro:body.intro
	})
	.save()
	.then((article)=>{
		res.render('admin/success',{
			userInfo:req.userInfo,
			message:'新增文章成功',
			url:'/article',
		})
	})
	.catch((e)=>{
		res.render('admin/fail',{
			userInfo:req.userInfo,
			message:'新增文章失败',
		})
	})
})



//显示编辑页面
router.get('/edit/:id',(req,res)=>{
	let id=req.params.id;//字符串
	// console.log(id);
	CategoryModel.find({},'_id name')
	.sort({order:1})
	.then((categories)=>{//categories是列表,找到所有的种类		
		ArticleModel.findById(id)
		.then((article)=>{
			res.render('admin/article_add_edit',{
				userInfo:req.userInfo,
				article:article,
				categories:categories				
			})
			// console.log('1::',article)
			// console.log('2::',article.category)
		})
		.catch((e)=>{
			res.render('admin/error',{
				userInfo:userInfo,
				message:'获取的文章不存在'
			})
		})
		// console.log('3::',categories)					
	})	
})



//处理编辑请求
router.post('/edit',(req,res)=>{
	let body=req.body;
	// console.log(body)//body是修改的内容
	// console.log('4::',body.category)	
	let options={
		category:body.category,
		title:body.title,
		content:body.content,
		intro:body.intro
	}
	ArticleModel.update({_id:body.id},options,(err,raw)=>{
		//回调函数
		if(!err){
			res.render('admin/success',{
				userInfo:req.userInfo,
				message:'修改文章内容成功',
				url:'/article',
			})
		}else{
			res.render('admin/fail',{
				userInfo:req.userInfo,
				message:'修改文章内容失败',
			})
		}
	})			
})



//处理删除页面
router.get('/delete/:id',(req,res)=>{
	let id=req.params.id;//字符串
	// console.log(id);//id是这篇文章的id	
	ArticleModel.remove({_id:id},(err,raw)=>{
		if(!err){
			res.render('admin/success',{
				userInfo:req.userInfo,
				message:'删除文章成功',
				url:'/article'
			})
		}else{
			res.render('admin/fail',{
				userInfo:req.userInfo,
				message:'删除文章失败,数据库删除失败',
			})
		}
	})	
})

module.exports=router;