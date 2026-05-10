import { useState } from 'react'
import Taro, { useLoad } from '@tarojs/taro'
import { Image, Input, ScrollView, Text, View } from '@tarojs/components'
import { COMMENTS } from '../../utils/mock'
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
  author?: {
    name: string
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
  author: { name: '陈同学', college: '浙江大学', grade: '在读' },
  likes: 0,
  comments: 0,
}

function getRecordId(post: Post) {
  return String(post.id || post._id || '')
}

function getAuthor(post: Post) {
  return post.author || { name: '陈同学', college: '浙江大学', grade: '在读' }
}

function isImageCover(cover?: string) {
  return !!cover && !cover.startsWith('linear-gradient')
}

function formatTime(value?: string) {
  if (!value) return '刚刚'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '刚刚'
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hour = String(date.getHours()).padStart(2, '0')
  const minute = String(date.getMinutes()).padStart(2, '0')
  return `${month}-${day} ${hour}:${minute}`
}

export default function PostDetail() {
  const [post, setPost] = useState<Post>(fallbackPost)
  const [liked, setLiked] = useState(false)
  const [bookmarked, setBookmarked] = useState(false)
  const [likeCount, setLikeCount] = useState(0)
  const [comments, setComments] = useState(COMMENTS)
  const [commentText, setCommentText] = useState('')

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
  const body = (post.content || post.excerpt || '').split('\n').filter(Boolean)
  const images = post.images?.length ? post.images : isImageCover(post.cover) ? [post.cover!] : []

  const handleBack = () => Taro.navigateBack()
  const handleUserClick = (name: string) => Taro.navigateTo({ url: `/pages/user-detail/index?name=${encodeURIComponent(name)}` })

  const handleLike = () => {
    setLiked(!liked)
    setLikeCount((count) => liked ? Math.max(0, count - 1) : count + 1)
  }

  const handleSendComment = () => {
    const text = commentText.trim()
    if (!text) return
    setComments([
      {
        id: `local_${Date.now()}`,
        author: { name: '我' },
        content: text,
        time: '刚刚',
        likes: 0,
      },
      ...comments,
    ])
    Taro.showToast({ title: '评论成功', icon: 'success' })
    setCommentText('')
  }

  return (
    <View style={{ minHeight: '100vh', backgroundColor: '#F8FAFC' }}>
      <View style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 16px', backgroundColor: '#FFF', borderBottom: '1px solid #F1F5F9', position: 'sticky', top: 0, zIndex: 10 }}>
        <View onClick={handleBack} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <Text style={{ fontSize: '22px', color: '#1E293B' }}>‹</Text>
        </View>
        <Text style={{ fontSize: '16px', fontWeight: '600', color: '#1E293B' }}>帖子详情</Text>
        <View style={{ width: '22px' }} />
      </View>

      <ScrollView scrollY style={{ height: 'calc(100vh - 52px)' }}>
        <View style={{ padding: '16px', paddingBottom: '88px' }}>
          <View style={{ backgroundColor: '#FFF', borderRadius: '14px', padding: '16px', border: '1px solid #E2E8F0' }}>
            <View style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
              <View onClick={() => handleUserClick(author.name)} style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ fontSize: '16px', color: '#FFF', fontWeight: '600' }}>{author.name[0] || '同'}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <View style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Text style={{ fontSize: '15px', fontWeight: '600', color: '#1E293B' }}>{author.name}</Text>
                  {author.verified && <Text style={{ fontSize: '12px', color: '#2563EB' }}>✓</Text>}
                </View>
                <Text style={{ fontSize: '12px', color: '#94A3B8' }}>{author.college || '浙江大学'} · {author.grade || '在读'}</Text>
              </View>
              <Text style={{ fontSize: '11px', color: '#94A3B8' }}>{formatTime(post.createdAt)}</Text>
            </View>

            <View style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '12px' }}>
              {(post.tags || [post.mainCategory || '发现']).map((tag) => (
                <View key={tag} style={{ backgroundColor: '#EFF6FF', borderRadius: '100px', padding: '3px 10px' }}>
                  <Text style={{ fontSize: '12px', color: '#2563EB' }}>{tag}</Text>
                </View>
              ))}
            </View>

            <Text style={{ fontSize: '18px', fontWeight: '700', color: '#1E293B', lineHeight: '26px', marginBottom: '12px' }}>
              {post.title}
            </Text>

            {body.map((paragraph, index) => (
              <Text key={index} style={{ fontSize: '15px', color: '#334155', lineHeight: '25px', marginBottom: '8px' }}>
                {paragraph}
              </Text>
            ))}

            {images.map((image) => (
              <Image
                key={image}
                src={image}
                mode="aspectFill"
                style={{ width: '100%', height: '180px', borderRadius: '10px', marginTop: '12px', backgroundColor: '#E2E8F0' }}
              />
            ))}

            {!images.length && post.cover && !isImageCover(post.cover) && (
              <View style={{ height: '140px', borderRadius: '10px', marginTop: '12px', background: post.cover }} />
            )}

            <View style={{ display: 'flex', gap: '20px', marginTop: '20px', marginBottom: '4px', padding: '12px 0', borderTop: '1px solid #E2E8F0', borderBottom: '1px solid #E2E8F0' }}>
              <View onClick={handleLike} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Text style={{ fontSize: '18px', color: liked ? '#EF4444' : '#94A3B8' }}>{liked ? '♥' : '♡'}</Text>
                <Text style={{ fontSize: '13px', color: liked ? '#EF4444' : '#94A3B8' }}>{likeCount}</Text>
              </View>
              <View style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Text style={{ fontSize: '18px', color: '#94A3B8' }}>💬</Text>
                <Text style={{ fontSize: '13px', color: '#94A3B8' }}>{comments.length}</Text>
              </View>
              <View onClick={() => { setBookmarked(!bookmarked); Taro.showToast({ title: bookmarked ? '已取消收藏' : '已收藏', icon: 'none' }) }}
                style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Text style={{ fontSize: '18px', color: bookmarked ? '#2563EB' : '#94A3B8' }}>{bookmarked ? '★' : '☆'}</Text>
                <Text style={{ fontSize: '13px', color: bookmarked ? '#2563EB' : '#94A3B8' }}>收藏</Text>
              </View>
            </View>
          </View>

          <View style={{ marginTop: '12px', backgroundColor: '#FFF', borderRadius: '14px', padding: '16px', border: '1px solid #E2E8F0' }}>
            <Text style={{ fontSize: '16px', fontWeight: '600', color: '#1E293B', marginBottom: '10px' }}>
              评论 ({comments.length})
            </Text>

            {comments.map((comment) => (
              <View key={comment.id} style={{ display: 'flex', gap: '10px', marginBottom: '14px' }}>
                <View style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#E2E8F0', flexShrink: 0 }} />
                <View style={{ flex: 1 }}>
                  <View style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Text style={{ fontSize: '13px', fontWeight: '600', color: '#1E293B' }}>{comment.author.name}</Text>
                    <Text style={{ fontSize: '11px', color: '#94A3B8' }}>{comment.time}</Text>
                  </View>
                  <Text style={{ fontSize: '14px', color: '#334155', marginTop: '2px', lineHeight: '21px' }}>{comment.content}</Text>
                  <Text style={{ fontSize: '11px', color: '#94A3B8', marginTop: '4px' }}>赞 {comment.likes}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      <View style={{
        position: 'fixed', bottom: 0, left: 0, right: 0, backgroundColor: '#FFF',
        borderTop: '1px solid #E2E8F0', padding: '8px 16px',
        display: 'flex', alignItems: 'center', gap: '8px',
        paddingBottom: 'calc(8px + env(safe-area-inset-bottom, 0px))',
      }}>
        <Input
          placeholder="写下你的评论..."
          value={commentText}
          onInput={(e) => setCommentText(e.detail.value)}
          style={{ flex: 1, padding: '8px 12px', backgroundColor: '#F1F5F9', borderRadius: '8px', fontSize: '14px' }}
        />
        <View onClick={handleSendComment}
          style={{ padding: '8px 14px', backgroundColor: commentText.trim() ? '#2563EB' : '#E2E8F0', borderRadius: '8px' }}>
          <Text style={{ fontSize: '14px', color: commentText.trim() ? '#FFF' : '#94A3B8' }}>发送</Text>
        </View>
      </View>
    </View>
  )
}
