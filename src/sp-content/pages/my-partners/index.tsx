import Taro from '@tarojs/taro'
import { Text, View } from '@tarojs/components'
import { PARTNER_USERS } from '../../../utils/mock'
import './index.scss'

export default function MyPartners() {
  return (
    <View style={{ minHeight: '100vh', backgroundColor: '#F8FAFC', padding: '12px' }}>
      {PARTNER_USERS.slice(0, 5).map((user) => (
        <View key={user.id} style={{ backgroundColor: '#FFF', borderRadius: '12px', padding: '14px', marginBottom: '10px', border: '1px solid #E2E8F0' }}>
          <View style={{ display: 'flex', alignItems: 'center' }}>
            <View style={{ width: '44px', height: '44px', borderRadius: '50%', backgroundColor: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: '12px' }}>
              <Text style={{ color: '#FFF', fontWeight: '700' }}>{user.name.charAt(0)}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: '15px', fontWeight: '700', color: '#1E293B' }}>{user.name}</Text>
              <Text style={{ fontSize: '12px', color: '#94A3B8', marginTop: '3px' }}>{user.lookingFor} · 匹配度 {user.match}%</Text>
            </View>
            <View onClick={() => Taro.navigateTo({ url: `/sp-social/pages/chat/index?id=${user.id}&name=${encodeURIComponent(user.name)}&category=兴趣搭子` })} style={{ padding: '6px 12px', backgroundColor: '#2563EB', borderRadius: '999px' }}>
              <Text style={{ color: '#FFF', fontSize: '12px', fontWeight: '600' }}>联系</Text>
            </View>
          </View>
          <Text style={{ fontSize: '13px', color: '#64748B', lineHeight: '20px', marginTop: '10px' }}>{user.bio}</Text>
        </View>
      ))}
    </View>
  )
}

