import { useEffect, useMemo, useState } from 'react'
import Taro, { useLoad } from '@tarojs/taro'
import { Image, Input, ScrollView, Text, View } from '@tarojs/components'
import { getPosts } from '../../utils/api'
import { MOCK_POSTS } from '../../utils/mock'
import './index.css'

const CATEGORIES = ['全部', '科研', '升学', '兴趣', '工作']
const CATEGORY_ICONS: Record<string, string> = {
  科研: '研',
  升学: '升',
  兴趣: '趣',
  工作: '职',
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
    college?: string
    major?: string
    grade?: string
    campus?: string
    bio?: string
  }
  likeCount?: number
  commentCount?: number
  likes?: number
  comments?: number
  createdAt?: string
}

type AuthorProfile = {
  id: string
  name: string
  college: string
  major: string
  grade: string
  campus: string
  intro: string
  skills: string[]
  interests: string[]
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
  return !!cover && !cover.startsWith('linear-gradient')
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

function getMatchReasons(post: Post, keyword: string) {
  if (!keyword) return []
  const author = getAuthor(post)
  const lower = keyword.toLowerCase()
  const reasons: string[] = []

  if (includesText(post.title, lower)) reasons.push(`标题包含 ${keyword}`)
  if (includesText(post.content || post.summary || post.excerpt, lower)) reasons.push(`正文包含 ${keyword}`)
  const tag = (post.tags || []).find((item) => includesText(item, lower))
  if (tag) reasons.push(`标签 ${tag}`)
  if (includesText(getPostCategory(post), lower) || includesText(post.categoryTag, lower)) reasons.push(`分类 ${getPostCategory(post)}`)
  if (includesText(author.name, lower)) reasons.push(`作者 ${author.name}`)
  if (includesText(author.college, lower)) reasons.push(`作者学院 ${author.college}`)
  if (includesText(author.major, lower)) reasons.push(`作者专业 ${author.major}`)
  if (includesText(author.grade, lower)) reasons.push(`作者年级 ${author.grade}`)
  const skill = author.skills.find((item) => includesText(item, lower))
  if (skill) reasons.push(`作者技能 ${skill}`)
  const interest = author.interests.find((item) => includesText(item, lower))
  if (interest) reasons.push(`作者兴趣 ${interest}`)

  return Array.from(new Set(reasons)).slice(0, 2)
}

function matchesSearch(post: Post, keyword: string) {
  if (!keyword) return true
  return getMatchReasons(post, keyword).length > 0
}

function mergePendingPost(posts: Post[]) {
  const pending = Taro.getStorageSync('pendingPost')
  if (!pending?.title) return posts
  const pendingId = getPostId(pending)
  if (posts.some((post) => getPostId(post) === pendingId)) return posts
  return [{ ...pending, id: pendingId }, ...posts]
}

export default function Discover() {
  const [activeCat, setActiveCat] = useState(0)
  const [searchQuery, setSearchQuery] = useState('')
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)

  useLoad(() => {
    const pending = Taro.getStorageSync('pendingPost')
    if (pending?.title) setPosts((current) => mergePendingPost(current))
  })

  useEffect(() => {
    let alive = true
    async function loadPosts() {
      setLoading(true)
      try {
        const data = await getPosts({ page: 0 })
        if (alive) setPosts(mergePendingPost(data?.length ? data : MOCK_POSTS))
      } catch (e) {
        console.warn('[Discover] load posts failed', e)
        if (alive) setPosts(mergePendingPost(MOCK_POSTS))
      } finally {
        if (alive) setLoading(false)
      }
    }
    loadPosts()
    return () => {
      alive = false
    }
  }, [])

  const keyword = searchQuery.trim()
  const filtered = useMemo(() => {
    const category = CATEGORIES[activeCat]
    return posts.filter((post) => {
      const matchesCategory = category === '全部' || getPostCategory(post) === category
      return matchesCategory && matchesSearch(post, keyword)
    })
  }, [activeCat, keyword, posts])

  const openPost = (post: Post) => {
    Taro.navigateTo({ url: `/pages/post-detail/index?postId=${encodeURIComponent(getPostId(post))}&from=discover` })
  }

  const openUser = (post: Post) => {
    const author = getAuthor(post)
    Taro.navigateTo({ url: `/pages/user-detail/index?userId=${encodeURIComponent(author.id)}&name=${encodeURIComponent(author.name)}` })
  }

  return (
    <View className='discover-page'>
      <View className='discover-header'>
        <View className='discover-title-row'>
          <Text className='discover-title'>发现</Text>
          <Text className='discover-subtitle'>搜索帖子、同学和校园经验</Text>
        </View>

        <View className='search-box'>
          <Text className='search-icon'>⌕</Text>
          <Input
            className='search-input'
            value={searchQuery}
            placeholder='搜索 Python、科研、摄影、作者昵称...'
            confirmType='search'
            onInput={(event) => setSearchQuery(String(event.detail.value || ''))}
            placeholderStyle='color: #94A3B8; font-size: 14px;'
          />
          {!!searchQuery && (
            <Text className='clear-search' onClick={() => setSearchQuery('')}>清空</Text>
          )}
        </View>

        <ScrollView scrollX enableFlex showScrollbar={false}>
          <View className='category-row'>
            {CATEGORIES.map((cat, index) => (
              <View key={cat} className={activeCat === index ? 'category-chip active' : 'category-chip'} onClick={() => setActiveCat(index)}>
                <Text>{cat}</Text>
              </View>
            ))}
          </View>
        </ScrollView>
      </View>

      <View className='post-list'>
        {!filtered.length && (
          <View className='empty-state'>
            <Text className='empty-title'>{loading ? '正在加载内容...' : '没有找到相关内容'}</Text>
            {!loading && <Text className='empty-desc'>换个关键词试试，或发布你的需求</Text>}
          </View>
        )}

        {filtered.map((post) => {
          const author = getAuthor(post)
          const category = getPostCategory(post)
          const reasons = getMatchReasons(post, keyword)

          return (
            <View className='post-card' key={getPostId(post)} onClick={() => openPost(post)}>
              <View className='author-row' onClick={(event) => { event.stopPropagation(); openUser(post) }}>
                <View className='avatar' style={{ backgroundColor: getAvatarBg(author.name) }}>
                  <Text>{author.name.charAt(0)}</Text>
                </View>
                <View className='author-main'>
                  <View className='author-name-row'>
                    <Text className='author-name'>{author.name}</Text>
                    <Text className='author-meta' numberOfLines={1}>{author.college} · {author.grade} · {author.campus}</Text>
                  </View>
                  <Text className='author-intro' numberOfLines={1}>{author.intro}</Text>
                </View>
              </View>

              <View className='tag-row'>
                <Text className='category-tag'>{post.categoryTag || `${category} · 动态`}</Text>
                {(post.tags || []).slice(0, 3).map((tag) => <Text className='post-tag' key={tag}>{tag}</Text>)}
              </View>

              {!!reasons.length && (
                <View className='reason-row'>
                  {reasons.map((reason) => <Text className='reason-tag' key={reason}>命中：{reason}</Text>)}
                </View>
              )}

              <View className='post-body'>
                <Text className='post-title'>{post.title}</Text>
                <Text className='post-excerpt' numberOfLines={2}>{post.summary || post.excerpt || post.content || '暂无内容'}</Text>
              </View>

              {post.cover ? (
                isImageCover(post.cover) ? (
                  <Image className='post-cover' src={post.cover} mode='aspectFill' />
                ) : (
                  <View className='cover-placeholder'>
                    <Text className='cover-icon'>{CATEGORY_ICONS[category] || '帖'}</Text>
                    <Text className='cover-label'>{category}</Text>
                  </View>
                )
              ) : null}

              <View className='post-footer'>
                <View className='post-stats'>
                  <Text>♡ {post.likeCount ?? post.likes ?? 0}</Text>
                  <Text>评论 {post.commentCount ?? post.comments ?? 0}</Text>
                </View>
                <Text className='detail-link'>查看详情</Text>
              </View>
            </View>
          )
        })}
      </View>

      <View className='publish-fab' onClick={() => Taro.navigateTo({ url: '/pages/publish/index?mode=post' })}>
        <Text>+</Text>
      </View>
    </View>
  )
}
