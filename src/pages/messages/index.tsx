import { useState } from 'react'
import Taro, { useDidShow } from '@tarojs/taro'
import { Image, Text, View } from '@tarojs/components'
import { CONVERSATIONS, type NotificationType } from '../../utils/mock'
import { getChatConversations, getNotificationUnreadCounts } from '../../utils/api'
import { getUnreadCounts as localGetUnreadCounts, markAllNotificationsRead, updateMessageTabUnread } from '../../utils/notifications'
import './index.css'

const QUICK_ENTRIES: Array<{
  title: string
  key: NotificationType
  icon: string
  tone: 'like' | 'follow' | 'comment' | 'system'
}> = [
  { title: '赞和收藏', key: 'likes', icon: '♥', tone: 'like' },
  { title: '新增关注', key: 'follows', icon: '●', tone: 'follow' },
  { title: '评论和@', key: 'comments', icon: '••', tone: 'comment' },
  { title: '系统通知', key: 'system', icon: '铃', tone: 'system' },
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
  targetUserId?: string
}

function getConversationUnread(conv: Conversation) {
  return Number(conv.unreadCount ?? conv.unread ?? 0)
}

function firstChar(name: string) {
  return (name || '同').trim().charAt(0) || '同'
}

function isRenderableImage(src?: string) {
  return !!src && !src.startsWith('linear-gradient') && !src.includes('/assets/avatar.png')
}

function normalizeBaseConversations() {
  return CONVERSATIONS
    .filter((item) => item.name !== '系统通知' && item.category !== '系统通知')
    .map((item) => ({
      ...item,
      id: String(item.id),
      unread: Number(item.unread || 0),
      unreadCount: Number(item.unreadCount ?? item.unread ?? 0),
    }))
}

function formatBadge(count: number) {
  if (count <= 0) return ''
  return count > 99 ? '99+' : String(count)
}

export default function Messages() {
  const [conversations, setConversations] = useState<Conversation[]>(normalizeBaseConversations())
  const [unreadCounts, setUnreadCounts] = useState(localGetUnreadCounts())

  useDidShow(() => {
    const baseConversations = normalizeBaseConversations()
    setConversations(baseConversations)

    getNotificationUnreadCounts().then((cloudCounts) => {
      setUnreadCounts(cloudCounts)
      updateMessageTabUnread()
    }).catch(() => {
      setUnreadCounts(localGetUnreadCounts())
    })

    async function loadConversations() {
      try {
        const cloudConversations = await getChatConversations()
        if (!Array.isArray(cloudConversations) || cloudConversations.length === 0) {
          const chatUnread = baseConversations.reduce((sum, item) => sum + getConversationUnread(item), 0)
          updateMessageTabUnread(chatUnread)
          return
        }
        const cloudIds = new Set(cloudConversations.map((item: Conversation) => item.id))
        const nextConversations = [
          ...cloudConversations,
          ...baseConversations.filter((item) => !cloudIds.has(item.id)),
        ]
        setConversations(nextConversations)
        const chatUnread = nextConversations.reduce((sum, item) => sum + getConversationUnread(item), 0)
        updateMessageTabUnread(chatUnread)
      } catch (e) {
        const chatUnread = baseConversations.reduce((sum, item) => sum + getConversationUnread(item), 0)
        updateMessageTabUnread(chatUnread)
      }
    }

    loadConversations()
  })

  const systemUnread = Number(unreadCounts.system || 0)
  const notificationUnreadTotal = Object.values(unreadCounts).reduce((sum, count) => sum + count, 0)
  const chatUnreadTotal = conversations.reduce((sum, item) => sum + getConversationUnread(item), 0)
  const totalUnread = notificationUnreadTotal + chatUnreadTotal

  const navigateNotice = (type: NotificationType) => {
    const directPages: Record<string, string> = {
      likes: '/pages/message-likes/index',
      follows: '/pages/message-follows/index',
      comments: '/pages/message-comments/index',
      system: '/pages/message-system/index',
    }
    const url = directPages[type] || `/pages/notification-list/index?type=${type}`
    Taro.navigateTo({ url })
  }

  const goChat = (conv: Conversation) => {
    setConversations((current) =>
      current.map((item) => item.id === conv.id ? { ...item, unread: 0, unreadCount: 0 } : item)
    )
    updateMessageTabUnread(Math.max(0, chatUnreadTotal - getConversationUnread(conv)))
    Taro.navigateTo({
      url: `/pages/chat/index?id=${encodeURIComponent(conv.id)}&name=${encodeURIComponent(conv.name)}&category=${encodeURIComponent(conv.category || '聊天')}`,
    })
  }

  const handleMarkAllRead = () => {
    if (totalUnread <= 0) {
      Taro.showToast({ title: '暂无未读消息', icon: 'none' })
      return
    }
    markAllNotificationsRead()
    setUnreadCounts({ likes: 0, follows: 0, comments: 0, system: 0 })
    setConversations((current) =>
      current.map((item) => ({ ...item, unread: 0, unreadCount: 0 }))
    )
    updateMessageTabUnread(0)
    Taro.showToast({ title: '已全部标为已读', icon: 'success' })
  }

  const renderBadge = (count: number, className = 'message-badge') => {
    const label = formatBadge(count)
    if (!label) return null
    return (
      <View className={className}>
        <Text>{label}</Text>
      </View>
    )
  }

  return (
    <View className='messages-page'>
      <View className='message-overview'>
        <View className='message-overview-text'>
          <Text className='message-overview-title'>消息中心</Text>
          <Text className='message-overview-desc'>
            {totalUnread > 0 ? `还有 ${formatBadge(totalUnread)} 条未读消息` : '所有消息都已读'}
          </Text>
        </View>
        <View
          className={`mark-read-btn ${totalUnread <= 0 ? 'mark-read-btn--disabled' : ''}`}
          onClick={handleMarkAllRead}
        >
          <Text>全部已读</Text>
        </View>
      </View>

      <View className='quick-entry-row'>
        {QUICK_ENTRIES.map((entry) => {
          const unread = unreadCounts[entry.key] || 0
          return (
            <View key={entry.key} className='quick-entry' onClick={() => navigateNotice(entry.key)}>
              <View className={`quick-icon quick-icon--${entry.tone}`}>
                <Text>{entry.icon}</Text>
                {renderBadge(unread)}
              </View>
              <Text className='quick-title'>{entry.title}</Text>
            </View>
          )
        })}
      </View>

      <View className='message-list-card'>
        {conversations.map((conv) => {
          const unread = getConversationUnread(conv)
          return (
            <View key={conv.id} className='message-row' onClick={() => goChat(conv)}>
              <View className='chat-avatar'>
                {isRenderableImage(conv.avatar) ? (
                  <Image className='chat-avatar-img' src={conv.avatar} mode='aspectFill' />
                ) : (
                  <Text>{firstChar(conv.name)}</Text>
                )}
              </View>
              <View className='message-main'>
                <Text className='message-title' numberOfLines={1}>{conv.name}</Text>
                <Text className='message-content' numberOfLines={1}>{conv.lastMessage}</Text>
              </View>
              <View className='message-side'>
                <Text className='message-time'>{conv.timestamp}</Text>
                {renderBadge(unread, 'row-badge')}
              </View>
            </View>
          )
        })}
      </View>

      {totalUnread > 0 ? <View className='total-unread-shadow' /> : null}
    </View>
  )
}
