//index.js
const auth = require('../../utils/auth.js')

//获取应用实例
const app = getApp()

Page({
  data: {
    motto: 'Hello World',
    userInfo: {},
    hasUserInfo: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo')
  },
  //事件处理函数
  bindViewTap: function() {
    wx.navigateTo({
      url: '../logs/logs'
    })
  },
  onLoad: function () {
    if (app.globalData.userInfo) {
      this.setData({
        userInfo: app.globalData.userInfo,
        hasUserInfo: true
      })
    } else if (this.data.canIUse){
      // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
      // 所以此处加入 callback 以防止这种情况
      app.userInfoReadyCallback = res => {
        const {userInfo, detail} = res
        this.setData({
          userInfo,
          hasUserInfo: true
        })
      }
    }
  },
  getUserInfo: function(e) {
    const {detail} = e
    app.globalData.userInfo = detail.userInfo
    detail.sessionKey = app.globalData.sessionKey
    auth.wxUploadUserInfo(detail).then(data => {
      console.log(data)
    }) 
    this.setData({
      userInfo: detail.userInfo,
      hasUserInfo: true
    })
  }
})
