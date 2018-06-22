//引入相应模块
var mysql = require("mysql");

//发送请求模块；
var request = require('request');

//创建redis连接服务对象
var redis = require('redis');
var client = redis.createClient();

// var redisServerIP = '127.0.0.1';
// var redisServerPort= '3306';
var session = require('express-session');
var redisStore = require('connect-redis')(session);

// MD5
var md5 = require('md5');

var http = require('http');
var qs = require('querystring'); 

//随机数；
var crypto = require('crypto');  

//sha1签名较对；
var crypto = require('crypto');
function sha1(str) {
	var md5sum = crypto.createHash('sha1');
	md5sum.update(str);
	str = md5sum.digest('hex');
	return str;
};

//sign签名模块；
var paysign = require('./paysign');


//定义数据库
var sql = mysql.createConnection({
	host:"localhost",
	user:"root",
	password:"",
	database:"wx"
});

//连接数据库
sql.connect();


module.exports = {
	register:function(table,data,callback){

		var conditions = 'select session_key from '+ table +' where sessionid = ?';
		sql.query(conditions, [JSON.parse(data.userInfo).sessionid], function(err,results, fields){
			//通过调用接口（如 wx.getUserInfo）获取数据时，接口会同时返回 rawData、signature，其中 signature = sha1( rawData + session_key )
			//开发者将 signature、rawData 发送到开发者服务器进行校验。服务器利用用户对应的 session_key 使用相同的算法计算出签名 signature2 ，比对 signature 与 signature2 即可校验数据的完整性。
			console.log('err', results[0])
			var res = sha1(JSON.parse(data.userInfo).rawData + results[0].session_key);
			if(res == JSON.parse(data.userInfo).signature) {
				console.log('较验成功！');

    		    // var condition = 'UPDATE ' + table +' SET session_key = ?, sessionid = ? WHERE openid = ?';

				var condition2 = 'UPDATE ' + table +' SET nickName = ?, gender = ?, language = ?, city = ?, province = ?, avatarUrl = ? WHERE sessionid = ?';
				var userInfo = JSON.parse(data.userInfo).rawData;
				userInfo = JSON.parse(userInfo);
				var params = [userInfo.nickName, userInfo.gender, userInfo.language, userInfo.city, userInfo.province, userInfo.avatarUrl, JSON.parse(data.userInfo).sessionid];
				//查询数据库
				sql.query(condition2, params, function(err,results,fields){
					callback({status: true, message: '用户信息更新成功！', data: results});
				});
			} else {
				console.log('较验失败！');
			}
		})

		
	},
	login: function(table, data, callback){
		var username = data.username;
		var password = data.password;
		console.log(username, password)
		var condition =  'select * from '+ table +' where username = ? and password = ?';
		sql.query(condition, [username, password], function(err, results, fields){
			console.log(results)
			if(results.length > 0){
				callback({status: true, message: '登录成功！', data: data});
			} else {
				callback({status: false, message: '账户或者密码错误！', data: null});
			}

		})
	},

	/*------------------------------------------------------------*/ 

	//微信用户登录凭证；
	onlogin: function(table, data, callback){
		var that = this;
		
		let code = data.code
		console.log('code', code)
		  request.get({
		    uri: 'https://api.weixin.qq.com/sns/jscode2session',
		    json: true,
		    qs: {
		      grant_type: 'authorization_code',
		      appid: 'wx1e5b1bede14cca6c',
		      secret: 'a4c889d44cc84e91f17d0fd872f3e855',
		      js_code: code
		    }
		  }, (err, response, data) => {
		    if (response.statusCode === 200) {
		    	console.log(data)
		      	console.log("[openid]", data.openid)
		      	console.log("[session_key]", data.session_key);
		      

		      	//先查询数据库是否存在该用户的openid; 
		      	var conditions = 'select * from user where openid = ?';
		      	sql.query(conditions, [data.openid], function(err, results, fields){

      		      	//生成随机数3rd_session
      		      	var sessionid = '';
      		      	  
      		      	crypto.randomBytes(168,function(ex,buf){  
      		      	    sessionid = buf.toString('hex');  

    		      		if(results.length > 0){
    		      			console.log('存在用户', data.session_key);
    		      			//更新session_key;
    		      			var condition = 'UPDATE ' + table +' SET session_key = ?, sessionid = ? WHERE openid = ?';

    		      			//更新用户订单表；
    		      			var condition2 = 'UPDATE ordering SET sessionid = ? WHERE openid = ?';

    		      			sql.query(condition, [data.session_key, sessionid, data.openid], function(err, results, fields){
    		      				console.log('更新成功');

    		      				//更新用户订单；
    		      				sql.query(condition2, [sessionid, data.openid], function(err2, results2, fields2){
    		      					console.log('订单表更新sessionid成功！');
    		      					callback({status: true, message: '用户已存在！session_key更新成功!', data: results, sessionid: sessionid});
    		      				})

    		      			})

    		      		} else {

          			      	//把登录用户的openid写入数据库；
          			      	var  sqls = 'INSERT INTO user(userId, openid, session_key, sessionid) VALUES(0, ?, ?, ?)';
          					var  params = [data.openid, data.session_key, sessionid];
          					//增
          					sql.query(sqls, params, function(err,results2,fields2){
          						callback({status: true, message: '用户添加成功！', data: results2, sessionid: sessionid});
          					});

    		      		}
      		      	}); 

      			      //TODO: 生成一个唯一字符串sessionid作为键，将openid和session_key作为值，存入redis，超时时间设置为2小时
      			      //伪代码: redisStore.set(sessionid, openid + session_key, 7200)
      			      // console.log(redisStore)
      			      // redisStore.set(1,'abc123', 7200);
      				
	      		      // res.json({ sessionid: sessionid })
		      		
			      	// client.hmset(sessionid, { sessionid: data.openid + data.session_key }, function(err) {
      				// 	console.log(sessionid);
      				// });

      		      	// //读取JavaScript(JSON)对象
      		     //  	client.hgetall(sessionid, function(err, object) {
      		     //    	console.log(111111111111111,object)
      		    	// })

      		     
		      	})

		      	
		    } else {
		      console.log("[error]", err)
		      // res.json(err)
		    }
		  })
	},
	address: function(table, data, callback){
		var sessionid = data.sessionid;
		var address = [];
		address.push(JSON.parse(data.address));

		//先查询用户原来地址；
		var condition = 'select * from '+ table +' where sessionid = ?';
		sql.query(condition, [sessionid], function(err, results, fields){
			if(results.length <= 0) return false
			if(results[0].address == '' || !results[0].address){console.log('没有')
				//当前用户没有地址时，
				address[0].checked = true;
			} else{
				var res = JSON.parse(results[0].address);
				res.map(item=>{
					//如果新增地址的默认地址勾选时，则其他地址不勾选；
					if(address[0].checked){
						item.checked = false;
					}
					address.push(item);
				});
			}
			address = JSON.stringify(address);
			//用户新增地址；

			var modSql = 'UPDATE ' + table +' SET address = ? WHERE sessionid = ?';
			
			sql.query(modSql, [address, sessionid], function(err,results,fields){
				callback({status: true, message: '地址添加成功！', data: results});
			});
			
		})
	},
	getAddress: function(table, data, callback){
		var sessionid = data.sessionid;
		//先查询用户原来地址；
		var condition = 'select * from '+ table +' where sessionid = ?';
		sql.query(condition, [sessionid], function(err, results, fields){
			// console.log('95', results, results[0].address);
			if(results.length > 0 && results[0].address) {
				callback({status: true, message: '查询到地址！', data: results});
			} else {
				callback({status: false, message: '该用户暂时没有收货地址！', data: null});
			}
			
		})
	},
	updateAddress: function(table, data, callback){
		console.log(555555555555, data.sessionid)
		var sessionid = data.sessionid;
		var address = data.address;

		//先查询用户原来地址；
		var modSql = 'UPDATE ' + table +' SET address = ? WHERE sessionid = ?';
		sql.query(modSql, [address, sessionid], function(err, results, fields){

			//查询用户地址；
			var condition = 'select * from '+ table +' where sessionid = ?';
			sql.query(condition, [sessionid], function(err, results, fields){
				callback({status: true, message: '地址更新成功！', data: results});
			})
		})
	},
	getCollected: function(table, data, callback){
		var username = data.username;
		var condition = 'select collected from '+ table +' where username = ?';
		sql.query(condition, [username], function(err, results, fields){
			
			if(results[0].collected == ''){
				callback({status: false, message: '没有查询到收藏的商品！', data: null});
			} else {
				callback({status: true, message: '查询到收藏的商品！', data: results});
			}
		})
	},
	updateCollected: function(table, data, callback){
		var username = data.username;
		var collected;
		console.log('data', data.collected)
		if(data.collected){
			collected = JSON.stringify(data.collected);
			console.log(12)
		} else{
			collected = '';
		console.log('134', data);
		}
		var condition = 'UPDATE ' + table +' SET collected = ? WHERE username = ?';


		sql.query(condition, [collected, username], function(err, results, fields){
			console.log('collected', results)
			callback({status: true, message: '收藏商品更新成功！', data: null});
			
		})
	},
	showCollected: function(table, data, callback){
		var username = data.username;
		var condition = 'select collected from ' + table + ' where username = ?';
		var condition2 = 'select * from products';
		var arr = [];
		sql.query(condition2, [username], function(err, results, fields){
			console.log('144',results.length);
			sql.query(condition, [username], function(err1, results2, fields2){
				console.log('146', results2);

				var collected;
				if(results2[0].collected == ''){
					collected = [];
				}else{
					collected = JSON.parse(results2[0].collected);
				}
				
				var res = results.map(item=>{
					collected.map(item2=>{
						if(item.ID == item2){
							arr.push(item);
						}
					})
				});

				console.log(arr);
				callback({status: true, message: '收藏商品展示成功！', data: arr})
			})
		})
	},
	//添加用户购物车；
	cart: function(table, data, callback){
		var sessionid = data.sessionid;
		var cart = data.cart;
		//用户新增地址；

		var modSql = 'UPDATE ' + table +' SET cart = ? WHERE sessionid = ?';
		
		sql.query(modSql, [cart, sessionid], function(err,results,fields){
			callback({status: true, message: '购物车添加成功！', data: results});
		});
	},
	//获取用户购物车
	getCart: function(table, data, callback){
		var sessionid = data.sessionid;
		//先查询用户原来地址；
		var condition = 'select * from '+ table +' where sessionid = ?';
		sql.query(condition, [sessionid], function(err, results, fields){
			
			if(results.length > 0 && results[0].cart) {
				callback({status: true, message: '查询购物车商品数量！', data: results});
			} else {
				callback({status: false, message: '该用户购物车暂时没有商品！', data: null});
			}
			
		})
	},
	order: function(table, data, callback){
		//通过 sessionid 拿到用户的 openid;可通过用户表查询获取；
		var sessionid = data.sessionid;
		var openid = '';
		console.log(data.sessionid)
		var condition = 'select * from ' + table +' where sessionid = ?';
		sql.query(condition, [sessionid], function(err, results, fields){
			openid = results[0].openid;
			console.log(99999, openid);
			// return false;
			var  addSql = 'INSERT INTO ordering VALUES(0,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)';
			var completeTime = '';
			//var  addSqlParams = [data.goods, data.address, data.price, JSON.stringify(data.msg), JSON.stringify(data.express), data.qty, JSON.stringify(data.paid), data.status, JSON.stringify(data.username), JSON.stringify(data.createTime)];
			var addSqlParams = [data.orderNo, openid, data.sessionid, data.username, data.goods, data.address, data.price, data.qty, data.paid, data.express, data.msg, data.status, data.createTime, completeTime, '']
			sql.query(addSql, addSqlParams, function(err,results,fields){
				
				if(results.affectedRows){
					//同时减掉购物车的商品；
					var sessionid = data.sessionid;
					//先查询用户原来地址；
					var condition = 'select * from '+ table +' where sessionid = ?';
					sql.query(condition, [sessionid], function(err, results, fields){
						
						if(results.length > 0 && results[0].cart) {
							var goods = JSON.parse(data.goods);
							var cart = JSON.parse(results[0].cart);
							//订单如果是在购物车下单的，代表购物车有商品；
							goods.map((item, idx)=>{
								cart.map((item2, idx2, self)=>{
									//减去订单的商品；
									if(item.ID == item2.ID){
										self.splice(idx2, 1);
									}
								})
							});


							//更新购物车商品；
							cart = JSON.stringify(cart);

							var modSql = 'UPDATE user SET cart = ? WHERE sessionid = ?';
							
							sql.query(modSql, [cart, sessionid], function(err,results,fields){

								callback({status: true, message: '恭喜您！订单提交成功！购物车更新成功！', data: results});
								
							});

						} else {
							//订单如果查在商品详情下单的，购物车不一定有商品；
							callback({status: false, message: '该用户购物车暂时没有商品！', data: null});
						}
						
					})

				} else {
					//订单不成功时提示；
					callback({status: false, message: '订单提交不成功', data: null});
				}
				
			});
		});
	},
	getOrder: function(table, data, callback){
		var sessionid = data.sessionid;
		var condition;
		switch(data.status){
			case 'unpaid':
				condition = 'select * from '+ table +' where sessionid = ?&&status = 0';
				break;
			case 'undelivery':
				condition = 'select * from '+ table +' where sessionid = ?&&status = 1';
				break; 
			case 'receiving':
				condition = 'select * from '+ table +' where sessionid = ?&&status = 2';
				break;
			case 'unevaluate':
				condition = 'select * from '+ table +' where sessionid = ?&&status = 5';
				break;
			default:
				condition = 'select * from '+ table +' where sessionid = ?';
		}

		var orders = [];
		sql.query(condition, [sessionid], function(err, results, fields){
			results.map((item, idx)=>{
				var status = '';
				var obj = {}
				switch(item.status){
					case 0:
						status = '待支付';
						break;
					case 1:
						status = '待发货';
						break;
					case 2:
						status = '待收货';
						break;
					case 3:
						status = '已收货';
						break;
					case 4:
						status = '已关闭';
						break;
					case 5:
						status = '待评价';
						break;
					default:
						status = '错误'
				}

				obj.orderId = item.orderId;
				obj.orderNo = item.orderNo;
				obj.username = item.username;
				obj.goods = JSON.parse(item.goods);
				obj.address = JSON.parse(item.address);
				obj.price = item.price.toFixed(2);
				obj.qty = item.qty;
				obj.paid = item.paid;
				obj.express = item.express;
				obj.msg = item.msg;
				obj.status = status;
				obj.createTime = item.createTime;
				obj.completeTime = item.completeTime;
				orders.unshift(obj);
			})
			callback({status: true, message: '订单查询成功', data: orders});
		})
	},

	//更新订单；
	updateOrder: function(table, data, callback){
		var sessionid = data.sessionid;
		var orderId = data.orderId;
		var completeTime = data.completeTime;
		var status = data.status;
		var params = [data.status, data.completeTime, data.sessionid, data.orderId];

		var condition = 'UPDATE ordering SET status = ?, completeTime = ? WHERE sessionid = ?&&orderId = ?';
		sql.query(condition, params, function(err, results, fields){
			callback({status: true, message: '订单已关闭', data: results});
		} )
	},
	express: function(table, data, callback){
		var userID = '1347013';
		var keyValue = 'b6b4fba5-b2ab-4d6e-a244-4d3eca36c76e';
		var url = 'http://api.kdniao.cc/Ebusiness/EbusinessOrderHandle.aspx';
		
		var DataType = '2';
		var charset = 'UTF-8';
		var str = { OrderCode:'', ShipperCode: 'SF', LogisticCode: 118461988807 };

		var jsonStr = new Buffer(JSON.stringify(str));
		var res = jsonStr.toString('base64');
		res = md5(res + keyValue);


		var PostStr = 'RequestType=1002&EBusinessID= userID &RequestData=jsonStr&DataSign= datasign&DataType=DataType';


		var postData=qs.stringify({  
		    msg: PostStr  
		});  
		var options={  
		   hostname:'http://api.kdniao.cc/Ebusiness/EbusinessOrderHandle.aspx',  
		   path:'/',  
		   method:'POST',  
		   headers:{  
		    //'Content-Type':'application/x-www-form-urlencoded',  
		    'Content-Type':'application/x-www-form-urlencoded; charset=UTF-8',  
		    'Content-Length':Buffer.byteLength(postData)  
		   }  
		}  
		var req = http.request(options, function(res) {  
		    console.log('Status:',res.statusCode);  
		    console.log('headers:',JSON.stringify(res.headers));  
		    res.setEncoding('utf-8');  
		    res.on('data',function(chun){  
		        console.log('body分隔线---------------------------------\r\n');  
		        console.info(chun);  
		    });  
		    res.on('end',function(){  
		        console.log('No more data in response.********');  
		    });  
		});  
	},
	//订单支付；
	toPaid: function(table, data, callback){
		var self = this;
		var ip = data.header('x-forwarded-for') || data.connection.remoteAddress;
		ip = ip.replace(/::ffff:/, '');
		console.log('ip', ip)
		console.log(data.body)

		//小程序id；鼎超电子科技小程序；
		var appid = 'wx1e5b1bede14cca6c';
		//商户号商户号	mch_id;
		var mch_id = "1507846201";
		//商户号密钥；
		var key = 'ailos850823ailos850823ailos85082';
		// 商户订单号
		var out_trade_no = data.body.orderNo; 
		//随机字符串	nonce_str
		var nonce_str = '';
		// 商品描述
		var body = 'test'; 
		// 支付成功的回调地址  可访问 不带参数
		var notify_url = 'https://www.cwq888.cn/orderResult';
		//ctx.header.host.replace(/::ffff:/, ''); // 获取客户端ip
		var spbill_create_ip = ip;
		//小程序下单交易类型
		var trade_type = 'JSAPI';
        // 订单价格 单位是 分
        var total_fee = data.body.total_fee * 100; 
        // 当前时间
        var timeStamp = Math.round(new Date().getTime()/1000).toString(); 
        //用户openid; 
        var openid = '';

        //查找用户openid;
        var sessionid = data.body.sessionid;
        var condition = 'select openid from user where sessionid = "' + sessionid + '"';
        sql.query(condition, function(err, results, fields){
        	console.log('results', results[0].openid);
        	openid = results[0].openid;

    		let promise = new Promise(function(resolve,rejeact){

    			crypto.randomBytes(16, function(ex,buf){
    				nonce_str = buf.toString('hex');
    				resolve();
    			});

    		});

    		promise.then(function(){
    		  	console.log('随机数16位', nonce_str);

    	  		var ret = {
    				appid: appid,
    				mch_id: mch_id,
    				nonce_str:nonce_str,
    				body: body,
    				out_trade_no: out_trade_no,
    				total_fee: total_fee,
    				spbill_create_ip: spbill_create_ip,
    				notify_url: notify_url,
    				openid: openid,
    				trade_type: trade_type,
    				key: key
    	        };
    	  		var sign = paysign.paysignjsapi(ret);
    	  		console.log(sign);

    	  		//统一下单；
    	  		var bodyData = '<xml>';
  		            bodyData += '<appid>' + appid + '</appid>';  // 小程序ID
  		            bodyData += '<body>' + body + '</body>'; // 商品描述
  		            bodyData += '<mch_id>' + mch_id + '</mch_id>'; // 商户号
  		            bodyData += '<nonce_str>' + nonce_str + '</nonce_str>'; // 随机字符串
  		            bodyData += '<notify_url>' + notify_url + '</notify_url>'; // 支付成功的回调地址
  		            bodyData += '<openid>' + openid + '</openid>'; // 用户标识
  		            bodyData += '<out_trade_no>' + out_trade_no + '</out_trade_no>'; // 商户订单号
  		            bodyData += '<spbill_create_ip>' + spbill_create_ip + '</spbill_create_ip>'; // 终端IP
  		            bodyData += '<total_fee>' + total_fee + '</total_fee>'; // 总金额 单位为分
  		            bodyData += '<trade_type>JSAPI</trade_type>'; // 交易类型 小程序取值如下：JSAPI
  		            bodyData += '<sign>' + sign + '</sign>';
  		            bodyData += '</xml>';

  		        //微信小程序统一下单接口
	            
	            var urlStr = 'https://api.mch.weixin.qq.com/pay/unifiedorder';
	          
	            request({  
                    url: urlStr,  
                    method: 'POST',  
                    body: bodyData  
                }, function(err, response, body) {  
                    if (!err && response.statusCode == 200) {
                    	console.log(body)
                    	var prepay_id = getXMLNodeValue('prepay_id', body.toString("utf-8")); 
                    	var nonce_str = getXMLNodeValue('nonce_str', body.toString("utf-8")); 
            	        var tmp = prepay_id.split('[');
            	        var _nonce_str = nonce_str.split('[');

            	        var tmp1 = tmp[2].split(']');
            	        var str = _nonce_str[2].split(']');

            	        console.log(tmp1[0]);
            	        var payRet = {
            	        	appId: appid,
            	        	timeStamp: timeStamp,
            	        	nonceStr: str[0],
            	        	signType: 'MD5',
            	        	package: 'prepay_id=' + tmp1[0],
            	        	key: key
            	        };
            	        var _paysign = paysign.paysignjsapi(payRet);
            	        console.log('paysign', _paysign);

            	        //把prepay_id与入数据库；
            	        var condition2 = 'UPDATE ordering SET prepay_id = "'+ tmp1[0] +'" WHERE orderNo = "' + out_trade_no + '"';
            	        sql.query(condition2, function(err2, results2, fields2){
            	        	console.log('prepay_id写入成功！');
            	        })

            	        callback({timeStamp: timeStamp, nonceStr: str[0], package: 'prepay_id=' + tmp1[0], signType: 'MD5', paySign: _paysign});
                   }
                });
                function getXMLNodeValue(node_name, xml) {  
            	    var tmp = xml.split("<" + node_name + ">");  
            	    var _tmp = tmp[1].split("</" + node_name + ">");  
            	    return _tmp[0]  
            	}
	    	});
        })	
	},
	orderResult: function(table, data, callback){
		console.log('返回来的数据', data);

		var obj = data.xml;
		var resRet = {};
		resRet['appid'] = 'wx1e5b1bede14cca6c';
		resRet['bank_type'] = obj.bank_type;
		resRet['cash_fee'] = obj.cash_fee;
		resRet['fee_type'] = obj.fee_type;
		resRet['is_subscribe'] = obj.is_subscribe;
		resRet['mch_id'] = '1507846201';
		resRet['nonce_str'] = obj.nonce_str;
		resRet['openid'] = obj.openid;
		resRet['out_trade_no'] = obj.out_trade_no;
		resRet['result_code'] = obj.result_code;
		resRet['return_code'] = obj.return_code;
		resRet['time_end'] = obj.time_end;
		resRet['total_fee'] = obj.total_fee;
		resRet['trade_type'] = obj.trade_type;
		resRet['transaction_id'] = obj.transaction_id;
		resRet['key'] = 'ailos850823ailos850823ailos85082';

		//判断签名是否相等；
		var returnSign = obj.sign;
		var sign = paysign.paysignjsapi(resRet);
		console.log('签名', sign, returnSign);
		if(sign != returnSign){
			console.log('签名不一致：', sign, returnSign);
			return false;
		}

		//支付订单号；
		var orderNo = data.xml.out_trade_no;
		//支付金额；
		var total_fee = data.xml.total_fee;
		//支付时间；
		var time = data.xml.time_end;

		var pattern = /(\d{4})(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})/;
		var date = time.replace(pattern, '$1-$2-$3 $4:$5:$6');
		//将字符串 2016/09/28 17:18:23转换为Date日期格式



		

		//查找数据库找到相应的订单；
		var condition = 'select * from ordering where orderNo = "' + orderNo + '"';
		sql.query(condition, function(err, results, fields){
			if(!results[0]) return false;
			if((results[0].price * 100) == data.xml.total_fee){
				//商品名称；
				var goods = JOSN.parse(results[0].goods);
				var name = goods[0].name;
				var openid = results[0].openid;
				//prepay_id;
				var prepay_id = results[0].prepay_id;

				//判断金额是否相等；
				console.log('金额一致！');
				//修改订单状态为待发货！；
				var condition = 'UPDATE ordering SET status = 1 WHERE orderNo = "' + orderNo + '"';
				sql.query(condition, function(err, results, fields){
					console.log('订单更新为待发货！', results);
					callback('<xml><return_code><![CDATA[SUCCESS]]></return_code></xml>');

					

					//查询token;
					var _condition = 'select access_token from token';
					sql.query(_condition, function(_err, _results, _fields){
						if(!results[0]) return false;
						var token = results[0].access_token;

						//发送模板消息；
						request({  
		                    url: 'https://api.weixin.qq.com/cgi-bin/message/wxopen/template/send?access_token=' + token,  
		                    method: 'POST', 
		                    json: true, 
		                    body: {
								"touser": openid,
								"template_id": "AKWkzf8dQ_la3UA5bribWJcECZ4TKnyj1JW_06I9Rtk",
								"page": "order?status=undelivery",
								"form_id": prepay_id,
								"data": {
									"keyword1": {
										"value": name //商品名称；
									},
									"keyword2": {
										"value": total_fee/100 + "元"  //支付金额
									},
									"keyword3": {
										"value": orderNo //订单编号
									} ,
									"keyword4": {
										"value": "已支付"  //订单状态
									},
									"keyword5": {
										"value": date //支付时间
									}
								},
								"emphasis_keyword": "keyword2.DATA"
							}
		                }, function(err, response, body) {  
		                	console.log(body);
		                });
					})	
				} )
			}
		})	
	},
	getToken: function(){
		token();
		function token(){
			request.get({
			  url: 'https://api.weixin.qq.com/cgi-bin/token',
			  json: true,
			  qs: {
			    grant_type: 'client_credential',
			    appid: 'wx1e5b1bede14cca6c',
			    secret: 'a4c889d44cc84e91f17d0fd872f3e855'
			  }
			}, (err, response, data) => {
				console.log(77777, response.body);
				//写入数据库；
				var condition = 'UPDATE token SET access_token = "' + response.body.access_token + '"';
				sql.query(condition, function(err, results, fields){
					console.log('token获取成功！')
				})
			});
		};
		
		setInterval(token, 7200000);
	}
}

/*<xml>
<appid>wxd930ea5d5a258f4f</appid>
<mch_id>10000100</mch_id>
<device_info>1000<device_info>
<body>test</body>
<nonce_str>ibuaiVcKdpRxkhJA</nonce_str>
<sign>9A0A8659F005D6984697E2CA0A9CF3B7</sign>
<xml>*/