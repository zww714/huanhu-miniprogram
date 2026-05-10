import { useState, useRef, useEffect } from 'react'
import Taro from '@tarojs/taro'
import { View, Text, ScrollView } from '@tarojs/components'
import { SKILL_DETAIL } from '../../utils/mock'
import './index.css'

function AnimatedCounter({ target, suffix = '' }: { target: number; suffix?: string }) {
  const [value, setValue] = useState(0)

  useEffect(() => {
    let start = 0
    const steps = 24
    const increment = target / steps
    const interval = setInterval(() => {
      start += 1
      if (start >= steps) { setValue(target); clearInterval(interval) }
      else { setValue(Math.floor(increment * start)) }
    }, 40)
    return () => clearInterval(interval)
  }, [target])

  return <Text>{value >= 1000 ? (value / 1000).toFixed(1) + 'k' : value}{suffix}</Text>
}

export default function SkillDetail() {
  const { name, level, category, desc, stats, tags, proofItems } = SKILL_DETAIL

  return (
    <View style={{ minHeight: '100vh', backgroundColor: '#F8FAFC' }}>
      {/* Nav */}
      <View style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 16px', backgroundColor: '#FFF', borderBottom: '1px solid #F1F5F9' }}>
        <View onClick={() => Taro.navigateBack()}>
          <Text style={{ fontSize: '20px', color: '#64748B' }}>鈫</Text>
        </View>
        <Text style={{ fontSize: '16px', fontWeight: '600', color: '#1E293B' }}>鎶能鑳借璇</Text>
        <View style={{ display: 'flex', gap: '12px' }}>
          <Text style={{ fontSize: '16px', color: '#64748B' }}>鈫</Text>
          <Text style={{ fontSize: '18px', color: '#64748B' }}>鈰</Text>
        </View>
      </View>

      <ScrollView>
        <View style={{ padding: '16px 16px 40px' }}>
        {/* Header Card */}
        <View style={{ backgroundColor: '#FFF', borderRadius: '16px', padding: '24px', textAlign: 'center', marginBottom: '12px', border: '1px solid #E2E8F0' }}>
          <View style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: '#FEF3C7', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
            <Text style={{ fontSize: '28px' }}>馃弳</Text>
          </View>
          <Text style={{ fontSize: '22px', fontWeight: '700', color: '#1E293B', marginBottom: '4px' }}>{name}</Text>
          <View style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', marginBottom: '8px' }}>
            <Text style={{ fontSize: '14px', color: '#D97706', fontWeight: '600' }}>{level}</Text>
            <View style={{ padding: '2px 8px', backgroundColor: '#F1F5F9', borderRadius: '4px' }}>
              <Text style={{ fontSize: '11px', color: '#64748B' }}>{category}</Text>
            </View>
          </View>
          <Text style={{ fontSize: '13px', color: '#64748B', lineHeight: '1.5' }}>{desc}</Text>
        </View>

        {/* Stats */}
        <View style={{ backgroundColor: '#FFF', borderRadius: '16px', padding: '20px', marginBottom: '12px', border: '1px solid #E2E8F0' }}>
          <View style={{ display: 'flex', justifyContent: 'space-around' }}>
            {[
              { label: '椤圭洰', value: stats.projects },
              { label: '璁よ瘉', value: stats.endorsements },
              { label: '娴忚', value: stats.views },
            ].map((s) => (
              <View key={s.label} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                <Text style={{ fontSize: '22px', fontWeight: '700', color: '#2563EB' }}>
                  <AnimatedCounter target={s.value} />
                </Text>
                <Text style={{ fontSize: '12px', color: '#94A3B8' }}>{s.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Tags */}
        <View style={{ backgroundColor: '#FFF', borderRadius: '16px', padding: '16px', marginBottom: '12px', border: '1px solid #E2E8F0' }}>
          <Text style={{ fontSize: '15px', fontWeight: '600', color: '#1E293B', marginBottom: '10px' }}>鎶能鑳芥爣绛</Text>
          <View style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {tags.map((t) => (
              <View key={t} style={{ backgroundColor: '#EFF6FF', borderRadius: '100px', padding: '5px 12px' }}>
                <Text style={{ fontSize: '13px', color: '#2563EB' }}>{t}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Proof Items */}
        <View style={{ backgroundColor: '#FFF', borderRadius: '16px', padding: '16px', marginBottom: '12px', border: '1px solid #E2E8F0' }}>
          <Text style={{ fontSize: '15px', fontWeight: '600', color: '#1E293B', marginBottom: '10px' }}>璇佹槑鏉愭枡</Text>
          {proofItems.map((item, i) => (
            <View key={i} style={{ display: 'flex', gap: '12px', padding: '12px 0', borderBottom: i < proofItems.length - 1 ? '1px solid #F1F5F9' : 'none' }}>
              <View style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: item.type === 'project' ? '#EFF6FF' : '#F0FDF4', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Text style={{ fontSize: '20px' }}>{item.type === 'project' ? '馃搧' : '馃摐'}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: '14px', fontWeight: '600', color: '#1E293B' }}>{item.name}</Text>
                <Text style={{ fontSize: '12px', color: '#64748B', marginTop: '2px' }}>{item.desc}</Text>
              </View>
              <Text style={{ fontSize: '14px', color: '#CBD5E1', alignSelf: 'center' }}>鈥</Text>
            </View>
          ))}
        </View>
      </View>
      </ScrollView>
    </View>
  )
}
