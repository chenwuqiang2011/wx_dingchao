// pages/goods/goods.js
var app = getApp();
var baseUrl = app.data.baseUrl;
var imgUrl = app.data.imgUrl;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    id:'',
    goods: '',
    currentTab: 0,
    currentTab2: 0,
    indicatorDots: true,
    autoplay: true,
    interval: 3000,
    duration: 1000,
    circular: true,
    qty: 0,
    imgUrl: imgUrl

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    
    //跳转传过来的参数；
    var id = options.id;
    this.id = options.id;
    var that = this;
    //加载提示；
    wx.showLoading({
      title: '加载中'
    });

    wx.request({
      method: 'POST',
      url: baseUrl +'getProduct',
      data: {id: id},
      header: {
        'content-type': 'application/x-www-form-urlencoded' //'application/json' // 默认值
      },
      success: function(res){
        console.log(res)
        //隐藏加载提示；
        wx.hideLoading();

        that.setData({
          goods: res.data.data[0]
        });
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
              that.onLoad();
            } else {
              console.log('取消')
            }
          }
        })
      }
    })
  },

  changeNav: function (e) {
    this.setData({
      currentTab: e.target.dataset.current
    })
  },
  changeNav2: function (e) {
    this.setData({
      currentTab2: e.target.dataset.current
    })
  },
  changeTab: function(e){
    console.log(e.detail.current)
    this.setData({
      currentTab2: e.detail.current
    });
  },
  add: function(){
    console.log(app.data.cart);
    if (!app.globalData.userInfo) {
      wx.showModal({
        title: '提示',
        content: '请先授权登录哦！',
        success: function (res) {
          if (res.confirm) {
            wx.switchTab({
              url: '../info/info'
            });
          }
        }
      });
      return false;
    };
    
    //要加入购物车的商品为；
    app.data.goodslist.map(item => {console.log(111)
      item.data.map(item2 => {
        console.log(222)
        if (item2.ID == this.id) {console.log(1)
          // app.data.cart.push(item2);

          if (app.data.cart.length > 0) {
            //购物车有商品时，判断是否存在一样的商品；
            var flag = false;
            app.data.cart.map((item3, idx3) => {
              if (item3.ID == this.id) {
                console.log(2)
                flag = true;

                //有相同商品时，数量 +1
                item3.qty++;
              } else if (!flag && idx3 == app.data.cart.length - 1) {
                console.log(3)
                //没有相同商品时，数量 为1
                item2.qty = 1;
                app.data.cart.push(item2);
              }
            })
          } else {
            //购物车没有商品时；
            console.log(4)
            item2.qty = 1;
            app.data.cart.push(item2);
          }
        }
      })
    });
    // this.setData({
    //   cart: app.data.cart
    // });
    console.log(app.data.cart)
    //显示数量；
    var that = this;
    console.log(app.data.qty)
    app.data.qty++;
    //更新购物车数量；
    this.setData({
      qty: app.data.qty
    });
    
    wx.showToast({
      title: '已添加到购物车',
      //image: '../image/img.png',  //自定义图标的本地路径，image 的优先级高于 icon 
      duration: 500,
      success: function () {
        app.addCart();
      }
    })
  },
  toCart: function(){
    wx.switchTab({
      url: '../cart/cart'
    })
  },
  buy: function(){
    console.log(app.data.cart);
    if (!app.globalData.userInfo) {
      wx.showModal({
        title: '提示',
        content: '请先授权登录哦！',
        success: function (res) {
          if (res.confirm) {
            wx.switchTab({
              url: '../info/info'
            });
          }
        }
      });
      return false;
    };

    var goods = [];
    this.data.goods.isSelect = true;
    this.data.goods.qty = 1;
    goods.push(this.data.goods);
    wx.navigateTo({
      url: '../acount/acount?cart=' + JSON.stringify(goods),
      success: function (res) { },
      fail: function (res) { },
      complete: function (res) { },
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
    console.log(app.data.qty)
    //更新购物车数量；
    this.setData({
      qty: app.data.qty
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