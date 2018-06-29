//home.js
//获取应用实例
const app = getApp()

Page({
  data: {
    roomid: '',
    liveid: 0,
  },
  onLoad(option) {
    const { roomid, liveid } = option
    this.setData({
      roomid,
      liveid,
    })
    this.getChatroomAddr(roomid)
  },
  getChatroomAddr(roomid) {
    wx.request({
      url: 'https://app.netease.im/api/chatroom/requestAddress',
      method: 'POST',
      header: {
        appkey: app.globalData.appkey,
      },
      data: {
        roomid,
      },
      success: (res) => {
        const { data } = res
        if (data.res === 200) {
          const {addr} = data.msg
          console.log(addr)
        }
      }
    })
  }
})
