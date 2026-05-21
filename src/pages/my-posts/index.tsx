import { useMemo, useState } from 'react'
import Taro, { useDidShow } from '@tarojs/taro'
import { Text, View } from '@tarojs/components'
import { CURRENT_USER, MOCK_POSTS, MY_POSTS } from '../../utils/mock'
import { deletePost, getMyPosts, updatePost } from '../../utils/api'
import './index.css'

type ManagedPost = {
  id: string
  title: string
  excerpt: string
  tags: string[]
  likes: number
  comments: number
  createdAt?: string
  time?: string
  authorId?: string
  visibility?: 'public' | 'private'
}

const STORAGE_KEY = 'myManagedPosts'

function getSeedPosts(): ManagedPost[] {
  const fromPosts = MOCK_POSTS
    .filter((post) => (post.authorId || post.userId || post.author?.id) === CURRENT_USER.id)
    .map((post) => ({
      id: post.id,
      title: post.title,
      excerpt: post.excerpt,
      tags: post.tags || [],
      likes: post.likeCount ?? post.likes ?? 0,
      comments: post.commentCount ?? post.comments ?? 0,
      createdAt: post.createdAt,
      authorId: post.authorId || post.userId,
      visibility: post.visibility || 'public',
    }))

  const fromMine = MY_POSTS.map((post) => ({
    id: post.id,
    title: post.title,
    excerpt: post.excerpt,
    tags: post.tags || [],
    likes: post.likes,
    comments: post.comments,
    time: post.time,
    authorId: post.authorId,
    visibility: post.visibility as ManagedPost['visibility'],
  }))

  const merged = [...fromPosts, ...fromMine]
  return merged.filter((post, index) => merged.findIndex((item) => item.id === post.id) === index)
}

function readPosts() {
  const cached = Taro.getStorageSync(STORAGE_KEY)
  return Array.isArray(cached) && cached.length ? cached : getSeedPosts()
}

function savePosts(posts: ManagedPost[]) {
  Taro.setStorageSync(STORAGE_KEY, posts)
}

function getTime(post: ManagedPost) {
  if (post.time) return post.time
  if (!post.createdAt) return '刚刚'
  const date = new Date(post.createdAt)
  if (Number.isNaN(date.getTime())) return post.createdAt
  return `${date.getMonth() + 1}-${date.getDate()}`
}

export default function MyPosts() {
  const [posts, setPosts] = useState<ManagedPost[]>(readPosts())
  const [batchMode, setBatchMode] = useState(false)
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [desc, setDesc] = useState(true)

  useDidShow(() => {
    const localPosts = readPosts()
    setPosts(localPosts)
    getMyPosts()
      .then((data) => {
        if (!Array.isArray(data) || !data.length) {
          setPosts(localPosts)
          return
        }
        const remotePosts = data.map((post: any) => ({
          id: post.id || post._id,
          title: post.title,
          excerpt: post.excerpt || post.summary || post.content || '',
          tags: post.tags || [],
          likes: post.likes ?? post.likeCount ?? 0,
          comments: post.comments ?? post.commentCount ?? 0,
          createdAt: post.createdAt,
          authorId: post.authorId || post.userId,
          visibility: post.visibility || 'public',
        }))
        setPosts(remotePosts.length ? remotePosts : localPosts)
      })
      .catch((e) => {
        console.warn('[MyPosts] getMyPosts failed, fallback local', e)
        setPosts(localPosts)
      })
  })

  const visiblePosts = useMemo(() => {
    const list = [...posts]
    return list.sort((a, b) => {
      const aTime = new Date(a.createdAt || '').getTime() || Number(a.id)
      const bTime = new Date(b.createdAt || '').getTime() || Number(b.id)
      return desc ? bTime - aTime : aTime - bTime
    })
  }, [posts, desc])

  const updatePosts = (nextPosts: ManagedPost[]) => {
    setPosts(nextPosts)
    savePosts(nextPosts)
  }

  const goDetail = (postId: string) => {
    Taro.navigateTo({ url: `/pages/post-detail/index?postId=${encodeURIComponent(postId)}&from=mine` })
  }

  const showPostMenu = (post: ManagedPost) => {
    Taro.showActionSheet({
      itemList: ['查看详情', '编辑帖子', '帖子管理', post.visibility === 'private' ? '设为公开' : '设为私密', '删除帖子'],
      itemColor: '#1E293B',
      success: ({ tapIndex }) => {
        if (tapIndex === 0) goDetail(post.id)
        if (tapIndex === 1) Taro.navigateTo({ url: `/pages/publish/index?mode=edit&postId=${encodeURIComponent(post.id)}` })
        if (tapIndex === 2) Taro.navigateTo({ url: `/pages/post-manage/index?postId=${encodeURIComponent(post.id)}` })
        if (tapIndex === 3) {
          const next = posts.map((item) => item.id === post.id ? { ...item, visibility: item.visibility === 'private' ? 'public' : 'private' } : item)
          updatePosts(next)
          updatePost({ postId: post.id, post: { visibility: post.visibility === 'private' ? 'public' : 'private' } }).catch((e) => console.warn('[MyPosts] update visibility failed', e))
          Taro.showToast({ title: post.visibility === 'private' ? '已设为公开' : '已设为私密', icon: 'success' })
        }
        if (tapIndex === 4) confirmDelete([post.id])
      },
    })
  }

  const confirmDelete = (ids: string[]) => {
    Taro.showModal({
      title: '确认删除',
      content: ids.length > 1 ? `删除后无法恢复，确定删除选中的 ${ids.length} 条帖子吗？` : '删除后无法恢复，确定删除吗？',
      confirmText: '删除',
      confirmColor: '#EF4444',
      success: ({ confirm }) => {
        if (!confirm) return
        ids.forEach((id) => deletePost({ postId: id }).catch((e) => console.warn('[MyPosts] delete failed', e)))
        updatePosts(posts.filter((post) => !ids.includes(post.id)))
        setSelectedIds([])
        Taro.showToast({ title: '已删除', icon: 'success' })
      },
    })
  }

  const toggleSelect = (id: string) => {
    setSelectedIds((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id])
  }

  const batchSetVisibility = (visibility: 'public' | 'private') => {
    if (!selectedIds.length) {
      Taro.showToast({ title: '请先选择帖子', icon: 'none' })
      return
    }
    updatePosts(posts.map((post) => selectedIds.includes(post.id) ? { ...post, visibility } : post))
    Taro.showToast({ title: visibility === 'private' ? '已设为私密' : '已设为公开', icon: 'success' })
  }

  const allSelected = visiblePosts.length > 0 && selectedIds.length === visiblePosts.length

  return (
    <View className='my-posts-page'>
      <View className='page-header'>
        <View>
          <Text className='page-title'>我的发布</Text>
          <Text className='page-subtitle'>共 {posts.length} 条内容，可集中编辑和管理</Text>
        </View>
        <View className='header-actions'>
          <View className={`outline-btn ${batchMode ? 'active' : ''}`} onClick={() => { setBatchMode(!batchMode); setSelectedIds([]) }}>
            <Text>{batchMode ? '完成' : '批量管理'}</Text>
          </View>
          <View className='outline-btn' onClick={() => setDesc(!desc)}>
            <Text>{desc ? '最新优先' : '最早优先'}</Text>
          </View>
        </View>
      </View>

      {batchMode && (
        <View className='batch-top'>
          <Text onClick={() => setSelectedIds(allSelected ? [] : visiblePosts.map((post) => post.id))}>{allSelected ? '取消全选' : '全选'}</Text>
          <Text>{selectedIds.length ? `已选 ${selectedIds.length} 条` : '选择需要管理的帖子'}</Text>
        </View>
      )}

      <View className='post-list'>
        {visiblePosts.map((post) => (
          <View className='post-card' key={post.id} onClick={() => batchMode ? toggleSelect(post.id) : goDetail(post.id)}>
            {batchMode && (
              <View className={`check-box ${selectedIds.includes(post.id) ? 'checked' : ''}`}>
                <Text>{selectedIds.includes(post.id) ? '✓' : ''}</Text>
              </View>
            )}
            <View className='post-main'>
              <View className='post-title-row'>
                <Text className='post-title'>{post.title}</Text>
                <Text className={`visibility ${post.visibility === 'private' ? 'private' : ''}`}>{post.visibility === 'private' ? '私密' : '公开'}</Text>
              </View>
              <Text className='post-excerpt'>{post.excerpt}</Text>
              <View className='tag-row'>
                {post.tags.slice(0, 3).map((tag) => <Text className='tag' key={tag}>{tag}</Text>)}
              </View>
              <View className='post-footer'>
                <View className='post-stats'>
                  <Text>♡ {post.likes}</Text>
                  <Text>评论 {post.comments}</Text>
                  <Text>{getTime(post)}</Text>
                </View>
                {!batchMode && (
                  <View className='more-btn' onClick={(event) => { event.stopPropagation(); showPostMenu(post) }}>
                    <Text>...</Text>
                  </View>
                )}
              </View>
            </View>
          </View>
        ))}
      </View>

      {batchMode && (
        <View className='batch-bar'>
          <Text className='batch-count'>已选 {selectedIds.length} 条</Text>
          <Text className='batch-action' onClick={() => batchSetVisibility('private')}>设为私密</Text>
          <Text className='batch-action' onClick={() => batchSetVisibility('public')}>设为公开</Text>
          <Text className='batch-danger' onClick={() => selectedIds.length ? confirmDelete(selectedIds) : Taro.showToast({ title: '请先选择帖子', icon: 'none' })}>删除</Text>
        </View>
      )}
    </View>
  )
}
