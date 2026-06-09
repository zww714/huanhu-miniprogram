import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Taro, { useDidShow, useLoad } from '@tarojs/taro'
import { Image, Text, View } from '@tarojs/components'
import ErrorBoundary from '../../components/common/ErrorBoundary'
import FloatingPostButton from '../../components/common/FloatingPostButton'
import SearchBar from '../../components/common/SearchBar'
import { followUser, getPartners, getUsers, unfollowUser } from '../../api'
import { getActivities } from '../../api/activity'
import { getRelationForUser, openUnifiedUserProfile } from '../../utils/publicProfiles'
import { getGenderSymbol, getGenderTone } from '../../utils/gender'
import './index.scss'
import {
  TABS, SKILL_FILTERS, PARTNER_FILTERS, ACTIVITY_FILTERS,
  type SkillItem, type SkillUser, type Activity,
} from './utils/constants'
import {
  lower, getRecordId, firstChar, isRenderableImage,
  normalizeSkill, userSkills, userWants, userInterestLabels,
  getUserName, getUserCampus, getUserCollege, getUserIntro,
  userMatchesKeyword, activityMatchesKeyword,
  mergePendingSkill, mergePendingPartner, mergePendingActivity,
} from './utils/helpers'
import Skeleton from './components/Skeleton'
import HeroBanner from './components/HeroBanner'
import Filters from './components/Filters'
import Empty from './components/Empty'

const HERO_COPY = [
  {
    title: '和全校同学交换技能',
    desc: '分享你的特长，找到想学的知识',
    features: [
      ['真', '真实同学', '安全可信'],
      ['配', '双向匹配', '高效学习'],
      ['学', '互助互学', '共同成长'],
    ],
  },
  {
    title: '找到同频搭子',
    desc: '一起运动、学习、拍照或参加活动',
    features: [
      ['趣', '兴趣同频', '轻松组队'],
      ['约', '校园搭子', '随时同行'],
      ['伴', '结伴参与', '更有动力'],
    ],
  },
  {
    title: '发现校园活动',
    desc: '报名讲座、比赛、社团活动和经验分享',
    features: [
      ['活', '校内活动', '快速报名'],
      ['真', '真实同学', '安全参与'],
      ['伴', '兴趣匹配', '结伴同行'],
    ],
  },
]

export default function Index() {
  const [activeTab, setActiveTab] = useState(0)
  const [activeFilter, setActiveFilter] = useState(0)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterDropdownOpen, setFilterDropdownOpen] = useState(false)
  const [expandedTags, setExpandedTags] = useState<Record<string, boolean>>({})
  const [followedUsers, setFollowedUsers] = useState<Record<string, boolean>>({})
  const [skillUsers, setSkillUsers] = useState<SkillUser[]>([])
  const [partners, setPartners] = useState<SkillUser[]>([])
  const [activities, setActivities] = useState<Activity[]>([])
  const [loading, setLoading] = useState(true)
  const isFirstShow = useRef(true)

  const loadHomeData = useCallback(async () => {
    setLoading(true)
    try {
      const [usersData, partnersData, activitiesData] = await Promise.all([
        getUsers({ page: 0 }),
        getPartners(),
        getActivities({ page: 0 }),
      ])
      setSkillUsers(mergePendingSkill(usersData || []))
      setPartners(mergePendingPartner(partnersData || []))
      setActivities(mergePendingActivity(activitiesData || []))
    } catch (e) {
      console.warn('[Home] loadHomeData failed:', e)
    } finally {
      setLoading(false)
    }
  }, [])

  useLoad((options) => {
    const tab = Number(options?.tab)
    if ([0, 1, 2].includes(tab)) setActiveTab(tab)
  })

  useEffect(() => {
    loadHomeData()
  }, [loadHomeData])

  useDidShow(() => {
    if (isFirstShow.current) {
      isFirstShow.current = false
      return
    }
    loadHomeData()
  })

  useEffect(() => {
    setActiveFilter(0)
  }, [activeTab])

  const keyword = lower(searchQuery)
  const filters = activeTab === 0 ? SKILL_FILTERS : activeTab === 1 ? PARTNER_FILTERS : ACTIVITY_FILTERS
  const activeFilterLabel = filters[activeFilter] || '全部'
  const heroCopy = HERO_COPY[activeTab]

  const filteredSkillUsers = useMemo(() => skillUsers.filter((user) => {
    const categoryMatch = activeFilterLabel === '全部' || activeFilterLabel === '热门'
      ? true
      : userSkills(user).some((skill) => skill.name.includes(activeFilterLabel)) || userWants(user).some((item) => item.includes(activeFilterLabel))
    return categoryMatch && userMatchesKeyword(user, keyword)
  }), [activeFilterLabel, keyword, skillUsers])

  const filteredPartners = useMemo(() => partners.filter((user) => {
    const labels = [...userInterestLabels(user), user.lookingFor].filter(Boolean).map(String)
    const categoryMatch = activeFilterLabel === '全部' ? true : labels.some((label) => label.includes(activeFilterLabel))
    return categoryMatch && userMatchesKeyword(user, keyword)
  }), [activeFilterLabel, keyword, partners])

  const filteredActivities = useMemo(() => activities.filter((activity) => {
    const categoryMatch = activeFilterLabel === '全部' || activeFilterLabel === '热门'
      ? true
      : activity.category === activeFilterLabel || activity.tags?.some((tag) => tag.includes(activeFilterLabel))
    return categoryMatch && activityMatchesKeyword(activity, keyword)
  }), [activeFilterLabel, activities, keyword])

  const openSearchPanel = useCallback(() => {
    Taro.navigateTo({ url: `/sp-common/pages/search-results/index?keyword=${encodeURIComponent(searchQuery)}&tab=${activeTab}` })
  }, [searchQuery, activeTab])

  const openChat = useCallback((user: { id?: string | number; _id?: string; name?: string }, category = '首页推荐') => {
    const id = getRecordId(user)
    if (!id) {
      Taro.showToast({ title: '用户信息不存在', icon: 'none' })
      return
    }
    Taro.navigateTo({
      url: `/sp-social/pages/chat/index?userId=${encodeURIComponent(id)}&id=${encodeURIComponent(id)}&name=${encodeURIComponent(user.name || '同学')}&category=${encodeURIComponent(category)}`,
    })
  }, [])

  const handlePublish = useCallback(() => {
    const mode = activeTab === 1 ? 'partner' : activeTab === 2 ? 'activity' : 'skill'
    Taro.navigateTo({ url: `/sp-content/pages/publish/index?mode=${mode}` })
  }, [activeTab])

  const handleUserClick = useCallback((user: SkillUser) => {
    openUnifiedUserProfile(getRecordId(user), getUserName(user))
  }, [])

  const handleActivityRegister = useCallback((activity: Activity, isFull: boolean) => {
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
    Taro.navigateTo({ url: `/sp-content/pages/activity-register/index?${query}` })
  }, [])

  const toggleTagGroup = useCallback((key: string) => {
    setExpandedTags((current) => ({ ...current, [key]: !current[key] }))
  }, [])

  const toggleFollow = useCallback(async (user: SkillUser) => {
    const id = getRecordId(user)
    if (!id) return
    const wasFollowed = !!followedUsers[id] || getRelationForUser(id).isFollowing
    setFollowedUsers((current) => ({ ...current, [id]: !wasFollowed }))
    try {
      if (wasFollowed) await unfollowUser({ targetUserId: id })
      else await followUser({ targetUserId: id })
      Taro.showToast({ title: wasFollowed ? '已取消关注' : '已关注', icon: 'success' })
    } catch (e) {
      setFollowedUsers((current) => ({ ...current, [id]: !wasFollowed }))
      Taro.showToast({ title: wasFollowed ? '已取消关注' : '已关注', icon: 'success' })
    }
  }, [followedUsers])

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
            const item = typeof tag === 'string' ? { name: tag } : normalizeSkill(tag as SkillItem)
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

  const renderUserCard = (user: SkillUser, index: number, mode: 'skill' | 'partner') => {
    const id = getRecordId(user)
    const skills = userSkills(user)
    const wants = userWants(user)
    const followed = !!followedUsers[id] || (!!id && getRelationForUser(id).isFollowing)
    const name = getUserName(user)
    const genderSymbol = getGenderSymbol(user as any)
    const genderTone = getGenderTone(user as any)
    return (
      <View className='home-user-card' key={`${mode}_${id || index}`}>
        <View className='home-user-card-main'>
          <View className='home-avatar-wrap' onClick={() => handleUserClick(user)}>
            {isRenderableImage(user.avatar) ? (
              <Image className='home-avatar-img' src={user.avatar} mode='aspectFill' lazyLoad />
            ) : (
              <Text className='home-avatar-text'>{firstChar(name)}</Text>
            )}
            {user.verified ? <Text className='home-avatar-check'>✓</Text> : null}
          </View>

          <View className='home-user-body'>
            <View className='home-user-title-row' onClick={() => handleUserClick(user)}>
              <Text className='home-user-name'>{name}</Text>
              {genderSymbol ? <Text className={`home-gender home-gender--${genderTone}`}>{genderSymbol}</Text> : null}
              {user.verified ? <Text className='home-verified'>✓</Text> : null}
            </View>
            <Text className='home-user-meta' numberOfLines={1}>{getUserCollege(user)} · {user.grade || '在读'}</Text>
            <Text className='home-user-intro' numberOfLines={2}>{getUserIntro(user)}</Text>
          </View>

          <View className='home-match-side'>
            <Text className={followed ? 'home-heart home-heart--active' : 'home-heart'} onClick={() => toggleFollow(user)}>
              {followed ? '✓' : '＋'}
            </Text>
          </View>
        </View>

        {mode === 'partner' ? (
          <View className='home-user-tags'>
            <Text className='home-tag-label home-tag-label--want'>想找</Text>
            <View className='home-tag-list'>
              <View className='home-skill-tag'>
                <Text>{user.lookingFor || userInterestLabels(user)[0] || '兴趣搭子'}</Text>
              </View>
            </View>
          </View>
        ) : (
          <>
            {renderTagGroup('我会', skills, `${mode}_${id}_can`, 'can')}
            {renderTagGroup('我想学', wants, `${mode}_${id}_want`, 'want')}
          </>
        )}

        <View className='home-user-footer'>
          <View className='home-user-foot-info'>
            <Text>⌖ {getUserCampus(user, index)}</Text>
            <Text>● {user.online === false ? '刚刚活跃' : '在线'}</Text>
          </View>
          <View className='home-contact-btn' onClick={() => openChat(user, mode === 'partner' ? '兴趣搭子' : '技能交换')}>
            <Text>联系TA</Text>
          </View>
        </View>
      </View>
    )
  }

  const renderActivityCard = (activity: Activity) => {
    const participants = activity.participantCount || activity.participants || 0
    const isFull = !!activity.maxParticipants && participants >= activity.maxParticipants
    return (
      <View className='home-activity-card' key={activity.id || activity._id || activity.title}>
        <View className='home-activity-cover'>
          {isRenderableImage(activity.cover) ? <Image className='home-activity-img' src={activity.cover} mode='aspectFill' lazyLoad /> : (
            <View className='home-activity-placeholder'>
              <Text>校园{'\n'}活动</Text>
            </View>
          )}
          <Text className='home-activity-cover-badge'>活动</Text>
        </View>
        <View className='home-activity-body' onClick={() => handleActivityRegister(activity, isFull)}>
          <View className='home-activity-title-row'>
            <Text className='home-activity-title' numberOfLines={2}>{activity.title}</Text>
            <Text className='home-activity-status'>{isFull ? '已满' : activity.status || '报名中'}</Text>
          </View>
          <Text className='home-activity-meta' numberOfLines={1}>● {activity.time}　⌖ {activity.location}</Text>
          <View className='home-activity-tags'>
            {(activity.tags || []).slice(0, 3).map((tag) => <Text key={tag}>{tag}</Text>)}
          </View>
          <View className='home-activity-footer'>
            <Text className='home-activity-count'>{participants} 人已报名</Text>
            <View className={isFull ? 'home-register-btn home-register-btn--disabled' : 'home-register-btn'} onClick={() => handleActivityRegister(activity, isFull)}>
              <Text>{isFull ? '已满' : '报名'}</Text>
            </View>
          </View>
        </View>
      </View>
    )
  }

  return (
    <ErrorBoundary>
      <View className='home-page'>
        <View className='home-scroll'>
          <View className='home-topbar'>
            <View className='home-brand'>
              <Text className='home-brand-main'>换乎</Text>
              <Text className='home-brand-sub'>ZJU版</Text>
            </View>
            <SearchBar
              className='home-search'
              value={searchQuery}
              placeholder='搜索昵称、技能、帖子或活动'
              readonly
              onClick={openSearchPanel}
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

          {loading ? (
            <Skeleton />
          ) : (
            <>
              <HeroBanner title={heroCopy.title} desc={heroCopy.desc} features={heroCopy.features} />
              <Filters
                filters={filters}
                activeFilter={activeFilter}
                filterDropdownOpen={filterDropdownOpen}
                onSelectFilter={(index) => { setActiveFilter(index); setFilterDropdownOpen(false) }}
                onToggleFilterDropdown={() => setFilterDropdownOpen((open) => !open)}
              />

              {activeTab === 0 ? (
                <View className='home-card-list'>
                  {!filteredSkillUsers.length ? <Empty /> : filteredSkillUsers.slice(0, 8).map((user, index) => renderUserCard(user, index, 'skill'))}
                </View>
              ) : null}

              {activeTab === 1 ? (
                <View className='home-card-list'>
                  {!filteredPartners.length ? <Empty /> : filteredPartners.slice(0, 8).map((user, index) => renderUserCard(user, index, 'partner'))}
                </View>
              ) : null}

              {activeTab === 2 ? (
                <View className='home-card-list home-activity-list'>
                  {!filteredActivities.length ? <Empty /> : filteredActivities.slice(0, 8).map(renderActivityCard)}
                </View>
              ) : null}
            </>
          )}
        </View>

        <FloatingPostButton className='home-floating-post' onClick={handlePublish} />
      </View>
    </ErrorBoundary>
  )
}
