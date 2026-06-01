import { memo } from 'react'
import { Text, View } from '@tarojs/components'

interface RecommendItem {
  id: string
  label: string
  title: string
  desc: string
  badge?: string
  tone: string
  category: string
  detail: string
  user?: Record<string, unknown>
}

interface Props {
  items: RecommendItem[]
  onExpandDetail: (data: unknown) => void
  onRecommendationClick: (id: string) => void
}

const TodayRecommend = memo(function TodayRecommend({
  items, onExpandDetail, onRecommendationClick,
}: Props) {
  return (
    <View className='home-section home-recommend-section'>
      <View className='home-section-header'>
        <Text className='home-section-title'>今日推荐</Text>
        <Text className='home-section-more' onClick={() => onExpandDetail({ type: 'recommendation-list', title: '今日推荐', detail: '\u6839\u636e\u5f53\u524d\u5206\u7c7b\u4e3a\u4f60\u7b5b\u9009\u7684\u63a8\u8350\u5185\u5bb9\u3002' })}>查看全部 〉</Text>
      </View>
      <View className='home-recommend-grid'>
        {items.map((item) => (
          <View className={`home-recommend-card home-recommend-card--${item.tone}`} key={item.id} onClick={() => onRecommendationClick(item.id)}>
            <View className='home-recommend-head'>
              <Text className='home-recommend-label' numberOfLines={1}>{item.label}</Text>
              {item.badge ? <Text className='home-recommend-badge'>{item.badge}</Text> : null}
            </View>
            <Text className='home-recommend-title' numberOfLines={1}>{item.title}</Text>
            <Text className='home-recommend-desc' numberOfLines={1}>{item.desc}</Text>
          </View>
        ))}
      </View>
    </View>
  )
})

export default TodayRecommend
