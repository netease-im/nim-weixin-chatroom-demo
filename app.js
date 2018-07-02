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
    appkey: '45c6af3c98409b18a84451215d0bdd6e',
    account: null,
    password: 'e10adc3949ba59abbe56e057f20f883e', // 123456的md5
    openid: null,
    sessionKey: null,
    userInfo: null,
    pageConfig: pageConfig,
    chatroomList: []
  }
})