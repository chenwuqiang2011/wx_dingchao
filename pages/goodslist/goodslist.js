// pages/goodslist/goodslist.js
var app = getApp();
var baseUrl = app.data.baseUrl;
var imgUrl = app.data.imgUrl;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    list: '',
    imgUrl: imgUrl,
    currentTab : 0, 
    keyWord: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // console.log(options.list)
    this.animation(0, false, 200);
    this.setData({
      keyWord: options.keyWord
    })
  
  },
  changeActive: function(e){
    console.log(e)
    var current = e.currentTarget.dataset.current;
    this.setData({
      currentTab: current
    });
    // 判断排序；
    switch(current){
      case 1:
        sort(current);
        break;
      case 2:
        sort(current);
        break;
      case 3:
        sort(current);
        break;
      default:
        sort(current);
        break;
    };
    function sort (current) {

    }
  },
  translate: function (e) {
    console.log(1234)
    this.animation(400, true, 0);
  },
  //动画显示隐藏函数；
  animation: function (duration, show, moveY) {
    console.log(111)
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
        animationData: animation.export()
      }
    })
  },
  //隐藏
  hiddenFloatView: function (e) {
    this.animation(400, false, 200);
    this.setData({
      keyWord: e.detail.value
    })
  },
  keyWord: function (e) {
    var that = this;
    wx.request({
      method: 'POST',
      data: {
        keyWord: that.data.keyWord
      },
      url: baseUrl + 'keyWord',
      header: {
        'content-type': 'application/x-www-form-urlencoded' // 'content-type': 'application/json'  默认值
      },
      success: function (res) {
        console.log(res);
        app.data.list = res.data.data;
        that.onShow();
      }
    })
  },
  toDetail: function (e) {
    wx.navigateTo({
      rediret: true,
      url: '../goods/goods?id=' + e.target.dataset.id
    });
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
    var data = app.data.list;
    console.log(data)

    this.setData({
      list: data
    })
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