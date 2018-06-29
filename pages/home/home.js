//home.js
//获取应用实例
const app = getApp()

Page({
  data: {
    avatar: 'https://yx-web.nos-hz.163yun.com/webdoc/h5/im/default-icon.png',
    nick: '匿名',
    chatroomList: [],
  },
  onLoad() {
    const userInfo = app.globalData.userInfo
    if (userInfo) {
      const { nickName, avatarUrl } = userInfo
      console.log(userInfo)
      this.setData({
        avatar: avatarUrl,
        nick: nickName
      })
    }
    wx.request({
      url: 'https://app.netease.im/api/chatroom/homeList',
      header: {
        appkey: app.globalData.appkey,
      },
      success: (res) => {
        const { data } = res
        if (data.res === 200) {
          // console.log(data.msg.list)
          this.setData({
            chatroomList: data.msg.list
          })
        }
      }
    })
  },
  enterRoom(event) {
    const { roomid, liveid } = event.currentTarget.dataset
    wx.navigateTo({
      url: `/pages/room/room?roomid=${roomid}&liveid=${liveid}`,
    })
  }
})
