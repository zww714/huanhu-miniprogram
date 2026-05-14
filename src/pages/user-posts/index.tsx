import { View, Text, ScrollView } from '@tarojs/components'
import Taro, { useLoad } from '@tarojs/taro'
import { useMemo, useState } from 'react'
import {
  getPublicPosts,
  getPublicUser,
  normalizePublicUserId,
  setPendingPublicPost,
  type PublicPost,
} from '../../utils/publicProfiles'
import './index.css'

export default function UserPosts() {
  const [userId, setUserId] = useState('')

  useLoad((options) => {
    setUserId(normalizePublicUserId(String(options?.userId || options?.id || '')))
  })

  const user = useMemo(() => getPublicUser(userId), [userId])
  const posts = useMemo(() => getPublicPosts(user.id), [user.id])

  const openPost = (post: PublicPost) => {
    setPendingPublicPost(post, user)
    Taro.navigateTo({ url: `/pages/post-detail/index?postId=${encodeURIComponent(post.id)}&from=user-posts` })
  }

  return (
    <ScrollView scrollY className='viewer-page' showScrollbar={false} enhanced bounces={false}>
      <View className='viewer-header'>
        <Text className='back' onClick={() => Taro.navigateBack()}>‹</Text>
        <View>
          <Text className='viewer-title'>TA的发布</Text>
          <Text className='viewer-subtitle'>{user.name} 的公开帖子</Text>
        </View>
      </View>

      <View className='post-list'>
        {!posts.length && (
          <View className='empty-state'>
            <Text>TA还没有发布内容</Text>
          </View>
        )}
        {posts.map((post) => (
          <View className='post-card' key={post.id} onClick={() => openPost(post)}>
            <View className='post-head'>
              <Text className='post-title'>{post.title}</Text>
              <Text className='post-time'>{post.createdAt}</Text>
            </View>
            <Text className='post-summary' numberOfLines={2}>{post.summary}</Text>
            <View className='tag-row'>
              {post.tags.slice(0, 3).map((tag) => <Text className='tag' key={tag}>{tag}</Text>)}
            </View>
            <View className='post-meta'>
              <Text>♡ {post.likeCount}</Text>
              <Text>评论 {post.commentCount}</Text>
            </View>
          </View>
        ))}
      </View>
      <View className='safe-bottom' />
    </ScrollView>
  )
}
