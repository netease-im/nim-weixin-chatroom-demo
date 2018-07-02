const app = getApp()
Page({
  data: {
    avatar: '',
    nick: '',
    chatroomList: [],
    chatroomImageBaseUrl: ''
  },
  onLoad() {
    let pageConfig = app.globalData.pageConfig
    const userInfo = app.globalData.userInfo
    let nickName = '匿名'
    let avatarUrl = pageConfig.defaultAvatar
    if (userInfo) {
      nickName = userInfo.nickName
      avatarUrl = userInfo.avatarUrl
    }
    this.setData({
      avatar: avatarUrl,
      nick: nickName,
      chatroomImageBaseUrl: pageConfig.chatroomImageBaseUrl
    })
    wx.request({
      url: pageConfig.chatroomListUrl,
      header: {
        appkey: app.globalData.appkey,
      },
      success:(res) => {
        const { data } = res
        if (data.res === 200) {
          this.setData({
            chatroomList: data.msg.list
          })
          app.globalData.chatroomList = [...data.msg.list]
        }
      }
    })
  },
  switchToChatRoom(e) {
    let chatroom = e.currentTarget.dataset.chatroom
    wx.navigateTo({
      url: `../chatroom/chatroom?roomid=${chatroom.roomid}&name=${chatroom.name}`,
    })
    console.log(chatroom)
  }
})
