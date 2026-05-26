import Taro, { useDidShow } from '@tarojs/taro'
import { Text, View } from '@tarojs/components'
import { useState } from 'react'
import { getNotifications, markNotificationsRead } from '../../../api'
import './index.css'

export default function MessageComments() {
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useDidShow(() => {
    setLoading(true)
    getNotifications({ type: 'comments', page: 0, pageSize: 50 })
      .then((res) => setItems(res.data || []))
      .catch((e) => {
        console.warn('[MessageComments] failed', e)
        setItems([])
      })
      .finally(() => setLoading(false))
  })

  const markRead = (item: any) => {
    if (!item.read) {
      markNotificationsRead({ ids: [item.id] }).catch(() => {})
      setItems((prev) => prev.map((i) => i.id === item.id ? { ...i, read: true } : i))
    }
    if (item.targetType === 'post' && item.targetId) {
      Taro.navigateTo({ url: `/sp-content/pages/post-detail/index?postId=${encodeURIComponent(item.targetId)}` })
    }
  }

  if (loading) {
    return (
      <View style={{ minHeight: '100vh', backgroundColor: '#F8FAFC', padding: '12px' }}>
        <Text style={{ textAlign: 'center', padding: '40px', color: '#94A3B8' }}>加载中...</Text>
      </View>
    )
  }

  return (
    <View style={{ minHeight: '100vh', backgroundColor: '#F8FAFC', padding: '12px' }}>
      {!items.length && (
        <View style={{ textAlign: 'center', padding: '60px 20px' }}>
          <Text style={{ fontSize: '16px', color: '#94A3B8' }}>暂无评论通知</Text>
        </View>
      )}
      {items.map((item) => (
        <View
          key={item.id}
          onClick={() => markRead(item)}
          style={{
            backgroundColor: item.read ? '#FFF' : '#EFF6FF',
            borderRadius: '12px', padding: '14px', marginBottom: '10px',
            border: `1px solid ${item.read ? '#DBEAFE' : '#93C5FD'}`,
          }}
        >
          <View style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
            <View style={{
              width: '36px', height: '36px', borderRadius: '50%',
              backgroundColor: '#DBEAFE', display: 'flex',
              alignItems: 'center', justifyContent: 'center', marginRight: '10px',
            }}>
              <Text style={{ color: '#2563EB', fontWeight: '700' }}>
                {(item.fromUserName || '同').charAt(0)}
              </Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: '15px', fontWeight: '700', color: '#1E293B' }}>
                {item.fromUserName}
              </Text>
              <Text style={{ fontSize: '12px', color: '#94A3B8', marginTop: '2px' }}>
                评论了你的帖子 · {item.createdAt || ''}
              </Text>
            </View>
          </View>
          <Text style={{ fontSize: '13px', color: '#475569', lineHeight: '20px' }}>
            {item.content}
          </Text>
          {item.targetTitle && (
            <Text style={{ fontSize: '13px', color: '#2563EB', marginTop: '8px' }} numberOfLines={1}>
              {item.targetTitle}
            </Text>
          )}
        </View>
      ))}
    </View>
  )
}

