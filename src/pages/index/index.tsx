import { useEffect, useMemo, useState } from 'react'
import Taro, { useLoad } from '@tarojs/taro'
import { Image, ScrollView, Text, View } from '@tarojs/components'
import FloatingPostButton from '../../components/common/FloatingPostButton'
import SearchBar from '../../components/common/SearchBar'
import TagChip from '../../components/common/TagChip'
import { getActivities, getPartners, getUsers } from '../../utils/api'
import { openUnifiedUserProfile } from '../../utils/publicProfiles'
import './index.scss'

const TABS = ['技能交换', '兴趣搭子', '社区活动']
const SKILL_FILTERS = ['全部', '热门', 'AI工具', 'Python', '数据分析', '设计', '考研']
const PARTNER_FILTERS = ['全部', '运动', '学习', '摄影', '桌游', '音乐', '旅行']
const ACTIVITY_FILTERS = ['全部', '热门', '讲座', '工作坊', '比赛', '社团', '志愿']

const TODAY_RECOMMENDATIONS = [
  { id: 'hot-skill', label: '本周热门技能', title: 'Python入门', desc: '1.2k 人想学', badge: 'TOP', tone: 'hot' },
  { id: 'new-help', label: '最新求助', title: '论文降重技巧求助', desc: '18 分钟前 · 计算机学院', badge: 'NEW', tone: 'new' },
  { id: 'match', label: '高匹配同学', title: '326 位同学', desc: '与你技能高度匹配', badge: '', tone: 'match' },
]

const HOT_TOPICS = [
  { id: 'library-seat', badge: '热', title: '浙大图书馆自习位拼友（可固定）', stats: '126 讨论 · 89 收藏' },
  { id: 'exam-school', badge: '新', title: '# 考研择校交流互助帖', stats: '642 讨论 · 312 收藏' },
]

type SkillItem = {
  name: string
  level?: number
  desc?: string
}

type SkillUser = {
  id?: string | number
  _id?: string
  name?: string
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
  completedCount?: number
  exchangeCount?: number
  online?: boolean
}

type Activity = {
  id?: string
  _id?: string
  title?: string
  time?: string
  location?: string
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

function getUserName(user: SkillUser) {
  return user.name || '同学'
}

function getUserCampus(user: SkillUser, index = 0) {
  return user.campus || ['紫金港校区', '玉泉校区', '西溪校区', '华家池校区', '之江校区'][index % 5]
}

function getUserCollege(user: SkillUser) {
  if (user.college && user.college !== '浙江大学') return user.college
  if (lower(user.major).includes('计算机')) return '计算机科学与技术学院'
  if (lower(user.major).includes('外语') || lower(user.major).includes('英语')) return '外国语学院'
  if (lower(user.major).includes('材料')) return '材料学院'
  if (lower(user.major).includes('电')) return '电气工程学院'
  return user.college || '计算机科学与技术学院'
}

function getUserIntro(user: SkillUser) {
  return user.intro || user.bio || user.lookingFor || '喜欢拆解技术，擅长用清晰步骤解决问题。'
}

function getMatchRate(user: SkillUser, index = 0) {
  return Number(user.matchRate || user.match || [92, 88, 90][index % 3])
}

function getCompletedCount(user: SkillUser, index = 0) {
  return Number(user.completedCount || user.exchangeCount || [23, 16, 12][index % 3])
}

function getActivityCampus(activity: Activity) {
  if (activity.campus) return activity.campus
  const location = activity.location || ''
  if (location.includes('玉泉')) return '玉泉校区'
  if (location.includes('西溪')) return '西溪校区'
  if (location.includes('华家池')) return '华家池校区'
  return '紫金港校区'
}

function userMatchesKeyword(user: SkillUser, keyword: string) {
  if (!keyword) return true
  const pool = [
    getUserName(user),
    getUserCollege(user),
    user.major,
    user.grade,
    user.campus,
    getUserIntro(user),
    ...userSkills(user).map((skill) => skill.name),
    ...userWants(user),
    ...userInterestLabels(user),
  ]
  return pool.some((item) => includesText(item, keyword))
}

function activityMatchesKeyword(activity: Activity, keyword: string) {
  if (!keyword) return true
  const pool = [
    activity.title,
    activity.description,
    activity.category,
    activity.location,
    activity.organizer,
    ...(activity.tags || []),
  ]
  return pool.some((item) => includesText(item, keyword))
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

function mergePendingPartner(partners: SkillUser[]) {
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
  const [activeFilter, setActiveFilter] = useState(0)
  const [searchQuery, setSearchQuery] = useState('')
  const [expandedTags, setExpandedTags] = useState<Record<string, boolean>>({})
  const [favoritedUsers, setFavoritedUsers] = useState<Record<string, boolean>>({})
  const [skillUsers, setSkillUsers] = useState<SkillUser[]>([])
  const [partners, setPartners] = useState<SkillUser[]>([])
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

  useEffect(() => {
    setActiveFilter(0)
  }, [activeTab])

  const keyword = lower(searchQuery)
  const filters = activeTab === 0 ? SKILL_FILTERS : activeTab === 1 ? PARTNER_FILTERS : ACTIVITY_FILTERS
  const activeFilterLabel = filters[activeFilter] || '全部'

  const filteredSkillUsers = useMemo(() => {
    return skillUsers.filter((user) => {
      const categoryMatch = activeFilterLabel === '全部' || activeFilterLabel === '热门'
        ? true
        : userSkills(user).some((skill) => skill.name.includes(activeFilterLabel)) || userWants(user).some((item) => item.includes(activeFilterLabel))
      return categoryMatch && userMatchesKeyword(user, keyword)
    })
  }, [activeFilterLabel, keyword, skillUsers])

  const filteredPartners = useMemo(() => {
    return partners.filter((user) => {
      const labels = [...userInterestLabels(user), ...userWants(user), user.lookingFor].filter(Boolean).map(String)
      const categoryMatch = activeFilterLabel === '全部' ? true : labels.some((label) => label.includes(activeFilterLabel))
      return categoryMatch && userMatchesKeyword(user, keyword)
    })
  }, [activeFilterLabel, keyword, partners])

  const filteredActivities = useMemo(() => {
    return activities.filter((activity) => {
      const categoryMatch = activeFilterLabel === '全部' || activeFilterLabel === '热门'
        ? true
        : activity.category === activeFilterLabel || activity.tags?.some((tag) => tag.includes(activeFilterLabel))
      return categoryMatch && activityMatchesKeyword(activity, keyword)
    })
  }, [activeFilterLabel, activities, keyword])

  const handleStartChat = (user: SkillUser) => {
    const id = getRecordId(user)
    const category = activeTab === 1 ? '兴趣搭子' : '技能交换'
    Taro.navigateTo({
      url: `/pages/contact-request/index?userId=${encodeURIComponent(id)}&name=${encodeURIComponent(getUserName(user))}&category=${encodeURIComponent(category)}&source=home`,
    })
  }

  const handlePublish = () => {
    const mode = activeTab === 1 ? 'partner' : activeTab === 2 ? 'activity' : 'skill'
    Taro.navigateTo({ url: `/pages/publish/index?mode=${mode}` })
  }

  const handleUserClick = (user: SkillUser) => {
    openUnifiedUserProfile(getRecordId(user), getUserName(user))
  }

  const handleActivityRegister = (activity: Activity, isFull: boolean) => {
    if (isFull) {
      Taro.showToast({ title: '活动已满', icon: 'none' })
      return
    }
    const query = [
      `id=${encodeURIComponent(activity.id || activity._id || activity.title || '')}`,
      `title=${encodeURIComponent(activity.title || '')}`,
      `organizer=${encodeURIComponent(activity.organizer || '')}`,
      `time=${encodeURIComponent(activity.time || '')}`,
      `location=${encodeURIComponent(activity.location || '')}`,
      `participants=${encodeURIComponent(String(activity.participants || activity.participantCount || 0))}`,
      `maxParticipants=${encodeURIComponent(String(activity.maxParticipants || ''))}`,
    ].join('&')
    Taro.navigateTo({ url: `/pages/activity-register/index?${query}` })
  }

  const handleRecommendationClick = (id: string) => {
    if (id === 'new-help') {
      Taro.switchTab({ url: '/pages/discover/index' })
      return
    }
    if (id === 'match') {
      Taro.pageScrollTo?.({ scrollTop: 520, duration: 250 })
      return
    }
    setSearchQuery('Python')
    setActiveTab(0)
    setActiveFilter(SKILL_FILTERS.indexOf('Python'))
  }

  const handleTopicClick = (topic: string) => {
    Taro.setStorageSync('discoverKeyword', topic)
    Taro.switchTab({ url: '/pages/discover/index' })
  }

  const toggleTagGroup = (key: string) => {
    setExpandedTags((current) => ({ ...current, [key]: !current[key] }))
  }

  const renderTagGroup = (
    title: string,
    tags: Array<{ name: string; level?: number }> | string[],
    groupKey: string,
    tone: 'can' | 'want'
  ) => {
    if (!tags.length) return null
    const expanded = !!expandedTags[groupKey]
    const visible = expanded ? tags : tags.slice(0, 3)
    const rest = Math.max(0, tags.length - 3)
    return (
      <View className='home-user-tags'>
        <Text className={`home-tag-label home-tag-label--${tone}`}>{title}</Text>
        <View className='home-tag-list'>
          {visible.map((tag) => {
            const item = typeof tag === 'string' ? { name: tag } : tag
            return (
              <View className='home-skill-tag' key={`${groupKey}_${item.name}`}>
                <Text>{item.name}</Text>
                {tone === 'can' && item.level ? <Text className='home-skill-level'>Lv.{item.level}</Text> : null}
              </View>
            )
          })}
          {rest > 0 ? (
            <View className='home-skill-tag home-skill-more' onClick={() => toggleTagGroup(groupKey)}>
              <Text>{expanded ? '收起' : `+${rest}`}</Text>
            </View>
          ) : null}
        </View>
      </View>
    )
  }

  const renderHeroBanner = () => (
    <View className='home-hero'>
      <View className='home-hero-art home-hero-art--one' />
      <View className='home-hero-art home-hero-art--two' />
      <View className='home-hero-content'>
        <Text className='home-hero-title'>和全校同学交换技能</Text>
        <Text className='home-hero-desc'>分享你的特长，找到想学的知识</Text>
      </View>
      <View className='home-hero-features'>
        {[
          ['盾', '真实同学', '安全可靠'],
          ['双', '双向匹配', '高效学习'],
          ['心', '互助互学', '共同成长'],
        ].map((item) => (
          <View className='home-hero-feature' key={item[1]}>
            <Text className='home-hero-feature-icon'>{item[0]}</Text>
            <View>
              <Text className='home-hero-feature-title'>{item[1]}</Text>
              <Text className='home-hero-feature-desc'>{item[2]}</Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  )

  const renderFilters = () => (
    <ScrollView scrollX showScrollbar={false} className='home-filter-scroll'>
      <View className='home-filter-list'>
        {filters.map((item, index) => (
          <TagChip
            key={item}
            text={item}
            active={activeFilter === index}
            type={activeFilter === index ? 'primary' : item === '热门' ? 'warning' : 'default'}
            onClick={() => setActiveFilter(index)}
          />
        ))}
        <View className='home-filter-more'>
          <Text>⌄</Text>
        </View>
      </View>
    </ScrollView>
  )

  const renderTodayRecommend = () => (
    <View className='home-section home-recommend-section'>
      <View className='home-section-header'>
        <Text className='home-section-title'>今日推荐</Text>
        <Text className='home-section-more' onClick={() => Taro.switchTab({ url: '/pages/discover/index' })}>查看全部 〉</Text>
      </View>
      <View className='home-recommend-grid'>
        {TODAY_RECOMMENDATIONS.map((item) => (
          <View className={`home-recommend-card home-recommend-card--${item.tone}`} key={item.id} onClick={() => handleRecommendationClick(item.id)}>
            <View className='home-recommend-head'>
              <Text className='home-recommend-label'>{item.label}</Text>
              {item.badge ? <Text className='home-recommend-badge'>{item.badge}</Text> : null}
            </View>
            <Text className='home-recommend-title'>{item.title}</Text>
            <Text className='home-recommend-desc'>{item.desc}</Text>
          </View>
        ))}
      </View>
    </View>
  )

  const renderUserCard = (user: SkillUser, index: number, mode: 'skill' | 'partner') => {
    const id = getRecordId(user)
    const skills = userSkills(user)
    const wants = userWants(user)
    const matchRate = getMatchRate(user, index)
    const favorited = !!favoritedUsers[id]
    const name = getUserName(user)
    return (
      <View className='home-user-card' key={`${mode}_${id || index}`}>
        <View className='home-user-card-main'>
          <View className='home-avatar-wrap' onClick={() => handleUserClick(user)}>
            {user.avatar ? (
              <Image className='home-avatar-img' src={user.avatar} mode='aspectFill' />
            ) : (
              <Text className='home-avatar-text'>{firstChar(name)}</Text>
            )}
            {user.verified ? <Text className='home-avatar-check'>✓</Text> : null}
          </View>

          <View className='home-user-body'>
            <View className='home-user-title-row' onClick={() => handleUserClick(user)}>
              <Text className='home-user-name'>{name}</Text>
              {user.verified ? <Text className='home-verified'>✓</Text> : null}
              <Text className={index === 0 ? 'home-status-tag home-status-tag--match' : 'home-status-tag home-status-tag--hot'}>
                {index === 0 ? '高匹配' : '热门'}
              </Text>
            </View>
            <Text className='home-user-meta' numberOfLines={1}>{getUserCollege(user)} · {user.grade || '大三'}</Text>
            <Text className='home-user-intro' numberOfLines={2}>{getUserIntro(user)}</Text>
          </View>

          <View className='home-match-side'>
            <View className='home-match-text'>
              <Text className='home-match-number'>{matchRate}</Text>
              <Text className='home-match-percent'>%</Text>
              <Text className='home-match-label'>匹配</Text>
            </View>
            <Text
              className={favorited ? 'home-heart home-heart--active' : 'home-heart'}
              onClick={() => setFavoritedUsers((current) => ({ ...current, [id]: !current[id] }))}
            >
              {favorited ? '♥' : '♡'}
            </Text>
          </View>
        </View>

        {renderTagGroup('我会', skills, `${mode}_${id}_can`, 'can')}
        {renderTagGroup('我想学', wants, `${mode}_${id}_want`, 'want')}

        <View className='home-user-footer'>
          <View className='home-user-foot-info'>
            <Text>⌖ {getUserCampus(user, index)}</Text>
            <Text>◷ {user.online === false ? '刚刚活跃' : '在线'}</Text>
            <Text>已完成 {getCompletedCount(user, index)} 次交换</Text>
          </View>
          <View className='home-contact-btn' onClick={() => handleStartChat(user)}>
            <Text>联系TA</Text>
          </View>
        </View>
      </View>
    )
  }

  const renderActivityCard = (activity?: Activity, compact = false) => {
    const fallback: Activity = {
      id: 'ai-workshop',
      title: 'AI科研工作坊：从论文到项目实战',
      time: '05.25 周六 14:00-17:00',
      location: '紫金港校区 西区教一 202',
      category: '活动',
      tags: ['实战分享', '工具体验', '小组讨论'],
      participantCount: 326,
      status: '进行中',
    }
    const item = activity || fallback
    const participants = item.participantCount || item.participants || 326
    const isFull = !!item.maxParticipants && participants >= item.maxParticipants
    return (
      <View className={compact ? 'home-activity-card home-activity-card--compact' : 'home-activity-card'} key={item.id || item._id || item.title}>
        <View className='home-activity-cover'>
          {item.cover ? <Image className='home-activity-img' src={item.cover} mode='aspectFill' /> : (
            <View className='home-activity-placeholder'>
              <Text>AI科研{'\n'}工作坊</Text>
            </View>
          )}
          <Text className='home-activity-cover-badge'>活动</Text>
        </View>
        <View className='home-activity-body' onClick={() => handleActivityRegister(item, isFull)}>
          <View className='home-activity-title-row'>
            <Text className='home-activity-title' numberOfLines={2}>{item.title || fallback.title}</Text>
            <Text className='home-activity-status'>{isFull ? '已满' : item.status || '进行中'}</Text>
          </View>
          <Text className='home-activity-meta' numberOfLines={1}>◷ {item.time || fallback.time}　⌖ {item.location || fallback.location}</Text>
          <View className='home-activity-tags'>
            {(item.tags || fallback.tags || []).slice(0, 3).map((tag) => <Text key={tag}>{tag}</Text>)}
          </View>
          <View className='home-activity-footer'>
            <Text className='home-activity-count'>{participants} 人已报名</Text>
            <View className={isFull ? 'home-register-btn home-register-btn--disabled' : 'home-register-btn'} onClick={() => handleActivityRegister(item, isFull)}>
              <Text>{isFull ? '已满' : '报名'}</Text>
            </View>
          </View>
        </View>
      </View>
    )
  }

  const renderHotTopics = () => (
    <View className='home-section home-topic-section'>
      <View className='home-section-header'>
        <Text className='home-section-title'>本周校园热议</Text>
        <Text className='home-section-more' onClick={() => Taro.switchTab({ url: '/pages/discover/index' })}>更多 〉</Text>
      </View>
      <View className='home-topic-grid'>
        {HOT_TOPICS.map((topic) => (
          <View className='home-topic-card' key={topic.id} onClick={() => handleTopicClick(topic.title)}>
            <Text className={topic.badge === '热' ? 'home-topic-badge home-topic-badge--hot' : 'home-topic-badge home-topic-badge--new'}>{topic.badge}</Text>
            <View className='home-topic-content'>
              <Text className='home-topic-title' numberOfLines={1}>{topic.title}</Text>
              <Text className='home-topic-stats'>{topic.stats}</Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  )

  const renderEmpty = () => (
    <View className='home-empty'>
      <Text className='home-empty-title'>{loading ? '正在加载内容...' : '没有找到相关内容'}</Text>
      <Text className='home-empty-desc'>换个关键词试试，或发布你的需求</Text>
    </View>
  )

  const renderSkillExchange = () => (
    <>
      {renderHeroBanner()}
      {renderFilters()}
      {renderTodayRecommend()}
      <View className='home-card-list'>
        {!filteredSkillUsers.length ? renderEmpty() : filteredSkillUsers.slice(0, 6).map((user, index) => renderUserCard(user, index, 'skill'))}
      </View>
      {renderActivityCard(activities[0], true)}
      {renderHotTopics()}
    </>
  )

  const renderInterestPartners = () => (
    <>
      {renderHeroBanner()}
      {renderFilters()}
      <View className='home-card-list'>
        {!filteredPartners.length ? renderEmpty() : filteredPartners.slice(0, 6).map((user, index) => renderUserCard(user, index, 'partner'))}
      </View>
      {renderHotTopics()}
    </>
  )

  const renderActivities = () => (
    <>
      {renderHeroBanner()}
      {renderFilters()}
      <View className='home-card-list'>
        {!filteredActivities.length ? renderEmpty() : filteredActivities.slice(0, 6).map((activity) => renderActivityCard(activity))}
      </View>
      {renderHotTopics()}
    </>
  )

  return (
    <View className='home-page'>
      <ScrollView scrollY showScrollbar={false} className='home-scroll'>
        <View className='home-topbar'>
          <View className='home-brand'>
            <Text className='home-brand-main'>换乎</Text>
            <Text className='home-brand-sub'>ZJU版</Text>
          </View>
          <SearchBar
            className='home-search'
            value={searchQuery}
            placeholder='搜索技能、搭子、活动或帖子'
            onInput={setSearchQuery}
            onConfirm={setSearchQuery}
          />
        </View>

        <View className='home-tabs'>
          {TABS.map((tab, index) => (
            <View className={activeTab === index ? 'home-tab home-tab--active' : 'home-tab'} key={tab} onClick={() => setActiveTab(index)}>
              <Text>{tab}</Text>
              <View className='home-tab-line' />
            </View>
          ))}
        </View>

        {activeTab === 0 ? renderSkillExchange() : null}
        {activeTab === 1 ? renderInterestPartners() : null}
        {activeTab === 2 ? renderActivities() : null}
      </ScrollView>

      <FloatingPostButton className='home-floating-post' onClick={handlePublish} />
    </View>
  )
}
