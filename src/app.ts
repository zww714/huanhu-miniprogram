import { PropsWithChildren } from 'react'
import Taro, { useDidShow, useLaunch } from '@tarojs/taro'
import { updateMessageTabUnread } from './utils/notifications'
import './app.scss'

const APP_CONFIG = {
  CLOUD_ENV: 'huanhu-d7gvz7pe18171aad3',
  LOGIN_KEY: 'huanhuLoginUser',
  TOKEN_KEY: 'token',
  PRIVACY_AGREED_KEY: 'huanhuPrivacyAgreed',
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

function setupPrivacyAuth() {
  // 处理微信隐私授权回调（2023年版本起微信要求）
  wx.onNeedPrivacyAuthorization?.((resolve) => {
    // 检查是否已经同意过
    const agreed = Taro.getStorageSync(APP_CONFIG.PRIVACY_AGREED_KEY)
    if (agreed) {
      resolve({ buttonId: 'agree', event: 'agree' })
      return
    }

    // 显示隐私授权弹窗
    wx.showModal({
      title: '隐私授权',
      content: '我们需要获取你的微信昵称和头像，用于创建和展示个人资料。请阅读并同意隐私协议。',
      confirmText: '同意',
      cancelText: '拒绝',
      success: (res) => {
        if (res.confirm) {
          Taro.setStorageSync(APP_CONFIG.PRIVACY_AGREED_KEY, true)
          resolve({ buttonId: 'agree', event: 'agree' })
        } else {
          // 拒绝后弹说明
          wx.showToast({ title: '拒绝授权将无法获取头像昵称', icon: 'none', duration: 3000 })
        }
      },
    })
  })
}

function App({ children }: PropsWithChildren) {
  useLaunch(() => {
    ensureCloud()
    setupPrivacyAuth()
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

