import { View, Text, ScrollView } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useState } from 'react'
import './index.css'

import {
  MY_PROFILE, MY_SKILLS, MY_LEARN_WANTS,
  MY_INTERESTS, MY_REVIEWS
} from '../../utils/mock'

const QUICK_ENTRIES = [
  { key: 'partners', icon: '🤝', label: '我的搭子', url: '/pages/my-partners/index' },
  { key: 'activities', icon: '🏃', label: '我的活动', url: '/pages/my-activities/index' },
  { key: 'favorites', icon: '⭐', label: '我的收藏', url: '/pages/my-favorites/index' },
  { key: 'settings', icon: '⚙️', label: '设置', url: '/pages/settings/index' },
]

const LEVEL_COLORS: Record<number, { bg: string; text: string; label: string }> = {
  5: { bg: '#FEF3C7', text: '#92400E', label: 'Lv.5' },
  4: { bg: '#FEF9C3', text: '#A16207', label: 'Lv.4' },
  3: { bg: '#F0F9FF', text: '#075985', label: 'Lv.3' },
  2: { bg: '#F1F5F9', text: '#475569', label: 'Lv.2' },
  1: { bg: '#F8FAFC', text: '#64748B', label: 'Lv.1' },
}

export default function Profile() {
  const [activeTab, setActiveTab] = useState('posts')

  const toast = (msg: string) => Taro.showToast({ title: msg, icon: 'none' })
  const go = (url: string) => Taro.navigateTo({ url })
  const p = MY_PROFILE
  const maxLevel = Math.max(...MY_SKILLS.map(s => s.level))
  const displaySkills = MY_SKILLS.slice(0, 4)

  return (
    <ScrollView scrollY style={{ height: 'calc(100vh - 58px)', backgroundColor: '#F8FAFC' }} showScrollbar={false} enhanced bounces={false}>
      <View style={{ backgroundColor: '#FFFFFF', paddingTop: '40px', paddingBottom: '16px' }}>
        <View style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <View style={{ width: '72px', height: '72px', borderRadius: '50%', backgroundColor: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '10px' }}>
            <Text style={{ fontSize: '28px', fontWeight: '700', color: '#FFFFFF' }}>{p.name.charAt(0)}</Text>
          </View>
          <View style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '2px' }}>
            <Text style={{ fontSize: '20px', fontWeight: '700', color: '#1E293B' }}>{p.name}</Text>
            <View style={{ width: '18px', height: '18px', borderRadius: '50%', backgroundColor: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ fontSize: '11px', color: '#FFFFFF', fontWeight: '700' }}>{'✓'}</Text>
            </View>
          </View>
          <Text style={{ fontSize: '13px', color: '#475569', marginBottom: '6px' }}>{p.school} · {p.college} · {p.grade}</Text>
          <Text style={{ fontSize: '13px', color: '#64748B', lineHeight: '18px', marginBottom: '14px', padding: '0 32px', textAlign: 'center' }}>{p.bio}</Text>
          <View onClick={() => go('/pages/edit-profile/index')} style={{ padding: '6px 24px', borderRadius: '20px', borderWidth: '1px', borderStyle: 'solid', borderColor: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ fontSize: '13px', color: '#2563EB', fontWeight: '500' }}>{'编辑资料'}</Text>
          </View>
        </View>
      </View>

      <View style={{ margin: '8px 12px 0', backgroundColor: '#FFFFFF', borderRadius: '12px', padding: '16px 0' }}>
        <View style={{ display: 'flex', flexDirection: 'row' }}>
          {[
            { label: '技能', value: p.stats.skills, url: '/pages/my-skills/index' },
            { label: '发布', value: p.stats.posts, url: '/pages/my-posts/index' },
            { label: '粉丝', value: p.stats.followers, url: '/pages/my-followers/index' },
            { label: '关注', value: p.stats.following, url: '/pages/my-following/index' },
          ].map((item, i) => (
            <View key={item.label} onClick={() => go(item.url)} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px', borderRight: i < 3 ? '1px solid #F1F5F9' : 'none' }}>
              <Text style={{ fontSize: '20px', fontWeight: '700', color: '#1E293B' }}>{item.value}</Text>
              <Text style={{ fontSize: '12px', color: '#94A3B8' }}>{item.label}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={{ margin: '8px 12px 0', backgroundColor: '#FFFFFF', borderRadius: '12px', padding: '16px' }}>
        <View style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <Text style={{ fontSize: '16px', fontWeight: '700', color: '#1E293B' }}>{'我会'}</Text>
          <View onClick={() => go('/pages/edit-skills/index?type=can')} style={{ display: 'flex', alignItems: 'center', gap: '2px', padding: '2px 4px' }}>
            <Text style={{ fontSize: '13px', color: '#2563EB', fontWeight: '500' }}>{'编辑'}</Text>
            <Text style={{ fontSize: '11px', color: '#2563EB' }}>{'›'}</Text>
          </View>
        </View>
        {displaySkills.map((skill, i) => {
          const lc = LEVEL_COLORS[skill.level] || LEVEL_COLORS[1]
          const isMaxLevel = skill.level === maxLevel && maxLevel >= 4
          return (
            <View key={i} onClick={() => toast(skill.name)} style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', padding: '10px 12px', marginBottom: i < displaySkills.length - 1 ? '8px' : '0', backgroundColor: '#F8FAFC', borderRadius: '10px', borderWidth: isMaxLevel ? '1px' : '0px', borderStyle: 'solid', borderColor: isMaxLevel ? '#FDE68A' : 'transparent' }}>
              <View style={{ width: '44px', height: '28px', borderRadius: '6px', backgroundColor: lc.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: '10px', flexShrink: 0 }}>
                <Text style={{ fontSize: '11px', fontWeight: '700', color: lc.text }}>{lc.label}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <View style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '4px' }}>
                  <Text style={{ fontSize: '14px', fontWeight: '600', color: '#1E293B' }}>{skill.name}</Text>
                  {isMaxLevel && <Text style={{ fontSize: '14px' }}>{'👑'}</Text>}
                </View>
                <Text style={{ fontSize: '11px', color: '#94A3B8', marginTop: '1px' }}>{skill.desc}</Text>
              </View>
            </View>
          )
        })}
        {MY_SKILLS.length > 4 && (
          <View style={{ display: 'flex', alignItems: 'center', padding: '8px 0' }}>
            <Text style={{ fontSize: '13px', color: '#64748B' }}>{'查看更多…'}</Text>
          </View>
        )}
        {MY_SKILLS.length === 0 && (
          <View style={{ padding: '20px 0', alignItems: 'center' }}>
            <Text style={{ fontSize: '13px', color: '#94A3B8', textAlign: 'center' }}>{'还没有添加你会的技能'}</Text>
            <Text style={{ fontSize: '13px', color: '#94A3B8', textAlign: 'center', marginTop: '2px' }}>{'添加后，其他同学可以更快找到你'}</Text>
          </View>
        )}
      </View>

      <View style={{ margin: '8px 12px 0', backgroundColor: '#FFFFFF', borderRadius: '12px', padding: '16px' }}>
        <View style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <Text style={{ fontSize: '16px', fontWeight: '700', color: '#1E293B' }}>{'我想学'}</Text>
          <View onClick={() => go('/pages/edit-skills/index?type=want')} style={{ display: 'flex', alignItems: 'center', gap: '2px', padding: '2px 4px' }}>
            <Text style={{ fontSize: '13px', color: '#2563EB', fontWeight: '500' }}>{'编辑'}</Text>
            <Text style={{ fontSize: '11px', color: '#2563EB' }}>{'›'}</Text>
          </View>
        </View>
        <View style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', gap: '8px' }}>
          {MY_LEARN_WANTS.slice(0, 6).map((item, i) => (
            <View key={i} style={{ padding: '6px 14px', borderRadius: '20px', backgroundColor: '#FFF7ED', borderWidth: '1px', borderStyle: 'solid', borderColor: '#FED7AA' }}>
              <Text style={{ fontSize: '13px', color: '#C2410C' }}>{item.name}</Text>
            </View>
          ))}
        </View>
        {MY_LEARN_WANTS.length > 6 && (
          <View style={{ display: 'flex', alignItems: 'center', padding: '6px 0', marginTop: '4px' }}>
            <Text style={{ fontSize: '13px', color: '#64748B' }}>{'查看更多…'}</Text>
          </View>
        )}
        {MY_LEARN_WANTS.length === 0 && (
          <View style={{ padding: '16px 0', alignItems: 'center' }}>
            <Text style={{ fontSize: '13px', color: '#94A3B8', textAlign: 'center' }}>{'还没有添加想学的内容'}</Text>
            <Text style={{ fontSize: '13px', color: '#94A3B8', textAlign: 'center', marginTop: '2px' }}>{'添加后，系统可以帮你推荐合适的同学'}</Text>
          </View>
        )}
      </View>

      <View style={{ margin: '8px 12px 0', backgroundColor: '#FFFFFF', borderRadius: '12px', padding: '16px' }}>
        <View style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <Text style={{ fontSize: '16px', fontWeight: '700', color: '#1E293B' }}>{'兴趣标签'}</Text>
          <View onClick={() => toast('兴趣标签编辑稍后接入')} style={{ display: 'flex', alignItems: 'center', gap: '2px', padding: '2px 4px' }}>
            <Text style={{ fontSize: '13px', color: '#2563EB', fontWeight: '500' }}>{'编辑'}</Text>
            <Text style={{ fontSize: '11px', color: '#2563EB' }}>{'›'}</Text>
          </View>
        </View>
        <View style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', gap: '8px' }}>
          {MY_INTERESTS.map((tag, i) => (
            <View key={i} style={{ padding: '6px 14px', borderRadius: '20px', backgroundColor: '#F0F9FF', borderWidth: '1px', borderStyle: 'solid', borderColor: '#BAE6FD' }}>
              <Text style={{ fontSize: '13px', color: '#0369A1' }}>{tag}</Text>
            </View>
          ))}
        </View>
        {MY_INTERESTS.length === 0 && (
          <View style={{ padding: '16px 0' }}>
            <Text style={{ fontSize: '13px', color: '#94A3B8', textAlign: 'center' }}>{'添加兴趣标签，让同学更容易找到你'}</Text>
          </View>
        )}
      </View>

      <View style={{ margin: '8px 12px 0', backgroundColor: '#FFFFFF', borderRadius: '12px', overflow: 'hidden' }}>
        <View style={{ display: 'flex', flexWrap: 'wrap' }}>
          {QUICK_ENTRIES.map((entry, i) => (
            <View key={entry.key} onClick={() => go(entry.url)} style={{ width: '25%', padding: '18px 0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', borderRight: (i + 1) % 4 === 0 ? 'none' : '1px solid #F1F5F9' }}>
              <Text style={{ fontSize: '22px' }}>{entry.icon}</Text>
              <Text style={{ fontSize: '13px', color: '#475569', fontWeight: '500' }}>{entry.label}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={{ margin: '8px 12px 24px', backgroundColor: '#FFFFFF', borderRadius: '12px', overflow: 'hidden' }}>
        <View style={{ display: 'flex', flexDirection: 'row', borderBottom: '1px solid #E2E8F0' }}>
          {[{ key: 'posts', label: '我的发布' }, { key: 'reviews', label: '收到的评价' }].map(tab => (
            <View key={tab.key} onClick={() => setActiveTab(tab.key)} style={{ flex: 1, padding: '14px 0', display: 'flex', alignItems: 'center', justifyContent: 'center', borderBottom: activeTab === tab.key ? '2.5px solid #2563EB' : '2px solid transparent' }}>
              <Text style={{ fontSize: '14px', fontWeight: activeTab === tab.key ? '600' : '400', color: activeTab === tab.key ? '#2563EB' : '#64748B' }}>{tab.label}</Text>
            </View>
          ))}
        </View>
        {activeTab === 'posts' && (
          <View style={{ padding: '20px 0' }}>
            <Text style={{ fontSize: '13px', color: '#94A3B8', textAlign: 'center' }}>{'暂无内容，去发布一条动态吧'}</Text>
          </View>
        )}
        {activeTab === 'reviews' && (
          <View style={{ padding: '12px 14px' }}>
            {MY_REVIEWS.map((review, i) => (
              <View key={review.id} style={{ padding: '12px 0', borderBottom: i < MY_REVIEWS.length - 1 ? '1px solid #F1F5F9' : 'none' }}>
                <View style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', marginBottom: '6px' }}>
                  <View style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: '#E0E7FF', marginRight: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Text style={{ fontSize: '12px', color: '#4338CA' }}>{review.reviewer.charAt(0)}</Text>
                  </View>
                  <Text style={{ fontSize: '13px', fontWeight: '500', color: '#1E293B', flex: 1 }}>{review.reviewer}</Text>
                  <Text style={{ fontSize: '11px', color: '#94A3B8' }}>{review.time}</Text>
                </View>
                <View style={{ display: 'flex', flexDirection: 'row', gap: '6px', marginBottom: '4px' }}>
                  {review.tags.map((tag: string, ti: number) => (
                    <View key={ti} style={{ padding: '2px 8px', borderRadius: '10px', backgroundColor: '#F0FDF4' }}>
                      <Text style={{ fontSize: '11px', color: '#059669' }}>{tag}</Text>
                    </View>
                  ))}
                </View>
                <Text style={{ fontSize: '13px', color: '#475569', lineHeight: '20px', marginBottom: '4px' }}>{review.content}</Text>
                <Text style={{ fontSize: '11px', color: '#93C5FD' }}>{'关联技能：' + review.skill}</Text>
              </View>
            ))}
            {MY_REVIEWS.length === 0 && (
              <View style={{ padding: '16px 0', alignItems: 'center' }}>
                <Text style={{ fontSize: '13px', color: '#94A3B8', textAlign: 'center' }}>{'暂无评价'}</Text>
              </View>
            )}
          </View>
        )}
      </View>
      <View style={{ height: '40px' }} />
    </ScrollView>
  )
}
