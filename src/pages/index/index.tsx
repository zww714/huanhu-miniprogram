import { useEffect, useMemo, useState } from 'react'
import Taro, { useLoad } from '@tarojs/taro'
import { Image, Input, ScrollView, Text, View } from '@tarojs/components'
import { getActivities, getPartners, getUsers } from '../../utils/api'
import { openUnifiedUserProfile } from '../../utils/publicProfiles'
import './index.css'

const TABS = ['技能交换', '兴趣搭子', '社区活动']
const SKILL_FILTERS = ['全部', '热门', 'AI工具', 'Python', '数据分析', '设计', '考研']

const TODAY_RECOMMENDATIONS = [
  { type: 'hot-skill', icon: '🔥', badge: 'TOP', title: 'Python入门', desc: '1.2k 人想学', color: '#FEF2F2' },
  { type: 'new-request', icon: '💬', badge: 'NEW', title: '论文降重技巧求助', desc: '18 分钟前 · 计算机学院', color: '#EFF6FF' },
  { type: 'match', icon: '🎯', badge: '', title: '326', desc: '与你技能高度匹配', color: '#F0FDF4', unit: '位同学' },
]

const HOT_TOPICS = [
  { icon: '🔥', tag: '热', title: '浙大图书馆自习位拼友（可固定）', stats: '126 讨论 · 89 收藏' },
  { icon: '', tag: '新', title: '# 考研择校交流互助帖', stats: '642 讨论 · 312 收藏' },
]
const ACTIVITY_CATEGORIES = ['全部', '技能交换', '兴趣', '志愿', '其他']
const PARTNER_CATEGORIES = ['全部', '运动', '游戏', '摄影', '学习', '音乐', '旅行', '其他']

const FILTER_GROUPS = [
  { key: 'identity', label: '身份', options: ['全部', '本科生', '研究生', '博士生', '教职工'] },
  { key: 'grade', label: '年级', options: ['全部', '大一', '大二', '大三', '大四', '研一', '研二', '研三', '博士在读'] },
  { key: 'college', label: '学院', options: ['全部', '计算机学院', '物理学院', '外国语学院', '电气学院', '材料学院', '生命科学学院'] },
  { key: 'major', label: '专业', options: ['全部', '计算机科学', '数据科学', '物理学', '英语', '电气工程', '材料科学'] },
  { key: 'campus', label: '校区', options: ['全部', '紫金港', '玉泉', '西溪', '华家池', '之江'] },
  { key: 'matchType', label: '匹配类型', options: ['全部', '我会匹配', '我想学匹配', '兴趣匹配', '活动匹配'] },
] as const

type FilterKey = (typeof FILTER_GROUPS)[number]['key']
type FilterState = Record<FilterKey, string>

const DEFAULT_FILTERS: FilterState = {
  identity: '全部',
  grade: '全部',
  college: '全部',
  major: '全部',
  campus: '全部',
  matchType: '全部',
}

type SkillItem = { name: string; level?: number; desc?: string }

type SkillUser = {
  id?: string | number
  _id?: string
  name: string
  avatar?: string
  college?: string
  major?: string
  grade?: string
  campus?: string
  verified?: boolean
  match?: number
  matchRate?: number
  bio?: string
  intro?: string
  type?: string
  can?: SkillItem[]
  skills?: SkillItem[]
  canTeach?: Array<string | SkillItem>
  want?: string[]
  learnWants?: string[]
  wantToLearn?: string[]
  interests?: string[]
  tags?: string[]
  lookingFor?: string
}

type PartnerUser = SkillUser

type Activity = {
  id?: string
  _id?: string
  title: string
  time: string
  location: string
  campus?: string
  description?: string
  participants?: number
  participantCount?: number
  maxParticipants?: number
  cover?: string
  organizer?: string
  tags?: string[]
  category?: string
  status?: string
}

function textOf(value: unknown) {
  return String(value || '').trim()
}

function lower(value: unknown) {
  return textOf(value).toLowerCase()
}

function includesText(value: unknown, keyword: string) {
  return !!keyword && lower(value).includes(keyword)
}

function getRecordId(item: { id?: string | number; _id?: string; name?: string }) {
  return String(item.id || item._id || item.name || '')
}

function firstChar(name?: string) {
  return name ? name.charAt(0) : '同'
}

function normalizeSkill(item: string | SkillItem): SkillItem {
  return typeof item === 'string' ? { name: item } : item
}

function userSkills(user: SkillUser) {
  const raw = user.canTeach?.length ? user.canTeach : user.can?.length ? user.can : user.skills || []
  return raw
    .map(normalizeSkill)
    .filter((skill) => !!skill?.name)
    .map((skill) => ({
      ...skill,
      level: Number((skill.level as any)?.$numberInt || skill.level || 0),
    }))
}

function userWants(user: SkillUser) {
  return (user.wantToLearn?.length ? user.wantToLearn : user.want?.length ? user.want : user.learnWants || [])
    .filter(Boolean)
    .map(String)
}

function userInterestLabels(user: SkillUser) {
  return Array.from(new Set([...(user.interests || []), ...(user.tags || [])].filter(Boolean).map(String)))
}

function getUserCampus(user: SkillUser) {
  const id = Number(user.id || user._id || 0)
  return user.campus || ['紫金港', '玉泉', '西溪', '紫金港', '华家池', '之江'][Math.abs(id) % 6] || '紫金港'
}

function getUserCollege(user: SkillUser) {
  if (user.college && user.college !== '浙江大学') return user.college
  if (lower(user.major).includes('计算机')) return '计算机学院'
  if (lower(user.major).includes('物理')) return '物理学院'
  if (lower(user.major).includes('英语')) return '外国语学院'
  if (lower(user.major).includes('电')) return '电气学院'
  if (lower(user.major).includes('材料')) return '材料学院'
  return user.college || '计算机学院'
}

function getUserMajor(user: SkillUser) {
  return user.major || '计算机科学'
}

function getUserIntro(user: SkillUser) {
  return user.intro || user.bio || user.lookingFor || '正在寻找可以一起交流的同学。'
}

function getIdentity(user: SkillUser) {
  const type = user.type || ''
  const grade = user.grade || ''
  if (type.includes('教职工') || grade.includes('教职工')) return '教职工'
  if (type.includes('博士') || grade.includes('博士')) return '博士生'
  if (type.includes('研究生') || grade.includes('研')) return '研究生'
  return '本科生'
}

function getMatchRate(user: SkillUser) {
  return Number(user.matchRate || user.match || 82)
}

function getActivityCampus(activity: Activity) {
  if (activity.campus) return activity.campus
  if (activity.location.includes('紫金港')) return '紫金港'
  if (activity.location.includes('玉泉')) return '玉泉'
  if (activity.location.includes('西溪')) return '西溪'
  if (activity.location.includes('华家池')) return '华家池'
  if (activity.location.includes('之江')) return '之江'
  return '紫金港'
}

function userKeywordReasons(user: SkillUser, keyword: string, channel: 'skill' | 'partner') {
  if (!keyword) return []
  const reasons: string[] = []
  const skills = userSkills(user)
  const wants = userWants(user)
  const interests = userInterestLabels(user)

  const matchedSkill = skills.find((skill) => includesText(skill.name, keyword))
  if (matchedSkill) reasons.push(`匹配：我会 ${matchedSkill.name}`)

  const matchedWant = wants.find((item) => includesText(item, keyword))
  if (matchedWant) reasons.push(`匹配：想学 ${matchedWant}`)

  const matchedInterest = interests.find((item) => includesText(item, keyword))
  if (matchedInterest) reasons.push(`匹配：兴趣 ${matchedInterest}`)

  if (includesText(user.name, keyword)) reasons.push('匹配：姓名')
  if (includesText(getUserCollege(user), keyword)) reasons.push(`匹配：学院 ${getUserCollege(user)}`)
  if (includesText(getUserMajor(user), keyword)) reasons.push(`匹配：专业 ${getUserMajor(user)}`)
  if (includesText(user.grade, keyword)) reasons.push(`匹配：年级 ${user.grade}`)
  if (includesText(getUserCampus(user), keyword)) reasons.push(`匹配：校区 ${getUserCampus(user)}`)
  if (includesText(getUserIntro(user), keyword)) reasons.push(channel === 'partner' ? '匹配：搭子简介' : '匹配：个人介绍')
  if (includesText(user.lookingFor, keyword)) reasons.push(`匹配：${user.lookingFor}`)

  return Array.from(new Set(reasons)).slice(0, 3)
}

function activityKeywordReasons(activity: Activity, keyword: string) {
  if (!keyword) return []
  const reasons: string[] = []
  const tag = (activity.tags || []).find((item) => includesText(item, keyword))
  if (includesText(activity.title, keyword)) reasons.push(`命中：活动标题包含 ${textOf(keyword)}`)
  if (tag) reasons.push(`命中：标签 ${tag}`)
  if (includesText(activity.category, keyword)) reasons.push(`命中：分类 ${activity.category}`)
  if (includesText(activity.location, keyword)) reasons.push(`命中：地点 ${activity.location}`)
  if (includesText(getActivityCampus(activity), keyword)) reasons.push(`命中：校区 ${getActivityCampus(activity)}`)
  if (includesText(activity.organizer, keyword)) reasons.push(`命中：组织者 ${activity.organizer}`)
  if (includesText(activity.description, keyword)) reasons.push('命中：活动说明')
  return Array.from(new Set(reasons)).slice(0, 3)
}

function matchesUserFilters(user: SkillUser, filters: FilterState, channel: 'skill' | 'partner') {
  if (filters.identity !== '全部' && getIdentity(user) !== filters.identity) return false
  if (filters.grade !== '全部' && user.grade !== filters.grade) return false
  if (filters.college !== '全部' && getUserCollege(user) !== filters.college) return false
  if (filters.major !== '全部' && !getUserMajor(user).includes(filters.major)) return false
  if (filters.campus !== '全部' && getUserCampus(user) !== filters.campus) return false
  if (filters.matchType === '我会匹配' && !userSkills(user).length) return false
  if (filters.matchType === '我想学匹配' && !userWants(user).length) return false
  if (filters.matchType === '兴趣匹配' && !userInterestLabels(user).length) return false
  if (filters.matchType === '活动匹配') return false
  if (channel === 'skill' && filters.matchType === '兴趣匹配') return false
  return true
}

function matchesActivityFilters(activity: Activity, filters: FilterState) {
  if (filters.campus !== '全部' && getActivityCampus(activity) !== filters.campus) return false
  if (filters.matchType !== '全部' && filters.matchType !== '活动匹配') return false
  return true
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
  return exists ? activities : [{ ...pending, id: pendingId }, ...activities]
}

export default function Index() {
  const [activeTab, setActiveTab] = useState(0)
  const [filterIndex, setFilterIndex] = useState(0)
  const [activityCategory, setActivityCategory] = useState(0)
  const [partnerCategory, setPartnerCategory] = useState(0)
  const [searchQuery, setSearchQuery] = useState('')
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS)
  const [draftFilters, setDraftFilters] = useState<FilterState>(DEFAULT_FILTERS)
  const [filterOpen, setFilterOpen] = useState(false)
  const [expandedTags, setExpandedTags] = useState<Record<string, boolean>>({})
  const [skillUsers, setSkillUsers] = useState<SkillUser[]>([])
  const [partners, setPartners] = useState<PartnerUser[]>([])
  const [activities, setActivities] = useState<Activity[]>([])
  const [loading, setLoading] = useState(true)

  useLoad((options) => {
    const tab = Number(options?.tab)
    if ([0, 1, 2].includes(tab)) setActiveTab(tab)
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
        setSkillUsers(mergePendingSkill(usersData || []))
        setPartners(mergePendingPartner(partnersData || []))
        setActivities(mergePendingActivity(activitiesData || []))
      } finally {
        if (alive) setLoading(false)
      }
    }
    loadHomeData()
    return () => { alive = false }
  }, [])

  const keyword = lower(searchQuery)
  const activeFilterChips = FILTER_GROUPS
    .filter((group) => filters[group.key] !== '全部')
    .map((group) => ({ key: group.key, label: group.label, value: filters[group.key] }))

  const filteredSkillUsers = useMemo(() => {
    const category = SKILL_FILTERS[filterIndex]
    return skillUsers.filter((user) => {
      const categoryMatch = category === '全部' || category === '热门'
        ? true
        : userSkills(user).some((skill) => skill.name.includes(category)) || userWants(user).some((item) => item.includes(category))
      const keywordMatch = !keyword || userKeywordReasons(user, keyword, 'skill').length > 0
      return categoryMatch && keywordMatch && matchesUserFilters(user, filters, 'skill')
    })
  }, [filterIndex, filters, keyword, skillUsers])

  const filteredPartners = useMemo(() => {
    const category = PARTNER_CATEGORIES[partnerCategory]
    return partners.filter((user) => {
      const labels = [...userInterestLabels(user), ...userWants(user), user.lookingFor].filter(Boolean).map(String)
      const categoryMatch = category === '全部' ? true : labels.some((label) => label.includes(category))
      const keywordMatch = !keyword || userKeywordReasons(user, keyword, 'partner').length > 0
      return categoryMatch && keywordMatch && matchesUserFilters(user, filters, 'partner')
    })
  }, [filters, keyword, partnerCategory, partners])

  const filteredActivities = useMemo(() => {
    const category = ACTIVITY_CATEGORIES[activityCategory]
    return activities.filter((activity) => {
      const categoryMatch = category === '全部' ? true : activity.category === category || activity.tags?.some((tag) => tag.includes(category))
      const keywordMatch = !keyword || activityKeywordReasons(activity, keyword).length > 0
      return categoryMatch && keywordMatch && matchesActivityFilters(activity, filters)
    })
  }, [activities, activityCategory, filters, keyword])

  const handleStartChat = (user: SkillUser | PartnerUser) => {
    const id = getRecordId(user)
    const category = activeTab === 1 ? '兴趣搭子' : '技能交换'
    Taro.navigateTo({
      url: `/pages/contact-request/index?userId=${encodeURIComponent(id)}&name=${encodeURIComponent(user.name)}&category=${encodeURIComponent(category)}&source=home`,
    })
  }

  const handlePublish = () => {
    const mode = activeTab === 1 ? 'partner' : activeTab === 2 ? 'activity' : 'skill'
    Taro.navigateTo({ url: `/pages/publish/index?mode=${mode}` })
  }

  const handleUserClick = (user: SkillUser) => {
    const id = getRecordId(user)
    openUnifiedUserProfile(id, user.name)
  }

  const handleActivityRegister = (activity: Activity, isFull: boolean) => {
    if (isFull) {
      Taro.showToast({ title: '活动已满', icon: 'none' })
      return
    }
    const query = [
      `id=${encodeURIComponent(activity.id || activity._id || activity.title)}`,
      `title=${encodeURIComponent(activity.title)}`,
      `organizer=${encodeURIComponent(activity.organizer || '')}`,
      `time=${encodeURIComponent(activity.time)}`,
      `location=${encodeURIComponent(activity.location)}`,
      `participants=${encodeURIComponent(String(activity.participants || activity.participantCount || 0))}`,
      `maxParticipants=${encodeURIComponent(String(activity.maxParticipants || ''))}`,
    ].join('&')
    Taro.navigateTo({ url: `/pages/activity-register/index?${query}` })
  }

  const toggleTagGroup = (key: string) => {
    setExpandedTags((current) => ({ ...current, [key]: !current[key] }))
  }

  const clearFilter = (key: FilterKey) => {
    setFilters((current) => ({ ...current, [key]: '全部' }))
  }

  const openFilter = () => {
    setDraftFilters(filters)
    setFilterOpen(true)
  }

  const renderEmpty = () => (
    <View className='empty-state'>
      <Text className='empty-title'>{loading ? '正在加载内容...' : '没有找到相关内容'}</Text>
      <Text className='empty-desc'>换个关键词试试，或发布你的需求</Text>
    </View>
  )

  const renderFilterTabs = (items: string[], value: number, onChange: (index: number) => void) => (
    <ScrollView scrollX showScrollbar={false} className='category-scroll'>
      <View className='category-list'>
        {items.map((tag, index) => (
          <View key={tag} className={value === index ? 'category-chip active' : 'category-chip'} onClick={() => onChange(index)}>
            {tag === '热门' && <Text className='chip-icon'>🔥</Text>}
            <Text>{tag}</Text>
          </View>
        ))}
        <View className='category-chip more-chip'>
          <Text>∨</Text>
        </View>
      </View>
    </ScrollView>
  )

  const renderStars = (level: number) => {
    const stars: string[] = []
    for (let i = 0; i < 5; i++) stars.push(i < level ? '★' : '☆')
    return <Text className='skill-stars'>{stars.join('')}</Text>
  }

  const renderTagGroup = (
    title: string,
    tags: Array<{ name: string; level?: number }> | string[],
    groupKey: string,
    tone: 'can' | 'want' | 'interest'
  ) => {
    const expanded = !!expandedTags[groupKey]
    const visible = expanded ? tags : tags.slice(0, 3)
    const rest = Math.max(0, tags.length - 3)
    if (!tags.length) return null
    return (
      <View className='tag-section'>
        <Text className={`tag-label ${tone}`}>{title}</Text>
        <View className='tag-wrap'>
          {visible.map((tag) => {
            const name = typeof tag === 'string' ? tag : tag.name
            const level = typeof tag === 'string' ? 0 : (tag.level || 0)
            return (
              <View className={`skill-tag ${tone}`} key={name}>
                <Text className='skill-tag-name'>{name}</Text>
                {level > 0 && renderStars(level)}
              </View>
            )
          })}
          {!expanded && rest > 0 && (
            <View className='skill-tag more' onClick={() => toggleTagGroup(groupKey)}>
              <Text>+{rest}</Text>
            </View>
          )}
          {expanded && rest > 0 && (
            <View className='skill-tag more' onClick={() => toggleTagGroup(groupKey)}>
              <Text>收起</Text>
            </View>
          )}
        </View>
      </View>
    )
  }

  const renderHeroBanner = () => (
    <View className='hero-banner'>
      <Text className='hero-title'>和全校同学交换技能</Text>
      <Text className='hero-desc'>分享你的特长，找到想学的知识</Text>
      <View className='hero-features'>
        <View className='hero-feature'>
          <Text className='hero-feature-icon'>✓</Text>
          <Text className='hero-feature-label'>真实同学</Text>
          <Text className='hero-feature-sub'>安全可靠</Text>
        </View>
        <View className='hero-feature'>
          <Text className='hero-feature-icon'>◎</Text>
          <Text className='hero-feature-label'>双向匹配</Text>
          <Text className='hero-feature-sub'>高效学习</Text>
        </View>
        <View className='hero-feature'>
          <Text className='hero-feature-icon'>♡</Text>
          <Text className='hero-feature-label'>互助互学</Text>
          <Text className='hero-feature-sub'>共同成长</Text>
        </View>
      </View>
    </View>
  )

  const renderTodayRecommend = () => (
    <View className='recommend-section'>
      <View className='section-header'>
        <Text className='section-title'>今日推荐</Text>
        <Text className='section-more'>查看全部 ›</Text>
      </View>
      <View className='recommend-cards'>
        {TODAY_RECOMMENDATIONS.map((item) => (
          <View className='recommend-card' key={item.type} style={{ backgroundColor: item.color }}>
            <View className='recommend-card-head'>
              <Text className='recommend-icon'>{item.icon}</Text>
              <Text className='recommend-card-label'>
                {item.type === 'hot-skill' ? '本周热门技能' : item.type === 'new-request' ? '最新求助' : '高匹配同学'}
              </Text>
              {!!item.badge && <Text className={`recommend-badge ${item.type}`}>{item.badge}</Text>}
            </View>
            <View className='recommend-card-body'>
              {item.type === 'match' ? (
                <View className='match-number-row'>
                  <Text className='match-number'>{item.title}</Text>
                  <Text className='match-unit'>{item.unit}</Text>
                </View>
              ) : (
                <Text className='recommend-card-title'>{item.title}</Text>
              )}
            </View>
            <Text className='recommend-card-desc'>{item.desc}</Text>
          </View>
        ))}
      </View>
    </View>
  )

  const renderUserCard = (user: SkillUser, channel: 'skill' | 'partner') => {
    const id = getRecordId(user)
    const skills = userSkills(user)
    const wants = userWants(user)
    const interests = userInterestLabels(user)
    const matchRate = getMatchRate(user)
    const isHot = matchRate >= 85
    return (
      <View className='user-card' key={id || user.name}>
        <View className='card-top'>
          <View className='avatar' onClick={() => handleUserClick(user)}>
            <Text>{firstChar(user.name)}</Text>
            {user.verified && <View className='avatar-verify'><Text>✓</Text></View>}
          </View>
          <View className='user-main'>
            <View className='name-line'>
              <Text className='user-name'>{user.name}</Text>
              {user.verified && <Text className='verify-mark'>✓</Text>}
              {isHot && <Text className='hot-badge'>高匹配</Text>}
              {!isHot && matchRate >= 80 && <Text className='warm-badge'>热门</Text>}
            </View>
            <Text className='user-meta' numberOfLines={1}>
              {getUserCollege(user)} · {user.grade || '在读'}
            </Text>
            <Text className='user-intro' numberOfLines={1}>{getUserIntro(user)}</Text>
          </View>
          <View className='match-area'>
            <View className='match-rate'>
              <Text className='match-number'>{matchRate}</Text>
              <Text className='match-percent'>%</Text>
              <Text className='match-label'>匹配</Text>
            </View>
            <Text className='match-heart'>♡</Text>
          </View>
        </View>

        {renderTagGroup('我会', skills, `${id}-can`, 'can')}
        {renderTagGroup(channel === 'partner' ? '兴趣' : '我想学', channel === 'partner' ? interests.map(i => ({ name: i })) : wants.map(w => ({ name: w })), `${id}-want`, channel === 'partner' ? 'interest' : 'want')}

        <View className='card-footer'>
          <View className='footer-info'>
            <Text className='footer-campus'>📍 {getUserCampus(user)}校区</Text>
            <Text className='footer-online'>⏱ 在线</Text>
            <Text className='footer-exchange'>已完成 {Math.floor(Math.random() * 30 + 5)} 次交换</Text>
          </View>
          <View className='contact-btn' onClick={() => handleStartChat(user)}>
            <Text>联系TA</Text>
          </View>
        </View>
      </View>
    )
  }

  const renderActivityCard = (activity: Activity) => {
    const participants = Number(activity.participants || activity.participantCount || 0)
    const isFull = participants >= (activity.maxParticipants || 999)
    const status = isFull ? '已满' : activity.status === '进行中' ? '进行中' : '报名中'
    return (
      <View className='activity-card' key={activity.id || activity._id || activity.title}>
        <View className='activity-cover-wrap'>
          {activity.cover ? (
            <Image className='activity-cover-img' src={activity.cover} mode='aspectFill' />
          ) : (
            <View className='activity-cover-placeholder'>
              <Text className='activity-cover-text'>{activity.title.slice(0, 6)}</Text>
            </View>
          )}
          <Text className='activity-type-badge'>活动</Text>
        </View>
        <View className='activity-body'>
          <View className='activity-title-row'>
            <Text className='activity-title'>{activity.title}</Text>
            <Text className={`activity-status ${status === '进行中' ? 'ongoing' : status === '已满' ? 'full' : ''}`}>{status}</Text>
          </View>
          <Text className='activity-time'>🕐 {activity.time}</Text>
          <Text className='activity-location'>📍 {activity.location}</Text>
          <View className='activity-tags'>
            {(activity.tags || []).slice(0, 3).map((tag) => <Text className='activity-tag' key={tag}>{tag}</Text>)}
          </View>
          <View className='activity-footer'>
            <View className='activity-participants'>
              <Text className='participant-count'>{participants}</Text>
              <Text className='participant-label'> 人已报名</Text>
            </View>
            <View className={isFull ? 'register-btn disabled' : 'register-btn'} onClick={() => handleActivityRegister(activity, isFull)}>
              <Text>{isFull ? '已满' : '报名'}</Text>
            </View>
          </View>
        </View>
      </View>
    )
  }

  const renderActiveFilterChips = () => (
    activeFilterChips.length > 0 ? (
      <View className='active-filter-row'>
        {activeFilterChips.map((chip) => (
          <View className='active-filter' key={chip.key} onClick={() => clearFilter(chip.key)}>
            <Text>{chip.label}：{chip.value} ×</Text>
          </View>
        ))}
      </View>
    ) : null
  )

  const renderHotTopics = () => (
    <View className='hot-topics-section'>
      <View className='section-header'>
        <Text className='section-title'>本周校园热议</Text>
        <Text className='section-more'>更多 ›</Text>
      </View>
      <View className='hot-topics-list'>
        {HOT_TOPICS.map((topic) => (
          <View className='hot-topic-item' key={topic.title}>
            <Text className={`topic-tag ${topic.tag === '热' ? 'hot' : 'new'}`}>{topic.tag}</Text>
            <View className='topic-content'>
              <Text className='topic-title' numberOfLines={1}>{topic.title}</Text>
              <Text className='topic-stats'>{topic.stats}</Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  )

  const renderSkillExchange = () => (
    <View>
      {renderHeroBanner()}
      {renderFilterTabs(SKILL_FILTERS, filterIndex, setFilterIndex)}
      {renderActiveFilterChips()}
      {renderTodayRecommend()}
      <View className='card-list'>
        {!filteredSkillUsers.length && renderEmpty()}
        {filteredSkillUsers.map((user) => renderUserCard(user, 'skill'))}
      </View>
      {renderHotTopics()}
    </View>
  )

  const renderInterestPartners = () => (
    <View>
      {renderFilterTabs(PARTNER_CATEGORIES, partnerCategory, setPartnerCategory)}
      {renderActiveFilterChips()}
      <View className='card-list'>
        {!filteredPartners.length && renderEmpty()}
        {filteredPartners.map((user) => renderUserCard(user, 'partner'))}
      </View>
    </View>
  )

  const renderActivitiesTab = () => (
    <View>
      {renderFilterTabs(ACTIVITY_CATEGORIES, activityCategory, setActivityCategory)}
      {renderActiveFilterChips()}
      <View className='card-list'>
        {!filteredActivities.length && renderEmpty()}
        {filteredActivities.map((activity) => renderActivityCard(activity))}
      </View>
    </View>
  )

  const renderFilterPanel = () => filterOpen && (
    <View className='filter-mask'>
      <View className='filter-panel'>
        <View className='filter-head'>
          <Text className='filter-title'>筛选</Text>
          <Text className='filter-close' onClick={() => setFilterOpen(false)}>×</Text>
        </View>
        <ScrollView scrollY className='filter-scroll' showScrollbar={false}>
          {FILTER_GROUPS.map((group) => (
            <View className='filter-group' key={group.key}>
              <Text className='filter-label'>{group.label}</Text>
              <View className='filter-options'>
                {group.options.map((option) => (
                  <View
                    key={option}
                    className={draftFilters[group.key] === option ? 'filter-option active' : 'filter-option'}
                    onClick={() => setDraftFilters((current) => ({ ...current, [group.key]: option }))}
                  >
                    <Text>{option}</Text>
                  </View>
                ))}
              </View>
            </View>
          ))}
        </ScrollView>
        <View className='filter-actions'>
          <View className='reset-btn' onClick={() => setDraftFilters(DEFAULT_FILTERS)}><Text>重置</Text></View>
          <View className='confirm-btn' onClick={() => { setFilters(draftFilters); setFilterOpen(false) }}><Text>确认</Text></View>
        </View>
      </View>
    </View>
  )

  return (
    <View className='home-page'>
      <ScrollView scrollY showScrollbar={false} className='home-scroll'>
        <View className='page-header'>
          <View className='logo-area'>
            <Text className='logo-text'>换乎</Text>
            <Text className='logo-sub'>ZJU版</Text>
          </View>
          <View className='search-bar'>
            <Text className='search-icon'>⌕</Text>
            <Input
              value={searchQuery}
              placeholder='搜索技能、搭子、活动或帖子'
              confirmType='search'
              onInput={(event) => setSearchQuery(String(event.detail.value || ''))}
              className='search-input'
              placeholderStyle='color: #94A3B8; font-size: 14px;'
            />
            {!!searchQuery && <Text className='clear-search' onClick={() => setSearchQuery('')}>×</Text>}
          </View>
        </View>

        <View className='tab-row'>
          {TABS.map((tab, index) => (
            <View key={tab} className={activeTab === index ? 'tab-item active' : 'tab-item'} onClick={() => setActiveTab(index)}>
              <Text>{tab}</Text>
              {activeTab === index && <View className='tab-indicator' />}
            </View>
          ))}
        </View>

        {activeTab === 0 && renderSkillExchange()}
        {activeTab === 1 && renderInterestPartners()}
        {activeTab === 2 && renderActivitiesTab()}
      </ScrollView>

      <View className='float-publish' onClick={handlePublish}>
        <Text>+</Text>
      </View>
      {renderFilterPanel()}
    </View>
  )
}
