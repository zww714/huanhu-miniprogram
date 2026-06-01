import { memo } from 'react'
import { View } from '@tarojs/components'
import './Skeleton.scss'

const SkeletonBlock = memo(function SkeletonBlock({ className }: { className?: string }) {
  return <View className={`skeleton-block ${className || ''}`}>
    <View className='skeleton-pulse' />
  </View>
})

const Skeleton = memo(function Skeleton() {
  return (
    <View className='skeleton-page'>
      {/* Hero Banner */}
      <View className='skeleton-hero'>
        <View className='skeleton-hero-title'>
          <View className='skeleton-line skeleton-line--short' />
          <View className='skeleton-line' />
        </View>
        <View className='skeleton-hero-body'>
          <View className='skeleton-line skeleton-line--long' />
        </View>
        <View className='skeleton-hero-features'>
          {[1, 2, 3].map((i) => (
            <View key={i} className='skeleton-feature' />
          ))}
        </View>
      </View>

      {/* Filters */}
      <View className='skeleton-filters'>
        {[1, 2, 3, 4, 5].map((i) => (
          <View key={i} className='skeleton-chip' />
        ))}
      </View>

      {/* Recommendation Section */}
      <View className='skeleton-section'>
        <View className='skeleton-section-header'>
          <View className='skeleton-line skeleton-line--short' />
        </View>
        <View className='skeleton-grid skeleton-grid--4'>
          {[1, 2, 3, 4].map((i) => (
            <View key={i} className='skeleton-grid-item skeleton-recommend-card'>
              <View className='skeleton-line' />
              <View className='skeleton-line skeleton-line--short' />
              <View className='skeleton-line skeleton-line--long' />
            </View>
          ))}
        </View>
      </View>

      {/* User/Activity Card Area */}
      <View className='skeleton-section'>
        <View className='skeleton-section-header'>
          <View className='skeleton-line skeleton-line--short' />
        </View>
        <View className='skeleton-card-list'>
          {[1, 2].map((i) => (
            <View key={i} className='skeleton-user-card'>
              <View className='skeleton-avatar' />
              <View className='skeleton-card-body'>
                <View className='skeleton-line' />
                <View className='skeleton-line skeleton-line--long' />
                <View className='skeleton-tags'>
                  <View className='skeleton-chip skeleton-chip--small' />
                  <View className='skeleton-chip skeleton-chip--small' />
                </View>
              </View>
            </View>
          ))}
        </View>
      </View>

      {/* Hot Topics */}
      <View className='skeleton-section'>
        <View className='skeleton-section-header'>
          <View className='skeleton-line skeleton-line--short' />
        </View>
        <View className='skeleton-grid skeleton-grid--2'>
          {[1, 2, 3, 4].map((i) => (
            <View key={i} className='skeleton-grid-item skeleton-topic-card'>
              <View className='skeleton-chip skeleton-chip--small' />
              <View className='skeleton-card-body'>
                <View className='skeleton-line' />
                <View className='skeleton-line skeleton-line--short' />
              </View>
            </View>
          ))}
        </View>
      </View>
      <View className='skeleton-loading-tip'>正在加载中...</View>
    </View>
  )
})

export default Skeleton
