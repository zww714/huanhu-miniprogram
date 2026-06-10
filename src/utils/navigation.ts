import Taro from '@tarojs/taro'

function showTransitionLoading(title = '加载中') {
  Taro.showLoading({ title, mask: true })
}

function hideTransitionLoading(delay = 520) {
  setTimeout(() => {
    Taro.hideLoading().catch(() => undefined)
  }, delay)
}

export function smoothNavigateTo(url: string, title = '加载中') {
  showTransitionLoading(title)
  Taro.navigateTo({
    url,
    success: () => hideTransitionLoading(),
    fail: () => {
      Taro.hideLoading().catch(() => undefined)
      Taro.showToast({ title: '页面暂不可用', icon: 'none' })
    },
  })
}

export function smoothSwitchTab(url: string, title = '加载中') {
  showTransitionLoading(title)
  Taro.switchTab({
    url,
    success: () => hideTransitionLoading(),
    fail: () => {
      Taro.hideLoading().catch(() => undefined)
      Taro.showToast({ title: '页面暂不可用', icon: 'none' })
    },
  })
}
