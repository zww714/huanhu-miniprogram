import { ActivityIndicator, Text, View } from '@tarojs/components'

interface LoadingProps {
  text?: string
  fullScreen?: boolean
  size?: 'small' | 'large'
}

export default function Loading({ text = '加载中...', fullScreen = false, size = 'large' }: LoadingProps) {
  const style = fullScreen
    ? { display: 'flex', flexDirection: 'column' as const, alignItems: 'center', justifyContent: 'center', minHeight: '60vh', padding: '40rpx' }
    : { display: 'flex', flexDirection: 'column' as const, alignItems: 'center', padding: '40rpx' }

  return (
    <View style={style}>
      <ActivityIndicator size={size} style={{ marginBottom: '16rpx' }} />
      {text && <Text style={{ fontSize: '28rpx', color: '#94A3B8' }}>{text}</Text>}
    </View>
  )
}
