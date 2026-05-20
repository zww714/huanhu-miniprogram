import { View, Text, ScrollView } from '@tarojs/components'
import Taro, { useLoad } from '@tarojs/taro'
import { useEffect, useMemo, useState } from 'react'
import { getUserPosts } from '../../utils/api'
import {
  getPublicPosts,
  getPublicUser,
  normalizePublicUserId,
  setPendingPublicPost,
  type PublicPost,
} from '../../utils/publicProfiles'
import './index.css'

const FALLBACK_POSTS = [
  { id: 'autumn', title: '浙大之秋：银杏大道的光影', summary: '午后的阳光洒在银杏叶上，整条路都变成了金色。随手一拍就是壁纸...', tags: ['摄影', '校园风景'], likeCount: 156, commentCount: 32, viewCount: '1.2k', createdAt: '2天前', cover: '秋' },
  { id: 'camera', title: '我的富士XT30使用体验', summary: '轻便复古的机身，胶片模拟直出真的很有味道。分享几个我常用的设置...', tags: ['摄影', '器材分享'], likeCount: 101, commentCount: 28, viewCount: '892', createdAt: '5天前', cover: '相' },
  { id: 'design-note', title: '产品设计流程笔记分享', summary: '从用户调研到原型草图，再到打磨细节，记录一次完整的产品设计过程。', tags: ['产品设计', '方法分享'], likeCount: 203, commentCount: 41, viewCount: '1.5k', createdAt: '1周前', cover: '设' },
  { id: 'campus-life', title: '校园生活碎片', summary: '图书馆自习、社团活动、和朋友的晚饭时光。平凡日子里的小确幸。', tags: ['校园生活', '日常记录'], likeCount: 88, commentCount: 19, viewCount: '765', createdAt: '2周前', cover: '校' },
]

function normalizePost(post: any, index: number, userId: string, userName: string): PublicPost & { viewCount?: string; cover?: string } {
  const fallback = FALLBACK_POSTS[index] || FALLBACK_POSTS[0]
  return {
    id: post.id || post._id || fallback.id,
    authorId: post.authorId || post.userId || userId,
    authorName: post.authorName || post.author?.name || userName,
    title: post.title || fallback.title,
    summary: post.summary || post.excerpt || post.content || fallback.summary,
    content: post.content || post.summary || post.excerpt || fallback.summary,
    tags: Array.isArray(post.tags) && post.tags.length ? post.tags : fallback.tags,
    visibility: post.visibility || 'public',
    likeCount: Number(post.likeCount ?? post.likes ?? fallback.likeCount),
    commentCount: Number(post.commentCount ?? post.comments ?? fallback.commentCount),
    createdAt: post.createdAt || post.time || fallback.createdAt,
    viewCount: post.viewCount || fallback.viewCount,
    cover: post.cover || fallback.cover,
  }
}

export default function UserPosts() {
  const [userId, setUserId] = useState('')
  const [remotePosts, setRemotePosts] = useState<any[]>([])

  useLoad((options) => {
    setUserId(normalizePublicUserId(String(options?.userId || options?.id || '')))
  })

  const user = useMemo(() => getPublicUser(userId), [userId])
  const posts = useMemo(() => {
    const source = remotePosts.length ? remotePosts : getPublicPosts(user.id)
    return (source.length ? source : FALLBACK_POSTS).map((post, index) => normalizePost(post, index, user.id, user.name))
  }, [remotePosts, user])

  useEffect(() => {
    if (!user.id) return
    let alive = true
    getUserPosts({ userId: user.id })
      .then((data) => {
        if (alive && Array.isArray(data)) setRemotePosts(data)
      })
      .catch((e) => console.warn('[UserPosts] getUserPosts failed, fallback mock', e))
    return () => { alive = false }
  }, [user.id])

  const goBack = () => {
    const pages = getCurrentPages()
    if (pages.length > 1) Taro.navigateBack()
    else Taro.navigateTo({ url: `/pages/profile/view?userId=${encodeURIComponent(user.id)}` })
  }

  const openPost = (post: PublicPost) => {
    if (!(post as any).canManage) setPendingPublicPost(post, user)
    Taro.navigateTo({ url: `/pages/post-detail/index?postId=${encodeURIComponent(post.id)}&from=user-posts` })
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
          <Text>▧</Text>
          <Text>仅展示公开发布内容</Text>
        </View>

        <View className='post-list'>
          {posts.map((post) => (
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
                <Text>◎ {(post as any).viewCount || '1.2k'}</Text>
                <Text>☰ {post.commentCount}</Text>
                <Text>♡ {post.likeCount}</Text>
                <Text>{post.createdAt}</Text>
              </View>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  )
}
