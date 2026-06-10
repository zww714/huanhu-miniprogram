import { View, Text } from '@tarojs/components'
import Taro, { useLoad } from '@tarojs/taro'
import { useEffect, useState } from 'react'

export default function UserDetailRedirect() {
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
    Taro.redirectTo({
      url: targetUrl,
      fail: () => Taro.navigateTo({ url: targetUrl }),
    })
  }, [targetUrl])

  return (
    <View className='user-page public-page'>
      <Text>正在打开主页...</Text>
    </View>
  )
}
