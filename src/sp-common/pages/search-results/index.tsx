import { useMemo, useState } from 'react'
import Taro, { useLoad } from '@tarojs/taro'
import { Image, Text, View } from '@tarojs/components'
import SearchBar from '../../../components/common/SearchBar'
import { getActivities } from '../../../api/activity'
import { getPosts } from '../../../api/post'
import { getUsers } from '../../../api/user'
import { openUnifiedUserProfile } from '../../../utils/publicProfiles'
import { getGenderSymbol, getGenderTone } from '../../../utils/gender'
import './index.scss'

type ResultType = 'user' | 'skill' | 'post' | 'activity'

type SearchResult = {
  id: string
  type: ResultType
  title: string
  desc: string
  tags: string[]
  cover?: string
  authorId?: string
  authorName?: string
  authorGender?: string
  authorCollege?: string
  source: any
}

function idOf(item: any) {
  if (!item) return ''
  return String(item.id || item._id || item.userId || item.title || item.name || '')
}

function includesKeyword(values: unknown[], keyword: string) {
  if (!keyword) return true
  const lowerKeyword = keyword.toLowerCase()
  return values.filter(Boolean).some((value) => String(value).toLowerCase().includes(lowerKeyword))
}

function skillsOf(user: any) {
  return (user?.canTeach || user?.can || user?.skills || [])
    .map((skill: any) => typeof skill === 'string' ? skill : skill?.name)
    .filter(Boolean)
}

function wantsOf(user: any) {
  return (user?.wantToLearn || user?.want || user?.learnWants || []).filter(Boolean)
}

function normalizeUser(user: any): SearchResult {
  const skills = skillsOf(user)
  return {
    id: idOf(user),
    type: skills.length ? 'skill' : 'user',
    title: user?.name || '同学',
    desc: user?.intro || user?.bio || user?.lookingFor || 'TA还没有填写简介',
    tags: [...skills, ...wantsOf(user)].slice(0, 4),
    cover: user?.avatar,
    authorId: idOf(user),
    authorName: user?.name || '同学',
    authorGender: user?.gender,
    authorCollege: user?.college || user?.school || '浙江大学',
    source: user,
  }
}

function normalizePost(post: any): SearchResult {
  const author = post?.author || {}
  return {
    id: idOf(post),
    type: 'post',
    title: post?.title || '帖子',
    desc: post?.summary || post?.excerpt || post?.content || '',
    tags: post?.tags || [],
    cover: post?.images?.[0] || post?.cover,
    authorId: post?.authorId || post?.userId || author.id || author.userId,
    authorName: post?.authorName || author.name || '同学',
    authorGender: author.gender,
    authorCollege: author.college || '浙江大学',
    source: post,
  }
}

function normalizeActivity(activity: any): SearchResult {
  return {
    id: idOf(activity),
    type: 'activity',
    title: activity?.title || '校园活动',
    desc: activity?.description || `${activity?.time || ''} ${activity?.location || ''}`.trim(),
    tags: activity?.tags || [],
    cover: activity?.cover,
    authorName: activity?.organizer || '校园活动',
    authorCollege: activity?.location || '',
    source: activity,
  }
}

function isImage(value?: string) {
  return !!value && !value.startsWith('linear-gradient')
}

function typeLabel(type: ResultType) {
  if (type === 'user') return '用户'
  if (type === 'skill') return '技能'
  if (type === 'activity') return '活动'
  return '帖子'
}

function getRealRecommendWords(users: any[], posts: any[], activities: any[]) {
  const counter = new Map<string, number>()
  const addWord = (value?: unknown) => {
    const word = String(value || '').trim()
    if (!word || word.length > 16) return
    counter.set(word, (counter.get(word) || 0) + 1)
  }

  users.forEach((user) => {
    skillsOf(user).forEach(addWord)
    wantsOf(user).forEach(addWord)
    ;(Array.isArray(user?.interests) ? user.interests : []).forEach(addWord)
  })
  posts.forEach((post) => {
    ;(Array.isArray(post?.tags) ? post.tags : []).forEach(addWord)
    addWord(post?.category)
  })
  activities.forEach((activity) => {
    ;(Array.isArray(activity?.tags) ? activity.tags : []).forEach(addWord)
    addWord(activity?.category)
  })

  return Array.from(counter.entries())
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, 8)
    .map(([word]) => word)
}

export default function SearchResults() {
  const [keyword, setKeyword] = useState('')
  const [posts, setPosts] = useState<any[]>([])
  const [users, setUsers] = useState<any[]>([])
  const [activities, setActivities] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useLoad(async (options) => {
    const nextKeyword = decodeURIComponent(String(options?.keyword || '')).trim()
    setKeyword(nextKeyword)
    setLoading(true)
    try {
      const [postData, userData, activityData] = await Promise.all([
        getPosts({ page: 0 }),
        getUsers({ page: 0 }),
        getActivities({ page: 0 }),
      ])
      setPosts(Array.isArray(postData) ? postData : [])
      setUsers(Array.isArray(userData) ? userData : [])
      setActivities(Array.isArray(activityData) ? activityData : [])
    } catch (error) {
      console.warn('[SearchResults] load failed', error)
      setPosts([])
      setUsers([])
      setActivities([])
    } finally {
      setLoading(false)
    }
  })

  const visibleResults = useMemo(() => {
    const all = [
      ...users.map(normalizeUser),
      ...posts.map(normalizePost),
      ...activities.map(normalizeActivity),
    ]
    const text = keyword.trim()
    return all.filter((item) => includesKeyword([
      item.title,
      item.desc,
      item.authorName,
      item.authorCollege,
      ...item.tags,
    ], text))
  }, [activities, keyword, posts, users])

  const recommendWords = useMemo(() => getRealRecommendWords(users, posts, activities), [activities, posts, users])

  const submitSearch = (value?: string) => {
    const text = String(value ?? keyword).trim()
    setKeyword(text)
    const recent = Taro.getStorageSync('homeRecentSearches')
    const nextRecent = [text, ...(Array.isArray(recent) ? recent.filter((item) => item !== text) : [])]
      .filter(Boolean)
      .slice(0, 6)
    Taro.setStorageSync('homeRecentSearches', nextRecent)
  }

  const openHotTopics = () => {
    Taro.navigateTo({ url: '/sp-common/pages/hot-topics/index' })
  }

  const openResult = (item: SearchResult) => {
    if (item.type === 'user' || item.type === 'skill') {
      openUnifiedUserProfile(item.authorId || item.id, item.authorName || item.title)
      return
    }
    if (item.type === 'activity') {
      const activity = item.source || {}
      const query = [
        `id=${encodeURIComponent(activity.id || activity._id || item.id)}`,
        `title=${encodeURIComponent(activity.title || item.title)}`,
        `organizer=${encodeURIComponent(activity.organizer || '')}`,
        `time=${encodeURIComponent(activity.time || '')}`,
        `location=${encodeURIComponent(activity.location || '')}`,
        `participants=${encodeURIComponent(String(activity.participants || activity.participantCount || 0))}`,
        `maxParticipants=${encodeURIComponent(String(activity.maxParticipants || ''))}`,
      ].join('&')
      Taro.navigateTo({ url: `/sp-content/pages/activity-register/index?${query}` })
      return
    }
    Taro.navigateTo({ url: `/sp-content/pages/post-detail/index?postId=${encodeURIComponent(item.id)}&from=search&keyword=${encodeURIComponent(keyword)}` })
  }

  return (
    <View className='search-page'>
      <View className='search-header'>
        <SearchBar
          className='search-result-bar'
          value={keyword}
          placeholder='搜索昵称、技能、帖子或活动'
          onInput={setKeyword}
          onConfirm={submitSearch}
        />
        <Text className='search-summary'>与“{keyword || '全部'}”相关的结果</Text>
      </View>

      {recommendWords.length ? (
        <View className='hot-search-card'>
          <Text className='hot-search-title'>热门推荐</Text>
          <View className='hot-search-list'>
            {recommendWords.map((word) => (
              <View className='hot-search-chip' key={word} onClick={() => submitSearch(word)}>
                <Text>{word}</Text>
              </View>
            ))}
          </View>
        </View>
      ) : null}

      <View className='search-list'>
        {loading ? (
          <View className='search-empty'><Text>正在搜索...</Text></View>
        ) : null}
        {!loading && !visibleResults.length ? (
          <View className='search-empty'><Text>未找到结果，换个关键词试试</Text></View>
        ) : null}
        {visibleResults.map((item) => (
          <View className='search-card' key={`${item.type}_${item.id}`} onClick={() => openResult(item)}>
            <View className='search-cover'>
              {isImage(item.cover) ? <Image className='search-cover-img' src={item.cover || ''} mode='aspectFill' lazyLoad /> : <Text>{typeLabel(item.type)}</Text>}
            </View>
            <View className='search-main'>
              <View className='search-title-row'>
                <Text className='search-title' numberOfLines={2}>{item.title}</Text>
                <Text className='search-type'>{typeLabel(item.type)}</Text>
              </View>
              <Text className='search-desc' numberOfLines={2}>{item.desc}</Text>
              <View className='search-author'>
                <Text className='search-author-name'>{item.authorName || typeLabel(item.type)}</Text>
                {getGenderSymbol({ gender: item.authorGender, name: item.authorName, id: item.authorId }) ? (
                  <Text className={`search-gender search-gender--${getGenderTone({ gender: item.authorGender, name: item.authorName, id: item.authorId })}`}>
                    {getGenderSymbol({ gender: item.authorGender, name: item.authorName, id: item.authorId })}
                  </Text>
                ) : null}
                <Text className='search-author-meta'>{item.authorCollege || ''}</Text>
              </View>
              <View className='search-actions'>
                {item.tags.slice(0, 3).map((tag) => <Text key={`${item.id}_${tag}`}>{tag}</Text>)}
              </View>
            </View>
          </View>
        ))}
      </View>

      {!loading && !visibleResults.length ? (
        <View className='campus-topic-card' onClick={openHotTopics}>
          <Text className='campus-topic-title'>本周校园热议</Text>
          <Text className='campus-topic-desc'>查看基于真实帖子互动统计的校园热榜</Text>
          <Text className='campus-topic-action'>去看热榜</Text>
        </View>
      ) : null}
    </View>
  )
}
