//app.js
const auth = require('./utils/auth.js')
import pageConfig from './utils/config.js'
App({
  onLaunch () {
    console.log('wx login ...')
    auth.wxLogin().then(data => {
      this.globalData.openid = data.openid
      this.globalData.sessionKey = data.session_key
      const account = data.openid.toLowerCase()
      this.globalData.account = account
      console.log(`wx account ${account}`)
    })
  },
  globalData: {
    account: null,
    password: 'e10adc3949ba59abbe56e057f20f883e', // 123456的md5
    chatroomServer: [], // 聊天服务器地址
    openid: null,
    sessionKey: null,
    userInfo: null,
    pageConfig: pageConfig,
    chatroomList: [],
    inChatroom: false, // 进入房间标志
    chatroomInstance: null
  }
})