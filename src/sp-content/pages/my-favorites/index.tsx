import { useState, useEffect } from 'react'
import Taro from '@tarojs/taro'
import { Image, Text, View } from '@tarojs/components'
import { MOCK_POSTS } from '../../../utils/mock'
import { getMyFavorites } from '../../../api'
import { openUnifiedUserProfile } from '../../../utils/publicProfiles'
import './index.scss'

type FavoriteItem = {
  _id: string
  id: string
  postId: string
  createdAt: any
  post: {
    _id: string
    id: string
    title: string
    excerpt: string
    cover?: string
    tags: string[]
    likeCount: number
    commentCount: number
    favoriteCount: number
    authorId: string
    author: {
      _id: string
      name: string
      avatar: string
      college: string
      grade: string
      verified: boolean
    }
  }
}

function formatTime(value?: any): string {
  if (!value) return ''
  if (typeof value === 'string') {
    const d = new Date(value)
    if (Number.isNaN(d.getTime())) return ''
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    return `${month}-${day}`
  }
  return ''
}

function isRenderableImage(src?: string) {
  return !!src && !src.startsWith('linear-gradient') && !src.includes('/assets/avatar.png')
}

export default function MyFavorites() {
  const [favorites, setFavorites] = useState<FavoriteItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getMyFavorites()
      .then((data) => {
        if (Array.isArray(data) && data.length) {
          setFavorites(data)
        } else {
          // Cloud returned empty or failed — use mock fallback
          const mock = MOCK_POSTS.slice(1, 4).map((post: any) => ({
            id: post.id,
            postId: post.id,
            createdAt: '',
            post: {
              ...post,
              authorId: post.authorId || '',
              author: post.author || {
                id: '',
                _id: '',
                name: '同学',
                avatar: '',
                college: '浙江大学',
                grade: '在读',
                verified: false,
              },
            },
          }))
          setFavorites(mock)
        }
      })
      .catch(() => {
        // Fallback to mock
        const mock = MOCK_POSTS.slice(1, 4).map((post: any) => ({
          id: post.id,
          postId: post.id,
          createdAt: '',
          post: {
            ...post,
            authorId: post.authorId || '',
            author: post.author || {
              id: '',
              _id: '',
              name: '同学',
              avatar: '',
              college: '浙江大学',
              grade: '在读',
              verified: false,
            },
          },
        }))
        setFavorites(mock)
      })
      .finally(() => setLoading(false))
  }, [])

  const goPostDetail = (postId: string) => {
    Taro.navigateTo({ url: `/sp-content/pages/post-detail/index?postId=${encodeURIComponent(postId)}` })
  }

  if (loading) {
    return (
      <View className='fav-loading'>
        <Text>加载中...</Text>
      </View>
    )
  }

  if (!favorites.length) {
    return (
      <View className='fav-empty'>
        <Text className='fav-empty-text'>你还没有收藏内容</Text>
        <Text className='fav-empty-desc'>去发现页看看有趣的帖子吧</Text>
      </View>
    )
  }

  return (
    <View className='fav-page'>
      {favorites.map((item) => {
        const post = item.post
        return (
          <View key={item.id || item.postId} className='fav-card' onClick={() => goPostDetail(item.postId)}>
            <View className='fav-author-row'>
              <View className='fav-avatar' onClick={(e) => { e.stopPropagation(); openUnifiedUserProfile(post.authorId, post.author?.name) }}>
                {isRenderableImage(post.author?.avatar) ? (
                  <Image src={post.author.avatar} mode='aspectFill' className='fav-avatar-img' lazyLoad />
                ) : (
                  <Text className='fav-avatar-text'>{(post.author?.name || '同').charAt(0)}</Text>
                )}
              </View>
              <View className='fav-author-info'>
                <Text className='fav-author-name'>{post.author?.name || '同学'}</Text>
                <Text className='fav-author-meta'>{post.author?.college || ''}</Text>
              </View>
              {formatTime(item.createdAt) && (
                <Text className='fav-time'>{formatTime(item.createdAt)}</Text>
              )}
            </View>

            <Text className='fav-title'>{post.title}</Text>
            <Text className='fav-excerpt'>{post.excerpt}</Text>

            {post.tags?.length > 0 && (
              <View className='fav-tags'>
                {post.tags.slice(0, 3).map((tag: string) => (
                  <Text key={tag} className='fav-tag'>{tag}</Text>
                ))}
              </View>
            )}

            <View className='fav-stats'>
              <Text>♥ {post.likeCount ?? 0}</Text>
              <Text>💬 {post.commentCount ?? 0}</Text>
              <Text>☆ {post.favoriteCount ?? 0}</Text>
            </View>
          </View>
        )
      })}
    </View>
  )
}

