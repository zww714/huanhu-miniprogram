import { View } from '@tarojs/components'
import Taro, { useLoad } from '@tarojs/taro'
import { useEffect, useState } from 'react'

export default function LegacyProfileViewRedirect() {
  const [targetUrl, setTargetUrl] = useState('')

  useLoad((options) => {
    const userId = decodeURIComponent(String(options?.userId || options?.id || ''))
    const name = decodeURIComponent(String(options?.name || ''))
    const query = [
      userId ? `userId=${encodeURIComponent(userId)}` : '',
      name ? `name=${encodeURIComponent(name)}` : '',
    ].filter(Boolean).join('&')
    setTargetUrl(`/sp-profile/pages/profile/view${query ? `?${query}` : ''}`)
  })

  useEffect(() => {
    if (!targetUrl) return
    Taro.showLoading({ title: '加载中', mask: true })
    Taro.redirectTo({
      url: targetUrl,
      success: () => setTimeout(() => Taro.hideLoading().catch(() => undefined), 520),
      fail: () => Taro.navigateTo({
        url: targetUrl,
        success: () => setTimeout(() => Taro.hideLoading().catch(() => undefined), 520),
        fail: () => Taro.hideLoading().catch(() => undefined),
      }),
    })
  }, [targetUrl])

  return <View style={{ minHeight: '100vh', backgroundColor: '#F8FAFC' }} />
}
