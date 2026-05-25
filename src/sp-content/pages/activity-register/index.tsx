import { useState } from 'react'
import Taro, { useLoad } from '@tarojs/taro'
import { Button, Input, Text, Textarea, View } from '@tarojs/components'
import { registerActivity } from '../../../utils/api'
import './index.css'

export default function ActivityRegister() {
  const [activity, setActivity] = useState({
    id: '',
    title: '社区活动',
    organizer: '',
    time: '',
    location: '',
    participants: '',
    maxParticipants: '',
  })
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [note, setNote] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useLoad((options) => {
    setActivity({
      id: decodeURIComponent(String(options?.id || '')),
      title: decodeURIComponent(String(options?.title || '社区活动')),
      organizer: decodeURIComponent(String(options?.organizer || '')),
      time: decodeURIComponent(String(options?.time || '')),
      location: decodeURIComponent(String(options?.location || '')),
      participants: decodeURIComponent(String(options?.participants || '')),
      maxParticipants: decodeURIComponent(String(options?.maxParticipants || '')),
    })
  })

  const submit = async () => {
    if (!name.trim()) {
      Taro.showToast({ title: '请输入姓名', icon: 'none' })
      return
    }
    setSubmitting(true)
    try {
      const res = await registerActivity({
        activityId: activity.id,
        name: name.trim(),
        phone: phone.trim(),
        note: note.trim(),
      })
      if (res.registered) {
        Taro.showToast({ title: '报名成功', icon: 'success' })
        setTimeout(() => Taro.navigateBack(), 600)
      } else {
        Taro.showToast({ title: '报名失败，请重试', icon: 'none' })
      }
    } catch (e) {
      console.warn('[ActivityRegister] submit failed', e)
      Taro.showToast({ title: '报名失败', icon: 'none' })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <View style={{ minHeight: '100vh', backgroundColor: '#F8FAFC', padding: '16px' }}>
      <View style={{ backgroundColor: '#FFF', borderRadius: '14px', padding: '16px', border: '1px solid #E2E8F0', marginBottom: '14px' }}>
        <Text style={{ display: 'block', fontSize: '18px', fontWeight: '700', color: '#1E293B', lineHeight: '26px' }}>{activity.title}</Text>
        {!!activity.organizer && <Text style={{ display: 'block', fontSize: '13px', color: '#64748B', marginTop: '8px' }}>组织：{activity.organizer}</Text>}
        <Text style={{ display: 'block', fontSize: '13px', color: '#64748B', marginTop: '6px' }}>时间：{activity.time}</Text>
        <Text style={{ display: 'block', fontSize: '13px', color: '#64748B', marginTop: '6px' }}>地点：{activity.location}</Text>
        <Text style={{ display: 'block', fontSize: '12px', color: '#94A3B8', marginTop: '10px' }}>
          已报名 {activity.participants}/{activity.maxParticipants || '∞'}
        </Text>
      </View>

      <View style={{ backgroundColor: '#FFF', borderRadius: '14px', padding: '16px', border: '1px solid #E2E8F0' }}>
        <Text style={{ fontSize: '14px', fontWeight: '600', color: '#1E293B' }}>姓名</Text>
        <View style={{ marginTop: '8px', marginBottom: '14px', borderRadius: '10px', backgroundColor: '#F8FAFC', padding: '10px 12px' }}>
          <Input value={name} placeholder='请输入姓名' onInput={(e) => setName(String(e.detail.value || ''))} style={{ fontSize: '14px' }} />
        </View>
        <Text style={{ fontSize: '14px', fontWeight: '600', color: '#1E293B' }}>联系方式</Text>
        <View style={{ marginTop: '8px', marginBottom: '14px', borderRadius: '10px', backgroundColor: '#F8FAFC', padding: '10px 12px' }}>
          <Input value={phone} placeholder='手机号或微信号' onInput={(e) => setPhone(String(e.detail.value || ''))} style={{ fontSize: '14px' }} />
        </View>
        <Text style={{ fontSize: '14px', fontWeight: '600', color: '#1E293B' }}>备注</Text>
        <Textarea value={note} placeholder='可填写你的报名说明' onInput={(e) => setNote(String(e.detail.value || ''))} style={{ marginTop: '8px', width: '100%', height: '100px', boxSizing: 'border-box', backgroundColor: '#F8FAFC', borderRadius: '10px', padding: '12px', fontSize: '14px' }} />
      </View>

      <Button
        onClick={submit}
        disabled={submitting}
        style={{
          marginTop: '22px', backgroundColor: submitting ? '#94A3B8' : '#2563EB',
          color: '#FFF', borderRadius: '10px', fontSize: '15px',
        }}
      >
        {submitting ? '提交中...' : '提交报名'}
      </Button>
    </View>
  )
}
