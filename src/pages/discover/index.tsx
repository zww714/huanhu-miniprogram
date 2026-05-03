import { useState } from 'react'
import Taro from '@tarojs/taro'
import { View, Text, ScrollView } from '@tarojs/components'
import { MOCK_POSTS } from '../../utils/mock'
import './index.css'

const CATEGORIES = ['全部', '科研', '升学', '兴趣', '工作']
const CAT_ICONS: Record<string, string> = { '科研': '🔬', '升学': '🎗', '兴趣': '🎹', '工作': '🥈' }

// Simple hash for gradient covers
function getInitials(name: string): string {
  return name.length > 0 ? name[0] : '?'
}
function getAvatarBg(name: string): string {
  const colors = ['#2563EB', '#7C3AED', '#DB2777', '#DC2626', '#EA580C', '#D97706', '#059669', '#0891B2']
  let hash = 0
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash)
  return colors[Math.abs(hash) % colors.length]
}

export default function Discover() {
  const [activeCat, setActiveCat] = useState(0)
  const [posts] = useState(MOCK_POSTS)

  const handlePostClick = (id: string) => Taro.navigateTo({ url: `/pages/post-detail/index?id=${id}` })
  const handleUserClick = (name: string) => Taro.navigateTo({ url: `/pages/user-detail/index?name=${encodeURIComponent(name)}` })
  const handlePublish = () => Taro.navigateTo({ url: '/pages/publish/index' })

  const filtered = activeCat === 0 ? posts : posts.filter((p) => {
    const catMap: Record<string, string> = { '科研': '科研', '升学': '升学', '兴趣': '兴趣', '工作': '工作' }
    return p.mainCategory === catMap[CATEGORIES[activeCat]]
  })

  return (
    <View style={{ minHeight: '100vh', backgroundColor: '#F8FAFC' }}>
      {/* Header */}
      <View style={{ position: 'sticky', top: 0, zIndex: 10, backgroundColor: '#FFF' }}>
        <View style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 16px' }}>
          <Text style={{ fontSize: '20px', fontWeight: '700', color: '#2563EB' }}>发现</Text>
          <View onClick={() => Taro.showToast({ title: '通知', icon: 'none' })}>
            <Text style={{ fontSize: '20px' }}>🔔</Text>
          </View>
        </View>

        {/* Search */}
        <View style={{ margin: '0 16px 8px', padding: '8px 14px', backgroundColor: '#F1F5F9', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Text style={{ fontSize: '14px', color: '#94A3B8' }}>🔍</Text>
          <Text style={{ fontSize: '14px', color: '#94A3B8', flex: 1 }}>鎼滅储浣犳劅兴趣鐨勫唴瀹?..</Text>
        </View>

        {/* Categories */}
        <ScrollView scrollX enableFlex style={{ whiteSpace: 'nowrap' }}>
          <View style={{ padding: '0 16px 8px', display: 'flex', gap: '8px' }}>
            {CATEGORIES.map((cat, i) => (
              <View key={cat} onClick={() => setActiveCat(i)}
                style={{
                  display: 'inline-flex', padding: '5px 16px', borderRadius: '100px', fontSize: '13px',
                  fontWeight: activeCat === i ? '600' : '400',
                  backgroundColor: activeCat === i ? '#2563EB' : '#F1F5F9',
                  color: activeCat === i ? '#FFF' : '#64748B'
                }}
              >{cat}</View>
            ))}
          </View>
        </ScrollView>
      </View>

      {/* Post Cards */}
      <View style={{ padding: '0 16px 80px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {filtered.map((post) => (
          <View key={post.id} onClick={() => handlePostClick(post.id)}
            style={{ backgroundColor: '#FFF', borderRadius: '14px', overflow: 'hidden', border: '1px solid #E2E8F0' }}>
            
            {/* ══ Top: User avatar + name + one-line intro ══ */}
            <View style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '14px 16px 0' }}>
              <View onClick={() => handleUserClick(post.author.name)} style={{
                width: '36px', height: '36px', borderRadius: '50%',
                backgroundColor: getAvatarBg(post.author.name),
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
              }}>
                <Text style={{ fontSize: '14px', fontWeight: '600', color: '#FFF' }}>
                  {getInitials(post.author.name)}
                </Text>
              </View>
              <View onClick={() => handleUserClick(post.author.name)} style={{ flex: 1 }}>
                <Text style={{ fontSize: '14px', fontWeight: '600', color: '#1E293B' }}>
                  {post.author.name}
                </Text>
                <Text style={{ fontSize: '12px', color: '#94A3B8', marginTop: '1px' }}>
                  {post.author.college} 路 {post.author.grade}
                </Text>
              </View>
            </View>

            {/* ══ Tags ══ */}
            <View style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 16px 0', flexWrap: 'nowrap' }}>
              <View style={{ padding: '2px 8px', backgroundColor: '#EFF6FF', borderRadius: '4px' }}>
                <Text style={{ fontSize: '11px', color: '#2563EB' }}>{post.categoryTag}</Text>
              </View>
              {post.tags.slice(0, 3).map((t) => (
                <View key={t} style={{ padding: '2px 8px', backgroundColor: '#F1F5F9', borderRadius: '4px' }}>
                  <Text style={{ fontSize: '11px', color: '#64748B' }}>{t}</Text>
                </View>
              ))}
            </View>

            {/* ══ Title + Excerpt ══ */}
            <View style={{ padding: '8px 16px 0' }}>
              <Text style={{ fontSize: '16px', fontWeight: '600', color: '#1E293B', lineHeight: '1.4' }}>
                {post.title}
              </Text>
              <Text style={{ fontSize: '13px', color: '#64748B', lineHeight: '1.5', marginTop: '4px' }} numberOfLines={2}>
                {post.excerpt}
              </Text>
            </View>

            {/* ══ Cover Image (gradient) ══ */}
            {post.cover ? (
              <View style={{
                margin: '10px 16px 0', height: '140px', borderRadius: '10px',
                background: post.cover, display: 'flex', alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Text style={{ fontSize: '32px', opacity: 0.6 }}>
                  {post.mainCategory === '科研' ? '🔬' : post.mainCategory === '兴趣' ? '🎹' : post.mainCategory === '升学' ? '🎗' : '🥈'}
                </Text>
              </View>
            ) : null}

            {/* ══ Bottom: Likes + Comments ══ */}
            <View style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '10px 16px 14px', marginTop: '4px'
            }}>
              <View style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                <View style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Text style={{ fontSize: '14px' }}>❤️</Text>
                  <Text style={{ fontSize: '13px', fontWeight: '500', color: '#EF4444' }}>{post.likes}</Text>
                </View>
                <View style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Text style={{ fontSize: '14px' }}>💬</Text>
                  <Text style={{ fontSize: '13px', fontWeight: '500', color: '#2563EB' }}>{post.comments}</Text>
                </View>
              </View>
              <Text style={{ fontSize: '12px', color: '#94A3B8' }}>查看详情 →</Text>
            </View>
          </View>
        ))}
      </View>

      {/* FAB Publish Button */}
      <View onClick={handlePublish}
        style={{
          position: 'fixed', right: '20px', bottom: '90px', width: '52px', height: '52px',
          borderRadius: '50%', backgroundColor: '#2563EB', display: 'flex', alignItems: 'center',
          justifyContent: 'center', border: '1px solid #2563EB', zIndex: 100
        }}>
        <Text style={{ fontSize: '24px', color: '#FFF' }}>+</Text>
      </View>
    </View>
  )
}
