import { useState } from 'react'
import Taro from '@tarojs/taro'
import { View, Text, ScrollView } from '@tarojs/components'
import './index.css'

export default function Profile() {
  const [activeTab, setActiveTab] = useState(0)
  
  const tabs = ['skills', 'posts', 'favorites']
  const tabNames: Record<string, string> = { skills: 'My Skills', posts: 'My Posts', favorites: 'Favorites' }
  const stats = { skills: 5, posts: 12, followers: 86, following: 42 }
  const statLabels: Record<string, string> = { skills: 'Skills', posts: 'Posts', followers: 'Followers', following: 'Following' }

  const skills = [
    { name: 'Python Programming', level: 'Lv.5', category: 'Development', desc: 'Proficient in Python for data analysis, ML, and Web development', tags: ['Data', 'Django', 'TF'] },
    { name: 'UI Design', level: 'Lv.3', category: 'Design', desc: 'Figma design experience, mobile UI/UX', tags: ['Figma', 'UI/UX'] },
  ]

  const myPosts = [
    { title: 'Python Data Analysis Guide', date: '3 days ago', likes: 45, comments: 12 },
    { title: 'Research Tools Recommendation', date: '1 week ago', likes: 89, comments: 23 },
  ]

  return (
    <View style={{ minHeight: '100vh', backgroundColor: '#F8FAFC' }}>
      <View style={{ padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Text style={{ fontSize: '20px', fontWeight: '700', color: '#1E293B' }}>Profile</Text>
        <Text style={{ fontSize: '16px' }} onClick={() => Taro.showToast({ title: 'Settings', icon: 'none' })}>Settings</Text>
      </View>

      <View style={{ padding: '0 16px' }}>
        <View style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '16px', backgroundColor: '#FFF', borderRadius: '14px', border: '1px solid #E2E8F0' }}>
          <View style={{ width: '56px', height: '56px', borderRadius: '50%', backgroundColor: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ fontSize: '22px', fontWeight: '700', color: '#FFF' }}>U</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: '17px', fontWeight: '600', color: '#1E293B' }}>Username</Text>
            <Text style={{ fontSize: '13px', color: '#64748B' }}>Zhejiang University</Text>
          </View>
        </View>

        <View style={{ display: 'flex', padding: '14px 0', marginTop: '14px', backgroundColor: '#FFF', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
          {Object.keys(stats).map((key) => (
            <View key={key} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
              <Text style={{ fontSize: '18px', fontWeight: '700', color: '#1E293B' }}>{stats[key as keyof typeof stats]}</Text>
              <Text style={{ fontSize: '11px', color: '#94A3B8' }}>{statLabels[key]}</Text>
            </View>
          ))}
        </View>

        <View style={{ display: 'flex', marginTop: '16px', borderBottom: '1px solid #F1F5F9' }}>
          {tabs.map((tab, i) => (
            <View key={tab} onClick={() => setActiveTab(i)}
              style={{ flex: 1, padding: '10px 0', display: 'flex', alignItems: 'center', justifyContent: 'center', borderBottom: activeTab === i ? '2px solid #2563EB' : '2px solid transparent' }}>
              <Text style={{ fontSize: '14px', fontWeight: activeTab === i ? '600' : '400', color: activeTab === i ? '#2563EB' : '#64748B' }}>{tabNames[tab]}</Text>
            </View>
          ))}
        </View>

        {activeTab === 0 && (
          <View style={{ padding: '14px 0 80px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {skills.map((s, i) => (
              <View key={i} style={{ padding: '14px', backgroundColor: '#FFF', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                <Text style={{ fontSize: '15px', fontWeight: '600', color: '#1E293B' }}>{s.name}</Text>
                <Text style={{ fontSize: '12px', color: '#2563EB', marginTop: '4px' }}>{s.category} | {s.level}</Text>
                <Text style={{ fontSize: '13px', color: '#64748B', marginTop: '8px', lineHeight: '1.5' }}>{s.desc}</Text>
                <View style={{ display: 'flex', gap: '6px', marginTop: '8px' }}>
                  {s.tags.map((t) => (
                    <View key={t} style={{ padding: '2px 8px', backgroundColor: '#F1F5F9', borderRadius: '4px' }}>
                      <Text style={{ fontSize: '11px', color: '#64748B' }}>{t}</Text>
                    </View>
                  ))}
                </View>
              </View>
            ))}
          </View>
        )}

        {activeTab === 1 && (
          <View style={{ padding: '14px 0 80px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {myPosts.map((p, i) => (
              <View key={i} style={{ padding: '14px', backgroundColor: '#FFF', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                <Text style={{ fontSize: '15px', fontWeight: '600', color: '#1E293B' }}>{p.title}</Text>
                <View style={{ display: 'flex', alignItems: 'center', gap: '14px', marginTop: '8px' }}>
                  <Text style={{ fontSize: '12px', color: '#94A3B8' }}>{p.date}</Text>
                  <Text style={{ fontSize: '12px', color: '#94A3B8' }}>Likes: {p.likes}</Text>
                  <Text style={{ fontSize: '12px', color: '#94A3B8' }}>Comments: {p.comments}</Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {activeTab === 2 && (
          <View style={{ padding: '14px 0 80px', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '200px' }}>
            <Text style={{ fontSize: '14px', color: '#94A3B8' }}>No favorites yet</Text>
          </View>
        )}
      </View>
    </View>
  )
}
