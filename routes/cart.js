const Router=require('express').Router;

const UserModel=require('../models/user.js');
const ProductModel=require('../models/product.js');
const router=Router();

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

//添加购物车
router.post('/',(req,res)=>{
	let body=req.body;//使用了app.js里面的post请求的中间件
	// console.log(req.userInfo._id);
	UserModel.findById(req.userInfo._id)//找到登录用户的id
	.then(user=>{//在数据库中找到对应的数据
		//有购物车
		if(user.cart){
			user.cart.cartList.push({
				product:body.productId,
				count:body.count
			})
		}
		//没有购物车就新建一个购物车
		else{
			user.cart={
				cartList:[
					{
						product:body.productId,
						count:body.count	
					}
				]
			}
		}
		user.save()
		.then(newUser=>{
			console.log(newUser)
			res.json({
				code:0,
				message:'添加购物车成功',
				// data:newUser	
			})
		})
	})
})

module.exports=router;