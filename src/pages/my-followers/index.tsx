import Taro from '@tarojs/taro'
import { Text, View } from '@tarojs/components'
import { CONTACTS } from '../../utils/mock'
import './index.css'

export default function MyFollowers() {
  return (
    <View style={{ minHeight: '100vh', backgroundColor: '#F8FAFC', padding: '12px' }}>
      {CONTACTS.slice(0, 6).map((user) => (
        <View key={user.id} onClick={() => Taro.navigateTo({ url: `/pages/user-detail/index?name=${encodeURIComponent(user.name)}` })} style={{ display: 'flex', alignItems: 'center', backgroundColor: '#FFF', borderRadius: '12px', padding: '14px', marginBottom: '10px' }}>
          <View style={{ width: '42px', height: '42px', borderRadius: '50%', backgroundColor: '#DBEAFE', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: '12px' }}>
            <Text style={{ color: '#2563EB', fontWeight: '700' }}>{user.name.charAt(0)}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: '15px', fontWeight: '600', color: '#1E293B' }}>{user.name}</Text>
            <Text style={{ fontSize: '12px', color: '#94A3B8', marginTop: '3px' }}>{user.bio}</Text>
          </View>
          <Text style={{ fontSize: '12px', color: '#2563EB' }}>查看</Text>
        </View>
      ))}
    </View>
  )
}
