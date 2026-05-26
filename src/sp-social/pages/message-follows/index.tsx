import Taro, { useDidShow } from '@tarojs/taro'
import { Text, View } from '@tarojs/components'
import { useState } from 'react'
import { getNotifications, markNotificationsRead } from '../../../api'
import { openUnifiedUserProfile } from '../../../utils/publicProfiles'
import './index.css'

export default function MessageFollows() {
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useDidShow(() => {
    setLoading(true)
    getNotifications({ type: 'follows', page: 0, pageSize: 50 })
      .then((res) => setItems(res.data || []))
      .catch((e) => {
        console.warn('[MessageFollows] failed', e)
        setItems([])
      })
      .finally(() => setLoading(false))
  })

  const markRead = (item: any) => {
    if (!item.read) {
      markNotificationsRead({ ids: [item.id] }).catch(() => {})
      setItems((prev) => prev.map((i) => i.id === item.id ? { ...i, read: true } : i))
    }
    openUnifiedUserProfile(item.fromUserId, item.fromUserName)
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
          <Text style={{ fontSize: '16px', color: '#94A3B8' }}>暂无新的关注</Text>
        </View>
      )}
      {items.map((item) => (
        <View
          key={item.id}
          onClick={() => markRead(item)}
          style={{
            display: 'flex', alignItems: 'center',
            backgroundColor: item.read ? '#FFF' : '#EFF6FF',
            borderRadius: '12px', padding: '14px', marginBottom: '10px',
            border: `1px solid ${item.read ? '#E2E8F0' : '#BFDBFE'}`,
          }}
        >
          <View style={{
            width: '42px', height: '42px', borderRadius: '50%',
            backgroundColor: '#DCFCE7', display: 'flex',
            alignItems: 'center', justifyContent: 'center', marginRight: '12px',
          }}>
            <Text style={{ color: '#16A34A', fontWeight: '700' }}>
              {(item.fromUserName || '同').charAt(0)}
            </Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: '15px', fontWeight: '700', color: '#1E293B' }}>
              {item.fromUserName}
            </Text>
            <Text style={{ fontSize: '13px', color: '#64748B', marginTop: '4px' }}>
              关注了你 · {item.createdAt || ''}
            </Text>
          </View>
          <Text style={{ fontSize: '12px', color: '#2563EB', fontWeight: '600' }}>查看</Text>
        </View>
      ))}
    </View>
  )
}
