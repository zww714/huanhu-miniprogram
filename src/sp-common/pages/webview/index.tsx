import Taro, { useLoad } from '@tarojs/taro'
import { Text, View, WebView } from '@tarojs/components'
import { useState } from 'react'

export default function WebviewPage() {
  const [url, setUrl] = useState('')

  useLoad((options) => {
    const nextUrl = decodeURIComponent(String(options?.url || ''))
    const title = decodeURIComponent(String(options?.title || ''))
    if (title) Taro.setNavigationBarTitle({ title })
    setUrl(nextUrl)
  })

  if (!url) {
    return (
      <View style={{ minHeight: '100vh', backgroundColor: '#F8FAFC', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ color: '#94A3B8', fontSize: '14px' }}>认证入口暂不可用</Text>
      </View>
    )
  }

  return <WebView src={url} />
}
