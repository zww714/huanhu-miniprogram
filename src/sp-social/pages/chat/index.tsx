import { useEffect, useMemo, useState } from 'react'
import Taro, { useLoad } from '@tarojs/taro'
import { Input, ScrollView, Text, View } from '@tarojs/components'
import { getChatMessages, sendChatMessage } from '../../../utils/api'
import './index.css'

type ChatMessage = {
  id: string
  text: string
  sender: 'me' | 'other'
  time: string
}

export default function Chat() {
  const [targetId, setTargetId] = useState('')
  const [targetName, setTargetName] = useState('同学')
  const [category, setCategory] = useState('聊天')
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)

  const loadMessages = async (nextTargetId = targetId) => {
    if (!nextTargetId) return
    try {
      const data = await getChatMessages({ targetId: nextTargetId })
      setMessages(data)
    } catch (e) {
      console.warn('[Chat] load messages failed', e)
    }
  }

  useLoad((options) => {
    const id = decodeURIComponent(String(options?.id || 'default_user'))
    const name = decodeURIComponent(String(options?.name || '同学'))
    const nextCategory = decodeURIComponent(String(options?.category || '聊天'))

    setTargetId(id)
    setTargetName(name)
    setCategory(nextCategory)
    loadMessages(id)
  })

  useEffect(() => {
    if (!targetId) return undefined
    const timer = setInterval(() => {
      loadMessages(targetId)
    }, 2000)
    return () => clearInterval(timer)
  }, [targetId])

  const canSend = useMemo(() => !!input.trim() && !!targetId && !sending, [input, sending, targetId])

  const handleSend = async () => {
    const text = input.trim()
    if (!text || !targetId || sending) return

    setSending(true)
    setInput('')
    try {
      const message = await sendChatMessage({
        targetId,
        targetName,
        category,
        text,
      })
      setMessages((current) => [...current, message])
      setTimeout(() => loadMessages(targetId), 300)
    } catch (e) {
      console.warn('[Chat] send failed', e)
      Taro.showToast({ title: '发送失败，请检查网络', icon: 'none' })
      setInput(text)
    } finally {
      setSending(false)
    }
  }

  return (
    <View style={{ height: '100vh', backgroundColor: '#F8FAFC', display: 'flex', flexDirection: 'column' }}>
      <View style={{ backgroundColor: '#FFF', padding: '10px 16px', borderBottom: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <Text onClick={() => Taro.navigateBack()} style={{ fontSize: '22px', color: '#1E293B' }}>‹</Text>
        <View style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ color: '#FFF', fontSize: '16px', fontWeight: '600' }}>{targetName[0] || '同'}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: '16px', fontWeight: '600', color: '#1E293B' }}>{targetName}</Text>
          <Text style={{ fontSize: '12px', color: '#94A3B8', marginTop: '2px' }}>{category} · 云端同步中</Text>
        </View>
      </View>

      <ScrollView scrollY style={{ flex: 1, minHeight: 0 }} scrollIntoView={messages.length ? `msg-${messages[messages.length - 1].id}` : undefined}>
        <View style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {!messages.length && (
            <View style={{ padding: '28px 12px', textAlign: 'center' }}>
              <Text style={{ fontSize: '13px', color: '#94A3B8' }}>开始和 {targetName} 聊天吧</Text>
            </View>
          )}
          {messages.map((message) => {
            const mine = message.sender === 'me'
            return (
              <View id={`msg-${message.id}`} key={message.id} style={{ display: 'flex', justifyContent: mine ? 'flex-end' : 'flex-start' }}>
                <View style={{ maxWidth: '72%', display: 'flex', flexDirection: 'column', alignItems: mine ? 'flex-end' : 'flex-start' }}>
                  <View style={{
                    padding: '9px 12px',
                    borderRadius: '12px',
                    backgroundColor: mine ? '#2563EB' : '#FFF',
                    border: mine ? '1px solid #2563EB' : '1px solid #E2E8F0',
                  }}>
                    <Text style={{ fontSize: '14px', color: mine ? '#FFF' : '#1E293B', lineHeight: '20px' }}>
                      {message.text}
                    </Text>
                  </View>
                  <Text style={{ fontSize: '10px', color: '#94A3B8', marginTop: '4px' }}>{message.time}</Text>
                </View>
              </View>
            )
          })}
        </View>
      </ScrollView>

      <View style={{ padding: '10px 12px', backgroundColor: '#FFF', borderTop: '1px solid #E2E8F0', display: 'flex', gap: '8px', alignItems: 'center' }}>
        <View style={{ flex: 1, minHeight: '40px', backgroundColor: '#F1F5F9', borderRadius: '20px', display: 'flex', alignItems: 'center', padding: '0 14px' }}>
          <Input
            value={input}
            confirmType="send"
            placeholder="输入消息..."
            onInput={(e) => setInput(e.detail.value)}
            onConfirm={handleSend}
            style={{ width: '100%', height: '38px', fontSize: '14px', color: '#1E293B' }}
          />
        </View>
        <View
          onClick={handleSend}
          style={{
            width: '58px',
            height: '38px',
            borderRadius: '19px',
            backgroundColor: canSend ? '#2563EB' : '#CBD5E1',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Text style={{ fontSize: '14px', color: '#FFF', fontWeight: '600' }}>{sending ? '...' : '发送'}</Text>
        </View>
      </View>
    </View>
  )
}
