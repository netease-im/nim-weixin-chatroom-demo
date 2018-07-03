import Chatroom from '../../vendor/NIM_Web_Chatroom_v5.3.0.js'
import * as iconBase64Map from '../../utils/imageBase64.js'
import { formatTime, generateRichTextNode, generateImageNode, generateFingerGuessImageFile } from '../../utils/util.js'
let app = getApp()
Page({
  data: {
    defaultAvatar: '', //用户默认头像
    currentTab: 0,//顶部当前索引
    roomInfo: {}, // 房间信息 {announcement, broadcasturl, createtime，creator，ext，name，onlineusercount，roomid，status}
    onlineMember: [], // 在线成员 [{account,avatar,nick,type}]
    iconBase64Map: {}, // base64 icon
    inputValue: '', // 发送的文本内容
    focusFlag: false,//控制输入框失去焦点与否
    emojiFlag: false,//emoji键盘标志位
    moreFlag: false, // 更多功能标志
    messageArr: [], // 渲染的数据
    animationData: {},
    animation: null,
    scrollTop: 0,
    messageWrapperMaxHeight: null, // 消息列表容器最大高度
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
      url: app.globalData.pageConfig.requestChatroomServerAddress,
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
      animation: wx.createAnimation({
        duration: 1000,
        timingFunction: 'ease',
      }),
      messageWrapperMaxHeight: wx.getSystemInfoSync().windowHeight - 275 - 40,
      defaultAvatar: app.globalData.pageConfig.defaultAvatar,
      iconBase64Map: iconBase64Map,
      roomInfo: Object.assign({}, app.globalData.chatroomList[charroomImageIndex], {
        roomImage: app.globalData.pageConfig.chatroomImageBaseUrl + 'image' + charroomImageIndex + '.png',
        onlineusercount: +app.globalData.chatroomList[charroomImageIndex].onlineusercount+1, // 自己进去了
      })
    })
  },
  /**
   * 页面卸载清除聊天室实例
   */
  onUnload() {
    app.globalData.chatroomInstance.destroy({
      done: () => {
        console.log('退出聊天室')
      }
    })
  },
  /**
   * 连接上服务器
   */
  onChatroomConnect(chatroomInfo) {
    // console.log('onChatroomConnect', chatroomInfo)
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
    let self = this
    msgs.map(msg => {
      switch (msg.type) {
        case 'notification': {
          self.addNotificationToRender(msg)
          break
        }
        case 'text': {
          self.addTextToRender(msg)
          break
        }
        case 'image': {
          self.addImageToRender(msg)
          break
        }
        case 'custom': {
          self.addCustomMsgToRender(msg)
          break
        }
        case 'robot': {

        }
        default: {
          self.addOtherMsgToRender(msg)
          break
        }
      }
    })
    // 滚动到底部
    self.scrollToBottom()
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
   * 添加文本(包含emoji)消息到渲染队列中
   */
  addTextToRender(msg) {
    // 刷新界面
    let displayTimeHeader = formatTime(msg.time)
    this.setData({
      messageArr: [...this.data.messageArr, {
        account: msg.from,
        nick: msg.fromNick,
        text: msg.text,
        type: msg.type,
        time: msg.time,
        displayTimeHeader,
        nodes: generateRichTextNode(msg.text)
      }]
    })
  },
  addImageToRender(msg) {
    // 添加到渲染队列
    let displayTimeHeader = formatTime(msg.time)
    this.setData({
      inputValue: '',
      messageArr: [...this.data.messageArr, {
        account: msg.from,
        nick: msg.fromNick,
        text: msg.text,
        file: msg.file, // image消息才有此字段
        type: msg.type, // "image"
        time: msg.time,
        displayTimeHeader,
        nodes: generateImageNode(msg.file)
      }]
    })
  },
  /**
   * 添加通知消息到渲染队列中
   */
  addNotificationToRender(msg) {
    // 添加到渲染队列
    let displayTimeHeader = formatTime(msg.time)
    this.setData({
      messageArr: [...this.data.messageArr, {
        account: msg.from,
        nick: msg.attach.fromNick,
        text: msg.text,
        type: msg.attach.type, // "memberEnter"、"memberExit"
        time: msg.time,
        displayTimeHeader,
        nodes: []
      }]
    })
    // 新增或删除在线成员
    let onlineMember = []
    if (msg.attach.type == 'memberEnter') {
      onlineMember = [...this.data.onlineMember]
      onlineMember.push({
        account: msg.from, 
        avatar: '', 
        nick: msg.attach.fromNick, 
        type: 'guest'
      })
    } else if (msg.attach.type == 'memberExit') {
      this.data.onlineMember.map(member => {
        if(msg.from != member.account) {
          onlineMember.push(member)
        }
      })
    }
    this.setData({
      onlineMember
    })
  },
  /**
   * 添加自定义消息到渲染队列中
   */
  addCustomMsgToRender(msg) {
    // 添加到渲染队列
    let displayTimeHeader = formatTime(msg.time)
    let customContent = JSON.parse(msg['content'])
    let renderType = 'custom'
    if (customContent.type == 1) {
      renderType = '猜拳'
    }
    this.setData({
      messageArr: [...this.data.messageArr, {
        account: msg.from,
        nick: msg.fromNick,
        text: msg.text,
        content: msg.content, // 自定义消息才有此字段
        type: renderType, // "custom"、猜拳
        time: msg.time,
        displayTimeHeader,
        nodes: generateImageNode(generateFingerGuessImageFile(customContent.data.value))
      }]
    })
  },
  /**
   * 添加其他类型消息到渲染队列
   */
  addOtherMsgToRender(msg) {
    // 添加到渲染队列
    let displayTimeHeader = formatTime(msg.time)
    this.setData({
      inputValue: '',
      messageArr: [...this.data.messageArr, {
        account: msg.from,
        nick: msg.fromNick || '',
        text: msg.text,
        type: msg.type, 
        time: msg.time,
        displayTimeHeader,
        nodes: [{
          type: 'text',
          text: `暂不支持该类型消息,请到手机或电脑客户端查看！`
        }]
      }]
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
  /**
   * 合并在线在线用户信息
   */
  mergeOnlineMember(memberArr) {
    console.log(memberArr)
    let result = [...this.data.onlineMember]
    memberArr.map(member => {
      if (member.online == true) {
        result.push(Object.assign({}, member, {
          avatar: member.avatar
        }))
      }
    })
    this.setData({
      onlineMember: result
    })
  },
  /**
   * 阻止事件冒泡空函数
   */
  stopEventPropagation() {
  },
  /**
   * 滚动页面到底部
   */
  scrollToBottom() {
    let self = this
    wx.createSelectorQuery().select('#recordWrapper').boundingClientRect(function (rect) {
      console.log(rect)
      // if (self.data.emojiFlag || self.data.moreFlag || self.data.focusFlag) {
      //   wx.pageScrollTo({
      //     scrollTop: rect.height + 550,
      //     duration: 100
      //   })
      // } else {
      //   wx.pageScrollTo({
      //     scrollTop: rect.height + 100,
      //     duration: 100
      //   })
      // }

      // wx.pageScrollTo({
      //   scrollTop: rect.height + 100,
      //   duration: 100
      // })
      if (rect.height > self.data.messageWrapperMaxHeight) {
        self.setData({
          scrollTop: rect.height - self.data.messageWrapperMaxHeight
        })
        console.log(self.data.scrollTop)
      }
    }).exec()
  },
  /**
   * 输入事件
   */
  inputChange(e) {
    this.setData({
      inputValue: e.detail.value
    })
  },
  /**
   * 获取焦点
   */
  inputFocus(e) {
    this.setData({
      emojiFlag: false,
      focusFlag: true
    })
  },
  /**
   * 失去焦点
   */
  inputBlur() {
    this.setData({
      focusFlag: false
    })
  },
  /**
   * 切换出emoji键盘
   */
  toggleEmoji() {
    this.setData({
      emojiFlag: !this.data.emojiFlag,
      moreFlag: false
    })
  },
  /**
   * 切出更多
   */
  toggleMore() {
    this.setData({
      moreFlag: !this.data.moreFlag,
      emojiFlag: false,
      focusFlag: false
    })
  },
  /**
   * emoji组件回调
   */
  emojiCLick(e) {
    let val = e.detail
    // 单击删除按钮，，删除emoji
    if (val == '[删除]') {
      let lastIndex = this.data.inputValue.lastIndexOf('[')
      if (lastIndex != -1) {
        this.setData({
          inputValue: this.data.inputValue.slice(0, lastIndex)
        })
      }
      return
    }
    if (val[0] == '[') { // emoji
      this.setData({
        inputValue: this.data.inputValue + val
      })
    }
  },
  /**
   * emoji点击发送
   */
  emojiSend(e) {
    let val = this.data.inputValue
    this.sendRequest(val)
    this.setData({
      emojiFlag: false
    })
  },
  /**
   * 发送文本
   */
  inputSend(e) {
    let text = e.detail.value
    this.sendRequest(text)
  },
  /**
   * 发送网络请求：发送文字
   */
  sendRequest(text) {
    let self = this
    this.setData({
      inputValue: ''
    })
    app.globalData.chatroomInstance.sendText({
      text,
      done: (err, msg) => {
        // 判断错误类型，并做相应处理
        if (err) {
          console.log(err)
          return
        }
        // 刷新界面
        self.addTextToRender(msg)
        // 滚动到底部
        self.scrollToBottom()
      }
    })
  },
})