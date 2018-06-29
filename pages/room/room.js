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
  },
})
