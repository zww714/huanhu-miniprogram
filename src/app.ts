import { PropsWithChildren } from 'react'
import Taro, { useDidShow, useLaunch } from '@tarojs/taro'
import { updateMessageTabUnread } from './utils/notifications'
import './app.scss'

const APP_CONFIG = {
  CLOUD_ENV: 'cloud1-d3geudxpp50aa1802',
  LOGIN_KEY: 'huanhuLoginUser',
  TOKEN_KEY: 'token',
}

let cloudReady = false
function ensureCloud() {
  if (cloudReady) return
  try {
    wx.cloud.init({ env: APP_CONFIG.CLOUD_ENV, traceUser: true })
    cloudReady = true
  } catch (e) {
    console.warn('[App] cloud init failed', e)
  }
}

function checkLogin() {
  const token = Taro.getStorageSync(APP_CONFIG.TOKEN_KEY)
  const user = Taro.getStorageSync(APP_CONFIG.LOGIN_KEY)
  if (!token && !user) {
    const pages = Taro.getCurrentPages()
    const currentRoute = pages[pages.length - 1]?.route || ''
    if (!currentRoute.includes('login') && !currentRoute.includes('verify') && !currentRoute.includes('index')) {
      Taro.navigateTo({ url: '/sp-common/pages/login/index' })
    }
  }
}

function refreshBadge() {
  try { updateMessageTabUnread() } catch (e) {}
}

function setupErrorHandler() {
  wx.onUnhandledRejection?.((res) => {
    console.warn('[App] unhandled rejection:', res.reason)
  })
}

function App({ children }: PropsWithChildren) {
  useLaunch(() => {
    ensureCloud()
    checkLogin()
    refreshBadge()
    setupErrorHandler()
  })

  useDidShow(() => {
    refreshBadge()
  })

  return children
}

export default App

