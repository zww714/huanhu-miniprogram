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
import './index.scss'
import {
  TABS, SKILL_FILTERS, PARTNER_FILTERS, ACTIVITY_FILTERS,
  SEARCH_SUGGESTIONS, TODAY_RECOMMENDATIONS, HOT_TOPICS,
  type SkillItem, type SkillUser, type Activity,
} from './utils/constants'
import {
  textOf, lower, includesText, getRecordId, firstChar, isRenderableImage,
  normalizeSkill, userSkills, userWants, userInterestLabels,
  getUserName, getUserCampus, getUserCollege, getUserIntro,
  getMatchRate, getCompletedCount, getActivityCampus,
  userMatchesKeyword, activityMatchesKeyword,
  mergePendingSkill, mergePendingPartner, mergePendingActivity,
} from './utils/helpers'
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
  const visibleRecommendations = TODAY_RECOMMENDATIONS.filter((item) => (
    activeFilterLabel === '全部' || activeFilterLabel === '热门' || item.category === activeFilterLabel
  ))
  const heroCopy = [
    {
      title: '和全校同学交换技能',
      desc: '分享你的特长，找到想学的知识',
      features: [
        ['盾', '真实同学', '安全可信'],
        ['双', '双向匹配', '高效学习'],
        ['心', '互助互学', '共同成长'],
      ],
    },
    {
      title: '找到同频搭子',
      desc: '一起运动、学习、拍照、参加活动',
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
        ['盾', '真实同学', '安全参与'],
        ['伴', '兴趣匹配', '结伴同行'],
      ],
    },
  ][activeTab]

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

  const openChat = (user: { id?: string | number; _id?: string; name?: string }, category = '首页推荐') => {
    const id = getRecordId(user)
    if (!id) {
      Taro.showToast({ title: '用户信息不存在', icon: 'none' })
      return
    }
    Taro.navigateTo({
      url: `/sp-social/pages/chat/index?userId=${encodeURIComponent(id)}&id=${encodeURIComponent(id)}&name=${encodeURIComponent(user.name || '同学')}&category=${encodeURIComponent(category)}`,
    })
  }

  const handleStartChat = (user: SkillUser) => {
    openChat(user, activeTab === 1 ? '兴趣搭子' : '技能交换')
  }

  const openSearchPanel = () => {
    Taro.navigateTo({ url: `/sp-common/pages/search-results/index?keyword=${encodeURIComponent(searchQuery)}&tab=${activeTab}` })
  }

  const submitSearch = (value?: string) => {
    const text = (value ?? searchDraft).trim()
    if (!text) {
      Taro.showToast({ title: '请输入搜索词', icon: 'none' })
      return
    }
    const nextRecent = [text, ...recentSearches.filter((item) => item !== text)].slice(0, 6)
    setRecentSearches(nextRecent)
    Taro.setStorageSync('homeRecentSearches', nextRecent)
    setSearchQuery(text)
    setSearchPanelOpen(false)
    Taro.navigateTo({ url: `/sp-common/pages/search-results/index?keyword=${encodeURIComponent(text)}&tab=${activeTab}` })
  }

  const selectFilter = (index: number) => {
    setActiveFilter(index)
    setFilterDropdownOpen(false)
  }

  const handlePublish = () => {
    const mode = activeTab === 1 ? 'partner' : activeTab === 2 ? 'activity' : 'skill'
    Taro.navigateTo({ url: `/sp-content/pages/publish/index?mode=${mode}` })
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
    Taro.navigateTo({ url: `/sp-content/pages/activity-register/index?${query}` })
  }

  const handleRecommendationClick = (id: string) => {
    const item = TODAY_RECOMMENDATIONS.find((rec) => rec.id === id)
    if (item) setDetailPopup({ type: 'recommendation', ...item })
  }

  const handleTopicClick = (id: string) => {
    const topic = HOT_TOPICS.find((item) => item.id === id)
    if (topic) setDetailPopup({ type: 'topic', ...topic })
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
      <View className='home-hero-paper' />
      <View className='home-hero-art home-hero-art--one' />
      <View className='home-hero-art home-hero-art--two' />
      <View className='home-hero-content'>
        <Text className='home-hero-title'>{heroCopy.title}</Text>
        <Text className='home-hero-desc'>{heroCopy.desc}</Text>
      </View>
      <View className='home-hero-features'>
        {heroCopy.features.map((item) => (
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
    <View className='home-filter-wrap'>
      <View className='home-filter-row'>
        <ScrollView scrollX showScrollbar={false} className='home-filter-scroll'>
          <View className='home-filter-list'>
            {filters.map((item, index) => (
              <TagChip
                key={item}
                text={item}
                active={activeFilter === index}
                type={activeFilter === index ? 'primary' : item === '热门' ? 'warning' : 'default'}
                onClick={() => selectFilter(index)}
              />
            ))}
          </View>
        </ScrollView>
        <View className={filterDropdownOpen ? 'home-filter-more home-filter-more--open' : 'home-filter-more'} onClick={() => setFilterDropdownOpen((open) => !open)}>
          <Text>⌄</Text>
        </View>
      </View>
      {filterDropdownOpen ? (
        <View className='home-filter-dropdown'>
          {filters.map((item, index) => (
            <View
              key={`dropdown_${item}`}
              className={activeFilter === index ? 'home-filter-option home-filter-option--active' : 'home-filter-option'}
              onClick={() => selectFilter(index)}
            >
              <Text>{item}</Text>
            </View>
          ))}
        </View>
      ) : null}
    </View>
  )

  const renderTodayRecommend = () => (
    <View className='home-section home-recommend-section'>
      <View className='home-section-header'>
        <Text className='home-section-title'>今日推荐</Text>
        <Text className='home-section-more' onClick={() => setDetailPopup({ type: 'recommendation-list', title: '今日推荐', detail: '根据当前分类为你筛选的推荐内容。' })}>查看全部 〉</Text>
      </View>
      <View className='home-recommend-grid'>
        {(visibleRecommendations.length ? visibleRecommendations : TODAY_RECOMMENDATIONS).map((item) => (
          <View className={`home-recommend-card home-recommend-card--${item.tone}`} key={item.id} onClick={() => handleRecommendationClick(item.id)}>
            <View className='home-recommend-head'>
              <Text className='home-recommend-label' numberOfLines={1}>{item.label}</Text>
              {item.badge ? <Text className='home-recommend-badge'>{item.badge}</Text> : null}
            </View>
            <Text className='home-recommend-title' numberOfLines={1}>{item.title}</Text>
            <Text className='home-recommend-desc' numberOfLines={1}>{item.desc}</Text>
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
    const genderSymbol = getGenderSymbol(user as any)
    const genderTone = getGenderTone(user as any)
    return (
      <View className='home-user-card' key={`${mode}_${id || index}`}>
        <View className='home-user-card-main'>
          <View className='home-avatar-wrap' onClick={() => handleUserClick(user)}>
            {isRenderableImage(user.avatar) ? (
              <Image className='home-avatar-img' src={user.avatar} mode='aspectFill' />
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
          {isRenderableImage(item.cover) ? <Image className='home-activity-img' src={item.cover} mode='aspectFill' /> : (
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
      <View className='home-card-list home-activity-list'>
        {!filteredActivities.length ? renderEmpty() : filteredActivities.slice(0, 6).map((activity) => renderActivityCard(activity))}
      </View>
      {renderHotTopics()}
    </>
  )

  const renderSearchPanel = () => {
    const words = recentSearches.length ? recentSearches : SEARCH_SUGGESTIONS
    return searchPanelOpen ? (
      <View className='home-modal-mask' onClick={() => setSearchPanelOpen(false)}>
        <View className='home-search-panel' onClick={(event) => event.stopPropagation()}>
          <View className='home-search-panel-head'>
            <Text className='home-search-panel-title'>搜索</Text>
            <Text className='home-search-panel-close' onClick={() => setSearchPanelOpen(false)}>关闭</Text>
          </View>
          <SearchBar
            className='home-search-panel-input'
            value={searchDraft}
            placeholder='输入技能、搭子、活动或帖子'
            onInput={setSearchDraft}
            onConfirm={submitSearch}
          />
          <View className='home-search-suggest-head'>
            <Text>{recentSearches.length ? '最近搜索' : '推荐搜索'}</Text>
          </View>
          <View className='home-search-suggest-list'>
            {words.map((word) => (
              <View className='home-search-suggest-item' key={word} onClick={() => submitSearch(word)}>
                <Text>{word}</Text>
              </View>
            ))}
          </View>
        </View>
      </View>
    ) : null
  }

  const renderDetailPopup = () => {
    if (!detailPopup) return null
    const user = detailPopup.user
    const list = detailPopup.type === 'recommendation-list' ? TODAY_RECOMMENDATIONS : detailPopup.type === 'topic-list' ? HOT_TOPICS : []
    return (
      <View className='home-modal-mask' onClick={() => setDetailPopup(null)}>
        <View className='home-detail-panel' onClick={(event) => event.stopPropagation()}>
          <View className='home-detail-head'>
            <Text className='home-detail-title'>{detailPopup.title}</Text>
            <Text className='home-detail-close' onClick={() => setDetailPopup(null)}>×</Text>
          </View>
          <Text className='home-detail-desc'>{detailPopup.detail}</Text>
          {user ? (
            <View className='home-detail-user' onClick={() => openChat(user, detailPopup.type === 'topic' ? '校园热议' : '今日推荐')}>
              <View className='home-detail-avatar'>
                {isRenderableImage(user.avatar) ? <Image className='home-detail-avatar-img' src={user.avatar} mode='aspectFill' /> : <Text>{firstChar(user.name)}</Text>}
              </View>
              <View className='home-detail-user-main'>
                <View className='home-detail-name-row'>
                  <Text className='home-detail-user-name'>{user.name}</Text>
                  {getGenderSymbol(user as any) ? <Text className={`home-gender home-gender--${getGenderTone(user as any)}`}>{getGenderSymbol(user as any)}</Text> : null}
                </View>
                <Text className='home-detail-user-meta'>{user.college} · {user.grade}</Text>
              </View>
              <Text className='home-detail-chat'>聊天</Text>
            </View>
          ) : null}
          {list.length ? (
            <View className='home-detail-list'>
              {list.map((item) => (
                <View className='home-detail-list-item' key={item.id} onClick={() => setDetailPopup({ type: detailPopup.type === 'topic-list' ? 'topic' : 'recommendation', ...item })}>
                  <Text className='home-detail-list-title'>{item.title}</Text>
                  <Text className='home-detail-list-meta'>{'stats' in item ? item.stats : item.desc}</Text>
                </View>
              ))}
            </View>
          ) : null}
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
            placeholder='搜索技能、搭子、活动或帖子'
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

        {activeTab === 0 ? renderSkillExchange() : null}
        {activeTab === 1 ? renderInterestPartners() : null}
        {activeTab === 2 ? renderActivities() : null}
      </View>

      <FloatingPostButton className='home-floating-post' onClick={handlePublish} />
      {renderDetailPopup()}
    </View>
    </ErrorBoundary>
  )
}
