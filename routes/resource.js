const Router=require('express').Router;
const path = require('path');
const fs = require('fs');
const ResourceModel=require('../models/resource.js');
const pagination=require('../util/pagination.js');
const multer=require('multer');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/resource/')
  },
  filename: function (req, file, cb) {
    cb(null, Date.now()+path.extname(file.originalname))
  }

})

const upload = multer({ storage: storage })

const router=Router();
//显示首页

//进入admin的中间件,写在router.get的前面
//权限控制,必须用管理员的身份登录后isAdmin变成了true
//才能进去管理员的后台,在地址栏中输入127.0.0.1:3000/admin时
//由于没有判断是不是管理员,所以不能进入
router.use((req,res,next)=>{
	if(req.userInfo.isAdmin){	
		next();
	}else{
		res.send('<h1>请用管理员身份登录</h1>')
	}
})

//显示资源列表首页
router.get('/',(req,res)=>{
	let options = {
	    page: req.query.page,//需要显示的页码
	    model:ResourceModel, //操作的数据模型
	    query:{}, //查询条件
	    projection:'-__v', //投影
	    sort:{_id:-1}, //排序
	}
	pagination(options)//promise对象
	.then((data)=>{//成功
		res.render('admin/resource_list',{
			userInfo:req.userInfo,
			resources:data.docs,
			page:data.page,//当前是第几页
			list:data.list,//[1,2,3,4]
			pages:data.pages,			
		})
	})
})


//显示资源新增页
router.get('/add',(req,res)=>{
	res.render('admin/resource_add',{
		userInfo:req.userInfo
	})
})


//处理新增资源
router.post('/add',upload.single('file'),(req,res)=>{
	new ResourceModel({
		name:req.body.name,
		path:'/resource/'+req.file.filename
	})
	.save()
	.then((resource)=>{//插入成功,渲染页面成功
		res.render('admin/success',{
			userInfo:req.userInfo,
			message:'新增资源成功',
			url:'/resource',
		})
	})
})



//处理删除
router.get('/delete/:id',(req,res)=>{
	let id=req.params.id;//字符串
	// console.log(id);	
	ResourceModel.findByIdAndRemove(id)//删除数据库中的记录
	.then(resource=>{
		let filePath = path.normalize(__dirname + '/../public/'+resource.path);
		//删除物理文件
		fs.unlink(filePath,(err)=>{
			if(!err){
				res.render('admin/success',{
					userInfo:req.userInfo,
					message:'删除资源成功',
					url:'/resource'
				})					
			}else{
				res.render('admin/error',{
					userInfo:req.userInfo,
					message:'删除资源失败,删除文件错误',
				})					
			}
		})
	})
	.catch(e=>{
		res.render('admin/error',{
			userInfo:req.userInfo,
			message:'删除资源失败,删除数据库记录错误',
		})			
	})	
})


module.exports=router;