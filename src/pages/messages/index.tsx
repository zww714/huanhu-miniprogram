import { useState } from 'react'
import Taro, { useDidShow } from '@tarojs/taro'
import { Text, View } from '@tarojs/components'
import { CONVERSATIONS, type NotificationType } from '../../utils/mock'
import { getChatConversations } from '../../utils/api'
import { getUnreadCounts, markAllNotificationsRead, updateMessageTabUnread } from '../../utils/notifications'
import './index.css'

const NAV_BUTTONS: Array<{ name: string; desc: string; key: NotificationType; color: string; icon: string }> = [
  { name: '赞和收藏', desc: '查看点赞与收藏提醒', key: 'likes', color: '#EF4444', icon: '♥' },
  { name: '新增关注', desc: '查看关注你的同学', key: 'follows', color: '#10B981', icon: '+' },
  { name: '评论和@', desc: '查看帖子评论、回复和提及你的互动', key: 'comments', color: '#3B82F6', icon: '@' },
  { name: '系统通知', desc: '查看平台和账号消息', key: 'system', color: '#64748B', icon: 'i' },
]

type Conversation = {
  id: string
  name: string
  avatar?: string
  lastMessage: string
  timestamp: string
  unread: number
  unreadCount?: number
  online?: boolean
  category?: string
}

function getConversationUnread(conv: Conversation) {
  return Number(conv.unreadCount ?? conv.unread ?? 0)
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
    const nextUnreadCounts = getUnreadCounts()
    setUnreadCounts(nextUnreadCounts)

    async function loadConversations() {
      try {
        const cloudConversations = await getChatConversations()
        const cloudIds = new Set(cloudConversations.map((item: Conversation) => item.id))
        const nextConversations = [
          ...cloudConversations,
          ...normalizeBaseConversations().filter((item) => !cloudIds.has(item.id)),
        ]
        setConversations(nextConversations)
        const chatUnread = nextConversations.reduce((sum, item) => sum + getConversationUnread(item), 0)
        updateMessageTabUnread(chatUnread)
      } catch (e) {
        console.warn('[Messages] load conversations failed', e)
        const nextConversations = normalizeBaseConversations()
        setConversations(nextConversations)
        updateMessageTabUnread()
      }
    }

    loadConversations()
  })

  const notificationUnreadTotal = Object.values(unreadCounts).reduce((sum, count) => sum + count, 0)
  const chatUnreadTotal = conversations.reduce((sum, item) => sum + getConversationUnread(item), 0)
  const totalUnread = notificationUnreadTotal + chatUnreadTotal

  const handleAllRead = () => {
    markAllNotificationsRead()
    setUnreadCounts(getUnreadCounts())
    setConversations((current) => {
      const next = current.map((item) => ({ ...item, unread: 0, unreadCount: 0 }))
      updateMessageTabUnread(0)
      return next
    })
    Taro.showToast({ title: '已全部标为已读', icon: 'success' })
  }

  const navigateNotice = (type: NotificationType) => {
    Taro.navigateTo({ url: `/pages/notification-list/index?type=${type}` })
  }

  const goChat = (conv: Conversation) => {
    if (conv.name === '系统通知' || conv.category === '系统通知') {
      Taro.navigateTo({ url: '/pages/notification-list/index?type=system' })
      return
    }
    setConversations((current) =>
      current.map((item) => item.id === conv.id ? { ...item, unread: 0, unreadCount: 0 } : item)
    )
    updateMessageTabUnread(Math.max(0, chatUnreadTotal - getConversationUnread(conv)))
    Taro.navigateTo({
      url: `/pages/chat/index?id=${encodeURIComponent(conv.id)}&name=${encodeURIComponent(conv.name)}&category=${encodeURIComponent(conv.category || '聊天')}`,
    })
  }

  return (
    <View className='messages-page'>
      <View className='messages-head'>
        <Text className='page-title'>消息</Text>
      </View>

      <View className={totalUnread > 0 ? 'unread-summary active' : 'unread-summary'}>
        <View>
          <Text className='unread-title'>{totalUnread > 0 ? `你有 ${totalUnread > 99 ? '99+' : totalUnread} 条未读消息` : '暂无未读消息'}</Text>
          <Text className='unread-desc'>通知和聊天未读会同步到底部消息提醒</Text>
        </View>
        {totalUnread > 0 ? (
          <View className='unread-action' onClick={handleAllRead}>
            <Text>全部已读</Text>
          </View>
        ) : (
          <View className='unread-action disabled'>
            <Text>全部已读</Text>
          </View>
        )}
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
              <Text className='notice-desc'>{btn.desc}</Text>
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
          <View key={conv.id} className={getConversationUnread(conv) > 0 ? 'conversation-item unread' : 'conversation-item'} onClick={() => goChat(conv)}>
            <View className='conv-avatar-wrap'>
              <View className={getConversationUnread(conv) > 0 ? 'conv-avatar active' : 'conv-avatar'}>
                <Text>{(conv.name || '?')[0]}</Text>
              </View>
              {getConversationUnread(conv) > 0 && (
                <View className='chat-badge'>
                  <Text>{getConversationUnread(conv) > 99 ? '99+' : getConversationUnread(conv)}</Text>
                </View>
              )}
            </View>
            <View className='conv-main'>
              <View className='conv-head'>
                <Text className={getConversationUnread(conv) > 0 ? 'conv-name unread' : 'conv-name'} numberOfLines={1}>{conv.name}</Text>
                <Text className='conv-time'>{conv.timestamp}</Text>
              </View>
              <Text className={getConversationUnread(conv) > 0 ? 'conv-message unread' : 'conv-message'} numberOfLines={1}>{conv.lastMessage}</Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  )
}
