import { useState } from 'react'
import Taro, { useLoad } from '@tarojs/taro'
import { Image, Input, ScrollView, Text, View } from '@tarojs/components'
import { POST_COMMENTS, type Comment, type CommentReply } from '../../utils/mock'
import { getPosts } from '../../utils/api'
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

type ReplyTarget = {
  commentId: string
  userId: string
  userName: string
}

const currentUser = {
  userId: '10086',
  userName: '陈同学',
  userAvatar: '',
}

const fallbackPost: Post = {
  id: 'fallback',
  title: '帖子详情',
  content: '暂时没有找到这条帖子，请返回发现页重新打开。',
  tags: ['发现'],
  authorId: '10086',
  author: { id: '10086', userId: '10086', name: '陈同学', college: '浙江大学', grade: '在读', avatar: '' },
  likes: 0,
  comments: 0,
}

function getRecordId(post: Post) {
  return String(post.id || post._id || '')
}

function getAuthor(post: Post) {
  return post.author || { id: post.authorId || post.userId || '10086', userId: post.authorId || post.userId || '10086', name: '陈同学', college: '浙江大学', grade: '在读', avatar: '' }
}

function getAuthorId(post: Post) {
  const author = getAuthor(post)
  return author.userId || author.id || post.authorId || post.userId || ''
}

function getUserName(comment: Comment) {
  return comment.userName || comment.author?.name || '同学'
}

function getUserAvatar(comment: Comment) {
  return comment.userAvatar || comment.author?.avatar || ''
}

function getCommentLikes(comment: Comment) {
  return Number(comment.likeCount ?? comment.likes ?? 0)
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
  const [liked, setLiked] = useState(false)
  const [bookmarked, setBookmarked] = useState(false)
  const [likeCount, setLikeCount] = useState(0)
  const [comments, setComments] = useState<Comment[]>(POST_COMMENTS)
  const [commentText, setCommentText] = useState('')
  const [replyTarget, setReplyTarget] = useState<ReplyTarget | null>(null)

  useLoad(async (options) => {
    const id = decodeURIComponent(String(options?.id || ''))
    const pending = Taro.getStorageSync('pendingPost')

    if (pending && (pending.id === id || pending._id === id)) {
      setPost(pending)
      setLikeCount(Number(pending.likes || 0))
      return
    }

    try {
      const posts = await getPosts({ page: 0 })
      const found = posts.find((item: Post) => getRecordId(item) === id)
      const nextPost = found || fallbackPost
      setPost(nextPost)
      setLikeCount(Number(nextPost.likes || 0))
    } catch (e) {
      console.warn('[PostDetail] load post failed', e)
      setPost(fallbackPost)
      setLikeCount(0)
    }
  })

  const author = getAuthor(post)
  const authorId = getAuthorId(post)
  const body = (post.content || post.excerpt || '').split('\n').filter(Boolean)
  const images = post.images?.length ? post.images : isImageCover(post.cover) ? [post.cover!] : []
  const commentTotal = comments.reduce((total, comment) => total + 1 + (comment.replies?.length || 0), 0)

  const handleBack = () => Taro.navigateBack()
  const goUser = (userId?: string, name?: string) => {
    if (!userId) {
      Taro.showToast({ title: '用户信息不存在', icon: 'none' })
      return
    }
    const query = [`userId=${encodeURIComponent(userId)}`]
    if (name) query.push(`name=${encodeURIComponent(name)}`)
    Taro.navigateTo({ url: `/pages/user-detail/index?${query.join('&')}` })
  }

  const startReply = (comment: Comment) => {
    const userId = comment.userId || ''
    const userName = getUserName(comment)
    if (!userId) {
      Taro.showToast({ title: '用户信息不存在', icon: 'none' })
      return
    }
    setReplyTarget({ commentId: comment.id, userId, userName })
  }

  const handleLike = () => {
    setLiked(!liked)
    setLikeCount((count) => liked ? Math.max(0, count - 1) : count + 1)
  }

  const handleCommentLike = (commentId: string) => {
    setComments((current) => current.map((comment) => {
      if (comment.id !== commentId) return comment
      const nextLiked = !comment.liked
      const nextCount = nextLiked ? getCommentLikes(comment) + 1 : Math.max(0, getCommentLikes(comment) - 1)
      return { ...comment, liked: nextLiked, likeCount: nextCount, likes: nextCount }
    }))
  }

  const handleSendComment = () => {
    const text = commentText.trim()
    if (!text) {
      Taro.showToast({ title: '请输入内容', icon: 'none' })
      return
    }

    if (replyTarget) {
      const reply: CommentReply = {
        id: `reply_${Date.now()}`,
        commentId: replyTarget.commentId,
        userId: currentUser.userId,
        userName: currentUser.userName,
        userAvatar: currentUser.userAvatar,
        replyToUserId: replyTarget.userId,
        replyToUserName: replyTarget.userName,
        content: text,
        createdAt: '刚刚',
      }
      setComments((current) => current.map((comment) => (
        comment.id === replyTarget.commentId
          ? { ...comment, replies: [...(comment.replies || []), reply] }
          : comment
      )))
    } else {
      const comment: Comment = {
        id: `local_${Date.now()}`,
        postId: getRecordId(post),
        userId: currentUser.userId,
        userName: currentUser.userName,
        userAvatar: currentUser.userAvatar,
        author: { name: currentUser.userName, avatar: currentUser.userAvatar },
        content: text,
        time: '刚刚',
        createdAt: '刚刚',
        likes: 0,
        likeCount: 0,
        liked: false,
        replies: [],
      }
      setComments((current) => [comment, ...current])
    }

    setCommentText('')
    setReplyTarget(null)
    Taro.showToast({ title: replyTarget ? '回复成功' : '评论成功', icon: 'success' })
  }

  return (
    <View className='post-page'>
      <View className='top-nav'>
        <Text className='back' onClick={handleBack}>‹</Text>
        <Text className='nav-title'>帖子详情</Text>
        <View className='nav-placeholder' />
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
                <Text className='author-meta'>{author.college || '浙江大学'} · {author.grade || '在读'}</Text>
              </View>
              <Text className='time-text'>{formatTime(post.createdAt)}</Text>
            </View>

            <View className='tag-row'>
              {(post.tags || [post.mainCategory || '发现']).map((tag) => (
                <Text key={tag} className='post-tag'>{tag}</Text>
              ))}
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
              <View className='action'>
                <Text className='action-icon'>💬</Text>
                <Text className='action-text'>{commentTotal}</Text>
              </View>
              <View className='action' onClick={() => { setBookmarked(!bookmarked); Taro.showToast({ title: bookmarked ? '已取消收藏' : '已收藏', icon: 'none' }) }}>
                <Text className={bookmarked ? 'action-icon active-blue' : 'action-icon'}>☆</Text>
                <Text className={bookmarked ? 'action-text active-blue' : 'action-text'}>收藏</Text>
              </View>
            </View>
          </View>

          <View className='comment-card'>
            <Text className='comment-title'>评论 ({commentTotal})</Text>

            {comments.map((comment) => {
              const userName = getUserName(comment)
              return (
                <View key={comment.id} className='comment-item'>
                  <Avatar name={userName} avatar={getUserAvatar(comment)} onClick={() => goUser(comment.userId, userName)} />
                  <View className='comment-main'>
                    <View className='comment-head'>
                      <Text className='comment-name' onClick={() => goUser(comment.userId, userName)}>{userName}</Text>
                      <Text className='comment-time'>{comment.createdAt || comment.time}</Text>
                    </View>
                    <Text className='comment-content' onClick={() => startReply(comment)}>{comment.content}</Text>
                    <View className='comment-actions'>
                      <Text className={comment.liked ? 'comment-like active-red' : 'comment-like'} onClick={() => handleCommentLike(comment.id)}>赞 {getCommentLikes(comment)}</Text>
                      <Text className='reply-btn' onClick={() => startReply(comment)}>回复</Text>
                    </View>

                    {!!comment.replies?.length && (
                      <View className='reply-list'>
                        {comment.replies.map((reply) => (
                          <View className='reply-item' key={reply.id}>
                            <Text className='reply-user' onClick={() => goUser(reply.userId, reply.userName)}>{reply.userName}</Text>
                            <Text className='reply-copy'> 回复 </Text>
                            <Text className='reply-user' onClick={() => goUser(reply.replyToUserId, reply.replyToUserName)}>{reply.replyToUserName}</Text>
                            <Text className='reply-copy'>：{reply.content}</Text>
                            <Text className='reply-time'>{reply.createdAt}</Text>
                          </View>
                        ))}
                      </View>
                    )}
                  </View>
                </View>
              )
            })}
          </View>
        </View>
      </ScrollView>

      <View className='input-bar'>
        {replyTarget && (
          <View className='replying-row'>
            <Text>正在回复 {replyTarget.userName}</Text>
            <Text className='cancel-reply' onClick={() => setReplyTarget(null)}>取消</Text>
          </View>
        )}
        <View className='input-row'>
          <Input
            placeholder={replyTarget ? `回复 ${replyTarget.userName}...` : '写评论...'}
            value={commentText}
            onInput={(e) => setCommentText(e.detail.value)}
            className='comment-input'
          />
          <View className={commentText.trim() ? 'send-btn active' : 'send-btn'} onClick={handleSendComment}>
            <Text>发送</Text>
          </View>
        </View>
      </View>
    </View>
  )
}
