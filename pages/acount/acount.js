// pages/acount/acount.js
var app = getApp();
var baseUrl = app.data.baseUrl;
var imgUrl = app.data.imgUrl;
var template = require('../../template/template.js');
var moment = require('../../utils/moment.js');

Page({

  /**
   * 页面的初始数据
   */
  data: {
    addressList: [],
    cart: [],
    qty: 0,
    price: 0,
    imgUrl: imgUrl,
    item: {
      show: false,
      select: true, //勾选符号；
      animationData: ''
    },
    msg: '',
    paid: '微信支付',
    express: '快递 免运费',
    flag: true  //判断点击的是配送方式 还是 支付方式；
  },
  translate: function(e){
    console.log(e.currentTarget.dataset.name, this.data.item.select)
    if(e.currentTarget.dataset.name == "paid"){
      this.setData({
        flag: true
      })
    } else {
      this.setData({
        flag: false
      })
    }
    this.animation(400, true, this.data.item.select, 0);
  },
  //隐藏
  hiddenFloatView: function(e){
    console.log(this.data.item.select)
    if(e.target.dataset.name == '微信支付'){
      this.animation(400, false, true, 200);
      
      //把选择方式回传；
      console.log(e.target.dataset.name)
      this.setData({
        paid: e.target.dataset.name
      })
    } else if(e.target.dataset.name == '银联支付'){
      this.animation(400, false, false, 200);      
      console.log(e.target.dataset.name)
      this.setData({
        paid: e.target.dataset.name
      })
    } else if (e.target.dataset.name == '快递 免运费') {
      console.log(e.target.dataset.name)
      this.animation(400, false, true, 200);      
      this.setData({
        express: e.target.dataset.name
      })
    } else {
      this.animation(400, false, this.data.item.select, 200);  
    }
  },
  //catchtap防止事件传播；
  no: function(){
    // console.log(123)
  },
  //动画显示隐藏函数；
  animation: function(duration, show, select, moveY){
    var animation = wx.createAnimation({
      transformOrigin: "50% 50%",
      duration: duration,
      timingFunction: "ease",
      delay: 0
    });

    animation.translateY(moveY + 'vh').step()

    this.setData({
      item: {
        show: show,
        select: select, //勾选符号；
        animationData: animation.export()
      }
    })
  },
  getMsg: function(e){
    this.setData({
      msg: e.detail.value
    })
  },
  //生成4位订单随机前缀；
  random: function(){
    var result = [];
    for (var i = 0; i < 4; i++) {
      var ranNum = Math.ceil(Math.random() * 25); //生成一个0到25的数字  
      //大写字母'A'的ASCII是65,A~Z的ASCII码就是65 + 0~25;然后调用String.fromCharCode()传入ASCII值返回相应的字符并push进数组里  
      result.push(String.fromCharCode(65 + ranNum));
    }
    return result.join('');
  },
  //提交订单；
  acount: function(){
    // var d = new Date();
    // var time = d.getDate();
    var that = this;
    var createTime = moment().format('YYYY-MM-DD HH:mm:ss')  //https://www.helloweba.net/javascript/271.html
    // 当前时间
    var timestamp = Math.round(new Date().getTime() / 1000); 
    var random = this.random();
    console.log(createTime, random);
    // return false;
    var obj = {};
    obj.orderNo = 'DC-' + random + timestamp;
    obj.sessionid = wx.getStorageSync('sessionid');
    obj.username = app.globalData.userInfo.nickName;
    obj.address = JSON.stringify(this.data.addressList);
    obj.goods = JSON.stringify(this.data.cart);
    obj.express = this.data.express;
    obj.paid = this.data.paid;
    obj.msg = this.data.msg;
    obj.qty = this.data.qty;
    obj.price = this.data.price;
    // obj.price = 0.01; //测试金额；
    obj.createTime = createTime;
    obj.status = 0; //0: 待付款；1: 待发货；2: 待收货；3: 已收货；
    console.log(obj.price, this.data.price);
    //把订单数据更新到后台数据库；
    if(this.data.addressList.length <= 0){
      wx.showModal({
        title: '温馨提示：',
        content: '请添加一个收货地址！',
        success: function(res){
          if(res.confirm){
            that.toAddressList();
          }
        }
      });
      return false;
    }
    wx.request({
      method: 'POST',
      url: baseUrl + 'order',
      data: obj,
      header: {
        //  'content-type': 'application/json' // 默认值
        'content-type': 'application/x-www-form-urlencoded' // 'content-type': 'application/json'  默认值
      },
      dataType: 'json',
      success: function(res){
        app.onShow();

        wx.redirectTo({
          url: '../order/order'
        })
      },
      fail: function(err){
        console.log(err);
      }
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.animation(0, false, this.data.item.select, 200);
    //获取用户默认地址；
    var that = this;
    wx.request({
      method: 'POST',
      url: baseUrl + 'getAddress',
      data: { sessionid: wx.getStorageSync('sessionid') },
      header: {
        //  'content-type': 'application/json' // 默认值
        'content-type': 'application/x-www-form-urlencoded' // 'content-type': 'application/json'  默认值
      },
      dataType: 'json',
      success: function (res) {
        if (!res.data.status) return false
        console.log(res.data.data[0].address);
        var addressList = JSON.parse(res.data.data[0].address);
        //只显示默认地址；
        addressList.map(item=>{
          if(item.checked){
            that.setData({
              addressList: [item]
            })
          }
        })
      }
    })
    var cart = JSON.parse(options.cart); 
    console.log(cart)   
    //计算商品数量；
    cart.map((item, idx) => {
      if(item.isSelect) {
        //显示的商品；
        this.data.cart.push(item);
        //计算商品数量；
        this.data.qty += item.qty;
        //计算商品总价；
        this.data.price += item.qty * item.nowPrice;
      }
    });
    this.setData({
      cart: this.data.cart,
      qty: this.data.qty,
      price: this.data.price.toFixed(2)
    })
  },
  toAddressList: function(){
    wx.navigateTo({
      url: '../address/address?flag=true'
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
  
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
   
    console.log(this.data.addressList)
    
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
  
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
  
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
  
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
  
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
  
  }
})