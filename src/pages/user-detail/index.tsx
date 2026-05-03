import { useState } from 'react'
import Taro from '@tarojs/taro'
import { View, Text, ScrollView } from '@tarojs/components'
import { USER_DETAILS } from '../../utils/mock'
import './index.css'

const TABS = ['动态', '个人简介']

function getInitials(name: string): string {
  return name.length > 0 ? name[0] : '?'
}

function getBgColor(name: string): string {
  const colors = ['#2563EB', '#7C3AED', '#DB2777', '#DC2626', '#EA580C', '#D97706', '#059669', '#0891B2']
  let hash = 0
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash)
  return colors[Math.abs(hash) % colors.length]
}

export default function UserDetail() {
  const params = Taro.getCurrentInstance()?.router?.params
  const userName = params?.name as string || ''
  const user = USER_DETAILS[userName] || USER_DETAILS['科研小达人']

  const [activeTab, setActiveTab] = useState(0)

  return (
    <View style={{ height: '100vh', backgroundColor: '#F8FAFC' }}>
      {/* ── Header: returns full screen not working, let's use fixed approach ── */}
      <ScrollView scrollY style={{ height: '100vh', backgroundColor: '#F8FAFC' }}>
        
        {/* ═══ COVER ═══ */}
        <View style={{
          height: '280px', background: user.bgCover,
          position: 'relative', overflow: 'hidden',
          borderBottomLeftRadius: '20px', borderBottomRightRadius: '20px'
        }}>
          {/* Decorative circles */}
          <View style={{ position: 'absolute', top: '-20px', left: '50%', transform: 'translateX(-50%)', width: '200px', height: '200px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.06)' }} />
          <View style={{ position: 'absolute', top: '50px', right: '-60px', width: '140px', height: '140px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.05)' }} />
          <View style={{ position: 'absolute', bottom: '30px', left: '-30px', width: '90px', height: '90px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.04)' }} />
          <View style={{ position: 'absolute', top: '140px', left: '20%', width: '60px', height: '60px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.05)' }} />

          {/* Back button */}
          <View
            onClick={() => Taro.navigateBack()}
            style={{
              position: 'absolute', top: '44px', left: '16px', zIndex: 10,
              width: '36px', height: '36px', borderRadius: '50%',
              backgroundColor: 'rgba(0,0,0,0.15)',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}
          >
            <Text style={{ fontSize: '18px', color: '#FFF', fontWeight: '600' }}>‹</Text>
          </View>

          {/* Avatar */}
          <View style={{
            position: 'absolute', left: '50%', transform: 'translateX(-50%)',
            bottom: '90px', zIndex: 2
          }}>
            <View style={{
              width: '80px', height: '80px', borderRadius: '50%',
              backgroundColor: getBgColor(user.name), border: '3px solid #FFF',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 4px 16px rgba(0,0,0,0.2)'
            }}>
              <Text style={{ fontSize: '30px', fontWeight: '700', color: '#FFF' }}>{getInitials(user.name)}</Text>
            </View>
            {/* Online status dot */}
            <View style={{
              position: 'absolute', bottom: '4px', right: '4px',
              width: '14px', height: '14px', borderRadius: '50%',
              backgroundColor: '#22C55E', border: '2px solid #FFF'
            }} />
          </View>

          {/* Name */}
          <Text style={{
            position: 'absolute', left: '50%', transform: 'translateX(-50%)',
            bottom: '58px', fontSize: '20px', fontWeight: '700', color: '#FFF'
          }}>
            {user.name}
          </Text>

          {/* College */}
          <Text style={{
            position: 'absolute', left: '50%', transform: 'translateX(-50%)',
            bottom: '38px', fontSize: '13px', color: 'rgba(255,255,255,0.8)'
          }}>
            {user.college} · {user.grade}
          </Text>

          {/* Tags */}
          <View style={{
            position: 'absolute', left: '50%', transform: 'translateX(-50%)',
            bottom: '8px', display: 'flex', gap: '6px', flexWrap: 'nowrap'
          }}>
            {user.tags.map((tag: string) => (
              <View key={tag} style={{
                padding: '2px 10px', borderRadius: '100px',
                backgroundColor: 'rgba(255,255,255,0.18)'
              }}>
                <Text style={{ fontSize: '11px', color: '#FFF' }}>{tag}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* ═══ STATS ROW ═══ */}
        <View style={{
          display: 'flex', padding: '14px 0', backgroundColor: '#FFF',
          margin: '-6px 16px 0', borderRadius: '12px',
          border: '1px solid #E2E8F0', position: 'relative', zIndex: 3
        }}>
          {[
            { label: '动态', value: user.stats.posts },
            { label: '获赞', value: user.stats.likes },
            { label: '关注', value: user.stats.following },
            { label: '粉丝', value: user.stats.followers },
          ].map((s, i) => (
            <View key={s.label}
              style={{
                flex: 1, display: 'flex', flexDirection: 'column',
                alignItems: 'center', gap: '2px',
                borderRight: i < 3 ? '1px solid #F1F5F9' : 'none'
              }}>
              <Text style={{ fontSize: '18px', fontWeight: '700', color: '#1E293B' }}>{s.value}</Text>
              <Text style={{ fontSize: '11px', color: '#94A3B8' }}>{s.label}</Text>
            </View>
          ))}
        </View>

        {/* ═══ TABS ═══ */}
        <View style={{
          display: 'flex', backgroundColor: '#FFF', padding: '0 16px',
          borderBottom: '1px solid #F1F5F9', marginTop: '12px'
        }}>
          {TABS.map((tab, i) => (
            <View key={tab} onClick={() => setActiveTab(i)}
              style={{
                flex: 1, padding: '12px 0',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                borderBottom: activeTab === i ? '2px solid #2563EB' : '2px solid transparent',
                transition: 'all 0.2s'
              }}>
              <Text style={{
                fontSize: '14px', fontWeight: activeTab === i ? '600' : '400',
                color: activeTab === i ? '#2563EB' : '#64748B'
              }}>{tab}</Text>
            </View>
          ))}
        </View>

        {/* ═══ TAB CONTENT ═══ */}
        {activeTab === 0 ? (
          /* ===== 动态 Tab ===== */
          <View style={{ padding: '14px 16px 80px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {user.recentPosts.map((post: any) => (
              <View key={post.id}
                onClick={() => Taro.navigateTo({ url: `/pages/post-detail/index?id=${post.id}` })}
                style={{
                  backgroundColor: '#FFF', borderRadius: '14px', overflow: 'hidden',
                  border: '1px solid #E2E8F0'
                }}
              >
                {/* Post cover image */}
                {post.cover ? (
                  <View style={{
                    height: '160px', background: post.cover,
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}>
                    <Text style={{ fontSize: '40px', opacity: 0.35 }}>📄</Text>
                  </View>
                ) : null}

                {/* Post info */}
                <View style={{ padding: '12px 14px' }}>
                  {/* User row */}
                  <View style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <View style={{
                      width: '24px', height: '24px', borderRadius: '50%',
                      backgroundColor: getBgColor(user.name),
                      display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                      <Text style={{ fontSize: '10px', fontWeight: '600', color: '#FFF' }}>
                        {getInitials(user.name)}
                      </Text>
                    </View>
                    <Text style={{ fontSize: '12px', fontWeight: '500', color: '#475569' }}>{user.name}</Text>
                    <Text style={{ fontSize: '11px', color: '#94A3B8' }}>{post.time}</Text>
                  </View>

                  <Text style={{ fontSize: '15px', fontWeight: '600', color: '#1E293B' }} numberOfLines={1}>
                    {post.title}
                  </Text>

                  <View style={{ display: 'flex', alignItems: 'center', gap: '14px', marginTop: '8px' }}>
                    <View style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Text style={{ fontSize: '12px', color: '#94A3B8' }}>❤</Text>
                      <Text style={{ fontSize: '11px', color: '#94A3B8' }}>{post.likes}</Text>
                    </View>
                    <View style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Text style={{ fontSize: '12px', color: '#94A3B8' }}>💬</Text>
                      <Text style={{ fontSize: '11px', color: '#94A3B8' }}>{post.comments}</Text>
                    </View>
                  </View>
                </View>
              </View>
            ))}
          </View>
        ) : (
          /* ===== 个人简介 Tab ===== */
          <View style={{ padding: '14px 16px 80px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {/* 个人简介 */}
            <View style={{ backgroundColor: '#FFF', borderRadius: '12px', padding: '16px', border: '1px solid #E2E8F0' }}>
              <View style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px' }}>
                <Text style={{ fontSize: '14px', fontWeight: '600', color: '#1E293B' }}>📖 个人简介</Text>
              </View>
              <Text style={{ fontSize: '13px', color: '#475569', lineHeight: '1.7' }}>{user.bio}</Text>
            </View>

            {/* 技能标签 */}
            <View style={{ backgroundColor: '#FFF', borderRadius: '12px', padding: '16px', border: '1px solid #E2E8F0' }}>
              <Text style={{ fontSize: '14px', fontWeight: '600', color: '#1E293B', marginBottom: '12px' }}>🏷️ 技能标签</Text>
              <View style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {user.tags.map((tag: string) => (
                  <View key={tag} style={{ padding: '6px 14px', borderRadius: '8px', backgroundColor: '#EFF6FF' }}>
                    <Text style={{ fontSize: '13px', color: '#2563EB' }}>{tag}</Text>
                  </View>
                ))}
              </View>
            </View>

            {/* 基本信息 */}
            <View style={{ backgroundColor: '#FFF', borderRadius: '12px', padding: '16px', border: '1px solid #E2E8F0' }}>
              <Text style={{ fontSize: '14px', fontWeight: '600', color: '#1E293B', marginBottom: '12px' }}>📋 基本信息</Text>
              <View style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {[
                  { label: '学院', value: user.college },
                  { label: '年级', value: user.grade },
                  { label: '动态', value: `${user.stats.posts} 条` },
                  { label: '获赞', value: `${user.stats.likes} 次` },
                ].map((info) => (
                  <View key={info.label} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #F8FAFC', paddingBottom: '4px' }}>
                    <Text style={{ fontSize: '13px', color: '#94A3B8' }}>{info.label}</Text>
                    <Text style={{ fontSize: '13px', color: '#1E293B', fontWeight: '500' }}>{info.value}</Text>
                  </View>
                ))}
              </View>
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  )
}
