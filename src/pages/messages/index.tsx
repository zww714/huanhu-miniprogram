import { useState } from 'react'
import Taro, { useDidShow } from '@tarojs/taro'
import { Text, View } from '@tarojs/components'
import { CONVERSATIONS, type NotificationType } from '../../utils/mock'
import { getChatConversations } from '../../utils/api'
import { getUnreadCounts } from '../../utils/notifications'
import './index.css'

const NAV_BUTTONS: Array<{ name: string; key: NotificationType; color: string; icon: string }> = [
  { name: '赞和收藏', key: 'likes', color: '#EF4444', icon: '♥' },
  { name: '新增关注', key: 'follows', color: '#10B981', icon: '+' },
  { name: '评论和@', key: 'comments', color: '#3B82F6', icon: '@' },
  { name: '系统通知', key: 'system', color: '#64748B', icon: 'i' },
]

type Conversation = {
  id: string
  name: string
  avatar?: string
  lastMessage: string
  timestamp: string
  unread: number
  online?: boolean
  category?: string
}

function normalizeBaseConversations() {
  return CONVERSATIONS
    .filter((item) => item.name === '系统通知' || item.category === '系统通知')
    .map((item) => ({
      ...item,
      id: String(item.id),
      unread: 0,
      lastMessage: '查看平台通知、活动提醒和账号消息',
      category: '系统通知',
    }))
}

export default function Messages() {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [unreadCounts, setUnreadCounts] = useState(getUnreadCounts())

  useDidShow(() => {
    setUnreadCounts(getUnreadCounts())

    async function loadConversations() {
      try {
        const cloudConversations = await getChatConversations()
        const cloudIds = new Set(cloudConversations.map((item: Conversation) => item.id))
        setConversations([
          ...cloudConversations,
          ...normalizeBaseConversations().filter((item) => !cloudIds.has(item.id)),
        ])
      } catch (e) {
        console.warn('[Messages] load conversations failed', e)
        setConversations(normalizeBaseConversations())
      }
    }

    loadConversations()
  })

  const navigateNotice = (type: NotificationType) => {
    Taro.navigateTo({ url: `/pages/notification-list/index?type=${type}` })
  }

  const goChat = (conv: Conversation) => {
    if (conv.name === '系统通知' || conv.category === '系统通知') {
      Taro.navigateTo({ url: '/pages/notification-list/index?type=system' })
      return
    }
    setConversations((current) =>
      current.map((item) => item.id === conv.id ? { ...item, unread: 0 } : item)
    )
    Taro.navigateTo({
      url: `/pages/chat/index?id=${encodeURIComponent(conv.id)}&name=${encodeURIComponent(conv.name)}&category=${encodeURIComponent(conv.category || '聊天')}`,
    })
  }

  return (
    <View className='messages-page'>
      <View className='messages-head'>
        <Text className='page-title'>消息</Text>
      </View>

      <View className='notice-grid'>
        {NAV_BUTTONS.map((btn) => {
          const unread = unreadCounts[btn.key]
          return (
            <View key={btn.key} className='notice-card' onClick={() => navigateNotice(btn.key)} style={{ backgroundColor: `${btn.color}10`, borderColor: `${btn.color}20` }}>
              <View className='notice-icon-wrap'>
                <Text className='notice-icon' style={{ color: btn.color }}>{btn.icon}</Text>
                {unread > 0 && (
                  <View className='notice-badge'>
                    <Text>{unread > 99 ? '99+' : unread}</Text>
                  </View>
                )}
              </View>
              <Text className='notice-name' style={{ color: btn.color }}>{btn.name}</Text>
            </View>
          )
        })}
      </View>

      <View className='split-line' />

      <View className='chat-title-row'>
        <Text>聊天消息</Text>
      </View>

      <View className='conversation-list'>
        {conversations.map((conv) => (
          <View key={conv.id} className={conv.unread > 0 ? 'conversation-item unread' : 'conversation-item'} onClick={() => goChat(conv)}>
            <View className='conv-avatar-wrap'>
              <View className={conv.unread > 0 ? 'conv-avatar active' : 'conv-avatar'}>
                <Text>{(conv.name || '?')[0]}</Text>
              </View>
              {conv.unread > 0 && (
                <View className='chat-badge'>
                  <Text>{conv.unread > 99 ? '99+' : conv.unread}</Text>
                </View>
              )}
            </View>
            <View className='conv-main'>
              <View className='conv-head'>
                <Text className={conv.unread > 0 ? 'conv-name unread' : 'conv-name'} numberOfLines={1}>{conv.name}</Text>
                <Text className='conv-time'>{conv.timestamp}</Text>
              </View>
              <Text className={conv.unread > 0 ? 'conv-message unread' : 'conv-message'} numberOfLines={1}>{conv.lastMessage}</Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  )
}
