//home.js
//获取应用实例
const app = getApp()

Page({
  data: {
    avatar: 'https://yx-web.nos-hz.163yun.com/webdoc/h5/im/default-icon.png',
    nick: '匿名',
  },
  onLoad() {
    const userInfo = app.globalData.userInfo
    if (userInfo) {
      const {nickName, avatarUrl} = userInfo
      console.log(userInfo)
      this.setData({
        avatar: avatarUrl,
        nick: nickName
      })
    }
  },
})
