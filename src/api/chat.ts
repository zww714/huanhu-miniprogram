/**
 * API 聊天模块 — 对话列表、消息发送/接收
 */
import {
  initCloud, delay, apiWarn, USE_CLOUD,
  getAllCloudDocuments, addCloudDocument,
  CHAT_USER_KEY, LOCAL_MESSAGES_KEY, LOCAL_CONVERSATIONS_KEY,
} from './base'
import { login } from './user'
import { CONVERSATIONS } from '../utils/mock'
import type { Conversation } from '../utils/mock'

// ============ 本地聊天工具函数 ============
function getLocalChatUser() {
  const saved = wx.getStorageSync(CHAT_USER_KEY)
  if (saved?.id) return saved
  const user = { id: `local_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`, name: '我' }
  wx.setStorageSync(CHAT_USER_KEY, user)
  return user
}

export async function getCurrentChatUser() {
  if (USE_CLOUD) {
    try {
      const userData = await login()
      if (userData?._id) {
        const user = { id: userData._id, name: userData.name || '我' }
        wx.setStorageSync(CHAT_USER_KEY, user)
        return user
      }
    } catch (e) { apiWarn('[API] getCurrentChatUser login failed', e) }
  }
  return getLocalChatUser()
}

function buildConversationId(a: string, b: string) {
  return [a, b].sort().join('__')
}

function formatChatTime(timestamp = Date.now()) {
  const date = new Date(timestamp)
  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
}

function getLocalMessageStore(): Record<string, any[]> {
  const data = wx.getStorageSync(LOCAL_MESSAGES_KEY)
  return data && typeof data === 'object' ? data : {}
}

function saveLocalMessages(conversationId: string, messages: any[]) {
  const store = getLocalMessageStore()
  store[conversationId] = messages
  wx.setStorageSync(LOCAL_MESSAGES_KEY, store)
}

function upsertLocalConversation(conversation: any) {
  const data = wx.getStorageSync(LOCAL_CONVERSATIONS_KEY)
  const list = Array.isArray(data) ? data : []
  wx.setStorageSync(LOCAL_CONVERSATIONS_KEY, [
    conversation,
    ...list.filter((item: any) => item.id !== conversation.id),
  ])
}

function normalizeChatMessage(message: any, currentUserId: string) {
  return {
    id: message.id || message._id || String(message.createdAtMs),
    text: message.text || '',
    sender: message.senderId === currentUserId ? 'me' : 'other',
    senderId: message.senderId,
    senderName: message.senderName,
    time: message.time || formatChatTime(message.createdAtMs),
    createdAtMs: Number(message.createdAtMs || 0),
  }
}

// ============ 对话列表 ============
export async function getConversations() {
  if (USE_CLOUD) {
    try {
      const res = await callCloudFunction('getConversations')
      return res.data as Conversation[]
    } catch (e) { apiWarn('[API] getConversations cloud failed', e) }
  }
  await delay()
  return CONVERSATIONS
}

// ============ 消息 ============
export async function getChatMessages(params: { targetId: string }) {
  const currentUser = await getCurrentChatUser()
  const conversationId = buildConversationId(currentUser.id, params.targetId)
  if (USE_CLOUD) {
    try {
      const messages = await getAllCloudDocuments('messages', 100)
      const cloudMessages = messages
        .filter((m) => m.conversationId === conversationId)
        .map((m) => normalizeChatMessage(m, currentUser.id))
        .sort((a, b) => a.createdAtMs - b.createdAtMs)
      if (cloudMessages.length) return cloudMessages
    } catch (e) { apiWarn('[API] getChatMessages cloud failed', e) }
  }
  const store = getLocalMessageStore()
  return (store[conversationId] || []).map((m) => normalizeChatMessage(m, currentUser.id))
}

export async function sendChatMessage(params: {
  targetId: string; targetName: string; category?: string; text: string
}) {
  const currentUser = await getCurrentChatUser()
  const conversationId = buildConversationId(currentUser.id, params.targetId)
  const createdAtMs = Date.now()
  const message = {
    conversationId, participants: [currentUser.id, params.targetId],
    senderId: currentUser.id, senderName: currentUser.name || '我',
    targetId: params.targetId, targetName: params.targetName,
    text: params.text, time: formatChatTime(createdAtMs), createdAtMs,
    category: params.category || '聊天',
  }

  if (USE_CLOUD) {
    try {
      const res = await addCloudDocument('messages', message)
      return normalizeChatMessage({ ...message, id: res._id, _id: res._id }, currentUser.id)
    } catch (e) { apiWarn('[API] sendChatMessage cloud failed', e) }
  }

  const store = getLocalMessageStore()
  const next = [...(store[conversationId] || []), message]
  saveLocalMessages(conversationId, next)
  upsertLocalConversation({
    id: params.targetId, name: params.targetName,
    lastMessage: params.text, timestamp: message.time,
    unread: 0, category: params.category || '聊天',
  })
  return normalizeChatMessage(message, currentUser.id)
}

export async function getChatConversations() {
  const currentUser = await getCurrentChatUser()
  const localData = wx.getStorageSync(LOCAL_CONVERSATIONS_KEY)
  const localConversations = Array.isArray(localData) ? localData : []

  if (USE_CLOUD) {
    try {
      const messages = await getAllCloudDocuments('messages', 200)
      const grouped: Record<string, any> = {}
      messages
        .filter((m) => Array.isArray(m.participants) && m.participants.includes(currentUser.id))
        .forEach((m) => {
          const otherId = m.participants.find((id: string) => id !== currentUser.id) || m.targetId
          const otherName = m.senderId === currentUser.id ? m.targetName : m.senderName
          const curr = grouped[otherId]
          if (!curr || Number(m.createdAtMs || 0) > Number(curr.createdAtMs || 0)) {
            grouped[otherId] = {
              id: otherId, name: otherName || '同学',
              lastMessage: m.text || '', timestamp: m.time || formatChatTime(m.createdAtMs),
              unread: m.senderId === currentUser.id ? 0 : 1,
              category: m.category || '聊天', createdAtMs: Number(m.createdAtMs || 0),
            }
          }
        })
      const cloudConversations = Object.values(grouped)
        .sort((a: any, b: any) => Number(b.createdAtMs || 0) - Number(a.createdAtMs || 0))
      const cloudIds = new Set(cloudConversations.map((item: any) => item.id))
      return [
        ...cloudConversations,
        ...localConversations.filter((item: any) => !cloudIds.has(item.id)),
      ]
    } catch (e) { apiWarn('[API] getChatConversations cloud failed', e) }
  }
  return localConversations
}
