import { Text, View } from '@tarojs/components'
import { ACTIVITIES } from '../../utils/mock'
import './index.css'

export default function MyActivities() {
  return (
    <View style={{ minHeight: '100vh', backgroundColor: '#F8FAFC', padding: '12px' }}>
      {ACTIVITIES.slice(0, 4).map((activity) => (
        <View key={activity.id} style={{ backgroundColor: '#FFF', borderRadius: '12px', padding: '14px', marginBottom: '10px', border: '1px solid #E2E8F0' }}>
          <View style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
            <Text style={{ flex: 1, fontSize: '16px', fontWeight: '700', color: '#1E293B' }}>{activity.title}</Text>
            <Text style={{ fontSize: '12px', color: '#2563EB', backgroundColor: '#EFF6FF', padding: '3px 8px', borderRadius: '999px' }}>{activity.category}</Text>
          </View>
          <Text style={{ fontSize: '13px', color: '#64748B', lineHeight: '20px' }}>组织：{activity.organizer}</Text>
          <Text style={{ fontSize: '13px', color: '#64748B', lineHeight: '20px' }}>时间：{activity.time}</Text>
          <Text style={{ fontSize: '13px', color: '#64748B', lineHeight: '20px' }}>地点：{activity.location}</Text>
          <Text style={{ fontSize: '12px', color: '#94A3B8', marginTop: '8px' }}>已报名 {activity.participants}/{activity.maxParticipants}</Text>
        </View>
      ))}
    </View>
  )
}
