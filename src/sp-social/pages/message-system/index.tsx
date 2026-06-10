import { useState } from 'react'
import Taro, { useDidShow } from '@tarojs/taro'
import { Text, View } from '@tarojs/components'
import { getNotifications, markNotificationsRead } from '../../../api'
import './index.scss'

type SystemNotice = {
  id: string
  title: string
  content: string
  time?: string
  action?: string
  url?: string
}

function formatNoticeTime(value?: string) {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hour = String(date.getHours()).padStart(2, '0')
  const minute = String(date.getMinutes()).padStart(2, '0')
  return `${month}-${day} ${hour}:${minute}`
}

function normalizeNotice(item: any, index: number): SystemNotice {
  return {
    id: item.id || item._id || `notice-${index}`,
    title: item.title || item.name || '系统通知',
    content: item.content || item.message || item.desc || '',
    time: formatNoticeTime(item.createdAt || item.time),
    action: item.actionText || item.action || '',
    url: item.url || item.path || '',
  }
}

export default function MessageSystem() {
  const [notices, setNotices] = useState<SystemNotice[]>([])
  const [loading, setLoading] = useState(true)

  useDidShow(() => {
    let alive = true
    setLoading(true)
    getNotifications({ type: 'system', page: 0, pageSize: 20 })
      .then((res) => {
        if (!alive) return
        const data = Array.isArray(res.data) ? res.data : []
        setNotices(data.map(normalizeNotice).filter((item) => item.content || item.title))
        markNotificationsRead({ type: 'system' }).catch(() => undefined)
      })
      .catch(() => {
        if (alive) setNotices([])
      })
      .finally(() => {
        if (alive) setLoading(false)
      })
    return () => { alive = false }
  })

  const go = (url?: string) => {
    if (!url) return
    const target = url.split('?')[0]
    const tabPages = ['/pages/index/index', '/pages/discover/index', '/pages/messages/index', '/pages/profile/index']
    const method = tabPages.includes(target) ? Taro.switchTab : Taro.navigateTo
    method({ url, fail: () => Taro.showToast({ title: '页面暂不可用', icon: 'none' }) })
  }

  return (
    <View style={{ minHeight: '100vh', backgroundColor: '#F8FAFC', padding: '12px' }}>
      {loading ? (
        <View style={{ padding: '48px 16px', textAlign: 'center' }}>
          <Text style={{ color: '#94A3B8', fontSize: '14px' }}>正在加载系统通知...</Text>
        </View>
      ) : null}

      {!loading && notices.length === 0 ? (
        <View style={{ padding: '56px 16px', textAlign: 'center', backgroundColor: '#FFF', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
          <Text style={{ display: 'block', color: '#1E293B', fontSize: '16px', fontWeight: '700' }}>暂无系统通知</Text>
          <Text style={{ display: 'block', color: '#94A3B8', fontSize: '13px', marginTop: '8px' }}>平台公告和系统提醒会显示在这里</Text>
        </View>
      ) : null}

      {notices.map((notice) => (
        <View key={notice.id} style={{ backgroundColor: '#FFF', borderRadius: '12px', padding: '14px', marginBottom: '10px', border: '1px solid #E2E8F0' }}>
          <View style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
            <View style={{ width: '34px', height: '34px', borderRadius: '50%', backgroundColor: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: '10px' }}>
              <Text style={{ color: '#2563EB', fontSize: '16px', fontWeight: '700' }}>i</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ display: 'block', fontSize: '15px', fontWeight: '700', color: '#1E293B' }}>{notice.title}</Text>
              {notice.time ? <Text style={{ display: 'block', fontSize: '11px', color: '#94A3B8', marginTop: '2px' }}>{notice.time}</Text> : null}
            </View>
          </View>
          <Text style={{ display: 'block', fontSize: '13px', color: '#475569', lineHeight: '20px' }}>{notice.content}</Text>
          {notice.action && notice.url ? (
            <View onClick={() => go(notice.url)} style={{ marginTop: '12px', padding: '8px 0', borderRadius: '8px', backgroundColor: '#EFF6FF', textAlign: 'center' }}>
              <Text style={{ fontSize: '13px', color: '#2563EB', fontWeight: '600' }}>{notice.action}</Text>
            </View>
          ) : null}
        </View>
      ))}
    </View>
  )
}
