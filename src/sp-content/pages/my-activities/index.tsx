import { useState } from 'react'
import Taro, { useDidShow } from '@tarojs/taro'
import { Text, View } from '@tarojs/components'
import { getMyActivityRegistrations, cancelActivityRegistration } from '../../../utils/api'
import { ACTIVITIES } from '../../../utils/mock'
import './index.css'

const fallbackRegistrations = ACTIVITIES.slice(0, 2).map((activity, index) => ({
  id: `mock_registration_${activity.id || index}`,
  activityId: activity.id || `mock_activity_${index}`,
  activity,
}))

export default function MyActivities() {
  const [registrations, setRegistrations] = useState<any[]>(fallbackRegistrations)
  const [loading, setLoading] = useState(false)

  useDidShow(() => {
    setLoading(false)
    setRegistrations(fallbackRegistrations)
    getMyActivityRegistrations()
      .then((data) => {
        if (Array.isArray(data) && data.length) setRegistrations(data)
      })
      .catch((e) => {
        console.warn('[MyActivities] failed', e)
        setRegistrations(fallbackRegistrations)
      })
      .finally(() => setLoading(false))
  })

  const goActivity = (item: any) => {
    Taro.navigateTo({
      url: `/sp-content/pages/activity-register/index?id=${encodeURIComponent(item.activityId)}&title=${encodeURIComponent(item.activity?.title || '')}&time=${encodeURIComponent(item.activity?.time || '')}&location=${encodeURIComponent(item.activity?.location || '')}`,
    })
  }

  const cancelRegistration = (item: any) => {
    Taro.showModal({
      title: '取消报名',
      content: '确定要取消这个活动的报名吗？',
      confirmText: '取消报名',
      confirmColor: '#EF4444',
      success: async ({ confirm }) => {
        if (!confirm) return
        try {
          await cancelActivityRegistration({ registrationId: item.id, activityId: item.activityId })
          setRegistrations((prev) => prev.filter((r) => r.id !== item.id))
          Taro.showToast({ title: '已取消报名', icon: 'success' })
        } catch (e) {
          console.warn('[MyActivities] cancel failed', e)
          Taro.showToast({ title: '操作失败', icon: 'none' })
        }
      },
    })
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
      <View style={{ padding: '8px 4px 12px' }}>
        <Text style={{ fontSize: '18px', fontWeight: '700', color: '#1E293B' }}>
          我的报名
        </Text>
        <Text style={{ fontSize: '13px', color: '#64748B', marginTop: '4px' }}>
          共 {registrations.length} 个活动
        </Text>
      </View>

      {!registrations.length && (
        <View style={{ textAlign: 'center', padding: '60px 20px' }}>
          <Text style={{ fontSize: '16px', color: '#94A3B8' }}>还没有报名任何活动</Text>
        </View>
      )}

      {registrations.map((item) => (
        <View
          key={item.id || item.activityId}
          style={{
            backgroundColor: '#FFF', borderRadius: '12px', padding: '14px',
            marginBottom: '10px', border: '1px solid #E2E8F0',
          }}
        >
          <View style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
            <Text style={{
              flex: 1, fontSize: '16px', fontWeight: '700', color: '#1E293B',
            }}>{item.activity?.title || ''}</Text>
            <Text style={{
              fontSize: '12px', color: '#2563EB', backgroundColor: '#EFF6FF',
              padding: '3px 8px', borderRadius: '999px',
            }}>{item.activity?.category || ''}</Text>
          </View>
          <Text style={{ fontSize: '13px', color: '#64748B', lineHeight: '20px' }}>
            组织：{item.activity?.organizer || ''}
          </Text>
          <Text style={{ fontSize: '13px', color: '#64748B', lineHeight: '20px' }}>
            时间：{item.activity?.time || ''}
          </Text>
          <Text style={{ fontSize: '13px', color: '#64748B', lineHeight: '20px' }}>
            地点：{item.activity?.location || ''}
          </Text>
          <Text style={{ fontSize: '12px', color: '#94A3B8', marginTop: '8px' }}>
            已报名 {item.activity?.participantCount || 0}/{item.activity?.maxParticipants || '∞'}
          </Text>
          <View style={{
            display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '10px',
          }}>
            <Text
              style={{ fontSize: '13px', color: '#2563EB', fontWeight: '600', padding: '6px 14px' }}
              onClick={() => goActivity(item)}
            >
              查看详情
            </Text>
            <Text
              style={{ fontSize: '13px', color: '#EF4444', fontWeight: '600', padding: '6px 14px' }}
              onClick={() => cancelRegistration(item)}
            >
              取消报名
            </Text>
          </View>
        </View>
      ))}
    </View>
  )
}

