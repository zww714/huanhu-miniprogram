import { useState } from 'react'
import Taro, { useLoad } from '@tarojs/taro'
import { Image, Input, ScrollView, Text, View } from '@tarojs/components'
import {
  CURRENT_USER,
  MOCK_POSTS,
  MY_POSTS,
  POST_COMMENTS,
  type Comment,
} from '../../utils/mock'
import { addComment, deleteComment as apiDeleteComment, deletePost, getComments, getPostDetail, getPosts, updatePost, toggleLike, toggleFavorite, getInteractionStatus } from '../../utils/api'
import { openUnifiedUserProfile } from '../../utils/publicProfiles'
import { recordBrowse } from '../../utils/history'
import './index.css'

type Post = {
  id?: string
  _id?: string
  title: string
  excerpt?: string
  content?: string
  cover?: string
  images?: string[]
  categoryTag?: string
  mainCategory?: string
  tags?: string[]
  authorId?: string
  userId?: string
  visibility?: 'public' | 'private'
  viewCount?: number
  collectCount?: number
  likeCount?: number
  commentCount?: number
  author?: {
    id?: string
    userId?: string
    name: string
    avatar?: string
    college?: string
    grade?: string
    verified?: boolean
  }
  likes?: number
  comments?: number
  createdAt?: string
}

const fallbackPost: Post = {
  id: 'fallback',
  title: '帖子详情',
  content: '暂时没有找到这条帖子，请返回发现页重新打开。',
  tags: ['发现'],
  authorId: CURRENT_USER.id,
  author: { id: CURRENT_USER.id, userId: CURRENT_USER.id, name: CURRENT_USER.name, college: '浙江大学', grade: '在读', avatar: CURRENT_USER.avatar },
  likes: 0,
  comments: 0,
}

function getRecordId(post: Post) {
  return String(post.id || post._id || '')
}

function getAuthor(post: Post) {
  return post.author || {
    id: post.authorId || post.userId || CURRENT_USER.id,
    userId: post.authorId || post.userId || CURRENT_USER.id,
    name: post.authorId === CURRENT_USER.id ? CURRENT_USER.name : '同学',
    college: '浙江大学',
    grade: '在读',
    avatar: '',
  }
}

function getAuthorId(post: Post) {
  const author = getAuthor(post)
  return post.authorId || post.userId || author.userId || author.id || ''
}

function isImageCover(cover?: string) {
  return !!cover && !cover.startsWith('linear-gradient')
}

function formatTime(value?: string) {
  if (!value) return '刚刚'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hour = String(date.getHours()).padStart(2, '0')
  const minute = String(date.getMinutes()).padStart(2, '0')
  return `${month}-${day} ${hour}:${minute}`
}

function Avatar({ name, avatar, onClick }: { name: string; avatar?: string; onClick: () => void }) {
  return (
    <View className='avatar' onClick={onClick}>
      {avatar ? (
        <Image src={avatar} mode='aspectFill' className='avatar-img' />
      ) : (
        <Text>{name.charAt(0) || '同'}</Text>
      )}
    </View>
  )
}

export default function PostDetail() {
  const [post, setPost] = useState<Post>(fallbackPost)
  const [isMissing, setIsMissing] = useState(false)
  const [liked, setLiked] = useState(false)
  const [bookmarked, setBookmarked] = useState(false)
  const [likeCount, setLikeCount] = useState(0)
  const [favoriteCount, setFavoriteCount] = useState(0)
  const [visibility, setVisibility] = useState<'public' | 'private'>('public')
  const [comments, setComments] = useState<Comment[]>(POST_COMMENTS)
  const [commentText, setCommentText] = useState('')

  useLoad(async (options) => {
    const id = decodeURIComponent(String(options?.postId || options?.id || ''))
    const pending = Taro.getStorageSync('pendingPost')
    const editedPosts = Taro.getStorageSync('editedPosts') || {}
    const localPosts = Taro.getStorageSync('localMinePosts') || []

    const applyPost = (found: Post) => {
      const nextPost = { ...found, ...(editedPosts[id] || {}) }
      setPost(nextPost)
      setLikeCount(Number(nextPost.likeCount ?? nextPost.likes ?? 0))
      setFavoriteCount(Number(nextPost.favoriteCount ?? nextPost.collectCount ?? 0))
      setVisibility(nextPost.visibility || 'public')
      setIsMissing(false)
      recordBrowse({ id: getRecordId(nextPost) || id, type: 'post', title: nextPost.title || '帖子', subtitle: nextPost.excerpt || nextPost.content?.slice(0, 30) })
    }

    if (pending && (pending.id === id || pending._id === id)) {
      applyPost(pending)
      return
    }

    try {
      const remotePost = await getPostDetail({ postId: id })
      const posts = remotePost ? [remotePost] : await getPosts({ page: 0 })
      const found = posts.find((item: Post) => getRecordId(item) === id)
        || MOCK_POSTS.find((item) => item.id === id)
        || localPosts.find((item: Post) => getRecordId(item) === id)
        || MY_POSTS.find((item) => item.id === id)

      if (found) {
        applyPost(found)
      } else {
        setPost(fallbackPost)
        setLikeCount(0)
        setIsMissing(true)
      }
    } catch (e) {
      console.warn('[PostDetail] load post failed', e)
      const found = MOCK_POSTS.find((item) => item.id === id)
        || localPosts.find((item: Post) => getRecordId(item) === id)
        || MY_POSTS.find((item) => item.id === id)
      if (found) {
        applyPost(found)
      } else {
        setPost(fallbackPost)
        setLikeCount(0)
        setIsMissing(true)
      }
    }

    // Load interaction status (liked / bookmarked)
    if (id) {
      getComments({ postId: id })
        .then((cloudComments) => {
          if (Array.isArray(cloudComments)) setComments(cloudComments)
        })
        .catch((e) => console.warn('[PostDetail] getComments failed, using mock', e))

      getInteractionStatus({ targetId: id })
        .then((status) => {
          if (status) {
            setLiked(status.liked)
            setBookmarked(status.favorited)
            setLikeCount(status.likeCount)
            setFavoriteCount(status.favoriteCount)
          }
        })
        .catch((e) => {
          console.warn('[PostDetail] getInteractionStatus failed, using local', e)
        })
    }
  })

  const author = getAuthor(post)
  const authorId = getAuthorId(post)
  const postId = getRecordId(post)
  const isOwner = !isMissing && (!!(post as any).canManage || authorId === CURRENT_USER.id)
  const body = (post.content || post.excerpt || '').split('\n').filter(Boolean)
  const images = post.images?.length ? post.images : isImageCover(post.cover) ? [post.cover!] : []
  const commentTotal = comments.reduce((total, comment) => total + 1 + (comment.replies?.length || 0), 0)

  const handleBack = () => Taro.navigateBack()
  const goUser = (userId?: string, name?: string) => {
    if (!userId) {
      Taro.showToast({ title: '用户信息不存在', icon: 'none' })
      return
    }
    openUnifiedUserProfile(userId, name)
  }

  const handleEditPost = () => Taro.navigateTo({ url: `/pages/publish/index?mode=edit&postId=${encodeURIComponent(postId)}` })
  const handleManagePost = () => Taro.navigateTo({ url: `/pages/post-manage/index?postId=${encodeURIComponent(postId)}` })
  const handleToggleVisibility = () => {
    const nextVisibility = visibility === 'public' ? 'private' : 'public'
    setVisibility(nextVisibility)
    updatePost({ postId, post: { visibility: nextVisibility } }).catch((e) => console.warn('[PostDetail] update visibility failed', e))
    Taro.showToast({ title: nextVisibility === 'private' ? '已设为私密' : '已设为公开', icon: 'none' })
  }
  const handleDeletePost = () => {
    Taro.showModal({
      title: '确认删除',
      content: '删除后将无法恢复，确定要删除这条帖子吗？',
      confirmText: '删除',
      confirmColor: '#EF4444',
      success: (res) => {
        if (!res.confirm) return
        deletePost({ postId })
          .then(() => {
            setIsMissing(true)
            Taro.showToast({ title: '已删除', icon: 'success' })
            setTimeout(() => Taro.navigateBack(), 600)
          })
          .catch((e) => {
            console.warn('[PostDetail] delete failed', e)
            Taro.showToast({ title: '删除失败', icon: 'none' })
          })
      },
    })
  }
  const handleMore = () => {
    if (isOwner) {
      Taro.showActionSheet({
        itemList: ['编辑帖子', '帖子管理', visibility === 'public' ? '设为私密' : '设为公开', '删除帖子'],
        success: (res) => {
          if (res.tapIndex === 0) handleEditPost()
          if (res.tapIndex === 1) handleManagePost()
          if (res.tapIndex === 2) handleToggleVisibility()
          if (res.tapIndex === 3) handleDeletePost()
        },
      })
      return
    }
    Taro.showActionSheet({
      itemList: [bookmarked ? '取消收藏' : '收藏', '举报', '不感兴趣'],
      success: (res) => {
        if (res.tapIndex === 0) {
          handleBookmark()
        }
        if (res.tapIndex === 1) Taro.showToast({ title: '举报功能后续接入', icon: 'none' })
        if (res.tapIndex === 2) Taro.showToast({ title: '已减少推荐', icon: 'none' })
      },
    })
  }

  const handleLike = async () => {
    if (!postId) return
    // Optimistic update
    const wasLiked = liked
    setLiked(!wasLiked)
    setLikeCount((count) => wasLiked ? Math.max(0, count - 1) : count + 1)

    try {
      const res = await toggleLike({ targetId: postId })
      setLiked(res.liked)
      setLikeCount(res.likeCount)
    } catch (e) {
      // Revert on failure
      console.warn('[PostDetail] toggleLike failed', e)
      setLiked(wasLiked)
      setLikeCount((count) => wasLiked ? count + 1 : Math.max(0, count - 1))
      Taro.showToast({ title: '操作失败，请稍后再试', icon: 'none' })
    }
  }

  const handleBookmark = async () => {
    if (!postId) return
    // Optimistic update
    const wasBookmarked = bookmarked
    setBookmarked(!wasBookmarked)
    if (wasBookmarked) {
      setFavoriteCount((count) => Math.max(0, count - 1))
    } else {
      setFavoriteCount((count) => count + 1)
    }

    try {
      const res = await toggleFavorite({ targetId: postId })
      setBookmarked(res.favorited)
      setFavoriteCount(res.favoriteCount)
    } catch (e) {
      // Revert on failure
      console.warn('[PostDetail] toggleFavorite failed', e)
      setBookmarked(wasBookmarked)
      if (wasBookmarked) {
        setFavoriteCount((count) => count + 1)
      } else {
        setFavoriteCount((count) => Math.max(0, count - 1))
      }
      Taro.showToast({ title: '操作失败，请稍后再试', icon: 'none' })
    }
  }

  const handleContactAuthor = () => {
    Taro.navigateTo({
      url: `/pages/contact-request/index?userId=${encodeURIComponent(authorId)}&name=${encodeURIComponent(author.name)}&category=${encodeURIComponent('帖子交流')}&postId=${encodeURIComponent(postId)}&source=post-detail`,
    })
  }

  const getCommentName = (comment: Comment) => comment.userName || comment.author?.name || '同学'
  const getCommentAvatar = (comment: Comment) => comment.userAvatar || comment.author?.avatar || ''
  const getCommentLikes = (comment: Comment) => Number(comment.likeCount ?? comment.likes ?? 0)

  const handleCommentLike = (commentId: string) => {
    setComments((current) => current.map((comment) => {
      if (comment.id !== commentId) return comment
      const likedNext = !comment.liked
      const nextCount = likedNext ? getCommentLikes(comment) + 1 : Math.max(0, getCommentLikes(comment) - 1)
      return { ...comment, liked: likedNext, likeCount: nextCount, likes: nextCount }
    }))
  }

  const handleSendComment = async () => {
    const text = commentText.trim()
    if (!text) {
      Taro.showToast({ title: '请输入评论内容', icon: 'none' })
      return
    }
    try {
      await addComment({ postId, content: text })
      const cloudComments = await getComments({ postId })
      if (Array.isArray(cloudComments)) setComments(cloudComments)
      setCommentText('')
      Taro.showToast({ title: '评论成功', icon: 'success' })
    } catch (e) {
      console.warn('[PostDetail] add comment failed, fallback local', e)
      setComments((current) => [{
        id: `local_${Date.now()}`,
        postId,
        userId: CURRENT_USER.id,
        userName: CURRENT_USER.name,
        userAvatar: CURRENT_USER.avatar,
        author: { name: CURRENT_USER.name, avatar: CURRENT_USER.avatar },
        content: text,
        time: '刚刚',
        createdAt: '刚刚',
        likes: 0,
        likeCount: 0,
        liked: false,
        canDelete: true,
        replies: [],
      }, ...current])
      setCommentText('')
    }
  }

  const handleDeleteComment = (comment: Comment) => {
    const commentId = comment.id || comment._id || ''
    if (!commentId) return
    Taro.showModal({
      title: '确认删除',
      content: '确定要删除这条评论吗？',
      confirmText: '删除',
      confirmColor: '#EF4444',
      success: (res) => {
        if (!res.confirm) return
        apiDeleteComment({ commentId })
          .catch((e) => console.warn('[PostDetail] delete comment failed, fallback local', e))
          .finally(() => {
            setComments((current) => current.filter((item) => item.id !== commentId && item._id !== commentId))
            Taro.showToast({ title: '已删除', icon: 'success' })
          })
      },
    })
  }

  if (isMissing) {
    return (
      <View className='post-page'>
        <View className='top-nav'>
          <Text className='back' onClick={handleBack}>‹</Text>
          <Text className='nav-title'>帖子详情</Text>
          <Text className='nav-placeholder' />
        </View>
        <View className='empty-state'>
          <Text className='empty-title'>暂时没有找到这条帖子</Text>
          <Text className='empty-desc'>请返回上一页重新打开，或确认帖子 ID 是否存在。</Text>
        </View>
      </View>
    )
  }

  return (
    <View className='post-page'>
      <View className='top-nav'>
        <Text className='back' onClick={handleBack}>‹</Text>
        <Text className='nav-title'>帖子详情</Text>
        <Text className='nav-placeholder' />
      </View>

      <ScrollView scrollY className='post-scroll' showScrollbar={false}>
        <View className='page-body'>
          <View className='post-card'>
            <View className='author-row'>
              <Avatar name={author.name} avatar={author.avatar} onClick={() => goUser(authorId, author.name)} />
              <View className='author-main'>
                <View className='author-name-row'>
                  <Text className='author-name' onClick={() => goUser(authorId, author.name)}>{author.name}</Text>
                  {author.verified && <Text className='verified'>✓</Text>}
                </View>
                <Text className='author-meta'>{author.college || '浙江大学'} · {author.grade || '在读'} · {visibility === 'private' ? '私密' : '公开'}</Text>
              </View>
              <View className='author-side'>
                <Text className='time-text'>{formatTime(post.createdAt)}</Text>
                <Text className='more-action more-action--inline' onClick={handleMore}>•••</Text>
              </View>
            </View>

            <Text className='post-title'>{post.title}</Text>
            {body.map((paragraph, index) => (
              <Text key={index} className='post-paragraph'>{paragraph}</Text>
            ))}

            {images.map((image) => (
              <Image key={image} src={image} mode='aspectFill' className='post-image' />
            ))}

            {!images.length && post.cover && !isImageCover(post.cover) && (
              <View className='cover-block' style={{ background: post.cover }} />
            )}

            <View className='post-actions'>
              <View className='action' onClick={handleLike}>
                <Text className={liked ? 'action-icon active-red' : 'action-icon'}>♡</Text>
                <Text className={liked ? 'action-text active-red' : 'action-text'}>{likeCount}</Text>
              </View>
              <View className='action' onClick={handleBookmark}>
                <Text className={bookmarked ? 'action-icon active-blue' : 'action-icon'}>☆</Text>
                <Text className={bookmarked ? 'action-text active-blue' : 'action-text'}>{favoriteCount}</Text>
              </View>
              <View className='action'>
                <Text className='action-icon'>💬</Text>
                <Text className='action-text'>{commentTotal}</Text>
              </View>
              {!isOwner && (
                <>
                  <View className='action' onClick={handleContactAuthor}>
                    <Text className='action-icon active-blue'>✉</Text>
                    <Text className='action-text active-blue'>联系TA</Text>
                  </View>
                  <View className='action' onClick={() => Taro.showToast({ title: '举报功能后续接入', icon: 'none' })}>
                    <Text className='action-icon'>!</Text>
                    <Text className='action-text'>举报</Text>
                  </View>
                </>
              )}
            </View>

            {isOwner && (
              <View className='owner-panel' onClick={handleManagePost}>
                <View className='owner-copy'>
                  <Text className='owner-title'>作者工具</Text>
                  <Text className='owner-desc'>这是你发布的帖子，可查看互动数据、编辑内容或调整公开状态。</Text>
                </View>
                <Text className='owner-link'>进入管理 ›</Text>
              </View>
            )}
          </View>

          <View className='comment-card'>
            <View className='comment-header'>
              <Text className='comment-title'>评论互动</Text>
              <Text className='comment-count'>{commentTotal} 条</Text>
            </View>
            <View className='comment-input-row'>
              <Input
                className='comment-input'
                value={commentText}
                placeholder='写下你的想法...'
                onInput={(event) => setCommentText(event.detail.value)}
              />
              <View className={commentText.trim() ? 'comment-send comment-send--active' : 'comment-send'} onClick={handleSendComment}>
                <Text>发送</Text>
              </View>
            </View>
            {!comments.length ? (
              <View className='comments-empty'><Text>暂时还没有评论</Text></View>
            ) : null}
            {comments.map((comment) => {
              const name = getCommentName(comment)
              return (
                <View className='comment-item' key={comment.id || comment._id}>
                  <Avatar name={name} avatar={getCommentAvatar(comment)} onClick={() => goUser(comment.userId, name)} />
                  <View className='comment-main'>
                    <View className='comment-head'>
                      <Text className='comment-name' onClick={() => goUser(comment.userId, name)}>{name}</Text>
                      <Text className='comment-time'>{comment.createdAt || comment.time}</Text>
                    </View>
                    <Text className='comment-content'>{comment.content}</Text>
                    <View className='comment-actions'>
                      <Text className={comment.liked ? 'comment-like active-red' : 'comment-like'} onClick={() => handleCommentLike(String(comment.id || comment._id || ''))}>赞 {getCommentLikes(comment)}</Text>
                      {comment.canDelete ? <Text className='comment-delete' onClick={() => handleDeleteComment(comment)}>删除</Text> : null}
                    </View>
                  </View>
                </View>
              )
            })}
          </View>
        </View>
      </ScrollView>
    </View>
  )
}
