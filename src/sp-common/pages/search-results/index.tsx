import { useMemo, useState } from 'react'
import Taro, { useLoad } from '@tarojs/taro'
import { Image, Text, View } from '@tarojs/components'
import SearchBar from '../../../components/common/SearchBar'
import { getPosts } from '../../../api'
import { MOCK_POSTS } from '../../../utils/mock'
import { openUnifiedUserProfile } from '../../../utils/publicProfiles'
import { getGenderSymbol, getGenderTone } from '../../../utils/gender'
import './index.scss'

const HOT_RECOMMENDS = ['Python 入门', '科研经验', '摄影搭子', '论文降重', 'AI工具', '校园活动']

type SearchPost = {
  id?: string
  _id?: string
  title: string
  excerpt?: string
  summary?: string
  content?: string
  cover?: string
  images?: string[]
  tags?: string[]
  mainCategory?: string
  category?: string
  authorId?: string
  userId?: string
  authorName?: string
  author?: {
    id?: string
    userId?: string
    name?: string
    avatar?: string
    college?: string
    grade?: string
    gender?: string
  }
  likeCount?: number
  commentCount?: number
  favoriteCount?: number
  likes?: number
  comments?: number
  createdAt?: string
}

function getPostId(post: SearchPost) {
  return String(post.id || post._id || post.title || '')
}

function getAuthorId(post: SearchPost) {
  return String(post.authorId || post.userId || post.author?.userId || post.author?.id || '')
}

function getAuthorName(post: SearchPost) {
  return post.authorName || post.author?.name || '同学'
}

function getDesc(post: SearchPost) {
  return post.summary || post.excerpt || post.content || '暂无内容'
}

function getCover(post: SearchPost) {
  return post.images?.[0] || post.cover || ''
}

function isImage(value?: string) {
  return !!value && !value.startsWith('linear-gradient')
}

function matches(post: SearchPost, keyword: string) {
  if (!keyword) return true
  const pool = [
    post.title,
    getDesc(post),
    post.mainCategory,
    post.category,
    getAuthorName(post),
    ...(post.tags || []),
  ].join(' ').toLowerCase()
  return pool.includes(keyword.toLowerCase())
}

function formatTime(value?: string) {
  if (!value) return '刚刚'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return `${date.getMonth() + 1}-${date.getDate()}`
}

export default function SearchResults() {
  const [keyword, setKeyword] = useState('')
  const [posts, setPosts] = useState<SearchPost[]>([])
  const [loading, setLoading] = useState(true)

  useLoad(async (options) => {
    const nextKeyword = decodeURIComponent(String(options?.keyword || '')).trim()
    setKeyword(nextKeyword)
    setLoading(true)
    try {
      const data = await getPosts({ page: 0, keyword: nextKeyword })
      setPosts(data?.length ? data : MOCK_POSTS)
    } catch (error) {
      console.warn('[SearchResults] load posts failed', error)
      setPosts(MOCK_POSTS)
    } finally {
      setLoading(false)
    }
  })

  const visiblePosts = useMemo(() => posts.filter((post) => matches(post, keyword.trim())), [keyword, posts])

  const submitSearch = (value?: string) => {
    const text = String(value ?? keyword).trim()
    setKeyword(text)
    const recent = Taro.getStorageSync('homeRecentSearches')
    const nextRecent = [text, ...(Array.isArray(recent) ? recent.filter((item) => item !== text) : [])].filter(Boolean).slice(0, 6)
    Taro.setStorageSync('homeRecentSearches', nextRecent)
  }

  const openPost = (post: SearchPost) => {
    Taro.navigateTo({ url: `/sp-content/pages/post-detail/index?postId=${encodeURIComponent(getPostId(post))}&from=search&keyword=${encodeURIComponent(keyword)}` })
  }

  const openAuthor = (post: SearchPost) => {
    const userId = getAuthorId(post)
    if (!userId) return
    openUnifiedUserProfile(userId, getAuthorName(post))
  }

  return (
    <View className='search-page'>
      <View className='search-header'>
        <SearchBar
          className='search-result-bar'
          value={keyword}
          placeholder='搜索帖子、技能、活动或同学'
          onInput={setKeyword}
          onConfirm={submitSearch}
        />
        <Text className='search-summary'>与“{keyword || '全部'}”相关的帖子</Text>
      </View>

      <View className='hot-search-card'>
        <Text className='hot-search-title'>热门推荐</Text>
        <View className='hot-search-list'>
          {HOT_RECOMMENDS.map((word) => (
            <View className='hot-search-chip' key={word} onClick={() => submitSearch(word)}>
              <Text>{word}</Text>
            </View>
          ))}
        </View>
      </View>

      <View className='search-list'>
        {loading ? (
          <View className='search-empty'><Text>正在搜索...</Text></View>
        ) : null}
        {!loading && !visiblePosts.length ? (
          <View className='search-empty'><Text>没有找到相关帖子，换个关键词试试</Text></View>
        ) : null}
        {visiblePosts.map((post) => {
          const cover = getCover(post)
          return (
            <View className='search-card' key={getPostId(post)} onClick={() => openPost(post)}>
              <View className='search-cover'>
                {isImage(cover) ? <Image className='search-cover-img' src={cover} mode='aspectFill' lazyLoad /> : <Text>{post.mainCategory || post.category || '帖子'}</Text>}
              </View>
              <View className='search-main'>
                <View className='search-title-row'>
                  <Text className='search-title' numberOfLines={2}>{post.title}</Text>
                  <Text className='search-type'>{post.mainCategory || post.category || '帖子'}</Text>
                </View>
                <Text className='search-desc' numberOfLines={2}>{getDesc(post)}</Text>
                <View className='search-author' onClick={(event) => { event.stopPropagation(); openAuthor(post) }}>
                  <Text className='search-author-name'>{getAuthorName(post)}</Text>
                  {getGenderSymbol({ gender: post.author?.gender, name: getAuthorName(post), id: getAuthorId(post) }) ? (
                    <Text className={`search-gender search-gender--${getGenderTone({ gender: post.author?.gender, name: getAuthorName(post), id: getAuthorId(post) })}`}>
                      {getGenderSymbol({ gender: post.author?.gender, name: getAuthorName(post), id: getAuthorId(post) })}
                    </Text>
                  ) : null}
                  <Text className='search-author-meta'>{post.author?.college || '浙江大学'} · {formatTime(post.createdAt)}</Text>
                </View>
                <View className='search-actions'>
                  <Text>♡ {Number(post.likeCount ?? post.likes ?? 0)}</Text>
                  <Text>💬 {Number(post.commentCount ?? post.comments ?? 0)}</Text>
                  <Text>☆ {Number(post.favoriteCount ?? 0)}</Text>
                </View>
              </View>
            </View>
          )
        })}
      </View>
    </View>
  )
}

