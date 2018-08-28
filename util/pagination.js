/*
	options={
		page://需要显示的页码
		model://操作的数据模型
		projection://投影,就是id,name,isAdmin
		query://查询条件
		sort://排序
		populate:[]
	}
*/
let pagination=(options)=>{
	return new Promise((resolve,reject)=>{
		//需要限制的页数
		let limit=5;

		//需要显示的页码	
		// req.query.page是指不传的情况下会走1,传非数字的话不能走
		let page=1;

		//是数字的情况下
		if(!isNaN(parseInt(options.page))){//parseInt转化成整数
			page=parseInt(options.page)
		}
		
		if(page<=0){
			page=1
		}

		options.model.countDocuments(options.query)
		.then((count)=>{//count总信息条数
			// console.log(count);
			//总页数=总信息条数/每页显示几条
			let pages=Math.ceil(count/limit);//向上取整,即剩下1条也显示
			if(page>pages){
				page=pages;
			}
			
			if(page==0){
				page=1;
			}

			//需要跳过的页数
			let skip=(page-1)*limit;
			//第一页显示2条  跳过0条
			//第二页显示2条  跳过2条
			//第三页显示2条  跳过4条
			//综上  发现规律：skip=(page-1)*limit

			//获取所有信息,分配给模板
			let query=options.model.find(options.query,options.projection);//'_id username isAdmin'只显示这么多
			// console.log(query)
			if(options.populate){
				for(let i=0;i<options.populate.length;i++){
					query=query.populate(options.populate[i])
				}
			}
			
			query
			.sort(options.sort)
			.skip(skip)
			.limit(limit)
			.then((docs)=>{
				// console.log('docs....',docs)
				resolve({
					list:docs,  //docs包括username  password _id _v isAdmin
					total:count,
					current:page*1,
					pageSize:limit
				})
				// console.log('1:::',docs)
				// console.log(req.userInfo)
				// console.log(docs)
			})
			// console.log(query)
		})	
	})
}
module.exports=pagination;