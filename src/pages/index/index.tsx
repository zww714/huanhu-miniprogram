/**
 * 首页 — 技能交换/兴趣搭子/社区活动
 */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Taro, { useDidShow, useLoad } from '@tarojs/taro'
import { Image, ScrollView, Text, View } from '@tarojs/components'
import ErrorBoundary from '../../components/common/ErrorBoundary'
import FloatingPostButton from '../../components/common/FloatingPostButton'
import SearchBar from '../../components/common/SearchBar'
import TagChip from '../../components/common/TagChip'
import { getActivities, getPartners, getUsers } from '../../api'
import { openUnifiedUserProfile } from '../../utils/publicProfiles'
import { getGenderSymbol, getGenderTone } from '../../utils/gender'
import SearchPanel from './components/SearchPanel'
import DetailPopup from './components/DetailPopup'
import {
  TABS, SKILL_FILTERS, PARTNER_FILTERS, ACTIVITY_FILTERS,
  TODAY_RECOMMENDATIONS, HOT_TOPICS,
  type SkillUser, type Activity,
  lower, firstChar, isRenderableImage,
  normalizeSkill, userSkills, userWants,
  userInterestLabels, getUserName, getUserCampus,
  getUserCollege, getUserIntro, getMatchRate,
  getCompletedCount, userMatchesKeyword, activityMatchesKeyword,
  mergePendingSkill, mergePendingPartner, mergePendingActivity,
} from './home-utils'

import './index.scss'

export default function Index() {
  const [activeTab, setActiveTab] = useState(0)
  const [activeFilter, setActiveFilter] = useState(0)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchDraft, setSearchDraft] = useState('')
  const [searchPanelOpen, setSearchPanelOpen] = useState(false)
  const [recentSearches, setRecentSearches] = useState<string[]>([])
  const [filterDropdownOpen, setFilterDropdownOpen] = useState(false)
  const [detailPopup, setDetailPopup] = useState<any>(null)
  const [expandedTags, setExpandedTags] = useState<Record<string, boolean>>({})
  const [favoritedUsers, setFavoritedUsers] = useState<Record<string, boolean>>({})
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
    } finally {
      setLoading(false)
    }
  }, [])

  useLoad((options) => {
    const tab = Number(options?.tab)
    if ([0, 1, 2].includes(tab)) setActiveTab(tab)
    const stored = Taro.getStorageSync('homeRecentSearches')
    if (Array.isArray(stored)) setRecentSearches(stored.slice(0, 6))
  })

  useEffect(() => { loadHomeData() }, [loadHomeData])

  useDidShow(() => {
    if (isFirstShow.current) { isFirstShow.current = false; return }
    loadHomeData()
  })

  useEffect(() => { setActiveFilter(0) }, [activeTab])

  const keyword = lower(searchQuery)
  const filters = activeTab === 0 ? SKILL_FILTERS : activeTab === 1 ? PARTNER_FILTERS : ACTIVITY_FILTERS
  const activeFilterLabel = filters[activeFilter] || '全部'
  const visibleRecommendations = TODAY_RECOMMENDATIONS.filter((item) => (
    activeFilterLabel === '全部' || activeFilterLabel === '热门' || item.category === activeFilterLabel
  ))

  const heroCopy = [
    { title: '和全校同学交换技能', desc: '分享你的特长，找到想学的知识', features: [['盾', '真实同学', '安全可信'], ['双', '双向匹配', '高效学习'], ['心', '互助互学', '共同成长']] },
    { title: '找到同频搭子', desc: '一起运动、学习、拍照、参加活动', features: [['趣', '兴趣同频', '轻松组队'], ['约', '校园搭子', '随时同行'], ['伴', '结伴参与', '更有动力']] },
    { title: '发现校园活动', desc: '报名讲座、比赛、社团活动和经验分享', features: [['活', '校内活动', '快速报名'], ['盾', '真实同学', '安全参与'], ['伴', '兴趣匹配', '结伴同行']] },
  ][activeTab]

  const filteredSkillUsers = useMemo(() => skillUsers.filter((user) => {
    const categoryMatch = activeFilterLabel === '全部' || activeFilterLabel === '热门'
      ? true : userSkills(user).some((s) => s.name.includes(activeFilterLabel)) || userWants(user).some((w) => w.includes(activeFilterLabel))
    return categoryMatch && userMatchesKeyword(user, keyword)
  }), [activeFilterLabel, keyword, skillUsers])

  const filteredPartners = useMemo(() => partners.filter((user) => {
    const labels = [...userInterestLabels(user), ...userWants(user), user.lookingFor].filter(Boolean).map(String)
    const categoryMatch = activeFilterLabel === '全部' ? true : labels.some((l) => l.includes(activeFilterLabel))
    return categoryMatch && userMatchesKeyword(user, keyword)
  }), [activeFilterLabel, keyword, partners])

  const filteredActivities = useMemo(() => activities.filter((a) => {
    const categoryMatch = activeFilterLabel === '全部' || activeFilterLabel === '热门'
      ? true : a.category === activeFilterLabel || a.tags?.some((t) => t.includes(activeFilterLabel))
    return categoryMatch && activityMatchesKeyword(a, keyword)
  }), [activeFilterLabel, activities, keyword])

  const openChat = (user: { id?: string | number; _id?: string; name?: string }, category = '首页推荐') => {
    const id = user?.id ?? user?._id ?? user?.name ?? ''
    if (!id) { Taro.showToast({ title: '用户信息不存在', icon: 'none' }); return }
    Taro.navigateTo({
      url: `/sp-social/pages/chat/index?userId=${encodeURIComponent(id)}&id=${encodeURIComponent(id)}&name=${encodeURIComponent(user?.name || '同学')}&category=${encodeURIComponent(category)}`,
    })
  }

  const handleStartChat = (user: SkillUser) => openChat(user, activeTab === 1 ? '兴趣搭子' : '技能交换')

  const submitSearch = (value?: string) => {
    const text = (value ?? searchDraft).trim()
    if (!text) { Taro.showToast({ title: '请输入搜索词', icon: 'none' }); return }
    const nextRecent = [text, ...recentSearches.filter((item) => item !== text)].slice(0, 6)
    setRecentSearches(nextRecent)
    Taro.setStorageSync('homeRecentSearches', nextRecent)
    setSearchQuery(text)
    setSearchPanelOpen(false)
    Taro.navigateTo({ url: `/sp-common/pages/search-results/index?keyword=${encodeURIComponent(text)}&tab=${activeTab}` })
  }

  const handlePublish = () => {
    const mode = activeTab === 1 ? 'partner' : activeTab === 2 ? 'activity' : 'skill'
    Taro.navigateTo({ url: `/sp-content/pages/publish/index?mode=${mode}` })
  }

  const handleUserClick = (user: SkillUser) => openUnifiedUserProfile(user?.id ?? user?._id ?? '', getUserName(user))

  const handleActivityRegister = (activity: Activity, isFull: boolean) => {
    if (isFull) { Taro.showToast({ title: '活动已满', icon: 'none' }); return }
    const q = `id=${encodeURIComponent(activity.id || activity._id || activity.title || '')}&title=${encodeURIComponent(activity.title || '')}&organizer=${encodeURIComponent(activity.organizer || '')}&time=${encodeURIComponent(activity.time || '')}&location=${encodeURIComponent(activity.location || '')}&participants=${encodeURIComponent(String(activity.participants || activity.participantCount || 0))}&maxParticipants=${encodeURIComponent(String(activity.maxParticipants || ''))}`
    Taro.navigateTo({ url: `/sp-content/pages/activity-register/index?${q}` })
  }

  const handleRecommendationClick = (id: string) => {
    const item = TODAY_RECOMMENDATIONS.find((r) => r.id === id)
    if (item) setDetailPopup({ type: 'recommendation', ...item })
  }

  const handleTopicClick = (id: string) => {
    const topic = HOT_TOPICS.find((t) => t.id === id)
    if (topic) setDetailPopup({ type: 'topic', ...topic })
  }

  // ===== Render Helpers =====

  const renderHeroBanner = () => (
    <View className='home-hero'>
      <View className='home-hero-paper' />
      <View className='home-hero-art home-hero-art--one' />
      <View className='home-hero-art home-hero-art--two' />
      <View className='home-hero-content'>
        <Text className='home-hero-title'>{heroCopy.title}</Text>
        <Text className='home-hero-desc'>{heroCopy.desc}</Text>
        <View className='home-hero-features'>
          {heroCopy.features.map(([icon, label, tip], i) => (
            <View className='home-hero-feature' key={i}>
              <View className='home-hero-icon'><Text>{icon}</Text></View>
              <View className='home-hero-feature-text'>
                <Text className='home-hero-feature-label'>{label}</Text>
                <Text className='home-hero-feature-tip'>{tip}</Text>
              </View>
            </View>
          ))}
        </View>
      </View>
    </View>
  )

  const renderFilters = () => (
    <View className='home-filter-wrap'>
      <View className='home-filter-row'>
        {filters.slice(0, 4).map((label, i) => (
          <View className={activeFilter === i ? 'home-filter home-filter--active' : 'home-filter'} key={label} onClick={() => { setActiveFilter(i); setFilterDropdownOpen(false) }}>
            <Text>{label}</Text>
          </View>
        ))}
        <View className={filterDropdownOpen ? 'home-filter-more home-filter-more--open' : 'home-filter-more'} onClick={() => setFilterDropdownOpen((o) => !o)}>
          <Text>更多</Text>
        </View>
      </View>
      {filterDropdownOpen ? (
        <View className='home-filter-dropdown'>
          {filters.slice(4).map((label, i) => (
            <View className={activeFilter === i + 4 ? 'home-filter-dropdown-item home-filter-dropdown-item--active' : 'home-filter-dropdown-item'} key={label} onClick={() => { setActiveFilter(i + 4); setFilterDropdownOpen(false) }}>
              <Text>{label}</Text>
              {activeFilter === i + 4 ? <Text className='home-filter-check'>✓</Text> : null}
            </View>
          ))}
        </View>
      ) : null}
    </View>
  )

  const renderTodayRecommend = () => {
    if (activeTab !== 0 || !visibleRecommendations.length) return null
    return (
      <>
        <View className='home-section-header'>
          <Text className='home-section-title'>今日推荐</Text>
          <Text className='home-section-more' onClick={() => setDetailPopup({ type: 'recommendation-list', title: '今日推荐', detail: '根据你的技能偏好和最近活跃情况推荐同学。' })}>更多 〉</Text>
        </View>
        <View className='home-recommend-grid'>
          {visibleRecommendations.map((item) => (
            <View className={`home-recommend-card home-recommend-card--${item.tone}`} key={item.id} onClick={() => handleRecommendationClick(item.id)}>
              <Text className='home-recommend-label'>{item.label}</Text>
              <Text className='home-recommend-title'>{item.title}</Text>
              <Text className='home-recommend-desc'>{item.desc}</Text>
              {item.badge ? <Text className='home-recommend-badge'>{item.badge}</Text> : null}
            </View>
          ))}
        </View>
      </>
    )
  }

  const renderTagGroup = (title: string, tags: Array<{ name: string; level?: number }> | string[], groupKey: string, tone: 'can' | 'want') => {
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
          {!expanded && rest > 0 ? (
            <View className='home-skill-tag home-skill-tag--more' onClick={() => toggleTagGroup(groupKey)}>
              <Text>+{rest}</Text>
            </View>
          ) : null}
          {expanded && tags.length > 3 ? (
            <View className='home-skill-tag home-skill-tag--more' onClick={() => toggleTagGroup(groupKey)}>
              <Text>收起</Text>
            </View>
          ) : null}
        </View>
      </View>
    )
  }

  const toggleTagGroup = (key: string) => {
    setExpandedTags((c) => ({ ...c, [key]: !c[key] }))
  }

  const renderUserCard = (user: SkillUser, index: number, mode: string) => {
    const id = String(user.id ?? user._id ?? index)
    const name = getUserName(user)
    const skills = userSkills(user)
    const wants = userWants(user)
    const matchRate = getMatchRate(user, index)
    const favorited = !!favoritedUsers[id]
    const genderSymbol = getGenderSymbol(user as any)
    const genderTone = getGenderTone(user as any)
    return (
      <View className='home-user-card' key={`${mode}_${id || index}`}>
        <View className='home-user-card-main'>
          <View className='home-avatar-wrap' onClick={() => handleUserClick(user)}>
            {isRenderableImage(user.avatar)
              ? <Image className='home-avatar-img' src={user.avatar} mode='aspectFill' />
              : <Text className='home-avatar-text'>{firstChar(name)}</Text>
            }
            {user.verified ? <Text className='home-avatar-check'>✓</Text> : null}
          </View>
          <View className='home-user-body'>
            <View className='home-user-title-row' onClick={() => handleUserClick(user)}>
              <Text className='home-user-name'>{name}</Text>
              {genderSymbol ? <Text className={`home-gender home-gender--${genderTone}`}>{genderSymbol}</Text> : null}
              {user.verified ? <Text className='home-verified'>✓</Text> : null}
              <Text className={index === 0 ? 'home-status-tag home-status-tag--match' : 'home-status-tag home-status-tag--hot'}>{index === 0 ? '高匹配' : '热门'}</Text>
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
            <Text className={favorited ? 'home-heart home-heart--active' : 'home-heart'} onClick={() => setFavoritedUsers((c) => ({ ...c, [id]: !c[id] }))}>{favorited ? '♥' : '♡'}</Text>
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
          <View className='home-contact-btn' onClick={() => handleStartChat(user)}><Text>联系TA</Text></View>
        </View>
      </View>
    )
  }

  const renderActivityCard = (activity?: Activity, compact = false) => {
    const fallback: Activity = {
      id: 'ai-workshop', title: 'AI科研工作坊：从论文到项目实战',
      time: '05.25 周六 14:00-17:00', location: '紫金港校区 西区教一 202',
      category: '活动', tags: ['实战分享', '工具体验', '小组讨论'], participantCount: 326, status: '进行中',
    }
    const item = activity || fallback
    const participants = item.participantCount || item.participants || 326
    const isFull = !!item.maxParticipants && participants >= item.maxParticipants
    return (
      <View className={compact ? 'home-activity-card home-activity-card--compact' : 'home-activity-card'} key={item.id || item._id || item.title}>
        <View className='home-activity-cover'>
          {isRenderableImage(item.cover)
            ? <Image className='home-activity-img' src={item.cover} mode='aspectFill' />
            : <View className='home-activity-placeholder'><Text>AI科研{'\n'}工作坊</Text></View>
          }
          <Text className='home-activity-cover-badge'>活动</Text>
        </View>
        <View className='home-activity-body' onClick={() => handleActivityRegister(item, isFull)}>
          <View className='home-activity-title-row'>
            <Text className='home-activity-title' numberOfLines={2}>{item.title || fallback.title}</Text>
            <Text className='home-activity-status'>{isFull ? '已满' : item.status || '进行中'}</Text>
          </View>
          <Text className='home-activity-meta' numberOfLines={1}>◷ {item.time || fallback.time}　⌖ {item.location || fallback.location}</Text>
          <View className='home-activity-tags'>{(item.tags || fallback.tags || []).slice(0, 3).map((tag) => <Text key={tag}>{tag}</Text>)}</View>
          <View className='home-activity-footer'>
            <Text className='home-activity-count'>{participants} 人已报名</Text>
            <View className={isFull ? 'home-register-btn home-register-btn--disabled' : 'home-register-btn'} onClick={() => handleActivityRegister(item, isFull)}><Text>{isFull ? '已满' : '报名'}</Text></View>
          </View>
        </View>
      </View>
    )
  }

  const renderHotTopics = () => (
    <View className='home-section home-topic-section'>
      <View className='home-section-header'>
        <Text className='home-section-title'>本周校园热议</Text>
        <Text className='home-section-more' onClick={() => setDetailPopup({ type: 'topic-list', title: '本周校园热议', detail: '这里展示本周在校园内讨论热度较高的话题。' })}>更多 〉</Text>
      </View>
      <View className='home-topic-grid'>
        {HOT_TOPICS.map((topic) => (
          <View className='home-topic-card' key={topic.id} onClick={() => handleTopicClick(topic.id)}>
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

  const renderTabs = () => (
    <>
      {renderHeroBanner()}
      {renderFilters()}
      {activeTab === 0 ? (() => {
        if (activeTab === 0) {
          return (<>
            {renderTodayRecommend()}
            <View className='home-card-list'>
              {!filteredSkillUsers.length ? renderEmpty() : filteredSkillUsers.slice(0, 6).map((user, i) => renderUserCard(user, i, 'skill'))}
            </View>
            {renderActivityCard(activities[0], true)}
            {renderHotTopics()}
          </>)
        }
        return null
      })() : null}
      {activeTab === 1 ? (<>
        {renderTodayRecommend()}
        <View className='home-card-list'>
          {!filteredPartners.length ? renderEmpty() : filteredPartners.slice(0, 6).map((user, i) => renderUserCard(user, i, 'partner'))}
        </View>
        {renderHotTopics()}
      </>) : null}
      {activeTab === 2 ? (<>
        <View className='home-card-list home-activity-list'>
          {!filteredActivities.length ? renderEmpty() : filteredActivities.slice(0, 6).map((activity) => renderActivityCard(activity))}
        </View>
        {renderHotTopics()}
      </>) : null}
    </>
  )

  return (
    <ErrorBoundary>
      <View className='home-page'>
        <View className='home-scroll'>
          <View className='home-topbar'>
            <View className='home-brand'>
              <Text className='home-brand-main'>换乎</Text>
              <Text className='home-brand-sub'>ZJU版</Text>
            </View>
            <SearchBar className='home-search' value={searchQuery} placeholder='搜索技能、搭子、活动或帖子' readonly onClick={() => setSearchPanelOpen(true)} />
          </View>
          <View className='home-tabs'>
            {TABS.map((tab, i) => (
              <View className={activeTab === i ? 'home-tab home-tab--active' : 'home-tab'} key={tab} onClick={() => setActiveTab(i)}>
                <Text>{tab}</Text>
                <View className='home-tab-line' />
              </View>
            ))}
          </View>
          {renderTabs()}
        </View>
        <FloatingPostButton className='home-floating-post' onClick={handlePublish} />
        <SearchPanel
          open={searchPanelOpen}
          searchDraft={searchDraft}
          recentSearches={recentSearches}
          onClose={() => setSearchPanelOpen(false)}
          onDraftChange={setSearchDraft}
          onSubmit={submitSearch}
        />
        <DetailPopup
          popup={detailPopup}
          recommendations={TODAY_RECOMMENDATIONS}
          hotTopics={HOT_TOPICS}
          onClose={() => setDetailPopup(null)}
          onChatOpen={(user, cat) => openChat(user, cat)}
          onItemClick={(item, type) => setDetailPopup({ type: type.includes('topic') ? 'topic' : 'recommendation', ...item })}
        />
      </View>
    </ErrorBoundary>
  )
}
