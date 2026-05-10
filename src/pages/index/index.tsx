import { useEffect, useMemo, useState } from 'react'
import Taro, { useLoad } from '@tarojs/taro'
import { ScrollView, Text, View } from '@tarojs/components'
import { getActivities, getPartners, getUsers } from '../../utils/api'
import './index.css'

const TABS = ['技能交换', '兴趣搭子', '社区活动']
const SKILL_FILTERS = ['全部', '热门', 'AI工具', 'Python', '数据分析', '英语交流', '摄影']
const ACTIVITY_CATEGORIES = ['全部', '技能交换', '兴趣', '志愿', '其他']
const PARTNER_CATEGORIES = ['全部', '运动', '游戏', '摄影', '学习', '音乐', '旅行', '其他']

type SkillUser = {
  id?: string | number
  _id?: string
  name: string
  avatar?: string
  college?: string
  major?: string
  grade?: string
  verified?: boolean
  match?: number
  bio?: string
  can?: { name: string; level: number }[]
  skills?: { name: string; level: number }[]
  want?: string[]
  learnWants?: string[]
}

type PartnerUser = SkillUser & {
  tags?: string[]
  interests?: string[]
  lookingFor?: string
}

type Activity = {
  id?: string
  _id?: string
  title: string
  time: string
  location: string
  participants: number
  maxParticipants?: number
  cover?: string
  organizer?: string
  tags?: string[]
  category?: string
}

function getRecordId(item: { id?: string | number; _id?: string }) {
  return String(item.id || item._id || '')
}

function firstChar(name?: string) {
  return name ? name.charAt(0) : '同'
}

function userSkills(user: SkillUser) {
  const skills = user.can?.length ? user.can : user.skills || []
  return skills
    .filter((skill) => !!skill?.name)
    .map((skill) => ({
      name: skill.name,
      level: Number((skill.level as any)?.$numberInt || skill.level || 0),
    }))
}

function userWants(user: SkillUser) {
  return (user.want?.length ? user.want : user.learnWants || [])
    .filter(Boolean)
    .map(String)
}

function mergePendingSkill(users: SkillUser[]) {
  const pending = Taro.getStorageSync('pendingSkillNeed')
  if (!pending?.name) return users

  return users.map((user, index) => {
    const isCurrentUser = user._id === 'user_chen' || index === 0
    if (!isCurrentUser) return user

    if (pending.type === 'can') {
      const level = Number(pending.level || 3)
      const can = userSkills(user).filter((skill) => skill.name !== pending.name)
      return {
        ...user,
        can: [...can, { name: pending.name, level }],
        skills: [...(user.skills || []).filter((skill) => skill.name !== pending.name), {
          name: pending.name,
          level,
          desc: pending.desc || '',
          tags: [pending.name],
        }],
      }
    }

    const wants = userWants(user).filter((item) => item !== pending.name)
    return {
      ...user,
      want: [...wants, pending.name],
      learnWants: [...wants, pending.name],
    }
  })
}

function mergePendingPartner(partners: PartnerUser[]) {
  const pending = Taro.getStorageSync('pendingPartnerProfile')
  if (!pending?.bio && !pending?.interests?.length) return partners

  return partners.map((user, index) => {
    const isCurrentUser = user._id === 'user_chen' || index === 0
    if (!isCurrentUser) return user

    const interests = Array.from(new Set([...(user.interests || []), ...(pending.interests || [])]))
    return {
      ...user,
      bio: pending.bio || user.bio,
      interests,
      tags: Array.from(new Set([...(user.tags || []), ...interests])),
      lookingFor: pending.lookingFor || user.lookingFor || `${interests[0] || '兴趣'}搭子`,
    }
  })
}

function mergePendingActivity(activities: Activity[]) {
  const pending = Taro.getStorageSync('pendingActivity')
  if (!pending?.title) return activities

  const pendingId = pending.id || pending._id || `pending_${pending.title}`
  const exists = activities.some((activity) => (activity.id || activity._id || activity.title) === pendingId)
  if (exists) return activities

  return [{ ...pending, id: pendingId }, ...activities]
}

export default function Index() {
  const [activeTab, setActiveTab] = useState(0)
  const [filterIndex, setFilterIndex] = useState(0)
  const [activityCategory, setActivityCategory] = useState(0)
  const [partnerCategory, setPartnerCategory] = useState(0)
  const [skillUsers, setSkillUsers] = useState<SkillUser[]>([])
  const [partners, setPartners] = useState<PartnerUser[]>([])
  const [activities, setActivities] = useState<Activity[]>([])
  const [loading, setLoading] = useState(true)

  useLoad((options) => {
    const tab = Number(options?.tab)
    if ([0, 1, 2].includes(tab)) {
      setActiveTab(tab)
    }
  })

  useEffect(() => {
    let alive = true

    async function loadHomeData() {
      setLoading(true)
      try {
        const [usersData, partnersData, activitiesData] = await Promise.all([
          getUsers({ page: 0 }),
          getPartners(),
          getActivities({ page: 0 }),
        ])

        if (!alive) return
        const mergedUsers = mergePendingSkill(usersData || [])
        setSkillUsers(mergedUsers)
        setPartners(mergePendingPartner(partnersData || []))
        setActivities(mergePendingActivity(activitiesData || []))
      } finally {
        if (alive) setLoading(false)
      }
    }

    loadHomeData()
    return () => {
      alive = false
    }
  }, [])

  const filteredSkillUsers = useMemo(() => {
    const filter = SKILL_FILTERS[filterIndex]
    if (!filter || filter === '全部' || filter === '热门') return skillUsers
    return skillUsers.filter((user) =>
      userSkills(user).some((skill) => skill.name.includes(filter))
    )
  }, [filterIndex, skillUsers])

  const filteredPartners = useMemo(() => {
    const category = PARTNER_CATEGORIES[partnerCategory]
    if (!category || category === '全部') return partners
    return partners.filter((user) => {
      const labels = [...(user.tags || []), ...(user.interests || [])]
      return labels.some((label) => label.includes(category))
    })
  }, [partnerCategory, partners])

  const filteredActivities = useMemo(() => {
    const category = ACTIVITY_CATEGORIES[activityCategory]
    if (!category || category === '全部') return activities
    return activities.filter((activity) => activity.category === category)
  }, [activityCategory, activities])

  const handleSearch = () => Taro.switchTab({ url: '/pages/discover/index' })
  const handleStartChat = (user: SkillUser | PartnerUser) => {
    const id = getRecordId(user) || encodeURIComponent(user.name)
    Taro.navigateTo({
      url: `/pages/chat/index?id=${encodeURIComponent(id)}&name=${encodeURIComponent(user.name)}&category=${encodeURIComponent(activeTab === 1 ? '兴趣搭子' : '技能交换')}`,
    })
  }
  const handlePublish = () => {
    const mode = activeTab === 1 ? 'partner' : activeTab === 2 ? 'activity' : 'skill'
    Taro.navigateTo({ url: `/pages/publish/index?mode=${mode}` })
  }
  const handleUserClick = (user: SkillUser) => {
    const id = getRecordId(user)
    const query = id ? `id=${encodeURIComponent(id)}` : `name=${encodeURIComponent(user.name)}`
    Taro.navigateTo({ url: `/pages/user-detail/index?${query}` })
  }

  const renderStars = (level = 0) =>
    Array(5).fill(0).map((_, i) => (
      <Text
        key={i}
        style={{
          color: i < level ? '#F59E0B' : '#E2E8F0',
          fontSize: '10px',
          marginRight: '1px',
        }}
      >
        {'\u2605'}
      </Text>
    ))

  const renderEmpty = (text: string) => (
    <View style={{ padding: '32px 16px', textAlign: 'center' }}>
      <Text style={{ fontSize: '13px', color: '#94A3B8' }}>
        {loading ? '正在加载真实数据...' : text}
      </Text>
    </View>
  )

  const renderFilter = (
    filters: string[],
    value: number,
    onChange: (index: number) => void,
    extraStyle: Record<string, string | number> = {}
  ) => (
    <ScrollView scrollX showScrollbar={false} style={{ height: '40px', whiteSpace: 'nowrap', ...extraStyle }}>
      <View style={{ padding: '0 16px', display: 'flex', gap: '8px', height: '32px' }}>
        {filters.map((tag, i) => (
          <View
            key={tag}
            onClick={() => onChange(i)}
            style={{
              display: 'inline-flex',
              padding: '5px 16px',
              borderRadius: '100px',
              fontSize: '13px',
              fontWeight: value === i ? '600' : '400',
              backgroundColor: value === i ? '#2563EB' : '#F1F5F9',
              color: value === i ? '#FFF' : '#64748B',
            }}
          >
            {tag}
          </View>
        ))}
      </View>
    </ScrollView>
  )

  const renderSkillExchange = () => (
    <View>
      {renderFilter(SKILL_FILTERS, filterIndex, setFilterIndex, { marginTop: '4px' })}

      <View
        style={{
          margin: '0 16px 10px',
          height: '110px',
          borderRadius: '14px',
          overflow: 'hidden',
          position: 'relative',
          background: 'linear-gradient(135deg, #3B82F6 0%, #6366F1 42%, #EC4899 100%)',
        }}
      >
        <View style={{ position: 'absolute', top: '-20px', right: '-10px', width: '100px', height: '100px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.12)' }} />
        <View style={{ position: 'absolute', bottom: '-30px', left: '-20px', width: '120px', height: '120px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.08)' }} />
        <View style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '0 20px' }}>
          <Text style={{ fontSize: '20px', fontWeight: '700', color: '#FFF', lineHeight: '28px' }}>
            和全校同学交换技能
          </Text>
          <Text style={{ fontSize: '13px', color: 'rgba(255,255,255,0.78)', marginTop: '4px' }}>
            分享你的特长，学习感兴趣的知识
          </Text>
        </View>
      </View>

      <View style={{ padding: '0 16px 16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {!filteredSkillUsers.length && renderEmpty('暂无匹配的技能用户')}
        {filteredSkillUsers.map((user) => (
          <View
            key={getRecordId(user) || user.name}
            style={{ backgroundColor: '#FFF', borderRadius: '14px', padding: '16px', border: '1px solid #E2E8F0' }}
          >
            <View style={{ display: 'flex', gap: '12px' }}>
              <View
                onClick={() => handleUserClick(user)}
                style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: '#2563EB', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <Text style={{ fontSize: '20px', fontWeight: '700', color: '#FFF' }}>{firstChar(user.name)}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <View style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Text style={{ fontSize: '16px', fontWeight: '600', color: '#1E293B' }}>{user.name}</Text>
                  {user.verified && <Text style={{ fontSize: '12px', color: '#2563EB' }}>✓</Text>}
                  {!!user.match && (
                    <View style={{ marginLeft: 'auto', backgroundColor: '#EFF6FF', borderRadius: '100px', padding: '2px 8px' }}>
                      <Text style={{ fontSize: '11px', color: '#2563EB', fontWeight: '500' }}>{user.match}% 匹配</Text>
                    </View>
                  )}
                </View>
                <Text style={{ fontSize: '13px', color: '#64748B', marginTop: '2px' }}>
                  {user.college || user.grade || '浙江大学'} · {user.major || '技能交换'}
                </Text>
                {!!user.grade && <Text style={{ fontSize: '12px', color: '#94A3B8' }}>{user.grade}</Text>}
              </View>
            </View>

            {!!user.bio && <Text style={{ fontSize: '13px', color: '#475569', marginTop: '10px', lineHeight: '1.5' }}>{user.bio}</Text>}

            <View style={{ marginTop: '10px' }}>
              <Text style={{ fontSize: '12px', color: '#2563EB', fontWeight: '500', marginBottom: '4px' }}>我会</Text>
              <View style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {userSkills(user).slice(0, 4).map((skill) => (
                  <View key={skill.name} style={{ display: 'flex', alignItems: 'center', gap: '2px', backgroundColor: '#F0FDF4', borderRadius: '100px', padding: '3px 10px' }}>
                    <Text style={{ fontSize: '12px', color: '#10B981' }}>{skill.name}</Text>
                    {renderStars(skill.level)}
                  </View>
                ))}
              </View>
            </View>

            <View style={{ marginTop: '8px' }}>
              <Text style={{ fontSize: '12px', color: '#EA580C', fontWeight: '500', marginBottom: '4px' }}>想学</Text>
              <View style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {userWants(user).slice(0, 4).map((want) => (
                  <View key={want} style={{ backgroundColor: '#FFF7ED', borderRadius: '100px', padding: '3px 10px' }}>
                    <Text style={{ fontSize: '12px', color: '#EA580C' }}>{want}</Text>
                  </View>
                ))}
              </View>
            </View>

            <View onClick={() => handleStartChat(user)} style={{ marginTop: '12px', padding: '8px 0', backgroundColor: '#2563EB', borderRadius: '8px', textAlign: 'center' }}>
              <Text style={{ fontSize: '14px', color: '#FFF', fontWeight: '500' }}>发起联系</Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  )

  const renderInterestPartners = () => (
    <View>
      {renderFilter(PARTNER_CATEGORIES, partnerCategory, setPartnerCategory, { marginTop: '4px', marginBottom: '4px' })}
      <View style={{ padding: '0 16px 20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {!filteredPartners.length && renderEmpty('暂无匹配的兴趣搭子')}
        {filteredPartners.map((user) => (
          <View key={getRecordId(user) || user.name} style={{ backgroundColor: '#FFF', borderRadius: '14px', padding: '16px', border: '1px solid #E2E8F0' }}>
            <View style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', marginBottom: '10px' }}>
              <View onClick={() => handleUserClick(user)} style={{ width: '44px', height: '44px', borderRadius: '50%', backgroundColor: '#2563EB', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ fontSize: '18px', fontWeight: '700', color: '#FFF' }}>{firstChar(user.name)}</Text>
              </View>
              <View style={{ flex: 1, minWidth: 0 }}>
                <View style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Text style={{ fontSize: '15px', fontWeight: '600', color: '#1E293B' }}>{user.name}</Text>
                  {user.verified && <Text style={{ fontSize: '12px', color: '#2563EB' }}>✓</Text>}
                </View>
                <Text style={{ fontSize: '13px', color: '#64748B', marginTop: '2px', lineHeight: '1.4' }}>
                  {user.bio || `${user.college || '浙江大学'} · ${user.grade || ''}`}
                </Text>
              </View>
              {!!user.match && (
                <View style={{ textAlign: 'right', flexShrink: 0 }}>
                  <Text style={{ fontSize: '20px', fontWeight: '700', color: '#2563EB', lineHeight: '24px' }}>{user.match}%</Text>
                  <Text style={{ fontSize: '11px', color: '#94A3B8' }}>匹配度</Text>
                </View>
              )}
            </View>
            <View style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px' }}>
              <View style={{ display: 'flex', alignItems: 'center', gap: '6px', flex: 1, flexWrap: 'wrap' }}>
                <Text style={{ fontSize: '12px', color: '#64748B' }}>寻找：</Text>
                <View style={{ padding: '3px 10px', backgroundColor: '#EFF6FF', borderRadius: '100px' }}>
                  <Text style={{ fontSize: '12px', color: '#2563EB', fontWeight: '500' }}>
                    {user.lookingFor || (user.learnWants || user.want || ['兴趣搭子'])[0]}
                  </Text>
                </View>
              </View>
              <View onClick={() => handleStartChat(user)} style={{ padding: '6px 16px', backgroundColor: '#2563EB', borderRadius: '100px', flexShrink: 0 }}>
                <Text style={{ fontSize: '13px', color: '#FFF', fontWeight: '500' }}>联系TA</Text>
              </View>
            </View>
          </View>
        ))}
      </View>
    </View>
  )

  const renderActivities = () => (
    <View>
      {renderFilter(ACTIVITY_CATEGORIES, activityCategory, setActivityCategory, { marginBottom: '8px' })}
      <View style={{ padding: '0 16px 20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {!filteredActivities.length && renderEmpty('暂无匹配的社区活动')}
        {filteredActivities.map((activity) => {
          const isFull = activity.participants >= (activity.maxParticipants || 999)
          return (
            <View key={activity.id || activity._id || activity.title} style={{ backgroundColor: '#FFF', borderRadius: '14px', overflow: 'hidden', border: '1px solid #E2E8F0' }}>
              <View style={{ height: '90px', position: 'relative', background: activity.cover || 'linear-gradient(135deg, #3B82F6 0%, #6366F1 100%)' }}>
                <View style={{ position: 'absolute', top: '-15px', right: '-5px', width: '70px', height: '70px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.1)' }} />
                <View style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', padding: '0 16px' }}>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: '16px', fontWeight: '600', color: '#FFF', lineHeight: '22px' }}>{activity.title}</Text>
                    <View style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}>
                      <Text style={{ fontSize: '11px', color: 'rgba(255,255,255,0.82)' }}>⏰ {activity.time}</Text>
                      <Text style={{ fontSize: '11px', color: 'rgba(255,255,255,0.6)' }}>·</Text>
                      <Text style={{ fontSize: '11px', color: 'rgba(255,255,255,0.82)' }}>📍 {activity.location}</Text>
                    </View>
                  </View>
                </View>
              </View>
              <View style={{ padding: '10px 14px' }}>
                <View style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px' }}>
                  <View style={{ display: 'flex', alignItems: 'center', gap: '6px', flex: 1, flexWrap: 'wrap' }}>
                    {!!activity.organizer && <Text style={{ fontSize: '11px', color: '#64748B' }}>{activity.organizer}</Text>}
                    {(activity.tags || []).map((tag) => (
                      <View key={tag} style={{ padding: '1px 6px', backgroundColor: '#F1F5F9', borderRadius: '100px' }}>
                        <Text style={{ fontSize: '10px', color: '#64748B' }}>{tag}</Text>
                      </View>
                    ))}
                  </View>
                  <View
                    onClick={() => Taro.showToast({ title: isFull ? '已满' : '报名成功', icon: isFull ? 'error' : 'success' })}
                    style={{ padding: '5px 14px', borderRadius: '100px', backgroundColor: isFull ? '#F1F5F9' : '#2563EB', flexShrink: 0 }}
                  >
                    <Text style={{ fontSize: '12px', color: isFull ? '#94A3B8' : '#FFF', fontWeight: '500' }}>{isFull ? '已满' : '报名'}</Text>
                  </View>
                </View>
                <View style={{ marginTop: '6px' }}>
                  <Text style={{ fontSize: '11px', color: '#94A3B8' }}>
                    {activity.participants}/{activity.maxParticipants || '∞'} 人已报名
                  </Text>
                </View>
              </View>
            </View>
          )
        })}
      </View>
    </View>
  )

  return (
    <View style={{ height: '100vh', position: 'relative', backgroundColor: '#F8FAFC' }}>
      <ScrollView scrollY showScrollbar={false} style={{ height: '100vh' }}>
        <View onClick={handleSearch} style={{ margin: '10px 16px 4px', padding: '10px 14px', backgroundColor: '#FFF', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '8px', border: '1px solid #E2E8F0' }}>
          <Text style={{ fontSize: '16px' }}>🔍</Text>
          <Text style={{ fontSize: '14px', color: '#94A3B8', flex: 1 }}>
            搜索课程、技能或同学......
          </Text>
        </View>

        <View style={{ display: 'flex', backgroundColor: '#FFF', padding: '8px 16px', borderBottom: '1px solid #E2E8F0', position: 'sticky', top: 0, zIndex: 10 }}>
          {TABS.map((tab, i) => (
            <View
              key={tab}
              onClick={() => setActiveTab(i)}
              style={{
                flex: 1,
                padding: '8px 0',
                textAlign: 'center',
                fontSize: '15px',
                fontWeight: activeTab === i ? '600' : '400',
                color: activeTab === i ? '#2563EB' : '#64748B',
                borderBottom: activeTab === i ? '2px solid #2563EB' : '2px solid transparent',
              }}
            >
              {tab}
            </View>
          ))}
        </View>

        {activeTab === 0 && renderSkillExchange()}
        {activeTab === 1 && renderInterestPartners()}
        {activeTab === 2 && renderActivities()}
      </ScrollView>

      <View onClick={handlePublish} style={{ position: 'fixed', bottom: '100px', right: '24px', width: '56px', height: '56px', borderRadius: '50%', backgroundColor: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 14px rgba(37,99,235,0.4)', zIndex: 100 }}>
        <Text style={{ fontSize: '28px', color: '#FFF', lineHeight: '28px' }}>+</Text>
      </View>
    </View>
  )
}
