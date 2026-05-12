import { useMemo, useState } from 'react'
import Taro, { useLoad } from '@tarojs/taro'
import { ScrollView, Text, View } from '@tarojs/components'
import { MOCK_POSTS, MY_POSTS } from '../../utils/mock'
import './index.css'

type ManagePost = {
  id?: string
  _id?: string
  title: string
  likes?: number
  comments?: number
  likeCount?: number
  commentCount?: number
  collectCount?: number
  viewCount?: number
  visibility?: 'public' | 'private'
}

function getPostId(post: ManagePost) {
  return String(post.id || post._id || '')
}

export default function PostManage() {
  const [postId, setPostId] = useState('')
  const [visibility, setVisibility] = useState<'public' | 'private'>('public')

  useLoad((options) => {
    const id = String(options?.postId || options?.id || '')
    setPostId(id)
    const editedPosts = Taro.getStorageSync('editedPosts') || {}
    const localPosts = Taro.getStorageSync('localMinePosts') || []
    const found = MOCK_POSTS.find((item) => item.id === id)
      || localPosts.find((item: ManagePost) => getPostId(item) === id)
      || MY_POSTS.find((item) => item.id === id)
    setVisibility((editedPosts[id]?.visibility || found?.visibility || 'public') as 'public' | 'private')
  })

  const post = useMemo(() => {
    const editedPosts = Taro.getStorageSync('editedPosts') || {}
    const localPosts = Taro.getStorageSync('localMinePosts') || []
    const found = MOCK_POSTS.find((item) => item.id === postId)
      || localPosts.find((item: ManagePost) => getPostId(item) === postId)
      || MY_POSTS.find((item) => item.id === postId)
    return found ? { ...found, ...(editedPosts[postId] || {}) } : null
  }, [postId])

  const handleBack = () => Taro.navigateBack()
  const handleEdit = () => Taro.navigateTo({ url: `/pages/publish/index?mode=edit&postId=${encodeURIComponent(postId)}` })
  const handleToggleVisibility = () => {
    const nextVisibility = visibility === 'public' ? 'private' : 'public'
    const editedPosts = Taro.getStorageSync('editedPosts') || {}
    Taro.setStorageSync('editedPosts', {
      ...editedPosts,
      [postId]: {
        ...(editedPosts[postId] || {}),
        visibility: nextVisibility,
      },
    })
    setVisibility(nextVisibility)
    Taro.showToast({ title: nextVisibility === 'private' ? '已设为私密' : '已设为公开', icon: 'none' })
  }
  const handleDelete = () => {
    Taro.showModal({
      title: '删除帖子',
      content: '确定要删除这条帖子吗？第一版只做本地状态演示。',
      confirmText: '删除',
      confirmColor: '#EF4444',
      success: (res) => {
        if (!res.confirm) return
        Taro.showToast({ title: '已删除', icon: 'success' })
        setTimeout(() => Taro.navigateBack(), 600)
      },
    })
  }

  if (!post) {
    return (
      <View className='manage-page'>
        <View className='manage-nav'>
          <Text className='nav-action' onClick={handleBack}>‹</Text>
          <Text className='nav-title'>帖子管理</Text>
          <Text className='nav-action'>•••</Text>
        </View>
        <View className='empty-card'>
          <Text className='empty-title'>未找到帖子</Text>
          <Text className='empty-desc'>请返回我的发布重新打开。</Text>
        </View>
      </View>
    )
  }

  return (
    <View className='manage-page'>
      <View className='manage-nav'>
        <Text className='nav-action' onClick={handleBack}>‹</Text>
        <Text className='nav-title'>帖子管理</Text>
        <Text className='nav-action'>•••</Text>
      </View>

      <ScrollView scrollY className='manage-scroll' showScrollbar={false}>
        <View className='card'>
          <Text className='post-title'>{post.title}</Text>
          <Text className={visibility === 'public' ? 'status public' : 'status private'}>{visibility === 'public' ? '公开' : '私密'}</Text>
        </View>

        <View className='card'>
          <Text className='section-title'>互动数据</Text>
          <View className='data-grid'>
            <View className='data-item'><Text className='data-value'>{post.viewCount || 0}</Text><Text className='data-label'>浏览量</Text></View>
            <View className='data-item'><Text className='data-value'>{post.likeCount ?? post.likes ?? 0}</Text><Text className='data-label'>点赞数</Text></View>
            <View className='data-item'><Text className='data-value'>{post.commentCount ?? post.comments ?? 0}</Text><Text className='data-label'>评论数</Text></View>
            <View className='data-item'><Text className='data-value'>{post.collectCount || 0}</Text><Text className='data-label'>收藏数</Text></View>
          </View>
        </View>

        <View className='card'>
          <Text className='section-title'>管理操作</Text>
          <View className='action-btn primary' onClick={handleEdit}><Text>编辑帖子</Text></View>
          <View className='action-btn' onClick={handleToggleVisibility}><Text>{visibility === 'public' ? '设置为私密' : '设置为公开'}</Text></View>
          <View className='action-btn' onClick={() => Taro.showToast({ title: '评论管理后续接入', icon: 'none' })}><Text>评论管理</Text></View>
          <View className='action-btn danger' onClick={handleDelete}><Text>删除帖子</Text></View>
        </View>
      </ScrollView>
    </View>
  )
}
