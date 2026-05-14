import Taro from '@tarojs/taro'
import { Text, View } from '@tarojs/components'
import { PARTNER_USERS } from '../../utils/mock'
import { openUnifiedUserProfile } from '../../utils/publicProfiles'
import './index.css'

export default function MessageFollows() {
  const users = PARTNER_USERS.slice(0, 5)
  return (
    <View style={{ minHeight: '100vh', backgroundColor: '#F8FAFC', padding: '12px' }}>
      {users.map((user, index) => (
        <View key={user.id} onClick={() => openUnifiedUserProfile(user.id, user.name)} style={{ display: 'flex', alignItems: 'center', backgroundColor: '#FFF', borderRadius: '12px', padding: '14px', marginBottom: '10px', border: '1px solid #DCFCE7' }}>
          <View style={{ width: '42px', height: '42px', borderRadius: '50%', backgroundColor: '#DCFCE7', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: '12px' }}>
            <Text style={{ color: '#16A34A', fontWeight: '700' }}>{user.name.charAt(0)}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: '15px', fontWeight: '700', color: '#1E293B' }}>{user.name}</Text>
            <Text style={{ fontSize: '13px', color: '#64748B', marginTop: '4px' }}>关注了你 · {index === 0 ? '刚刚' : `${index + 1}小时前`}</Text>
          </View>
          <Text style={{ fontSize: '12px', color: '#2563EB', fontWeight: '600' }}>查看</Text>
        </View>
      ))}
    </View>
  )
}
