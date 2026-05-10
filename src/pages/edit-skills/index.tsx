import { useState } from 'react'
import Taro, { useLoad } from '@tarojs/taro'
import { Button, Input, Text, Textarea, View } from '@tarojs/components'
import { MY_LEARN_WANTS, MY_SKILLS } from '../../utils/mock'
import './index.css'

export default function EditSkills() {
  const [type, setType] = useState<'can' | 'want'>('can')
  const [name, setName] = useState('')
  const [desc, setDesc] = useState('')
  const [level, setLevel] = useState(3)

  useLoad((options) => {
    setType(options?.type === 'want' ? 'want' : 'can')
  })

  const current = type === 'can' ? MY_SKILLS.map((item) => item.name) : MY_LEARN_WANTS.map((item) => item.name)
  const save = () => {
    if (!name.trim()) {
      Taro.showToast({ title: '请输入名称', icon: 'none' })
      return
    }
    Taro.setStorageSync(type === 'can' ? 'pendingSkillNeed' : 'pendingWantSkill', { type, name, desc, level })
    Taro.showToast({ title: '已保存', icon: 'success' })
    setTimeout(() => Taro.navigateBack(), 500)
  }

  return (
    <View style={{ minHeight: '100vh', backgroundColor: '#F8FAFC', padding: '16px' }}>
      <View style={{ display: 'flex', gap: '10px', marginBottom: '16px' }}>
        {(['can', 'want'] as const).map((item) => (
          <View key={item} onClick={() => setType(item)} style={{ flex: 1, padding: '12px 0', borderRadius: '10px', backgroundColor: type === item ? '#2563EB' : '#FFF', textAlign: 'center', border: '1px solid #E2E8F0' }}>
            <Text style={{ fontSize: '15px', color: type === item ? '#FFF' : '#64748B', fontWeight: '600' }}>{item === 'can' ? '我会' : '我想学'}</Text>
          </View>
        ))}
      </View>
      <Text style={{ fontSize: '14px', fontWeight: '600', color: '#1E293B' }}>已有内容</Text>
      <View style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '10px', marginBottom: '18px' }}>
        {current.map((item) => (
          <View key={item} onClick={() => setName(item)} style={{ padding: '6px 12px', borderRadius: '999px', backgroundColor: '#EFF6FF' }}>
            <Text style={{ fontSize: '13px', color: '#2563EB' }}>{item}</Text>
          </View>
        ))}
      </View>
      <View style={{ backgroundColor: '#FFF', borderRadius: '10px', border: '1px solid #E2E8F0', padding: '10px 12px', marginBottom: '14px' }}>
        <Input value={name} placeholder={type === 'can' ? '输入你会的技能' : '输入你想学的技能'} onInput={(e) => setName(String(e.detail.value || ''))} style={{ fontSize: '14px' }} />
      </View>
      {type === 'can' && (
        <View style={{ display: 'flex', gap: '8px', marginBottom: '14px' }}>
          {[1, 2, 3, 4, 5].map((item) => (
            <View key={item} onClick={() => setLevel(item)} style={{ padding: '8px 12px', borderRadius: '8px', backgroundColor: level === item ? '#2563EB' : '#FFF', border: '1px solid #E2E8F0' }}>
              <Text style={{ fontSize: '13px', color: level === item ? '#FFF' : '#64748B', fontWeight: '600' }}>Lv.{item}</Text>
            </View>
          ))}
        </View>
      )}
      <Textarea value={desc} placeholder='补充说明' onInput={(e) => setDesc(String(e.detail.value || ''))} style={{ width: '100%', height: '120px', boxSizing: 'border-box', backgroundColor: '#FFF', borderRadius: '10px', border: '1px solid #E2E8F0', padding: '12px', fontSize: '14px' }} />
      <Button onClick={save} style={{ marginTop: '24px', backgroundColor: '#2563EB', color: '#FFF', borderRadius: '10px', fontSize: '15px' }}>保存</Button>
    </View>
  )
}
