import { useState } from 'react'
import Taro, { useDidShow } from '@tarojs/taro'
import { Text, View } from '@tarojs/components'
import { getBrowseHistory, clearBrowseHistory, type BrowseItem } from '../../../utils/history'
import './index.scss'

const typeLabels: Record<BrowseItem['type'], string> = {
  post: '帖子',
  skill: '技能',
  user: '用户',
}

const typeIcons: Record<BrowseItem['type'], string> = {
  post: '📄',
  skill: '⚡',
  user: '👤',
}

function formatTime(ts: number) {
  const d = new Date(ts)
  const now = new Date()
  const diff = now.getTime() - ts
  if (diff < 60000) return '刚刚'
  if (diff < 3600000) return `${Math.floor(diff / 60000)}分钟前`
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}小时前`
  if (d.getFullYear() === now.getFullYear()) {
    return `${d.getMonth() + 1}月${d.getDate()}日`
  }
  return `${d.getFullYear()}/${d.getMonth() + 1}/${d.getDate()}`
}

export default function BrowseHistory() {
  const [items, setItems] = useState<BrowseItem[]>([])

  useDidShow(() => {
    setItems(getBrowseHistory())
  })

  const handleClear = () => {
    Taro.showModal({
      title: '清空浏览记录',
      content: '确定清空所有浏览记录吗？',
      confirmColor: '#EF4444',
      success: ({ confirm }) => {
        if (!confirm) return
        clearBrowseHistory()
        setItems([])
        Taro.showToast({ title: '已清空', icon: 'success' })
      },
    })
  }

  const handleTap = (item: BrowseItem) => {
    const urls: Record<BrowseItem['type'], string> = {
      post: `/sp-content/pages/post-detail/index?postId=${encodeURIComponent(item.id)}`,
      skill: `/sp-content/pages/skill-detail/index?skillId=${encodeURIComponent(item.id)}`,
      user: `/sp-content/pages/user-detail/index?userId=${encodeURIComponent(item.id)}&name=${encodeURIComponent(item.title)}`,
    }
    Taro.navigateTo({ url: urls[item.type] })
  }

  return (
    <View className='history-page'>
      {items.length > 0 && (
        <View className='history-header'>
          <Text className='history-count'>共 {items.length} 条记录</Text>
          <Text className='history-clear' onClick={handleClear}>清空</Text>
        </View>
      )}

      {!items.length && (
        <View className='history-empty'>
          <Text className='empty-icon'>◷</Text>
          <Text className='empty-text'>暂无浏览记录</Text>
        </View>
      )}

      {items.map((item, idx) => (
        <View key={`${item.type}-${item.id}-${idx}`} className='history-item' onClick={() => handleTap(item)}>
          <View className={`history-icon history-icon--${item.type}`}>
            <Text>{typeIcons[item.type]}</Text>
          </View>
          <View className='history-content'>
            <Text className='history-title' numberOfLines={1}>{item.title}</Text>
            {item.subtitle && <Text className='history-subtitle' numberOfLines={1}>{item.subtitle}</Text>}
          </View>
          <View className='history-meta'>
            <Text className='history-type'>{typeLabels[item.type]}</Text>
            <Text className='history-time'>{formatTime(item.timestamp)}</Text>
          </View>
        </View>
      ))}
    </View>
  )
}



