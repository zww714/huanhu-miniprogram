import { Component, type ErrorInfo, type ReactNode } from 'react'
import { Text, View } from '@tarojs/components'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
}

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[ErrorBoundary]', error, info.componentStack)
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined })
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback

      return (
        <View style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80rpx 40rpx' }}>
          <Text style={{ fontSize: '64rpx', marginBottom: '24rpx' }}>⚠️</Text>
          <Text style={{ fontSize: '32rpx', fontWeight: 600, color: '#1E293B', marginBottom: '12rpx' }}>页面加载出错</Text>
          <Text style={{ fontSize: '26rpx', color: '#94A3B8', textAlign: 'center', marginBottom: '32rpx' }}>
            请检查网络后重试
          </Text>
          <View
            style={{ padding: '16rpx 40rpx', backgroundColor: '#2563EB', borderRadius: '40rpx' }}
            onClick={this.handleRetry}
            hoverClass="opacity-80"
          >
            <Text style={{ fontSize: '28rpx', color: '#FFFFFF' }}>重试</Text>
          </View>
        </View>
      )
    }

    return this.props.children
  }
}
