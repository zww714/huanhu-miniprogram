import { View, Text, ScrollView } from '@tarojs/components'
import Taro, { useLoad } from '@tarojs/taro'
import { useEffect, useMemo, useState } from 'react'
import { getUserPosts } from '../../../api'
import {
  normalizePublicUserId,
  setPendingPublicPost,
  type PublicPost,
} from '../../../utils/publicProfiles'
import './index.scss'

function normalizePost(post: any, index: number, userId: string, userName: string): PublicPost & { viewCount?: string | number; cover?: string } {
  return {
    id: post.id || post._id || `post-${index}`,
    authorId: post.authorId || post.userId || userId,
    authorName: post.authorName || post.author?.name || userName,
    title: post.title || '未命名内容',
    summary: post.summary || post.excerpt || post.content || '',
    content: post.content || post.summary || post.excerpt || '',
    tags: Array.isArray(post.tags) ? post.tags : [],
    visibility: post.visibility || 'public',
    likeCount: Number(post.likeCount ?? post.likes ?? 0),
    commentCount: Number(post.commentCount ?? post.comments ?? 0),
    createdAt: post.createdAt || post.time || '',
    viewCount: Number(post.viewCount || 0),
    cover: post.cover || '',
  }
}

export default function UserPosts() {
  const [userId, setUserId] = useState('')
  const [userName, setUserName] = useState('同学')
  const [remotePosts, setRemotePosts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useLoad((options) => {
    setUserId(normalizePublicUserId(String(options?.userId || options?.id || '')))
    setUserName(decodeURIComponent(String(options?.name || '同学')))
  })

  const posts = useMemo(() => (
    remotePosts.map((post, index) => normalizePost(post, index, userId, userName))
  ), [remotePosts, userId, userName])

  useEffect(() => {
    if (!userId) return
    let alive = true
    setLoading(true)
    getUserPosts({ userId })
      .then((data) => {
        if (alive) setRemotePosts(Array.isArray(data) ? data : [])
      })
      .catch((e) => {
        console.warn('[UserPosts] getUserPosts failed', e)
        if (alive) setRemotePosts([])
      })
      .finally(() => {
        if (alive) setLoading(false)
      })
    return () => { alive = false }
  }, [userId])

  const goBack = () => {
    const pages = getCurrentPages()
    if (pages.length > 1) Taro.navigateBack()
    else Taro.navigateTo({ url: `/sp-profile/pages/profile/view?userId=${encodeURIComponent(userId)}` })
  }

  const openPost = (post: PublicPost) => {
    if (!(post as any).canManage) setPendingPublicPost(post, { id: userId, name: userName } as any)
    Taro.navigateTo({ url: `/sp-content/pages/post-detail/index?postId=${encodeURIComponent(post.id)}&from=user-posts` })
  }

  return (
    <ScrollView scrollY className='posts-page' showScrollbar={false} enhanced bounces={false}>
      <View className='page-shell'>
        <View className='top-nav'>
          <Text className='back-icon' onClick={goBack}>‹</Text>
          <Text className='page-title'>TA的发布</Text>
          <View className='nav-spacer' />
        </View>

        <View className='private-line'>
          <Text>只展示公开发布内容</Text>
        </View>

        <View className='post-list'>
          {loading ? (
            <Text className='empty-text'>加载中...</Text>
          ) : posts.length ? posts.map((post) => (
            <View className='post-card' key={post.id} onClick={() => openPost(post)}>
              <View className='post-top'>
                <View className='post-cover'><Text>{(post as any).cover || post.title.slice(0, 1)}</Text></View>
                <View className='post-main'>
                  <Text className='post-title' numberOfLines={2}>{post.title}</Text>
                  <Text className='post-summary' numberOfLines={2}>{post.summary || post.content}</Text>
                  <View className='tag-row'>
                    {(post.tags || []).slice(0, 2).map((tag) => <Text className='tag' key={tag}>{tag}</Text>)}
                  </View>
                </View>
              </View>
              <View className='post-divider' />
              <View className='post-meta'>
                <Text>浏览 {Number((post as any).viewCount || 0)}</Text>
                <Text>评论 {post.commentCount}</Text>
                <Text>点赞 {post.likeCount}</Text>
                <Text>{String(post.createdAt || '')}</Text>
              </View>
            </View>
          )) : (
            <Text className='empty-text'>TA 还没有发布公开内容</Text>
          )}
        </View>
      </View>
    </ScrollView>
  )
}
