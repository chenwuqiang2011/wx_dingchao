var bodyParser = require('body-parser');

//新引入的模块；
var url =require("url");
var urlencodedParser = bodyParser.urlencoded({ extended: true });
var sql = require('../mysql/sql_user');

//图片上传；
var express = require('express');
var router = express.Router();
var formidable = require('formidable'),
    fs = require('fs'),
    TITLE = 'formidable上传示例',
    AVATAR_UPLOAD_FOLDER = '/avatar/',
    domain = 'http://192.168.1.186:999/';



exports.register = function (app){
	//用户登录；
	app.post('/login', urlencodedParser, function(request, response){
		sql.login('user', request.body, function(data){
			response.send(data);
		})
	});
	//用户注册；
	app.post("/register", urlencodedParser, function(request, response){
		//请求数据库；
		sql.register("user", request.body, function(data){
			//返回数据到页面；
			console.log(6666)
			response.send(data);
		})
	});


	/*------------------------------------------------------------*/ 


	//微信用户登录；
	app.post('/onlogin', urlencodedParser, function(request, response){
		console.log(request.header('data'))
		sql.onlogin('user', request.body, function(data){
			response.send(data);
		})
	});
	//新增用户地址；
	app.post("/address", urlencodedParser, function(request, response){
		//请求数据库；
		sql.address("user", request.body, function(data){
			response.send(data);
		})
	});
	//查询用户地址；
	app.post("/getAddress", urlencodedParser, function(request, response){
		//请求数据库；
		sql.getAddress("user", request.body, function(data){
			response.send(data);
		})
	});
	//更新用户地址；
	app.post("/updateAddress", urlencodedParser, function(request, response){
		//请求数据库；
		sql.updateAddress("user", request.body, function(data){
			response.send(data);
		})
	});
	//获取用户收藏的商品；
	app.post("/getCollected", urlencodedParser, function(request, response){
		//请求数据库；
		sql.getCollected("user", request.body, function(data){
			response.send(data);
		})
	});
	//更新用户收藏的商品；
	app.post("/updateCollected", urlencodedParser, function(request, response){
		//请求数据库；
		sql.updateCollected("user", request.body, function(data){
			response.send(data);
		})
	});
	//展示用户收藏的商品；
	app.post("/showCollected", urlencodedParser, function(request, response){
		//请求数据库；
		sql.showCollected("user", request.body, function(data){
			response.send(data);
		})
	});
	
	//添加用户购物车；
	app.post('/cart', urlencodedParser, function(request, response){
		console.log(12344321, request.header)
		sql.cart('user', request.body, function(data){
			response.send(data);
		})
	});
	//获取用户购物车；
	app.post('/getCart', urlencodedParser, function(request, response){
		sql.getCart('user', request.body, function(data){
			response.send(data);
		})
	});
	//用户下单；
	app.post('/order', urlencodedParser, function(request, response){
		sql.order('user', request.body, function(data){
			response.send(data);
		})
	});
	//获取订单；
	app.post('/getOrder', urlencodedParser, function(request, response){
		sql.getOrder('ordering', request.body, function(data){
			response.send(data);
		})
	});
	//更新订单
	app.post('/updateOrder', urlencodedParser, function(request, response){
		sql.updateOrder('ordering', request.body, function(data){
			response.send(data);
		})
	});

	
	//发货订单；
	app.post('/delivery', urlencodedParser, function(request, response){
		sql.delivery('ordering', request.body, function(data){
			response.send(data);
		})
	});
	//获取用户；
	app.post('/getUsers', urlencodedParser, function(request, response){
		sql.getUsers('user', request.body, function(data){
			response.send(data);
		})
	});


	//快递api;
	app.post('/express', urlencodedParser, function(request, response){
		sql.express('user', request.body, function(data){
			response.send(data)
		})
	});
	//订单支付；
	app.post('/toPaid', urlencodedParser, function(request, response){
		
		sql.toPaid('user', request, function(data){
			response.send(data);
		})
	});
	//订单支付结果回调；
	app.post('/orderResult', urlencodedParser, function(request, response){
		sql.orderResult('user', request.body, function(data){
			response.send(data);
		})
	});
	//获取access_token;
	app.get('/getToken', function(request, response){
		sql.getToken('user', request.query, function(data){
			response.send(data);
		})
	});
	//上传图片；
	app.post('/upload', function(req, res){
		var form = new formidable.IncomingForm();   //创建上传表单
		form.encoding = 'utf-8';        //设置编辑
		form.uploadDir = 'public' + AVATAR_UPLOAD_FOLDER;     //设置上传目录  
		  //app.use(express.static(path.join(path.resolve(__dirname,"../../"), '/')));// 指向前端静态文件夹dist
		form.keepExtensions = true;     //保留后缀
		form.maxFieldsSize = 2 * 1024 * 1024;   //文件大小

		form.parse(req, function(err, fields, files) {

		    if (err) {
		      res.locals.error = err;
		      // res.render('index', { title: TITLE });
		      res.send('index', { title: TITLE });
		      return;
		    }
		    console.log(fields, files);

		    var extName = '';  //后缀名
		    console.log(files.file.type);
		    switch (files.file.type) {

		      case 'image/pjpeg':
		        extName = 'jpg';
		        break;
		      case 'image/jpeg':
		        extName = 'jpg';
		        break;
		      case 'image/jpg':
		        extName = 'jpg';
		        break;
		      case 'image/png':
		        extName = 'png';
		        break;
		      case 'image/x-png':
		        extName = 'png';
		        break;
		    }
console.log('extName', extName)
		    if(extName.length == 0){
		      res.locals.error = '只支持png和jpg格式图片';
		      res.send({msg: 'index', title: TITLE });
		      return;
		    }

		    var avatarName = Math.random() + '.' + extName;
		    //图片写入地址；
		    var newPath = form.uploadDir + avatarName;
		    //显示地址；
		    var showUrl = domain + newPath;
		    console.log("newPath",newPath);
		    fs.renameSync(files.file.path, newPath);  //重命名

		    //把图片地址写入数据库；

		    
		    res.send({
		      "newPath":showUrl
		    });
		  });
		// sql.upload('user', request, function(data){console.log(1234, request.body);
		// 	response.send(data);
		// })
	})
	
}


