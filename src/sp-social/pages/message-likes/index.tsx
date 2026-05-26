import Taro, { useDidShow } from '@tarojs/taro'
import { Text, View } from '@tarojs/components'
import { useState } from 'react'
import { getNotifications, markNotificationsRead } from '../../../api'
import './index.css'

export default function MessageLikes() {
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useDidShow(() => {
    setLoading(true)
    getNotifications({ type: 'likes', page: 0, pageSize: 50 })
      .then((res) => setItems(res.data || []))
      .catch((e) => {
        console.warn('[MessageLikes] failed', e)
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
          <Text style={{ fontSize: '16px', color: '#94A3B8' }}>暂无点赞和收藏通知</Text>
        </View>
      )}
      {items.map((item) => (
        <View
          key={item.id}
          onClick={() => markRead(item)}
          style={{
            display: 'flex', gap: '12px',
            backgroundColor: item.read ? '#FFF' : '#FEF2F2',
            borderRadius: '12px', padding: '14px', marginBottom: '10px',
            border: `1px solid ${item.read ? '#FEE2E2' : '#FECACA'}`,
          }}
        >
          <View style={{
            width: '42px', height: '42px', borderRadius: '50%',
            backgroundColor: '#FEE2E2', display: 'flex',
            alignItems: 'center', justifyContent: 'center',
          }}>
            <Text style={{ color: '#EF4444', fontSize: '18px' }}>♡</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: '15px', fontWeight: '700', color: '#1E293B' }}>
              {item.fromUserName}
            </Text>
            <Text style={{ fontSize: '13px', color: '#64748B', marginTop: '4px' }}>
              {item.content}
            </Text>
            {item.targetTitle && (
              <Text
                style={{ fontSize: '13px', color: '#2563EB', marginTop: '6px' }}
                numberOfLines={1}
              >
                {item.targetTitle}
              </Text>
            )}
            <Text style={{ fontSize: '11px', color: '#94A3B8', marginTop: '6px' }}>
              {item.createdAt || ''}
            </Text>
          </View>
        </View>
      ))}
    </View>
  )
}

