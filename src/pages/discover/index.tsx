import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Taro, { useDidShow, useLoad } from '@tarojs/taro'
import { Image, ScrollView, Text, View } from '@tarojs/components'
import ErrorBoundary from '../../components/common/ErrorBoundary'
import FloatingPostButton from '../../components/common/FloatingPostButton'
import SearchBar from '../../components/common/SearchBar'
import {
  getPosts,
  toggleFavorite as apiToggleFavorite,
} from '../../api'
import { getActivities } from '../../api/activity'
import { getActivityStats, getPostStats } from '../../api/stats'
import { type Activity } from '../../utils/mock'
import { openUnifiedUserProfile } from '../../utils/publicProfiles'
import { getGenderSymbol, getGenderTone } from '../../utils/gender'
import './index.scss'

const CATEGORIES = ['推荐', '科研', '升学', '兴趣', '活动', '兼职']

const CATEGORY_ICONS: Record<string, string> = {
  科研: '研',
  升学: '升',
  兴趣: '趣',
  工作: '职',
  兼职: '职',
  活动: '活',
}

type Post = {
  id?: string
  _id?: string
  title: string
  excerpt?: string
  summary?: string
  content?: string
  cover?: string
  images?: string[]
  category?: string
  categoryTag?: string
  mainCategory?: string
  tags?: string[]
  authorId?: string
  userId?: string
  authorName?: string
  author?: {
    id?: string
    userId?: string
    name: string
    avatar?: string
    gender?: string
    college?: string
    major?: string
    grade?: string
    campus?: string
    bio?: string
  }
  likeCount?: number
  commentCount?: number
  favoriteCount?: number
  collectCount?: number
  likes?: number
  comments?: number
  createdAt?: string
}

type AuthorProfile = {
  id: string
  name: string
  avatar?: string
  gender?: string
  college: string
  major: string
  grade: string
  campus: string
  intro: string
  skills: string[]
  interests: string[]
}

type FeedItem = {
  id: string
  type: 'post' | 'activity' | 'help' | 'partner'
  title: string
  desc: string
  coverImage?: string
  tags: string[]
  category: string
  statusLabel: string
  statusType: 'primary' | 'success' | 'warning' | 'danger' | 'purple'
  authorName: string
  authorAvatar?: string
  authorGender?: string
  authorMeta: string
  authorId?: string
  likeCount: number
  commentCount: number
  favoriteCount: number
  participantCount?: number
  location?: string
  timeText?: string
  contactable?: boolean
  source: Post | Activity
}

const AUTHOR_PROFILES: Record<string, AuthorProfile> = {
  '10086': {
    id: '10086',
    name: '张三',
    college: '计算机学院',
    major: '计算机科学',
    grade: '研一',
    campus: '紫金港',
    intro: '擅长 Python 和数据分析，喜欢分享科研效率工具。',
    skills: ['Python', '数据分析', 'AI工具'],
    interests: ['科研', '编程', 'AI'],
  },
  u_photo: {
    id: 'u_photo',
    name: '光影捕手',
    college: '艺术学院',
    major: '视觉传达',
    grade: '大二',
    campus: '紫金港',
    intro: '摄影爱好者，喜欢校园扫街和后期修图。',
    skills: ['摄影', '修图'],
    interests: ['摄影', '设计', '校园活动'],
  },
  u_math: {
    id: 'u_math',
    name: '上岸锦鲤',
    college: '数学学院',
    major: '数学',
    grade: '研一',
    campus: '玉泉',
    intro: '分享考研数学和升学经验。',
    skills: ['数学', '升学规划'],
    interests: ['升学', '学习'],
  },
  u_career: {
    id: 'u_career',
    name: '实习记录员',
    college: '软件学院',
    major: '软件工程',
    grade: '大三',
    campus: '紫金港',
    intro: '关注实习、简历和面试复盘。',
    skills: ['简历优化', '面试复盘'],
    interests: ['工作', '求职'],
  },
  u_offer: {
    id: 'u_offer',
    name: '上岸笔记',
    college: '竺可桢学院',
    major: '交叉创新',
    grade: '大四',
    campus: '紫金港',
    intro: '记录保研、申请和材料准备经验。',
    skills: ['升学申请', '材料整理'],
    interests: ['升学', '经验分享'],
  },
  u_boardgame: {
    id: 'u_boardgame',
    name: '桌游召集人',
    college: '管理学院',
    major: '工商管理',
    grade: '研二',
    campus: '紫金港',
    intro: '周末组织轻松桌游局。',
    skills: ['活动组织'],
    interests: ['桌游', '兴趣搭子'],
  },
  u_frontend: {
    id: 'u_frontend',
    name: '前端小结',
    college: '计算机学院',
    major: '计算机科学',
    grade: '大三',
    campus: '玉泉',
    intro: '整理前端学习和面试笔记。',
    skills: ['前端', 'JavaScript'],
    interests: ['工作', '编程'],
  },
}

function getPostId(post: Post) {
  return String(post.id || post._id || post.title)
}

function getPostCategory(post: Post) {
  return post.mainCategory || post.category || post.categoryTag?.split('·')[0] || '兴趣'
}

function normalizeCategory(category: string) {
  if (category === '工作') return '兼职'
  return category
}

function getAuthorId(post: Post) {
  return String(post.authorId || post.userId || post.author?.userId || post.author?.id || '')
}

function getAuthor(post: Post): AuthorProfile {
  const id = getAuthorId(post)
  const profile = AUTHOR_PROFILES[id]
  if (profile) return profile
  return {
    id: id || post.author?.name || 'unknown-user',
    name: post.authorName || post.author?.name || '同学',
    avatar: post.author?.avatar,
    gender: post.author?.gender,
    college: post.author?.college || '浙江大学',
    major: post.author?.major || '在读',
    grade: post.author?.grade || '在读',
    campus: post.author?.campus || '校内',
    intro: post.author?.bio || '正在换乎分享内容。',
    skills: [],
    interests: post.tags || [],
  }
}

function isImageCover(cover?: string) {
  return !!cover && !cover.startsWith('linear-gradient') && !cover.includes('/assets/avatar.png')
}

function isRenderableImage(src?: string) {
  return !!src && !src.startsWith('linear-gradient') && !src.includes('/assets/avatar.png')
}

function firstChar(name: string) {
  return (name || '同').trim().charAt(0) || '同'
}

function getAvatarBg(name: string) {
  const colors = ['#2563EB', '#7C3AED', '#DB2777', '#EA580C', '#059669', '#0891B2']
  let hash = 0
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash)
  return colors[Math.abs(hash) % colors.length]
}

function includesText(value: unknown, keyword: string) {
  return String(value || '').toLowerCase().includes(keyword)
}

function textIncludesAny(values: unknown[], keyword: string) {
  return values.some((value) => includesText(value, keyword))
}

function getPostStatus(post: Post): Pick<FeedItem, 'type' | 'statusLabel' | 'statusType' | 'contactable'> {
  const title = `${post.title || ''}${post.summary || ''}${post.excerpt || ''}${post.content || ''}`
  const tags = (post.tags || []).join(',')
  if (title.includes('求') || title.includes('搭子') || tags.includes('求助') || tags.includes('搭子')) {
    return { type: title.includes('搭子') ? 'partner' : 'help', statusLabel: '可联系', statusType: 'success', contactable: true }
  }
  if (normalizeCategory(getPostCategory(post)) === '兼职') {
    return { type: 'post', statusLabel: '兼职', statusType: 'warning' }
  }
  return { type: 'post', statusLabel: normalizeCategory(getPostCategory(post)), statusType: 'primary' }
}

function normalizePost(post: Post): FeedItem {
  const author = getAuthor(post)
  const category = normalizeCategory(getPostCategory(post))
  const status = getPostStatus(post)
  return {
    id: getPostId(post),
    title: post.title,
    desc: post.summary || post.excerpt || post.content || '暂无内容',
    coverImage: post.cover || post.images?.[0],
    tags: post.tags || [],
    category,
    authorId: author.id,
    authorName: author.name,
    authorAvatar: author.avatar,
    authorGender: author.gender,
    authorMeta: `${author.college} · ${author.grade}`,
    likeCount: Number(post.likeCount ?? post.likes ?? 0),
    commentCount: Number(post.commentCount ?? post.comments ?? 0),
    favoriteCount: Number(post.favoriteCount ?? post.collectCount ?? 0),
    source: post,
    ...status,
  }
}

function normalizeActivity(activity: Activity): FeedItem {
  return {
    id: activity.id,
    type: 'activity',
    title: activity.title,
    desc: activity.description || `${activity.organizer || '校园活动'} 正在招募感兴趣的同学参与。`,
    coverImage: activity.cover,
    tags: activity.tags || [],
    category: '活动',
    statusLabel: activity.status || '活动',
    statusType: activity.status === '已结束' ? 'danger' : 'warning',
    authorName: activity.organizer || '校园活动',
    authorMeta: activity.location || activity.campus || '浙江大学',
    likeCount: 0,
    commentCount: 0,
    favoriteCount: 0,
    participantCount: activity.participantCount ?? activity.participants ?? 0,
    location: activity.location,
    timeText: activity.time,
    source: activity,
  }
}

function itemMatchesKeyword(item: FeedItem, keyword: string) {
  if (!keyword) return true
  return textIncludesAny([
    item.title,
    item.desc,
    item.category,
    item.statusLabel,
    item.authorName,
    item.authorMeta,
    item.location,
    item.timeText,
    ...(item.tags || []),
  ], keyword.toLowerCase())
}

function itemMatchesCategory(item: FeedItem, category: string) {
  if (category === '推荐') return true
  if (category === '活动') return item.type === 'activity' || item.category === '活动'
  if (category === '兼职') return item.category === '兼职' || item.tags.some((tag) => ['实习', '兼职', '求职', '内推', '面试'].includes(tag))
  return item.category === category || item.tags.some((tag) => tag.includes(category))
}

export default function Discover() {
  const [activeCat, setActiveCat] = useState(0)
  const [searchQuery, setSearchQuery] = useState('')
  const [posts, setPosts] = useState<Post[]>([])
  const [activities, setActivities] = useState<Activity[]>([])
  const [postStats, setPostStats] = useState<Record<string, { likeCount: number; commentCount: number; favoriteCount: number }>>({})
  const [activityStats, setActivityStats] = useState<Record<string, number>>({})
  const [loading, setLoading] = useState(true)
  const [likedItems, setLikedItems] = useState<Record<string, boolean>>({})
  const [favoritedItems, setFavoritedItems] = useState<Record<string, boolean>>({})

  const isFirstShow = useRef(true)

  useLoad(() => {
    const storedKeyword = Taro.getStorageSync('discoverKeyword')
    if (storedKeyword) {
      setSearchQuery(String(storedKeyword).replace(/^#\s*/, '').trim())
      Taro.removeStorageSync('discoverKeyword')
    }
  })

  const loadPosts = useCallback(async () => {
    setLoading(true)
    try {
      const selected = CATEGORIES[activeCat]
      const requestCategory = selected === '推荐' ? '全部' : selected === '兼职' ? '工作' : selected
      const [postData, activityData] = await Promise.all([
        getPosts({ page: 0, category: requestCategory, keyword: searchQuery.trim() }),
        getActivities({ page: 0, category: selected === '鎺ㄨ崘' ? undefined : selected, keyword: searchQuery.trim() }),
      ])
      setPosts(postData || [])
      setActivities(activityData || [])
    } catch (e) {
      console.warn('[Discover] load posts failed', e)
      setPosts([])
      setActivities([])
    } finally {
      setLoading(false)
    }
  }, [activeCat, searchQuery])

  useEffect(() => {
    loadPosts()
  }, [loadPosts])

  useDidShow(() => {
    if (isFirstShow.current) {
      isFirstShow.current = false
      return
    }
    loadPosts()
  })

  const keyword = searchQuery.trim()
  const feedItems = useMemo(() => {
    const postItems = posts.map(normalizePost)
    const activityItems = activities.map(normalizeActivity)
    return [...postItems, ...activityItems].filter((item) => {
      const category = CATEGORIES[activeCat]
      return itemMatchesCategory(item, category) && itemMatchesKeyword(item, keyword)
    })
  }, [activeCat, activities, keyword, posts])

  const hotTopicPreview = useMemo(() => {
    return posts
      .map((post) => {
        const id = getPostId(post)
        const stats = postStats[id] || { likeCount: 0, commentCount: 0, favoriteCount: 0 }
        return {
          id,
          title: post.title,
          desc: post.summary || post.excerpt || post.content || '',
          heat: stats.commentCount + stats.likeCount + stats.favoriteCount,
          commentCount: stats.commentCount,
        }
      })
      .sort((a, b) => b.heat - a.heat)
      .slice(0, 3)
  }, [postStats, posts])

  useEffect(() => {
    const ids = posts.map(getPostId).filter(Boolean)
    if (!ids.length) {
      setPostStats({})
      return
    }
    let cancelled = false
    Promise.all(ids.map(async (id) => {
      const stats = await getPostStats(id)
      return [id, {
        likeCount: stats.likeCount ?? 0,
        commentCount: stats.commentCount ?? 0,
        favoriteCount: stats.favoriteCount ?? 0,
      }] as const
    })).then((entries) => {
      if (!cancelled) setPostStats(Object.fromEntries(entries))
    })
    return () => {
      cancelled = true
    }
  }, [posts])

  useEffect(() => {
    const ids = activities.map((activity) => activity.id || activity._id || '').filter(Boolean)
    if (!ids.length) {
      setActivityStats({})
      return
    }
    let cancelled = false
    Promise.all(ids.map(async (id) => {
      const stats = await getActivityStats(id)
      return [id, stats.registrationCount ?? 0] as const
    })).then((entries) => {
      if (!cancelled) setActivityStats(Object.fromEntries(entries))
    })
    return () => {
      cancelled = true
    }
  }, [activities])

  const openPost = (item: FeedItem) => {
    Taro.navigateTo({ url: `/sp-content/pages/post-detail/index?postId=${encodeURIComponent(item.id)}&from=discover` })
  }

  const openActivityRegister = (activity: Activity) => {
    const activityId = activity.id || activity._id || ''
    const registrationCount = activityStats[activityId] ?? 0
    const query = [
      `id=${encodeURIComponent(activity.id || '')}`,
      `title=${encodeURIComponent(activity.title || '')}`,
      `organizer=${encodeURIComponent(activity.organizer || '')}`,
      `time=${encodeURIComponent(activity.time || '')}`,
      `location=${encodeURIComponent(activity.location || '')}`,
      `participants=${encodeURIComponent(String(registrationCount))}`,
      `maxParticipants=${encodeURIComponent(String(activity.maxParticipants || ''))}`,
    ].join('&')
    Taro.navigateTo({ url: `/sp-content/pages/activity-register/index?${query}` })
  }

  const openFeedItem = (item: FeedItem) => {
    if (item.type === 'activity') {
      openActivityRegister(item.source as Activity)
      return
    }
    openPost(item)
  }

  const openUser = (item: FeedItem) => {
    if (!item.authorId) return
    openUnifiedUserProfile(item.authorId, item.authorName)
  }

  const openSearch = () => {
    Taro.navigateTo({ url: `/sp-common/pages/search-results/index?keyword=${encodeURIComponent(searchQuery)}&from=discover` })
  }

  const openHotTopics = () => {
    Taro.navigateTo({ url: '/sp-common/pages/hot-topics/index' })
  }

  const toggleLike = (id: string) => {
    setLikedItems((current) => ({ ...current, [id]: !current[id] }))
  }

  const toggleFavorite = async (item: FeedItem) => {
    const id = item.id
    const currentValue = !!favoritedItems[id]
    setFavoritedItems((current) => ({ ...current, [id]: !currentValue }))
    try {
      const res = await apiToggleFavorite({
        targetType: 'post',
        targetId: id,
        post: {
          ...(item.source || {}),
          id,
          _id: (item.source as any)?._id || id,
          title: item.title,
          excerpt: item.desc,
          tags: item.tags,
          coverImage: item.coverImage,
          authorId: item.authorId,
          authorName: item.authorName,
          authorAvatar: item.authorAvatar,
          authorGender: item.authorGender,
          college: item.authorMeta,
        },
      })
      setFavoritedItems((current) => ({ ...current, [id]: !!res.favorited }))
      Taro.showToast({ title: res.favorited ? '已收藏' : '已取消收藏', icon: 'success' })
    } catch (e) {
      setFavoritedItems((current) => ({ ...current, [id]: currentValue }))
      Taro.showToast({ title: '收藏失败', icon: 'none' })
    }
  }

  const renderCover = (item: FeedItem) => {
    if (isImageCover(item.coverImage)) {
      return <Image className='feed-cover-img' src={item.coverImage || ''} mode='aspectFill' lazyLoad />
    }
    const style = item.coverImage?.startsWith('linear-gradient') ? { background: item.coverImage } : undefined
    return (
      <View className='feed-cover-placeholder' style={style}>
        <Text className='feed-cover-icon'>{CATEGORY_ICONS[item.category] || (item.type === 'activity' ? '活' : '帖')}</Text>
        <Text className='feed-cover-label'>{item.type === 'activity' ? '校园活动' : item.category}</Text>
      </View>
    )
  }

  const renderFeedCard = (item: FeedItem) => {
    const liked = !!likedItems[item.id]
    const favorited = !!favoritedItems[item.id]
    const realPostStats = postStats[item.id] || { likeCount: 0, commentCount: 0, favoriteCount: 0 }
    const registrationCount = activityStats[item.id] ?? 0
    const likeCount = realPostStats.likeCount + (liked ? 1 : 0)
    const commentCount = realPostStats.commentCount
    const favoriteCount = realPostStats.favoriteCount + (favorited ? 1 : 0)
    return (
      <View className='feed-card' key={`${item.type}_${item.id}`} onClick={() => openFeedItem(item)}>
        <View className='feed-main'>
          <View className='feed-cover'>{renderCover(item)}</View>
          <View className='feed-content'>
            <View className='feed-title-row'>
              <Text className='feed-title' numberOfLines={2}>{item.title}</Text>
              <Text className={`feed-status feed-status--${item.statusType}`}>{item.statusLabel}</Text>
            </View>
            <Text className='feed-desc' numberOfLines={2}>{item.desc}</Text>
            <View className='feed-tags'>
              {item.tags.slice(0, 3).map((tag) => <Text className='feed-tag' key={`${item.id}_${tag}`}>{tag}</Text>)}
            </View>
            {item.type === 'activity' ? (
              <View className='activity-line'>
                <Text numberOfLines={1}>{item.timeText}</Text>
                <Text numberOfLines={1}>{item.location}</Text>
              </View>
            ) : null}
          </View>
        </View>

        <View className='feed-footer'>
          {item.type === 'activity' ? (
            <>
              <Text className='activity-count'>{registrationCount} 人报名</Text>
              <View
                className='register-btn'
                onClick={(event) => {
                  event.stopPropagation()
                  openActivityRegister(item.source as Activity)
                }}
              >
                <Text>去报名</Text>
              </View>
            </>
          ) : (
            <>
              <View className='feed-author' onClick={(event) => { event.stopPropagation(); openUser(item) }}>
                <View className='feed-avatar' style={{ backgroundColor: getAvatarBg(item.authorName) }}>
                  {isRenderableImage(item.authorAvatar) ? <Image className='feed-avatar-img' src={item.authorAvatar} mode='aspectFill' lazyLoad /> : <Text>{firstChar(item.authorName)}</Text>}
                </View>
                <View className='feed-author-text'>
                  <View className='feed-author-name-row'>
                    <Text className='feed-author-name'>{item.authorName}</Text>
                    {getGenderSymbol({ gender: item.authorGender, name: item.authorName, id: item.authorId }) ? (
                      <Text className={`feed-gender feed-gender--${getGenderTone({ gender: item.authorGender, name: item.authorName, id: item.authorId })}`}>
                        {getGenderSymbol({ gender: item.authorGender, name: item.authorName, id: item.authorId })}
                      </Text>
                    ) : null}
                  </View>
                  <Text className='feed-author-meta' numberOfLines={1}>{item.authorMeta}</Text>
                </View>
              </View>
              <View className='feed-actions'>
                <Text
                  className={liked ? 'feed-action feed-action--active' : 'feed-action'}
                  onClick={(event) => { event.stopPropagation(); toggleLike(item.id) }}
                >
                  ♥ {likeCount}
                </Text>
                <Text className='feed-action'>💬 {commentCount}</Text>
                <Text
                  className={favorited ? 'feed-action feed-action--active' : 'feed-action'}
                  onClick={(event) => { event.stopPropagation(); toggleFavorite(item) }}
                >
                  ☆ {favoriteCount}
                </Text>
              </View>
            </>
          )}
        </View>
      </View>
    )
  }

  return (
    <ErrorBoundary>
    <View className='discover-page'>
      <ScrollView scrollY className='discover-scroll' showScrollbar={false}>
        <View className='discover-header'>
          <SearchBar
            className='search-box discover-search-bar'
            value={searchQuery}
            placeholder='搜索帖子、技能、活动或同学'
            readonly
            onClick={openSearch}
          />

          <ScrollView scrollX enableFlex showScrollbar={false} className='category-scroll'>
            <View className='category-row'>
              {CATEGORIES.map((cat, index) => (
                <View key={cat} className={activeCat === index ? 'category-chip active' : 'category-chip'} onClick={() => setActiveCat(index)}>
                  <Text>{cat}</Text>
                </View>
              ))}
            </View>
          </ScrollView>
        </View>

        <View className='hot-topic-section'>
          <View className='section-header'>
            <Text className='section-title'>校园热榜</Text>
            <Text className='section-more' onClick={openHotTopics}>查看全部 &gt;</Text>
          </View>
          <View className='topic-rank-list'>
            {hotTopicPreview.length ? hotTopicPreview.map((topic, index) => (
              <View className='topic-rank-row' key={topic.id} onClick={openHotTopics}>
                <Text className={`topic-rank-index topic-rank-index--${index < 3 ? index + 1 : 'normal'}`}>{index + 1}</Text>
                <View className='topic-rank-main'>
                  <Text className='topic-rank-title' numberOfLines={1}>{topic.title}</Text>
                  <Text className='topic-rank-desc' numberOfLines={1}>{topic.desc || '来自真实帖子互动'}</Text>
                </View>
                <Text className='topic-rank-heat'>{topic.commentCount} 讨论</Text>
              </View>
            )) : (
              <View className='topic-rank-empty' onClick={openHotTopics}>
                <Text>暂无真实热榜数据</Text>
              </View>
            )}
          </View>
        </View>

        <View className='feed-list'>
          {!feedItems.length && (
            <View className='empty-state'>
              <Text className='empty-title'>{loading ? '正在加载内容...' : '没有找到相关内容'}</Text>
              {!loading && <Text className='empty-desc'>换个关键词试试，或发布你的需求</Text>}
            </View>
          )}
          {feedItems.map(renderFeedCard)}
        </View>
      </ScrollView>

      <FloatingPostButton
        className='discover-floating-post'
        onClick={() => Taro.navigateTo({ url: '/sp-content/pages/publish/index?mode=post' })}
      />
    </View>
    </ErrorBoundary>
  )
}

