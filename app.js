//项目入口文件
const express=require('express');
const bodyParser=require('body-parser');
const mongoose=require('mongoose');
const Cookies=require('cookies');
const session=require('express-session');
const MongoStore = require("connect-mongo")(session);
const cookieParser = require('cookie-parser');

//1.启动数据库
mongoose.connect('mongodb://localhost:27017/kmall', { useNewUrlParser: true });
const db=mongoose.connection;
db.on('error',(err)=>{
	throw err;
})

db.once('open',()=>{
	console.log('DB collected...');
})

const app=express();


//跨域设置
app.use((req,res,next)=>{//跨域到哪个端口号上,这里跨到3000上
	res.append("Access-Control-Allow-Origin","http://localhost:3000");
	res.append("Access-Control-Allow-Credentials",true);
	res.append("Access-Control-Allow-Methods","GET, POST, PUT,DELETE");
	res.append("Access-Control-Allow-Headers", "Content-Type, X-Requested-With"); 
	next();
})

//处理OPTIONS

app.use((req,res,next)=>{
	if(req.method=='OPTIONS'){	
		res.send('OPTIONS OK')
	}else{
		next()
	}
//	next()
})

app.use(cookieParser())


//cookie+session  cookies是从前台发过来,session存到后台
//发过来之后session从后台去取,找匹配的id
app.use(session({//session是对cookies进行加密
	//设置cookie名称
	name:'pig',
	//用它来对session cookie加盐,防止篡改
	secret:'ssahfgsdfuaefjwyef',
	//强制保存session即使它并没有变化
	resave:true,
	//强制将未初始化的session存储
	saveUninitialized: true,
	//如果为true,则每次请求都更新cookie的过期时间
	rolling:true,
    //cookie过期时间 1天
    cookie:{maxAge:1000*60*60*24},    
    //设置session存储在数据库中
    store:new MongoStore({ mongooseConnection: mongoose.connection })   
}))


//取出userInfno用户信息,应该先存,在登录的时候存下来用户的信息
app.use((req,res,next)=>{
	// console.log(req.session);
	//使用session
	req.userInfo=req.session.userInfo || {};
	next();

	//打印出{ pig: 's:DejyS-s7yYw9afwtsNqPjlf9zRTnegjZ.yJLHQ/fVFRIvXBumh3oZMUi56A0ijlQdMv7ZquD3j6o' }
	//能打印出pig,说明cookie向服务器发送请求时携带了cookies
	// console.log('req.cookies:::',req.cookies)

	//服务器端的session接收到cookie,获取到用户信息
	// console.log('req.userInfo:::',req.userInfo)
})



//4.添加处理post请求的中间件
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());


//5.处理路由
app.use('/admin',require('./routes/admin.js'))
app.use('/',require('./routes/index.js'))
app.use('/user',require('./routes/user.js'))
app.use('/category',require('./routes/category.js'))
app.use('/article',require('./routes/article.js'))
app.use('/comment',require('./routes/comment.js'))
app.use('/resource',require('./routes/resource.js'))
app.use('/home',require('./routes/home.js'))



app.listen(3001,()=>{
	console.log('server is running at 127.0.0.1:3001');
})