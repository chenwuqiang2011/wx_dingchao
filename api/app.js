var express = require("express");

var events = require('events');
var emitter = new events.EventEmitter();
emitter.on('someEvent', function(arg1, arg2) {
	console.log('listener1', arg1, arg2);
});
emitter.on('someEvent', function(arg1, arg2) {
	console.log('listener2', arg1, arg2);
});
emitter.emit('someEvent', 'byvoid', 1991);


//引入index汇总
var router = require("./router/index.js");
console.log(999)
var app=router.register(express);

app.listen(999);

//发送请求模块；
var request = require('request');
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