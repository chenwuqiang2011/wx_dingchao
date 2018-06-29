//引入相应模块
var mysql = require("mysql");

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
/*	register:function(table,data,callback){
		
		var condition = 'select * from '+ table +' where username = ?';
		// //查询数据库
		// sql.query( condition, [data.category], function(err, results, fields){
		// 	callback({status: true,data: results})
		// })

		//查询数据库
		sql.query(condition, [data.username], function(err,results,fields){
			console.log(results)
			if(results.length > 0){
				callback({status: false, message: '该手机号已注册！请重新注册！', data: null});
			} else {
				var  addSql = 'INSERT INTO user(userId, username, password) VALUES(0,?,?)';
				var  addSqlParams = [data.username, data.password];
				//增
				sql.query(addSql, addSqlParams, function(err,results,fields){
					callback({status: true, message: '恭喜您！注册成功！', data: results});
				});
			}
		});
	}*/
	test: function(table, data, callback){
		console.log('test', data);
		TopClient = require('node-taobao-topclient').default;
		var client = new TopClient({
		    'appkey': 'appkey',
		    'appsecret': 'secret',
		    'REST_URL': 'http://gw.api.taobao.com/router/rest'
		});
		console.log(TopClient)
		client.execute('taobao.item.detail.get', {
		    'params':'areaId',
		    'item_id':'545469636086',
		    'fields':'item,price,delivery,skuBase,skuCore,trade,feature,props,debug'
		}).then(function(error, response) {
		    if (!error) console.log(response);
		    else console.log(error);
		})
		/*var condition = 'select * from '+ table;
		sql.query(condition, function(err, results, fields){console.log(results)
			if(results.length > 0){
				callback({status: true, message: '查询到所有商品！', data: results});
			} else {
				callback({status: false, message: '没有查询到所有商品！', data: null});
			}
		})*/
	},
	queryProducts: function(table, data, callback){console.log(data)
		var defaultData = {pageNo: 1, qty: 10};
		data = Object.assign(defaultData, data);
		var pageNo = data.pageNo - 1;
		var qty = data.qty;
		var condition = 'select * from '+ table + ' limit ' + pageNo * qty + ' , ' + qty;
		var condition2 = 'select * from '+ table;
		var qty = 0;
		sql.query(condition2, function(err, results,fields){
			qty = results.length;
		})
		sql.query(condition, function(err, results, fields){
			if(results.length > 0){
				callback({status: true, message: '查询到所有商品！', data: results, total: qty});
			} else {
				callback({status: false, message: '没有查询到所有商品！', data: null});
			}
		})
	},
	priceUp: function(table, data, callback){
		var defaultData = {pageNo: 1, qty: 10};
		data = Object.assign(defaultData, data);
		var pageNo = data.pageNo - 1;
		var qty = data.qty;
		var condition = 'select * from '+ table + ' order by nowPrice asc limit ' + pageNo * qty + ' , ' + qty;
		sql.query(condition, function(err, results, fields){
			if(results.length > 0){
				callback({status: true, message: '查询到所有商品！', data: results});
			} else {
				callback({status: false, message: '没有查询到所有商品！', data: null});
			}
		})
	},
	priceDown: function(table, data, callback){
		var defaultData = {pageNo: 1, qty: 10};
		data = Object.assign(defaultData, data);
		var pageNo = data.pageNo - 1;
		var qty = data.qty;
		console.log(1234)
		var condition = 'select * from '+ table + ' order by nowPrice desc limit ' + pageNo * qty + ' , ' + qty;
		sql.query(condition, function(err, results, fields){
			if(results.length > 0){
				callback({status: true, message: '查询到所有商品！', data: results});
			} else {
				callback({status: false, message: '没有查询到所有商品！', data: null});
			}
		})
	},
	newProducts: function(table, data, callback){
		var defaultData = {pageNo: 1, qty: 10};
		data = Object.assign(defaultData, data);
		var pageNo = data.pageNo - 1;
		var qty = data.qty;
		var condition = 'select * from '+ table + ' order by createdTime desc limit ' + pageNo * qty + ' , ' + qty;;
		sql.query(condition, function(err, results, fields){
			if(results.length > 0){
				callback({status: true, message: '查询到所有商品！', data: results});
			} else {
				callback({status: false, message: '没有查询到所有商品！', data: null});
			}
		})
	},
	getProduct: function(table, data, callback){
		var prevId;
		console.log(data.id)
		if(data.id){
			prevId = data.id;
		}
		var condition = 'select * from '+ table + ' where ID = ' + data.id;
		console.log(prevId);
		sql.query(condition, function(err, results, fields){
			if(results.length > 0){
				callback({status: true, message: '查询到所有商品！', data: results});
			} else {
				callback({status: false, message: '没有查询到所有商品！', data: null});
			}
		})
	},
	getHot: function(table, data, callback){
		var defaultData = {pageNo: 1, qty: 10};
		data = Object.assign(defaultData, data);
		var pageNo = data.pageNo - 1;
		var qty = data.qty;
		console.log(data)
		var condition = 'select * from '+ table + ' order by sales desc limit ' + pageNo * qty + ' , ' + qty;
		sql.query(condition, function(err, results, fields){
			if(results.length > 0){
				callback({status: true, message: '查询到第'+ pageNo+'页的所有商品！', data: results});
			} else {
				callback({status: false, message: '没有查询到所有商品！', data: null});
			}
		})
	},
	keyWord: function(table, data, callback){
		var keyWord = data.keyWord;
		var condition = 'select * from ' + table + ' where description like "%'+ keyWord +'%" or name like "%'+ keyWord +'%"' ;
		sql.query(condition, function(err, results, fields){
			console.log(99999, results)
			if(results.length > 0){
				callback({status: true, message: '查询到相关的所有商品！', data: results});
			} else {
				callback({status: false, message: '没有查询到所有商品！', data: null});
			}
		})
	},
	getOrders: function(table, data, callback){
		var defaultData = {pageNo: 1, qty: 10};
		data = Object.assign(defaultData, data);
		var pageNo = data.pageNo - 1;
		var qty = data.qty;

		var condition = 'select * from '+ table + ' limit ' + pageNo * qty + ' , ' + qty;
		
		var orders = [];
		sql.query(condition, function(err, results, fields){

			var condition2 = 'select * from '+ table;
			sql.query(condition2, function(err2, results2, fields2){
				var total = results2.length;
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
			callback({status: true, message: '订单查询成功', data: orders, total: total});
			})

			
		})
	}
}

