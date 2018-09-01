const Router=require('express').Router;
const router=Router();
const ProductModel=require('../models/product.js');
const path = require('path');
const fs = require('fs');
const multer=require('multer');//负责上传文件

const storage = multer.diskStorage({
	destination: function (req, file, cb) {
	    cb(null, 'public/resource/')
	},
	filename: function (req, file, cb) {
	    cb(null, Date.now()+path.extname(file.originalname))
	}
})

const upload = multer({ storage: storage });


//权限控制
router.use((req,res,next)=>{
	// console.log(req.userInfo)
	if(req.userInfo.isAdmin){	
		next();
	}else{
		res.json({//10表示未登录
			code:10
		})
	}
})


//上传图片的过程是:1.前台向后台发送接口uploadImage,在后台找到uploadImage
//2.file是发到后台的文件参数名,默认不写的话是file
//3.通过req.file.filename拿到文件的名字和扩展名
//4.'http://127.0.0.1:3001/resource/'+req.file.filename是访问到服务器端的地址,最终回传给前台
//5.在前台的fileList里面中的response拿到地址
//6.由于没有携带cookie,需要在image文件中加上withCredentials={ true }保留cookie
//7.前台传过来cookie在后台的session中拿到对应的cookie,就能判断有无用户登录


//上传商品图片
router.post('/uploadImage',upload.single('file'),(req,res)=>{
	// filePath是访问到服务器端的地址,最终回传给前台
	const filePath='http://127.0.0.1:3001/resource/'+req.file.filename;
	// console.log(filePath)//没有打印出来是因为没有携带cookies
	res.send(filePath)
})




//商品详情处理图片
router.post('/getImageUrl',upload.single('upload'),(req,res)=>{
	//发送给前端找地址(将图片插入到哪)
	// console.log(req.file.filename)
	const filePath='http://127.0.0.1:3001/resource/'+req.file.filename;

	res.json({
		"success": true,
		"msg": "上传成功",
		"file_path": filePath
	})
})

//处理新增请求
router.post('/',(req,res)=>{	
	// console.log(req.body.sonId)
	let body=req.body;//使用了app.js里面的post请求的中间件

	new ProductModel({
		name:body.name,
		description:body.description,
		detail:body.detail,
		Image:body.Image,
		price:body.price,
		sonId:body.sonId,
		stock:body.stock
	})
	.save()
	.then((product)=>{
		if(product){//插入成功
			ProductModel.getPaginationCategories(1,{})
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
		}								
	})
	.catch((e)=>{//插入失败,渲染错误页面
		res.json({
			code:1,
			errmessage:'插入失败,服务器端错误'
		})
	})
})


module.exports=router