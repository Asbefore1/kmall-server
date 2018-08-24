const Router=require('express').Router;
const CategoryModel=require('../models/category.js');
const ArticleModel=require('../models/article.js');
const CommentModel=require('../models/comment.js');
const pagination=require('../util/pagination.js');
const getCommonData=require('../util/getCommonData.js');
const router=Router();


//显示首页
router.get('/',(req,res)=>{
	// console.log(req.cookies.get('userInfo'));
	// console.log(req.userinfo);

	/*在浏览器地址栏里输入127.0.0.1:3000请求到app.js里面的app.use('/',require('./routes/index.js'))
	接着走到routes/index.js,看到是get请求和/对应前面的模板swig即去找./views里面的main里面的index把index继承layout的内容和自己的内容解析成html代码一块返回给前端
	浏览器从上到下解析代码解析到href='lib/bootstrap/css/bootstrap.min.css'时去找127.0.0.1:3000/lib/bootstrap/css/bootstrap.min.css即请求静态页面css后台走到app.use(express.static('public'))
	去找public下面的lib/bootstrap/css/bootstrap.min.css找到css下面所有的href和src都是这样的解析方法请求到页面ArticleModel.getPaginationArticles(req)
	*/
	ArticleModel.getPaginationArticles(req)
	.then(pageData=>{
		getCommonData()
		.then(data=>{//获取首页文章列表
			res.render('main/index',{
				userInfo:req.userInfo,
				articles:pageData.docs,
				page:pageData.page,
				list:pageData.list,
				pages:pageData.pages,
				categories:data.categories,
				topArticles:data.topArticles,
				url:'/articles'
			});	
			// console.log(pageData.docs)//每页显示的文章			
		})
	})	
})




//ajax请求获取文章列表的分页数据
router.get("/articles",(req,res)=>{
	let category = req.query.id;
	let query = {};
	if(category){
		query.category = category;
	}
	ArticleModel.getPaginationArticles(req,query)
	.then((data)=>{
		res.json({
			code:'0',
			data:data
		})
	})
});




//显示详情页面
router.get("/view/:id",(req,res)=>{
	let id = req.params.id;
	// console.log(id)
	ArticleModel.findByIdAndUpdate(id,{$inc:{click:1}},{new:true})//$inc加
	.populate('category','name')
	.then(article=>{
		getCommonData()
		.then(data=>{	
			CommentModel.getPaginationComments(req,{article:id})
		    .then(pageData=>{
		      	res.render('main/detail',{
					userInfo:req.userInfo,
					article:article,
					categories:data.categories,
					topArticles:data.topArticles,
					comments:pageData.docs,
					page:pageData.page,
					list:pageData.list,
					pages:pageData.pages,
					category:article.category._id.toString()
				})	
		    })								
		})
	})
})



//显示列表页面
router.get("/list/:id",(req,res)=>{
	let id = req.params.id;
	// console.log(id);
	ArticleModel.getPaginationArticles(req,{category:id})
	.then(pageData=>{
		getCommonData()
		.then(data=>{//获取首页文章列表
			res.render('main/list',{
				userInfo:req.userInfo,
				articles:pageData.docs,
				page:pageData.page,
				list:pageData.list,
				pages:pageData.pages,
				categories:data.categories,
				topArticles:data.topArticles,
				category:id,
				url:'/articles'
			});	
			// console.log(pageData.docs)//每页显示的文章			
		})
	})	
})



module.exports=router;