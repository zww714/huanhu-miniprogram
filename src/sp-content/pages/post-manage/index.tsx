import { useState } from 'react'
import Taro, { useLoad } from '@tarojs/taro'
import { ScrollView, Text, View } from '@tarojs/components'
import { getPostDetail, updatePost, deletePost } from '../../../api'
import './index.css'

export default function PostManage() {
  const [post, setPost] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [postId, setPostId] = useState('')

  useLoad((options) => {
    const id = String(options?.postId || options?.id || '')
    setPostId(id)
    if (!id) {
      setLoading(false)
      return
    }
    getPostDetail({ postId: id })
      .then((res: any) => {
        const data = res.data || res
        setPost(data)
      })
      .catch((e) => {
        console.warn('[PostManage] getPostDetail failed', e)
        Taro.showToast({ title: '加载帖子失败', icon: 'none' })
      })
      .finally(() => setLoading(false))
  })

  const handleBack = () => Taro.navigateBack()
  const handleEdit = () => Taro.navigateTo({ url: `/sp-content/pages/publish/index?mode=edit&postId=${encodeURIComponent(postId)}` })
  const handleToggleVisibility = () => {
    if (!postId || !post) return
    const nextVisibility = post.visibility === 'public' ? 'private' : 'public'
    Taro.showLoading({ title: nextVisibility === 'private' ? '设置私密...' : '设置公开...' })
    updatePost({ postId, post: { visibility: nextVisibility } })
      .then(() => {
        setPost((prev: any) => ({ ...prev, visibility: nextVisibility }))
        Taro.showToast({ title: nextVisibility === 'private' ? '已设为私密' : '已设为公开', icon: 'none' })
      })
      .catch((e) => {
        console.warn('[PostManage] update visibility failed', e)
        Taro.showToast({ title: '设置失败，请重试', icon: 'none' })
      })
      .finally(() => Taro.hideLoading())
  }
  const handleDelete = () => {
    if (!postId) return
    Taro.showModal({
      title: '删除帖子',
      content: '删除后将无法恢复，确定要删除这条帖子吗？',
      confirmText: '删除',
      confirmColor: '#EF4444',
      success: (res) => {
        if (!res.confirm) return
        Taro.showLoading({ title: '删除中...' })
        deletePost({ postId })
          .then(() => {
            Taro.showToast({ title: '已删除', icon: 'success' })
            setTimeout(() => Taro.navigateBack(), 600)
          })
          .catch((e) => {
            console.warn('[PostManage] deletePost failed', e)
            Taro.showToast({ title: '删除失败，请重试', icon: 'none' })
          })
          .finally(() => Taro.hideLoading())
      },
    })
  }

  if (loading) {
    return (
      <View className='manage-page'>
        <View className='manage-nav'>
          <Text className='nav-action' onClick={() => Taro.navigateBack()}>‹</Text>
          <Text className='nav-title'>帖子管理</Text>
          <Text className='nav-action'>•••</Text>
        </View>
        <View className='empty-card'>
          <Text className='empty-title'>加载中...</Text>
        </View>
      </View>
    )
  }

  if (!post) {
    return (
      <View className='manage-page'>
        <View className='manage-nav'>
          <Text className='nav-action' onClick={() => Taro.navigateBack()}>‹</Text>
          <Text className='nav-title'>帖子管理</Text>
          <Text className='nav-action'>•••</Text>
        </View>
        <View className='empty-card'>
          <Text className='empty-title'>未找到帖子</Text>
          <Text className='empty-desc'>该帖子不存在或已被删除。</Text>
        </View>
      </View>
    )
  }

  const visibility = post.visibility || 'public'

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
            <View className='data-item'><Text className='data-value'>{post.likeCount ?? 0}</Text><Text className='data-label'>点赞数</Text></View>
            <View className='data-item'><Text className='data-value'>{post.commentCount ?? 0}</Text><Text className='data-label'>评论数</Text></View>
            <View className='data-item'><Text className='data-value'>{post.favoriteCount ?? post.collectCount ?? 0}</Text><Text className='data-label'>收藏数</Text></View>
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

