import { useState } from 'react'
import Taro from '@tarojs/taro'
import { View, Text, Image, ScrollView, Input } from '@tarojs/components'
import { POST_DETAIL, COMMENTS } from '../../utils/mock'
import './index.css'

export default function PostDetail() {
  const [liked, setLiked] = useState(false)
  const [bookmarked, setBookmarked] = useState(false)
  const [likeCount, setLikeCount] = useState(POST_DETAIL.likes)
  const [comments] = useState(COMMENTS)
  const [commentText, setCommentText] = useState('')

  const handleBack = () => Taro.navigateBack()
  const handleUserClick = (name: string) => Taro.navigateTo({ url: `/pages/user-detail/index?name=${encodeURIComponent(name)}` })

  const handleLike = () => {
    setLiked(!liked)
    setLikeCount((c) => liked ? c - 1 : c + 1)
  }

  const handleSendComment = () => {
    if (!commentText.trim()) return
    Taro.showToast({ title: '璇勮鎴愬姛', icon: 'success' })
    setCommentText('')
  }

  return (
    <View style={{ minHeight: '100vh', backgroundColor: '#F8FAFC' }}>
      {/* Nav Bar */}
      <View style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 16px', backgroundColor: '#FFF', borderBottom: '1px solid #F1F5F9', position: 'sticky', top: 0, zIndex: 10 }}>
        <View onClick={handleBack} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <Text style={{ fontSize: '20px', color: '#64748B' }}>←</Text>
        </View>
        <Text style={{ fontSize: '16px', fontWeight: '600', color: '#1E293B' }}>甯栧瓙璇︽儏</Text>
        <View style={{ display: 'flex', gap: '12px' }}>
          <Text style={{ fontSize: '18px', color: '#64748B' }}>←</Text>
          <Text style={{ fontSize: '18px', color: '#64748B' }}>⬅</Text>
        </View>
      </View>

      <ScrollView>
        <View style={{ padding: '16px', paddingBottom: '80px' }}>
        {/* Author */}
        <View style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
          <View onClick={() => handleUserClick(POST_DETAIL.author.name)} style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#E2E8F0' }} />
          <View style={{ flex: 1 }}>
            <View style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Text style={{ fontSize: '15px', fontWeight: '600', color: '#1E293B' }}>{POST_DETAIL.author.name}</Text>
              {POST_DETAIL.author.verified && <Text style={{ fontSize: '12px', color: '#2563EB' }}>✓</Text>}
            </View>
            <Text style={{ fontSize: '12px', color: '#94A3B8' }}>{POST_DETAIL.author.college} 路 {POST_DETAIL.author.grade}</Text>
          </View>
          <Text style={{ fontSize: '11px', color: '#94A3B8' }}>{POST_DETAIL.time}</Text>
        </View>

        {/* Tags */}
        <View style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '12px' }}>
          {POST_DETAIL.tags.map((t) => (
            <View key={t} style={{ backgroundColor: '#EFF6FF', borderRadius: '100px', padding: '3px 10px' }}>
              <Text style={{ fontSize: '12px', color: '#2563EB' }}>{t}</Text>
            </View>
          ))}
        </View>

        {/* Title */}
        <Text style={{ fontSize: '18px', fontWeight: '700', color: '#1E293B', lineHeight: '1.4', marginBottom: '12px' }}>
          {POST_DETAIL.title}
        </Text>

        {/* Body */}
        {POST_DETAIL.body.map((para, i) => (
          <Text key={i} style={{ fontSize: '15px', color: '#334155', lineHeight: '1.7', marginBottom: '8px' }}>{para}</Text>
        ))}

        {/* Actions */}
        <View style={{ display: 'flex', gap: '20px', marginTop: '20px', marginBottom: '16px', padding: '12px 0', borderTop: '1px solid #E2E8F0', borderBottom: '1px solid #E2E8F0' }}>
          <View onClick={handleLike} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Text style={{ fontSize: '18px', color: liked ? '#EF4444' : '#94A3B8' }}>{liked ? '❤' : '♡'}</Text>
            <Text style={{ fontSize: '13px', color: liked ? '#EF4444' : '#94A3B8' }}>{likeCount}</Text>
          </View>
          <View style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Text style={{ fontSize: '18px', color: '#94A3B8' }}>💬</Text>
            <Text style={{ fontSize: '13px', color: '#94A3B8' }}>{POST_DETAIL.comments}</Text>
          </View>
          <View onClick={() => { setBookmarked(!bookmarked); Taro.showToast({ title: bookmarked ? '鍙栨秷鏀惰棌' : '鏀惰棌鎴愬姛', icon: 'none' }) }}
            style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Text style={{ fontSize: '18px', color: bookmarked ? '#2563EB' : '#94A3B8' }}>{bookmarked ? '馃敄' : '馃敄'}</Text>
          </View>
        </View>

        {/* Comments Section */}
        <Text style={{ fontSize: '16px', fontWeight: '600', color: '#1E293B', marginBottom: '10px' }}>
          璇勮 ({comments.length})
        </Text>

        {comments.map((c) => (
          <View key={c.id} style={{ display: 'flex', gap: '10px', marginBottom: '14px' }}>
            <View style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#E2E8F0', flexShrink: 0 }} />
            <View style={{ flex: 1 }}>
              <View style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Text style={{ fontSize: '13px', fontWeight: '600', color: '#1E293B' }}>{c.author.name}</Text>
                <Text style={{ fontSize: '11px', color: '#94A3B8' }}>{c.time}</Text>
              </View>
              <Text style={{ fontSize: '14px', color: '#334155', marginTop: '2px', lineHeight: '1.5' }}>{c.content}</Text>
              <Text style={{ fontSize: '11px', color: '#94A3B8', marginTop: '4px' }}>鉂?{c.likes}</Text>
            </View>
          </View>
        ))}
      </View>
      </ScrollView>

      {/* Comment Input */}
      <View style={{
        position: 'fixed', bottom: 0, left: 0, right: 0, backgroundColor: '#FFF',
        borderTop: '1px solid #E2E8F0', padding: '8px 16px',
        display: 'flex', alignItems: 'center', gap: '8px',
        paddingBottom: 'calc(8px + env(safe-area-inset-bottom, 0px))'
      }}>
        <Input
          placeholder='鍐欎笅浣犵殑璇勮...'
          value={commentText}
          onInput={(e) => setCommentText(e.detail.value)}
          style={{ flex: 1, padding: '8px 12px', backgroundColor: '#F1F5F9', borderRadius: '8px', fontSize: '14px' }}
        />
        <View onClick={handleSendComment}
          style={{ padding: '8px 14px', backgroundColor: commentText.trim() ? '#2563EB' : '#E2E8F0', borderRadius: '8px' }}>
          <Text style={{ fontSize: '14px', color: commentText.trim() ? '#FFF' : '#94A3B8' }}>鍙戦€</Text>
        </View>
      </View>
    </View>
  )
}
