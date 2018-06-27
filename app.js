//app.js
const auth = require('./utils/auth.js')

App({
  onLaunch () {
    auth.wxLogin().then(data => {
      this.globalData.openid = data.openid
      this.globalData.sessionKey = data.session_key
    })
  },
  globalData: {
    userInfo: null,
    openid: null,
    sessionKey: null,
  }
})