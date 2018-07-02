import ChatRoom from '../../vendor/NIM_Web_Chatroom_v5.3.0.js'
import * as iconBase64Map from '../../utils/imageBase64.js'
let app = getApp()
Page({
  data: {
    currentTab: 0,//顶部当前索引
    roomInfo: {}, // 房间信息 {announcement, broadcasturl, createtime，creator，ext，name，onlineusercount，roomid，status}
    iconBase64Map: {}, // base64 icon
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // 寻找聊天室贴图
    let charroomImageIndex = null
    let chatroomList = app.globalData.chatroomList
    chatroomList.map((item, index) => {
      if(item.roomid == options.roomid) {
        charroomImageIndex = index
        return
      }
    })
    // 设置顶部标题
    wx.setNavigationBarTitle({
      title: options.name,
    })
    // 获取指定聊天室实例
    let chatroomInstance = Chatroom.getInstance({
      appKey: app.globalData.pageConfig.appKey,
      account: 'account',
      token: 'token',
      chatroomId: 'chatroomId',
      chatroomAddresses: [
        'address1',
        'address2'
      ],
      onconnect: onChatroomConnect,
      onerror: onChatroomError,
      onwillreconnect: onChatroomWillReconnect,
      ondisconnect: onChatroomDisconnect,
      // 消息
      onmsgs: onChatroomMsgs
    });
    console.log(chatroomInstance)
    this.setData({
      iconBase64Map: iconBase64Map,
      roomInfo: Object.assign({}, {
        roomImage: app.globalData.pageConfig.chatroomImageBaseUrl + 'image' + charroomImageIndex + '.png'
      }, app.globalData.chatroomList[charroomImageIndex])
    })
  },
  /**
   * nav点击
   */
  switchNav(e) {
    if (this.data.currentTab == e.currentTarget.dataset.current) {
      return
    } else {
      this.setData({
        currentTab: e.currentTarget.dataset.current
      })
    }
  },
})