import { useState } from 'react'
import Taro, { useLoad } from '@tarojs/taro'
import { Text, Textarea, View } from '@tarojs/components'
import { sendChatMessage } from '../../../api'
import './index.scss'

type ContactOptions = {
  userId?: string
  id?: string
  name?: string
  category?: string
  skillId?: string
  proofId?: string
  postId?: string
  source?: string
}

function decode(value?: string) {
  return decodeURIComponent(String(value || ''))
}

export default function ContactRequest() {
  const [targetId, setTargetId] = useState('')
  const [targetName, setTargetName] = useState('同学')
  const [category, setCategory] = useState('交流')
  const [skillId, setSkillId] = useState('')
  const [proofId, setProofId] = useState('')
  const [postId, setPostId] = useState('')
  const [source, setSource] = useState('')
  const [message, setMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useLoad((options: ContactOptions) => {
    const nextId = decode(options.userId || options.id)
    const nextName = decode(options.name) || '同学'
    const nextCategory = decode(options.category) || '交流'
    setTargetId(nextId)
    setTargetName(nextName)
    setCategory(nextCategory)
    setSkillId(decode(options.skillId))
    setProofId(decode(options.proofId))
    setPostId(decode(options.postId))
    setSource(decode(options.source))
    setMessage(`你好，我想和你交流${nextCategory}相关内容。`)
  })

  const goBack = () => Taro.navigateBack()

  const handleSubmit = async () => {
    if (submitting) return
    const text = message.trim()
    if (!targetId) {
      Taro.showToast({ title: '用户信息不存在', icon: 'none' })
      return
    }
    if (!text) {
      Taro.showToast({ title: '请输入申请内容', icon: 'none' })
      return
    }

    setSubmitting(true)
    try {
      await sendChatMessage({
        targetId,
        targetName,
        category,
        text,
      })
      Taro.setStorageSync('lastContactRequest', {
        id: `contact_${Date.now()}`,
        toUserId: targetId,
        targetName,
        category,
        skillId,
        proofId,
        postId,
        source,
        message: text,
        createdAt: new Date().toISOString(),
        status: 'sent',
      })
      Taro.showToast({ title: '已发送联系申请', icon: 'success' })
      Taro.navigateTo({
        url: `/sp-social/pages/chat/index?id=${encodeURIComponent(targetId)}&name=${encodeURIComponent(targetName)}&category=${encodeURIComponent(category)}`,
      })
    } catch (e) {
      console.warn('[ContactRequest] send failed', e)
      Taro.showToast({ title: '发送失败，请稍后重试', icon: 'none' })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <View className='contact-page'>
      <View className='contact-nav'>
        <Text className='nav-back' onClick={goBack}>‹</Text>
        <Text className='nav-title'>联系申请</Text>
        <Text className='nav-more'>•••</Text>
      </View>

      <View className='contact-body'>
        <View className='profile-card'>
          <View className='avatar'>
            <Text>{targetName.charAt(0) || '同'}</Text>
          </View>
          <View className='profile-main'>
            <Text className='name'>{targetName}</Text>
            <Text className='meta'>{category}</Text>
          </View>
          <Text className='status'>待确认</Text>
        </View>

        <View className='info-card'>
          <Text className='section-title'>申请说明</Text>
          <Textarea
            className='message-input'
            value={message}
            maxlength={160}
            placeholder='简单说明你想交流的内容'
            onInput={(event) => setMessage(event.detail.value)}
          />
          <Text className='hint'>发送后会进入聊天页，后续沟通记录会保存在消息中。</Text>
        </View>

        <View className='info-card'>
          <Text className='section-title'>关联信息</Text>
          <View className='detail-row'>
            <Text className='detail-label'>交流类型</Text>
            <Text className='detail-value'>{category}</Text>
          </View>
          {!!skillId && (
            <View className='detail-row'>
              <Text className='detail-label'>关联技能</Text>
              <Text className='detail-value'>{skillId}</Text>
            </View>
          )}
          {!!proofId && (
            <View className='detail-row'>
              <Text className='detail-label'>证明材料</Text>
              <Text className='detail-value'>{proofId}</Text>
            </View>
          )}
          {!!postId && (
            <View className='detail-row'>
              <Text className='detail-label'>关联帖子</Text>
              <Text className='detail-value'>{postId}</Text>
            </View>
          )}
        </View>
      </View>

      <View className='bottom-bar'>
        <View className='submit-btn' onClick={handleSubmit}>
          <Text>{submitting ? '发送中...' : '发送申请'}</Text>
        </View>
      </View>
    </View>
  )
}

