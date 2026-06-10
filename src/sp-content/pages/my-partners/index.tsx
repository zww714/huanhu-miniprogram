import { useEffect, useState } from 'react'
import Taro from '@tarojs/taro'
import { Text, View } from '@tarojs/components'
import { getPartners } from '../../../api'
import './index.scss'

function firstChar(name?: string) {
  return (name || '同').charAt(0)
}

export default function MyPartners() {
  const [partners, setPartners] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let alive = true
    setLoading(true)
    getPartners()
      .then((data) => {
        if (alive) setPartners(Array.isArray(data) ? data : [])
      })
      .catch((e) => {
        console.warn('[MyPartners] load failed', e)
        if (alive) setPartners([])
      })
      .finally(() => {
        if (alive) setLoading(false)
      })
    return () => { alive = false }
  }, [])

  const goChat = (user: any) => {
    Taro.navigateTo({
      url: `/sp-social/pages/contact-request/index?userId=${encodeURIComponent(user.id || user._id)}&name=${encodeURIComponent(user.name || '同学')}&category=${encodeURIComponent(user.lookingFor || '兴趣搭子')}&source=my-partners`,
    })
  }

  return (
    <View style={{ minHeight: '100vh', backgroundColor: '#F8FAFC', padding: '12px' }}>
      {loading ? (
        <View style={{ backgroundColor: '#FFF', borderRadius: '12px', padding: '28px 14px', textAlign: 'center', border: '1px solid #E2E8F0' }}>
          <Text style={{ color: '#94A3B8', fontSize: '13px' }}>正在加载...</Text>
        </View>
      ) : null}
      {!loading && !partners.length ? (
        <View style={{ backgroundColor: '#FFF', borderRadius: '12px', padding: '28px 14px', textAlign: 'center', border: '1px solid #E2E8F0' }}>
          <Text style={{ color: '#94A3B8', fontSize: '13px' }}>暂无真实搭子数据</Text>
        </View>
      ) : null}
      {partners.map((user) => (
        <View key={user.id || user._id} style={{ backgroundColor: '#FFF', borderRadius: '12px', padding: '14px', marginBottom: '10px', border: '1px solid #E2E8F0' }}>
          <View style={{ display: 'flex', alignItems: 'center' }}>
            <View style={{ width: '44px', height: '44px', borderRadius: '50%', backgroundColor: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: '12px' }}>
              <Text style={{ color: '#FFF', fontWeight: '700' }}>{firstChar(user.name)}</Text>
            </View>
            <View style={{ flex: 1, minWidth: 0 }}>
              <Text style={{ fontSize: '15px', fontWeight: '700', color: '#1E293B' }}>{user.name || '同学'}</Text>
              <Text style={{ fontSize: '12px', color: '#94A3B8', marginTop: '3px' }}>{user.lookingFor || '兴趣交流'}</Text>
            </View>
            <View onClick={() => goChat(user)} style={{ padding: '6px 12px', backgroundColor: '#2563EB', borderRadius: '999px' }}>
              <Text style={{ color: '#FFF', fontSize: '12px', fontWeight: '600' }}>联系</Text>
            </View>
          </View>
          <Text style={{ fontSize: '13px', color: '#64748B', lineHeight: '20px', marginTop: '10px' }}>{user.bio || user.intro || 'TA 还没有填写简介。'}</Text>
        </View>
      ))}
    </View>
  )
}
