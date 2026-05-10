import { useState } from 'react'
import Taro from '@tarojs/taro'
import { Button, Input, Text, Textarea, View } from '@tarojs/components'
import { MY_PROFILE } from '../../utils/mock'
import './index.css'

export default function EditProfile() {
  const [name, setName] = useState(MY_PROFILE.name)
  const [college, setCollege] = useState(MY_PROFILE.college)
  const [grade, setGrade] = useState(MY_PROFILE.grade)
  const [bio, setBio] = useState(MY_PROFILE.bio)

  const save = () => {
    Taro.setStorageSync('profileDraft', { name, college, grade, bio })
    Taro.showToast({ title: '已保存', icon: 'success' })
    setTimeout(() => Taro.navigateBack(), 500)
  }

  const field = (label: string, value: string, setter: (value: string) => void, placeholder: string) => (
    <View style={{ marginBottom: '14px' }}>
      <Text style={{ fontSize: '14px', fontWeight: '600', color: '#1E293B' }}>{label}</Text>
      <View style={{ marginTop: '8px', backgroundColor: '#FFF', borderRadius: '10px', border: '1px solid #E2E8F0', padding: '10px 12px' }}>
        <Input value={value} placeholder={placeholder} onInput={(e) => setter(String(e.detail.value || ''))} style={{ fontSize: '14px', color: '#1E293B' }} />
      </View>
    </View>
  )

  return (
    <View style={{ minHeight: '100vh', backgroundColor: '#F8FAFC', padding: '16px' }}>
      {field('昵称', name, setName, '请输入昵称')}
      {field('学院', college, setCollege, '请输入学院')}
      {field('年级', grade, setGrade, '请输入年级')}
      <Text style={{ fontSize: '14px', fontWeight: '600', color: '#1E293B' }}>个人介绍</Text>
      <Textarea value={bio} placeholder='介绍一下你自己' onInput={(e) => setBio(String(e.detail.value || ''))} style={{ marginTop: '8px', width: '100%', height: '130px', boxSizing: 'border-box', backgroundColor: '#FFF', borderRadius: '10px', border: '1px solid #E2E8F0', padding: '12px', fontSize: '14px', color: '#1E293B' }} />
      <Button onClick={save} style={{ marginTop: '24px', backgroundColor: '#2563EB', color: '#FFF', borderRadius: '10px', fontSize: '15px' }}>保存资料</Button>
    </View>
  )
}
