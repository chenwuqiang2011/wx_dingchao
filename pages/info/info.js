// pages/info/info.js
var app = getApp();
var baseUrl = app.data.baseUrl;
var template = require('../../template/template.js');

var show = false;
var item = {};

let plugin = requirePlugin("myPlugin")
let routeInfo = {
  startLat: '',    //起点经度 选填
  startLng: '',    //起点纬度 选填
  startName: "我的位置",   // 起点名称 选填
  endLat: 23.133915,    // 终点经度必传
  endLng: 113.338542,  //终点纬度 必传
  endName: "广州鼎超电子科技有限公司",  //终点名称 必传
  mode: ''  //算路方式 选填
}

Page({

  /**
   * 页面的初始数据
   */
  data: {
    routeInfo: routeInfo,
    motto: 'Hello World',
    userInfo: {},
    hasUserInfo: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    item: {
      show: show
    },
    orders: '',
    qty: {
      unpaid: 0,
      undelivery: 0,
      receiving: 0,
      unevaluate: 0
    }
  },
  formSubmit: function(e){
    console.log(e.detail);
    wx.request({
      url: baseUrl + 'getToken',
      data: {
        formId: e.detail.formId
      },
      header: {
        'content-type': 'application/x-www-form-urlencoded' // 'content-type': 'application/json'  默认值
        
      },
      success: function (res) {
        console.log(res);

      },
      fail: function (err) {
        console.log(err);
      }
    })
  },
  onWalkTabClick: function(){console.log(888888888888888, 'walk')
    this.setData({
      routeInfo: {
        startLat: '',    //起点经度 选填
        startLng: '',    //起点纬度 选填
        startName: "我的位置",   // 起点名称 选填
        endLat: 23.183309,    // 终点经度必传
        endLng: 113.3172,  //终点纬度 必传
        endName: "来福士购物中心",  //终点名称 必传
        mode: 'walk'  //算路方式 选填
      }
    })
  },
  toMap: function(e){console.log(e)
    wx.navigateTo({
      url: '../map/map'
    })
  },
  onLoad: function () {

    // wx.showNavigationBarLoading()   //标题加载中动画

    // wx.showNavigationBarLoading()

    //动态设置页面标题。跟json配置功能一样；
    // wx.setNavigationBarTitle({
    //   title: '个人中心',
    //   success: function () {
    //     console.log('个人中心设置成功！')
    //   }
    // });

    //用户信息；
    if (app.globalData.userInfo) {
      this.setData({
        userInfo: app.globalData.userInfo,
        hasUserInfo: true
      })
    } else if (this.data.canIUse) {
      // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
      // 所以此处加入 callback 以防止这种情况
      app.userInfoReadyCallback = res => {
        this.setData({
          userInfo: res.userInfo,
          hasUserInfo: true
        })
      }
    } else {
      // 在没有 open-type=getUserInfo 版本的兼容处理
      wx.getUserInfo({
        success: res => {
          app.globalData.userInfo = res.userInfo
          this.setData({
            userInfo: res.userInfo,
            hasUserInfo: true
          })
        }
      })
    }
  },
  getUserInfo: function(e){
    var that = this;
    console.log(e)
    var sessionid = wx.getStorageSync('sessionid');
    console.log(sessionid)
    wx.getUserInfo({
     
      success: function (res) {
        console.log(e, JSON.parse(res.rawData));
        app.globalData.userInfo = e.detail.userInfo;
        //判断是否已授权；
        // wx.getSetting({
        //   success: function(res){
        //     console.log(res.authSetting['scope.userInfo'])

        //   }
        // })
        //登录成功，更新购物车信息；
        app.onShow();
        that.onShow();
        that.setData({
          userInfo: e.detail.userInfo,
          hasUserInfo: true
        });

        //把用户写入数据库；
        wx.request({
          method: 'POST',
          url: baseUrl + 'register',
          data: {
            userInfo: JSON.stringify({rawData: e.detail.rawData, signature: e.detail.signature, sessionid: sessionid})
          },
          header: {
            'content-type': 'application/x-www-form-urlencoded', // 'content-type': 'application/json'  默认值
            'sessionid': sessionid
          },
          success: function (res) {
            console.log(res);
           
          },
          fail: function (err) {
            console.log(err);
          }
        })
      },
      fail: function (err) {
        console.log(err);
        wx.showModal({
          title: '警告',
          content: '您拒绝了授权，部分功能体验将无法正常使用，请稍后再次点击授权!',
          success: function (res) {
            if (res.confirm) {
              console.log('用户点击确定')
            }
          }
        })
      }
    })
  },
  toOrders: function(){
    //请求前判断是否已授权；
    if (!app.globalData.userInfo){
      wx.showModal({
        title: '提示',
        content: '请先授权登录'
      });
      return false;
    }
    wx.navigateTo({
      url: '../order/order'
    })
  },
  unpaid: function(){
    //请求前判断是否已授权；
    if (!app.globalData.userInfo) {
      wx.showModal({
        title: '提示',
        content: '请先授权登录'
      });
      return false;
    }
    wx.navigateTo({
      url: '../order/order?status=unpaid'
    })
  },
  undelivery: function(){
    //请求前判断是否已授权；
    if (!app.globalData.userInfo) {
      wx.showModal({
        title: '提示',
        content: '请先授权登录'
      });
      return false;
    }
    wx.navigateTo({
      url: '../order/order?status=undelivery'
    })
  },
  receiving: function () {
    //请求前判断是否已授权；
    if (!app.globalData.userInfo) {
      wx.showModal({
        title: '提示',
        content: '请先授权登录'
      });
      return false;
    }
    wx.navigateTo({
      url: '../order/order?status=receiving'
    })
  },
  unevaluate: function () {
    //请求前判断是否已授权；
    if (!app.globalData.userInfo) {
      wx.showModal({
        title: '提示',
        content: '请先授权登录'
      });
      return false;
    }
    wx.navigateTo({
      url: '../order/order?status=unevaluate'
    })
  },
  toCart: function(){
    wx.switchTab({
      url: '../cart/cart'
    })
  },
  toAddress: function(){
    //请求前判断是否已授权；
    if (!app.globalData.userInfo){
      wx.showModal({
        title: '提示',
        content: '请先授权登录'
      });
      return false;
    }
    wx.navigateTo({
      url: '../address/address'
    })
  },
  contact: function(){
    wx.makePhoneCall({
      phoneNumber: '18520521259',
      success: function(res){
        console.log(res);
      },
      fail: function(err){
        console.log(err);
      }
    })
  },
  /*
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function (e) {
    var that = this;
    //请求数据
    template.updateAreaData(that, 0, e);
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    var that = this;
    wx.getSetting({
      success: function(res){
        console.log(res.authSetting['scope.userInfo']);
        //如果授权，允许访问；
        if (!res.authSetting['scope.userInfo']) return false;
        wx.showLoading({
          title: '加载中'
        });
        wx.request({
          method: 'POST',
          url: baseUrl + 'getOrder',
          data: {
            sessionid: wx.getStorageSync('sessionid'),
            status: 'getOrder'
          },
          header: {
            'content-type': 'application/x-www-form-urlencoded' // 'content-type': 'application/json'  默认值
          },
          success: function (res) {
            console.log(res);
            //去除加载提示；
            wx.hideLoading();

            if (res.data.status) {
              //重置数量显示；
              that.data.qty.unpaid = 0;
              that.data.qty.undelivery = 0;
              that.data.qty.receiving = 0;
              that.data.qty.unevaluate = 0;
              res.data.data.map((item, idx) => {
                switch (item.status) {
                  case '待支付':
                    that.data.qty.unpaid++;
                    break;
                  case '待发货':
                    that.data.qty.undelivery++;
                    break;
                  case '待收货':
                    that.data.qty.receiving++;
                    break;
                  case '待评价':
                    that.data.qty.unevaluate++;
                    break;
                }
              }); 
              that.setData({
                qty: that.data.qty
              })
            }
          },
          fail: function (err) {
            //去除加载提示；
            wx.hideLoading();
            //可提示重新发送请求；
            wx.showModal({
              title: '加载失败！',
              content: '是否要重新获取数据？',
              success: function (res) {
                if (res.confirm) {
                  //重新发送请求；
                  that.onShow();
                } else {
                  console.log('取消')
                }
              }
            })
          }
        })

      }
    });
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