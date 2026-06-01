import { memo } from 'react'
import { Text, View } from '@tarojs/components'

interface TopicItem {
  id: string
  badge: string
  title: string
  stats: string
  detail: string
  user?: Record<string, unknown>
}

interface Props {
  topics: TopicItem[]
  onExpandDetail: (data: unknown) => void
  onTopicClick: (id: string) => void
}

const HotTopics = memo(function HotTopics({
  topics, onExpandDetail, onTopicClick,
}: Props) {
  return (
    <View className='home-section home-topic-section'>
      <View className='home-section-header'>
        <Text className='home-section-title'>本周校园热议</Text>
        <Text className='home-section-more' onClick={() => onExpandDetail({ type: 'topic-list', title: '本周校园热议', detail: '\u8fd9\u91cc\u5c55\u793a\u672c\u5468\u5728\u6821\u56ed\u5185\u8ba8\u8bba\u70ed\u5ea6\u8f83\u9ad8\u7684\u8bdd\u9898\u3002' })}>更多 〉</Text>
      </View>
      <View className='home-topic-grid'>
        {topics.map((topic) => (
          <View className='home-topic-card' key={topic.id} onClick={() => onTopicClick(topic.id)}>
            <Text className={topic.badge === '\u70ed' ? 'home-topic-badge home-topic-badge--hot' : 'home-topic-badge home-topic-badge--new'}>{topic.badge}</Text>
            <View className='home-topic-content'>
              <Text className='home-topic-title' numberOfLines={1}>{topic.title}</Text>
              <Text className='home-topic-stats'>{topic.stats}</Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  )
})

export default HotTopics
