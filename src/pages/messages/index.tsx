import { useState } from 'react'
import Taro, { useDidShow } from '@tarojs/taro'
import { Text, View } from '@tarojs/components'
import { CONVERSATIONS } from '../../utils/mock'
import { getChatConversations } from '../../utils/api'
import './index.css'

const NAV_BUTTONS = [
  { name: '赞和收藏', key: 'likes', color: '#EF4444', icon: '♥' },
  { name: '新增关注', key: 'follows', color: '#10B981', icon: '+' },
  { name: '评论和@', key: 'comments', color: '#3B82F6', icon: '@' },
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
  return CONVERSATIONS.map((item) => ({ ...item, id: String(item.id) }))
}

export default function Messages() {
  const [conversations, setConversations] = useState<Conversation[]>([])

  useDidShow(() => {
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

  const navigate = (key: string) => {
    const titles: Record<string, string> = {
      likes: '赞和收藏',
      follows: '新增关注',
      comments: '评论和@',
    }
    Taro.showToast({ title: titles[key], icon: 'none' })
  }

  const goChat = (conv: Conversation) => {
    Taro.navigateTo({
      url: `/pages/chat/index?id=${encodeURIComponent(conv.id)}&name=${encodeURIComponent(conv.name)}&category=${encodeURIComponent(conv.category || '聊天')}`,
    })
  }

  return (
    <View style={{ minHeight: '100vh', backgroundColor: '#F8FAFC' }}>
      <View style={{ backgroundColor: '#FFF', padding: '12px 16px 8px' }}>
        <Text style={{ fontSize: '22px', fontWeight: '700', color: '#1E293B' }}>消息</Text>
      </View>

      <View style={{ display: 'flex', gap: '8px', padding: '4px 16px 12px', backgroundColor: '#FFF' }}>
        {NAV_BUTTONS.map((btn) => (
          <View key={btn.key} onClick={() => navigate(btn.key)}
            style={{
              flex: 1, padding: '14px 4px', borderRadius: '12px',
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              justifyContent: 'center', gap: '4px',
              backgroundColor: btn.color + '10',
              border: '1px solid ' + btn.color + '20',
            }}
          >
            <Text style={{ fontSize: '20px' }}>{btn.icon}</Text>
            <Text style={{ fontSize: '13px', fontWeight: '500', color: btn.color }}>{btn.name}</Text>
          </View>
        ))}
      </View>

      <View style={{ height: '8px', backgroundColor: '#F1F5F9' }} />

      <View style={{ padding: '14px 16px 8px', backgroundColor: '#FFF', borderBottom: '1px solid #F1F5F9' }}>
        <Text style={{ fontSize: '15px', fontWeight: '600', color: '#1E293B' }}>聊天消息</Text>
      </View>

      <View style={{ backgroundColor: '#FFF' }}>
        {conversations.map((conv) => (
          <View key={conv.id} onClick={() => goChat(conv)}
            style={{
              display: 'flex', padding: '12px 16px', gap: '12px', alignItems: 'center',
              backgroundColor: conv.unread > 0 ? '#F8FAFC' : '#FFF',
              borderBottom: '1px solid #F1F5F9',
            }}
          >
            <View style={{ position: 'relative', width: '50px', height: '50px', flexShrink: 0 }}>
              <View style={{
                width: '50px', height: '50px', borderRadius: '50%',
                backgroundColor: conv.unread > 0 ? '#2563EB' : '#E2E8F0',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Text style={{ fontSize: '20px', color: conv.unread > 0 ? '#FFF' : '#64748B' }}>
                  {(conv.name || '?')[0]}
                </Text>
              </View>
              {conv.unread > 0 && (
                <View style={{
                  position: 'absolute', top: '-2px', right: '-2px',
                  minWidth: '18px', height: '18px', borderRadius: '9px',
                  backgroundColor: '#EF4444',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  padding: '0 4px',
                }}>
                  <Text style={{ fontSize: '10px', color: '#FFF', fontWeight: '600' }}>
                    {conv.unread > 99 ? '99+' : conv.unread}
                  </Text>
                </View>
              )}
            </View>
            <View style={{ flex: 1, minWidth: 0 }}>
              <View style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Text style={{ fontSize: '15px', fontWeight: conv.unread > 0 ? '600' : '400', color: '#1E293B' }} numberOfLines={1}>
                  {conv.name}
                </Text>
                <Text style={{ fontSize: '11px', color: '#94A3B8', flexShrink: 0, marginLeft: '8px' }}>
                  {conv.timestamp}
                </Text>
              </View>
              <Text style={{ fontSize: '13px', color: conv.unread > 0 ? '#475569' : '#94A3B8', marginTop: '4px' }} numberOfLines={1}>
                {conv.lastMessage}
              </Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  )
}
