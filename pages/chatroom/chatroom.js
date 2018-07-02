import Chatroom from '../../vendor/NIM_Web_Chatroom_v5.3.0.js'
import * as iconBase64Map from '../../utils/imageBase64.js'
let app = getApp()
Page({
  data: {
    currentTab: 0,//顶部当前索引
    roomInfo: {}, // 房间信息 {announcement, broadcasturl, createtime，creator，ext，name，onlineusercount，roomid，status}
    onlineMember: [], // 在线成员 [{account,avatar,nick,type}]
    iconBase64Map: {}, // base64 icon
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let self = this
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
    // 获取聊天室服务端地址
    wx.request({
      url: 'https://app.netease.im/api/chatroom/requestAddress',
      data: {
        roomid: options.roomid
      },
      header: {
        appkey: app.globalData.pageConfig.appkey
      },
      method: 'POST',
      success: (res) => {
        let addr = [...res.data.msg.addr]
        app.globalData.chatroomServer = addr
        // 获取指定聊天室实例
        let chatroomInstance = Chatroom.getInstance({
          appKey: app.globalData.pageConfig.appkey,
          account: app.globalData.account,
          token: app.globalData.password,
          chatroomId: options.roomid,
          chatroomAddresses: addr,
          onconnect: self.onChatroomConnect,
          onerror: self.onChatroomError,
          onwillreconnect: self.onChatroomWillReconnect,
          ondisconnect: self.onChatroomDisconnect,
          onmsgs: self.onChatroomMsgs
        });
        // 暂存聊天室实例
        app.globalData.chatroomInstance = chatroomInstance
      }
    })
    
    this.setData({
      iconBase64Map: iconBase64Map,
      roomInfo: Object.assign({}, {
        roomImage: app.globalData.pageConfig.chatroomImageBaseUrl + 'image' + charroomImageIndex + '.png'
      }, app.globalData.chatroomList[charroomImageIndex])
    })
  },
  onUnload() {
    console.log('onUnload')
  },
  /**
   * 连接上服务器
   */
  onChatroomConnect(chatroomInfo) {
    console.log('onChatroomConnect', chatroomInfo)
    let self = this
    // 拉取成员信息
    app.globalData.chatroomInstance.getChatroomMembers({
      guest: false,
      done: (error, obj) => {
        if (error) {
          console.log(error)
          return
        }
        self.mergeOnlineMember(obj.members)
      }
    })
    app.globalData.chatroomInstance.getChatroomMembers({
      guest: true,
      done: (error, obj) => {
        if (error) {
          console.log(error)
          return
        }
        self.mergeOnlineMember(obj.members)
      }
    })
  },
  /**
   * 收到消息
   * [{attach: {from,fromNick,gaged,tempMuteDuration,tempMuted,to:[],toNick:[],type},chatroomId,flow,from,custom,content,fromClientType,fromCustom,resend,idClient,status,text,time,type}]
   */
  onChatroomMsgs(msgs) {
    console.log('onChatroomMsgs', msgs)
    msgs.map(msg => {
      switch (msg.type) {
        case 'notification': {

        }
        case 'text': {

        }
        case 'robot': {

        }
      }
    })
  },
  /**
   * 发生错误
   */
  onChatroomError(error, obj) {
    console.log('onerror', error, obj);
  },
  /**
   * 即将重连
   */
  onChatroomWillReconnect(obj) {
    console.log('onwillreconnect', obj);
  },
  /**
   * 已经断开连接
   */
  onChatroomDisconnect(error) {
    console.log('ondisconnect', error);
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
  /**
   * 合并在线在线用户信息
   */
  mergeOnlineMember(memberArr) {
    let result = [...this.data.onlineMember]
    memberArr.map(member => {
      if (member.online == true) {
        result.push(Object.assign({}, member))
      }
    })
    this.setData({
      onlineMember: result
    })
  }
})