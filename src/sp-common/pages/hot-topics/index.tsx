import { useEffect, useMemo, useState } from 'react'
import Taro from '@tarojs/taro'
import { ScrollView, Text, View } from '@tarojs/components'
import { getPosts } from '../../../api/post'
import { getPostStats } from '../../../api/stats'
import './index.scss'

type HotPost = {
  id: string
  title: string
  desc: string
  authorName: string
  category: string
  tags: string[]
  likeCount: number
  commentCount: number
  favoriteCount: number
}

function postId(post: any) {
  return String(post?.id || post?._id || post?.title || '')
}

function normalizePost(post: any): HotPost {
  const author = post?.author || {}
  return {
    id: postId(post),
    title: post?.title || '帖子',
    desc: post?.summary || post?.excerpt || post?.content || '',
    authorName: post?.authorName || author.name || '同学',
    category: post?.mainCategory || post?.category || post?.categoryTag || '校园',
    tags: Array.isArray(post?.tags) ? post.tags : [],
    likeCount: 0,
    commentCount: 0,
    favoriteCount: 0,
  }
}

export default function HotTopics() {
  const [posts, setPosts] = useState<HotPost[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let alive = true
    async function loadHotPosts() {
      setLoading(true)
      try {
        const data = await getPosts({ page: 0 })
        const basePosts = Array.isArray(data) ? data.map(normalizePost).filter((post) => !!post.id) : []
        const withStats = await Promise.all(basePosts.map(async (post) => {
          const stats = await getPostStats(post.id)
          return {
            ...post,
            likeCount: stats.likeCount ?? 0,
            commentCount: stats.commentCount ?? 0,
            favoriteCount: stats.favoriteCount ?? 0,
          }
        }))
        if (alive) setPosts(withStats)
      } catch (e) {
        console.warn('[HotTopics] load failed', e)
        if (alive) setPosts([])
      } finally {
        if (alive) setLoading(false)
      }
    }
    loadHotPosts()
    return () => {
      alive = false
    }
  }, [])

  const rankedPosts = useMemo(() => {
    return posts
      .map((post) => ({
        ...post,
        heat: post.commentCount + post.likeCount + post.favoriteCount,
      }))
      .sort((a, b) => b.heat - a.heat)
  }, [posts])

  const openPost = (post: HotPost) => {
    Taro.navigateTo({ url: `/sp-content/pages/post-detail/index?postId=${encodeURIComponent(post.id)}&from=hot-topics` })
  }

  return (
    <ScrollView scrollY className='hot-page' showScrollbar={false}>
      <View className='hot-head'>
        <Text className='hot-title'>校园热榜</Text>
        <Text className='hot-desc'>根据真实帖子互动统计排序，不展示模拟热度。</Text>
      </View>

      <View className='hot-list'>
        {loading ? (
          <View className='hot-empty'><Text>正在加载热榜...</Text></View>
        ) : null}
        {!loading && !rankedPosts.length ? (
          <View className='hot-empty'><Text>暂无真实热榜数据</Text></View>
        ) : null}
        {rankedPosts.map((post, index) => (
          <View className='hot-row' key={post.id} onClick={() => openPost(post)}>
            <Text className={`hot-rank hot-rank--${index < 3 ? index + 1 : 'normal'}`}>{index + 1}</Text>
            <View className='hot-main'>
              <Text className='hot-post-title' numberOfLines={2}>{post.title}</Text>
              <Text className='hot-post-desc' numberOfLines={2}>{post.desc || `${post.authorName} 发布的校园内容`}</Text>
              <View className='hot-meta'>
                <Text>{post.category}</Text>
                <Text>{post.commentCount} 讨论</Text>
                <Text>{post.likeCount} 点赞</Text>
                <Text>{post.favoriteCount} 收藏</Text>
              </View>
              <View className='hot-tags'>
                {post.tags.slice(0, 3).map((tag) => <Text key={`${post.id}_${tag}`}>{tag}</Text>)}
              </View>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  )
}
