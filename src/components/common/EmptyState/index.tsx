import { Image, Text, View } from '@tarojs/components'

interface EmptyStateProps {
  icon?: string
  title?: string
  description?: string
  actionText?: string
  onAction?: () => void
}

export default function EmptyState({
  icon = '📭',
  title = '暂无内容',
  description = '',
  actionText,
  onAction,
}: EmptyStateProps) {
  return (
    <View style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80rpx 40rpx' }}>
      <Text style={{ fontSize: '80rpx', marginBottom: '24rpx' }}>{icon}</Text>
      <Text style={{ fontSize: '32rpx', fontWeight: 600, color: '#1E293B', marginBottom: '12rpx' }}>{title}</Text>
      {description && (
        <Text style={{ fontSize: '28rpx', color: '#94A3B8', textAlign: 'center', lineHeight: '1.6' }}>{description}</Text>
      )}
      {actionText && onAction && (
        <View
          style={{ marginTop: '32rpx', padding: '20rpx 48rpx', backgroundColor: '#2563EB', borderRadius: '40rpx' }}
          onClick={onAction}
          hoverClass="opacity-80"
        >
          <Text style={{ fontSize: '28rpx', color: '#FFFFFF', fontWeight: 500 }}>{actionText}</Text>
        </View>
      )}
    </View>
  )
}
