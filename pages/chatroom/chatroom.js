let app = getApp()
Page({
  data: {
    currentTab: 0,//当前索引
    roomName: null,
    roomId: null,
    roomImage: null
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

    let charroomImageIndex = null
    let chatroomList = app.globalData.chatroomList
    chatroomList.map((item, index) => {
      if(item.roomid == options.roomid) {
        charroomImageIndex = index
        return
      }
    })
    wx.setNavigationBarTitle({
      title: options.name,
    })
    this.setData({
      roomName: options.name,
      roomId: options.roomid,
      roomImage: app.globalData.pageConfig.chatroomImageBaseUrl + 'image' + charroomImageIndex + '.png'
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