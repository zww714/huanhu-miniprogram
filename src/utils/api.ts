/**
 * API 层 - 统一数据入口
 *
 * 设计原则：
 * - 开发/测试阶段先用 mock 数据，页面不改
 * - 云函数就绪后，只需切换 api.ts 的调用目标
 * - 支持优雅降级：云函数报错时自动 fallback 到 mock
 *
 * 使用方式：
 *   import { getUsers, getUserDetail } from '../../utils/api'
 *   const users = await getUsers({ category: 'Python' })
 *   const detail = await getUserDetail({ userId: 'xxx' })
 */

// ============ 开关：true=用云函数，false=用mock数据 ============
const USE_CLOUD = true

// ============ Cloud SDK 初始化 ============
let cloudInitialized = false
function initCloud() {
  if (cloudInitialized) return Promise.resolve()
  cloudInitialized = true
  return new Promise((resolve, reject) => {
    wx.cloud.init({
      env: 'cloud1-d3geudxpp50aa1802',
      traceUser: true,
    })
    resolve(true)
  })
}

// ============ 云函数调用包装 ============
async function callCloudFunction(name: string, data?: any) {
  await initCloud()
  return new Promise<any>((resolve, reject) => {
    wx.cloud.callFunction({
      name,
      data,
      success: (res) => {
        const result = res.result
        if (result.code === 0) {
          resolve(result)
        } else {
          reject(new Error(result.msg || '云函数错误'))
        }
      },
      fail: (err) => reject(err),
    })
  })
}

async function getCloudCollection(collectionName: string, limit = 20, where?: Record<string, any>) {
  await initCloud()
  return new Promise<any[]>((resolve, reject) => {
    const collection = wx.cloud.database().collection(collectionName)
    const query = where ? collection.where(where) : collection

    query
      .limit(limit)
      .get({
        success: (res) => resolve(res.data || []),
        fail: (err) => reject(err),
      })
  })
}

async function addCloudDocument(collectionName: string, data: Record<string, any>) {
  await initCloud()
  const db = wx.cloud.database()
  return new Promise<any>((resolve, reject) => {
    db.collection(collectionName).add({
      data: {
        ...data,
        createdAt: db.serverDate(),
        updatedAt: db.serverDate(),
      },
      success: resolve,
      fail: reject,
    })
  })
}

async function getAllCloudDocuments(collectionName: string, limit = 100) {
  await initCloud()
  return new Promise<any[]>((resolve, reject) => {
    wx.cloud.database()
      .collection(collectionName)
      .limit(limit)
      .get({
        success: (res) => resolve(res.data || []),
        fail: reject,
      })
  })
}

async function uploadCloudFile(localPath: string, folder = 'post-images') {
  await initCloud()
  const ext = localPath.includes('.') ? localPath.split('.').pop() : 'jpg'
  const cloudPath = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

  return new Promise<string>((resolve, reject) => {
    wx.cloud.uploadFile({
      cloudPath,
      filePath: localPath,
      success: (res) => resolve(res.fileID),
      fail: reject,
    })
  })
}

async function getCloudDocument(collectionName: string, id: string) {
  await initCloud()
  return new Promise<any>((resolve, reject) => {
    wx.cloud.database()
      .collection(collectionName)
      .doc(id)
      .get({
        success: (res) => resolve(res.data),
        fail: reject,
      })
  })
}

async function updateCloudDocument(collectionName: string, id: string, data: Record<string, any>) {
  await initCloud()
  const db = wx.cloud.database()
  return new Promise<any>((resolve, reject) => {
    db.collection(collectionName).doc(id).update({
      data: {
        ...data,
        updatedAt: db.serverDate(),
      },
      success: resolve,
      fail: reject,
    })
  })
}

// ============ 延迟模拟 ============
function delay(ms = 200) {
  return new Promise(r => setTimeout(r, ms))
}

// ============ Mock 数据导入 ============
import {
  SKILL_USERS,
  MOCK_POSTS,
  ACTIVITIES,
  CONVERSATIONS,
  USER_DETAILS,
  PARTNER_USERS,
  MY_PROFILE,
  MY_SKILLS,
  MY_LEARN_WANTS,
  MY_INTERESTS,
  MY_REVIEWS,
  USER_DETAIL_PROFILE,
  type SkillUser,
  type Post,
  type Activity,
  type Conversation,
} from './mock'

// ============ ============ ============
//          API 函数
// ============ ============ ============

// ----- 用户相关 -----
export async function getUsers(params?: { category?: string; page?: number }) {
  if (USE_CLOUD) {
    try {
      const res = await callCloudFunction('getUsers', params)
      return res.data as SkillUser[]
    } catch (e) {
      console.warn('[API] getUsers cloud failed, fallback to mock', e)
    }

    try {
      let users = await getCloudCollection('users', 20, { seedTag: 'huanhu-initial-v1' })
      if (params?.category && params.category !== '全部' && params.category !== '热门') {
        users = users.filter((u: any) =>
          (u.skills || u.can || []).some((s: any) => s.name?.includes(params.category!))
        )
      }
      return users as SkillUser[]
    } catch (e) {
      console.warn('[API] getUsers database failed, fallback to mock', e)
    }
  }
  await delay()
  if (params?.category && params.category !== '全部' && params.category !== '热门') {
    return SKILL_USERS.filter(u =>
      u.can.some(s => s.name.includes(params!.category!))
    )
  }
  return SKILL_USERS
}

// ----- 兴趣搭子 -----
export async function getPartners(params?: { category?: string }) {
  if (USE_CLOUD) {
    try {
      const users = await getUsers()
      let partners = users.map((user: any) => ({
        ...user,
        id: user.id || user._id,
        tags: user.interests || [],
        lookingFor: user.lookingFor || (user.learnWants && user.learnWants[0]) || (user.want && user.want[0]) || '兴趣搭子',
      }))

      if (params?.category && params.category !== '全部') {
        partners = partners.filter((user: any) =>
          user.tags?.some((tag: string) => tag.includes(params.category!))
        )
      }

      return partners
    } catch (e) {
      console.warn('[API] getPartners cloud failed, fallback to mock', e)
    }
  }

  await delay()
  if (params?.category && params.category !== '全部') {
    return PARTNER_USERS.filter(u =>
      u.tags?.some(t => t.includes(params!.category!))
    )
  }
  return PARTNER_USERS
}

// ----- 登录 -----
export async function login() {
  if (USE_CLOUD) {
    try {
      const res = await callCloudFunction('login')
      return res.currentUser || res.userData
    } catch (e) {
      console.warn('[API] login cloud failed', e)
    }
  }
  await delay()
  return MY_PROFILE
}

export async function getCurrentUser() {
  if (USE_CLOUD) {
    try {
      const res = await callCloudFunction('getCurrentUser')
      return res.currentUser || res.userData
    } catch (e) {
      console.warn('[API] getCurrentUser cloud failed', e)
    }
  }
  await delay()
  return wx.getStorageSync('profileDraft') || MY_PROFILE
}

const LOGIN_USER_KEY = 'huanhuLoginUser'
const SMS_CODE_KEY = 'huanhuSmsCode'

export async function saveWechatProfile(params: {
  nickName?: string
  avatarUrl?: string
}) {
  const user = await login()
  const nextProfile = {
    name: params.nickName || user?.name || '微信用户',
    avatar: params.avatarUrl || user?.avatar || '',
  }

  if (USE_CLOUD && user?._id) {
    await updateCloudDocument('users', user._id, nextProfile)
    const updated = await getCloudDocument('users', user._id)
    wx.setStorageSync(LOGIN_USER_KEY, updated)
    return updated
  }

  const localUser = { ...(user || {}), ...nextProfile }
  wx.setStorageSync(LOGIN_USER_KEY, localUser)
  return localUser
}

export async function sendSmsCode(phone: string) {
  const cleanPhone = phone.trim()
  if (!/^1\d{10}$/.test(cleanPhone)) {
    throw new Error('请输入正确的手机号')
  }

  const code = String(Math.floor(100000 + Math.random() * 900000))
  wx.setStorageSync(SMS_CODE_KEY, {
    phone: cleanPhone,
    code,
    expiresAt: Date.now() + 5 * 60 * 1000,
  })

  // 开发阶段用 toast 显示验证码；接入真实短信服务时替换这里。
  return { code, expiresIn: 300 }
}

export async function phoneCodeLogin(params: {
  phone: string
  code: string
}) {
  const saved = wx.getStorageSync(SMS_CODE_KEY)
  const phone = params.phone.trim()
  const code = params.code.trim()

  if (!saved || saved.phone !== phone || saved.code !== code || Date.now() > saved.expiresAt) {
    throw new Error('验证码错误或已过期')
  }

  const user = await login()
  const nextProfile = {
    phone,
    phoneVerified: true,
    name: user?.name || `用户${phone.slice(-4)}`,
  }

  if (USE_CLOUD && user?._id) {
    await updateCloudDocument('users', user._id, nextProfile)
    const updated = await getCloudDocument('users', user._id)
    wx.setStorageSync(LOGIN_USER_KEY, updated)
    return updated
  }

  const localUser = { ...(user || {}), ...nextProfile }
  wx.setStorageSync(LOGIN_USER_KEY, localUser)
  return localUser
}

export function getSavedLoginUser() {
  return wx.getStorageSync(LOGIN_USER_KEY)
}

// ----- 用户详情 -----
export async function getUserDetail(params: { userId?: string; userName?: string }) {
  if (USE_CLOUD) {
    try {
      const res = await callCloudFunction('getUserDetail', params)
      return res.userData
    } catch (e) {
      console.warn('[API] getUserDetail cloud failed', e)
    }
  }
  await delay()
  if (params.userName && USER_DETAILS[params.userName]) {
    return USER_DETAILS[params.userName]
  }
  return USER_DETAIL_PROFILE
}

// ----- 帖子 -----
function normalizePost(post: any) {
  const seedMap: Record<string, any> = {
    post_python: MOCK_POSTS[0],
    post_photo: MOCK_POSTS[1],
    post_math: MOCK_POSTS[2],
    post_ai: MOCK_POSTS[3],
  }
  const cleanSeed = seedMap[post._id] || seedMap[post.id]
  const authorMap: Record<string, any> = {
    user_chen: { name: '陈同学', avatar: '/assets/avatar.png', college: '物理学院', grade: '博士在读' },
    user_photo: { name: '光影捕手', college: '艺术学院', grade: '大二' },
    user_orange: { name: '上岸锦鲤', college: '数学学院', grade: '研一' },
    user_xiong: { name: '论文苦手', college: '人文学院', grade: '大三' },
  }

  const createdAt = post.createdAt || cleanSeed?.createdAt || ''
  const createdAtMs = typeof createdAt === 'string'
    ? Date.parse(createdAt) || 0
    : Number(createdAt?.getTime?.() || createdAt?.$date || 0)

  return {
    ...(cleanSeed || post),
    ...post,
    ...(cleanSeed
      ? {
          title: cleanSeed.title,
          excerpt: cleanSeed.excerpt,
          content: cleanSeed.content || cleanSeed.excerpt,
          categoryTag: cleanSeed.categoryTag,
          mainCategory: cleanSeed.mainCategory,
          tags: cleanSeed.tags,
          cover: cleanSeed.cover,
        }
      : {}),
    id: post.id || post._id || cleanSeed?.id,
    author: post.author || cleanSeed?.author || authorMap[post.userId] || {
      name: '陈同学',
      college: '浙江大学',
      grade: '在读',
    },
    tags: Array.isArray(cleanSeed?.tags || post.tags) ? (cleanSeed?.tags || post.tags) : [],
    likes: Number(post.likes ?? post.likeCount ?? cleanSeed?.likes ?? 0),
    comments: Number(post.comments ?? post.commentCount ?? cleanSeed?.comments ?? 0),
    likeCount: Number(post.likeCount ?? post.likes ?? cleanSeed?.likes ?? 0),
    commentCount: Number(post.commentCount ?? post.comments ?? cleanSeed?.comments ?? 0),
    collectCount: Number(post.collectCount ?? post.favoriteCount ?? 0),
    favoriteCount: Number(post.favoriteCount ?? post.collectCount ?? 0),
    authorId: post.authorId || post.userId || cleanSeed?.authorId,
    userId: post.userId || post.authorId || cleanSeed?.userId,
    canManage: !!post.canManage,
    createdAt,
    createdAtMs,
  }
}

export async function getPosts(params?: { category?: string; page?: number; userId?: string; keyword?: string; tag?: string }) {
  if (USE_CLOUD) {
    try {
      const res = await callCloudFunction('getPosts', params)
      return (res.data || []).map(normalizePost) as Post[]
    } catch (e) {
      console.warn('[API] getPosts cloud failed, fallback to mock', e)
    }
  }
  await delay()
  let posts = [...MOCK_POSTS]
  if (params?.category && params.category !== '全部' && params.category !== '鍏ㄩ儴') {
    posts = posts.filter(p => p.mainCategory === params.category || p.category === params.category)
  }
  if (params?.keyword) {
    const keyword = params.keyword.toLowerCase()
    posts = posts.filter((post: any) => [post.title, post.content, post.excerpt, post.summary, post.mainCategory, post.category, ...(post.tags || [])].some((value) => String(value || '').toLowerCase().includes(keyword)))
  }
  return posts.map((post: any) => normalizePost(post))
}

// ----- 发布帖子 -----
export async function createPost(params: {
  title: string
  content: string
  tags: string[]
  visibility: string
  mainCategory?: string
  image?: string
}) {
  const title = params.title.trim()
  const content = params.content.trim()
  const tags = params.tags.map((tag) => tag.trim()).filter(Boolean)

  if (!title || !content) {
    throw new Error('标题和内容不能为空')
  }

  let image = params.image || ''
  if (USE_CLOUD && image && !image.startsWith('cloud://') && !image.startsWith('http')) {
    try {
      image = await uploadCloudFile(image)
    } catch (e) {
      console.warn('[API] upload post image failed, continue without image', e)
      image = ''
    }
  }

  const post = {
    title,
    excerpt: content.slice(0, 80),
    content,
    cover: image || 'linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%)',
    categoryTag: `${params.mainCategory || '兴趣'} · 动态`,
    mainCategory: params.mainCategory || '兴趣',
    tags,
    visibility: params.visibility,
    likes: 0,
    comments: 0,
    userId: 'user_chen',
    author: {
      name: '陈同学',
      avatar: '/assets/avatar.png',
      college: '物理学院',
      grade: '博士在读',
    },
    images: image ? [image] : [],
    seedTag: 'huanhu-initial-v1',
    source: 'publish',
  }

  if (USE_CLOUD) {
    try {
      const res = await callCloudFunction('createPost', {
        title,
        content,
        summary: content.slice(0, 80),
        tags,
        visibility: params.visibility,
        category: params.mainCategory || '兴趣',
        mainCategory: params.mainCategory || '兴趣',
        images: image ? [image] : [],
        image,
      })
      return normalizePost(res.data)
    } catch (e) {
      console.warn('[API] createPost cloud failed, fallback local', e)
    }
  }

  const id = `local_${Date.now()}`
  const localPost = { ...post, id, _id: id }
  const saved = wx.getStorageSync('localMinePosts')
  wx.setStorageSync('localMinePosts', [localPost, ...(Array.isArray(saved) ? saved : [])])
  return localPost
}

export async function getMyPosts() {
  if (USE_CLOUD) {
    try {
      const res = await callCloudFunction('getMyPosts')
      return (res.data || []).map(normalizePost)
    } catch (e) {
      console.warn('[API] getMyPosts cloud failed, fallback local', e)
    }
  }
  const saved = wx.getStorageSync('localMinePosts')
  const localPosts = Array.isArray(saved) ? saved : []
  return [...localPosts, ...MY_POSTS].map((item: any) => normalizePost(item))
}

export async function getUserPosts(params: { userId: string }) {
  if (USE_CLOUD) {
    try {
      const res = await callCloudFunction('getUserPosts', params)
      return (res.data || []).map(normalizePost)
    } catch (e) {
      console.warn('[API] getUserPosts cloud failed, fallback mock', e)
    }
  }
  return []
}

export async function getPostDetail(params: { postId: string }) {
  if (USE_CLOUD) {
    try {
      const res = await callCloudFunction('getPostDetail', params)
      return normalizePost(res.data)
    } catch (e) {
      console.warn('[API] getPostDetail cloud failed, fallback mock', e)
    }
  }
  return undefined
}

export async function updatePost(params: { postId: string; post: Record<string, any> }) {
  if (USE_CLOUD) {
    try {
      return await callCloudFunction('updatePost', params)
    } catch (e) {
      console.warn('[API] updatePost cloud failed, fallback local', e)
    }
  }
  const editedPosts = wx.getStorageSync('editedPosts') || {}
  wx.setStorageSync('editedPosts', { ...editedPosts, [params.postId]: params.post })
  return { code: 0, msg: '保存成功' }
}

export async function deletePost(params: { postId: string }) {
  if (USE_CLOUD) {
    try {
      return await callCloudFunction('deletePost', params)
    } catch (e) {
      console.warn('[API] deletePost cloud failed, fallback local', e)
    }
  }
  const saved = wx.getStorageSync('localMinePosts')
  if (Array.isArray(saved)) {
    wx.setStorageSync('localMinePosts', saved.filter((item: any) => item.id !== params.postId && item._id !== params.postId))
  }
  return { code: 0, msg: '已删除' }
}

// ----- 发布“我会 / 我想学” -----
export async function publishSkillNeed(params: {
  type: 'can' | 'want'
  name: string
  level?: number
  desc?: string
}) {
  const userId = 'user_chen'
  const name = params.name.trim()
  const desc = params.desc?.trim() || ''

  if (!name) {
    throw new Error('技能名称不能为空')
  }

  if (USE_CLOUD) {
    const user = await getCloudDocument('users', userId)
    const can = Array.isArray(user.can) ? user.can : []
    const skills = Array.isArray(user.skills) ? user.skills : []
    const want = Array.isArray(user.want) ? user.want : []
    const learnWants = Array.isArray(user.learnWants) ? user.learnWants : []

    if (params.type === 'can') {
      const level = Number(params.level || 3)
      const nextSkill = { name, level, ...(desc ? { desc, tags: [name] } : {}) }
      const nextCan = [...can.filter((item: any) => item.name !== name), { name, level }]
      const nextSkills = [...skills.filter((item: any) => item.name !== name), nextSkill]

      await updateCloudDocument('users', userId, {
        can: nextCan,
        skills: nextSkills,
        'stats.skills': nextCan.length,
      })
      const updated = await getCloudDocument('users', userId)
      return { code: 0, data: updated }
    }

    const nextWant = [...want.filter((item: string) => item !== name), name]
    const nextLearnWants = [...learnWants.filter((item: string) => item !== name), name]

    await updateCloudDocument('users', userId, {
      want: nextWant,
      learnWants: nextLearnWants,
    })
    const updated = await getCloudDocument('users', userId)
    return { code: 0, data: updated }
  }

  return { code: 0 }
}

// ----- 发布兴趣搭子资料 -----
export async function publishPartnerProfile(params: {
  bio: string
  interests: string[]
}) {
  const userId = 'user_chen'
  const bio = params.bio.trim()
  const interests = params.interests.map((item) => item.trim()).filter(Boolean)

  if (!bio) {
    throw new Error('一句话个人介绍不能为空')
  }
  if (!interests.length) {
    throw new Error('请至少填写一个兴趣爱好')
  }

  const lookingFor = `${interests[0]}搭子`

  if (USE_CLOUD) {
    const user = await getCloudDocument('users', userId)
    const oldInterests = Array.isArray(user.interests) ? user.interests : []
    const nextInterests = Array.from(new Set([...oldInterests, ...interests]))

    await updateCloudDocument('users', userId, {
      bio,
      interests: nextInterests,
      lookingFor,
    })
    const updated = await getCloudDocument('users', userId)
    return { code: 0, data: updated }
  }

  return { code: 0, data: { bio, interests, lookingFor } }
}

// ----- 发布社区活动 -----
export async function createActivity(params: {
  title: string
  organizer: string
  time: string
  location: string
  participants?: number
  maxParticipants?: number
  category?: string
  tags?: string[]
}) {
  const title = params.title.trim()
  const organizer = params.organizer.trim()
  const time = params.time.trim()
  const location = params.location.trim()
  const tags = (params.tags || []).map((tag) => tag.trim()).filter(Boolean)

  if (!title || !organizer || !time || !location) {
    throw new Error('活动名称、组织方、时间和地点不能为空')
  }

  const activity = {
    title,
    organizer,
    time,
    location,
    participants: Number(params.participants || 0),
    maxParticipants: Number(params.maxParticipants || 20),
    category: params.category || '兴趣',
    tags,
    cover: 'linear-gradient(135deg, #3B82F6 0%, #6366F1 100%)',
    seedTag: 'huanhu-initial-v1',
    source: 'publish',
  }

  if (USE_CLOUD) {
    const res = await addCloudDocument('activities', activity)
    return { ...activity, id: res._id, _id: res._id }
  }

  return { ...activity, id: `local_${Date.now()}` }
}

// ----- 活动 -----
export async function getActivities(params?: { category?: string; page?: number }) {
  if (USE_CLOUD) {
    try {
      const res = await callCloudFunction('getActivities', params)
      return res.data as Activity[]
    } catch (e) {
      console.warn('[API] getActivities cloud failed', e)
    }

    try {
      let activities = await getCloudCollection('activities', 20, { seedTag: 'huanhu-initial-v1' })
      if (params?.category && params.category !== '全部' && params.category !== '热门') {
        activities = activities.filter((a: any) => a.category === params.category)
      }
      return activities.map((activity: any) => ({ ...activity, id: activity.id || activity._id })) as Activity[]
    } catch (e) {
      console.warn('[API] getActivities database failed, fallback to mock', e)
    }
  }
  await delay()
  let activities = [...ACTIVITIES]
  if (params?.category && params.category !== '全部' && params.category !== '热门') {
    activities = activities.filter(a => a.category === params.category)
  }
  return activities
}

// ----- 对话列表 -----
export async function getConversations() {
  if (USE_CLOUD) {
    try {
      const res = await callCloudFunction('getConversations')
      return res.data as Conversation[]
    } catch (e) {
      console.warn('[API] getConversations cloud failed', e)
    }
  }
  await delay()
  return CONVERSATIONS
}

// ----- 云端聊天 -----
const CHAT_USER_KEY = 'huanhuChatCurrentUser'
const LOCAL_MESSAGES_KEY = 'huanhuChatMessages'
const LOCAL_CONVERSATIONS_KEY = 'huanhuLocalConversations'

function getLocalChatUser() {
  const saved = wx.getStorageSync(CHAT_USER_KEY)
  if (saved?.id) return saved

  const user = {
    id: `local_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    name: '我',
  }
  wx.setStorageSync(CHAT_USER_KEY, user)
  return user
}

export async function getCurrentChatUser() {
  if (USE_CLOUD) {
    try {
      const userData = await login()
      if (userData?._id) {
        const user = {
          id: userData._id,
          name: userData.name || '我',
        }
        wx.setStorageSync(CHAT_USER_KEY, user)
        return user
      }
    } catch (e) {
      console.warn('[API] getCurrentChatUser login failed, use local id', e)
    }
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
    ...list.filter((item) => item.id !== conversation.id),
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

export async function getChatMessages(params: { targetId: string }) {
  const currentUser = await getCurrentChatUser()
  const conversationId = buildConversationId(currentUser.id, params.targetId)

  if (USE_CLOUD) {
    try {
      const messages = await getAllCloudDocuments('messages', 100)
      const cloudMessages = messages
        .filter((message) => message.conversationId === conversationId)
        .map((message) => normalizeChatMessage(message, currentUser.id))
        .sort((a, b) => a.createdAtMs - b.createdAtMs)
      if (cloudMessages.length) return cloudMessages
    } catch (e) {
      console.warn('[API] getChatMessages cloud failed, fallback local', e)
    }
  }

  const store = getLocalMessageStore()
  const localMessages = (store[conversationId] || []).map((message) => normalizeChatMessage(message, currentUser.id))
  return localMessages
}

export async function sendChatMessage(params: {
  targetId: string
  targetName: string
  category?: string
  text: string
}) {
  const currentUser = await getCurrentChatUser()
  const conversationId = buildConversationId(currentUser.id, params.targetId)
  const createdAtMs = Date.now()
  const message = {
    conversationId,
    participants: [currentUser.id, params.targetId],
    senderId: currentUser.id,
    senderName: currentUser.name || '我',
    targetId: params.targetId,
    targetName: params.targetName,
    text: params.text,
    time: formatChatTime(createdAtMs),
    createdAtMs,
    category: params.category || '聊天',
  }

  if (USE_CLOUD) {
    try {
      const res = await addCloudDocument('messages', message)
      return normalizeChatMessage({ ...message, id: res._id, _id: res._id }, currentUser.id)
    } catch (e) {
      console.warn('[API] sendChatMessage cloud failed, fallback local', e)
    }
  }

  const store = getLocalMessageStore()
  const next = [...(store[conversationId] || []), message]
  saveLocalMessages(conversationId, next)
  upsertLocalConversation({
    id: params.targetId,
    name: params.targetName,
    lastMessage: params.text,
    timestamp: message.time,
    unread: 0,
    category: params.category || '聊天',
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
        .filter((message) => Array.isArray(message.participants) && message.participants.includes(currentUser.id))
        .forEach((message) => {
          const otherId = message.participants.find((id: string) => id !== currentUser.id) || message.targetId
          const otherName = message.senderId === currentUser.id ? message.targetName : message.senderName
          const current = grouped[otherId]
          if (!current || Number(message.createdAtMs || 0) > Number(current.createdAtMs || 0)) {
            grouped[otherId] = {
              id: otherId,
              name: otherName || '同学',
              lastMessage: message.text || '',
              timestamp: message.time || formatChatTime(message.createdAtMs),
              unread: message.senderId === currentUser.id ? 0 : 1,
              category: message.category || '聊天',
              createdAtMs: Number(message.createdAtMs || 0),
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
    } catch (e) {
      console.warn('[API] getChatConversations cloud failed, fallback local', e)
    }
  }

  return localConversations
}

// ----- 我的资料 -----
export async function getMyProfile() {
  await delay()
  return MY_PROFILE
}

export async function getMySkills() {
  if (USE_CLOUD) {
    try {
      const res = await callCloudFunction('getMySkills')
      return res.data || []
    } catch (e) {
      console.warn('[API] getMySkills cloud failed, fallback to mock', e)
    }
  }
  const saved = wx.getStorageSync('localMySkills')
  return Array.isArray(saved) ? saved : MY_SKILLS
}

export async function getUserSkills(params: { userId: string }) {
  if (USE_CLOUD) {
    try {
      const res = await callCloudFunction('getUserSkills', params)
      return res.data || []
    } catch (e) {
      console.warn('[API] getUserSkills cloud failed, fallback to mock', e)
    }
  }
  return []
}

export async function getSkillDetail(params: { skillId: string; userId?: string }) {
  if (USE_CLOUD) {
    try {
      const res = await callCloudFunction('getSkillDetail', params)
      return res.data
    } catch (e) {
      console.warn('[API] getSkillDetail cloud failed, fallback to mock', e)
    }
  }
  return undefined
}

export async function createSkill(params: Record<string, any>) {
  if (USE_CLOUD) {
    try {
      const res = await callCloudFunction('createSkill', params)
      return res.data
    } catch (e) {
      console.warn('[API] createSkill cloud failed, fallback local', e)
    }
  }
  const saved = wx.getStorageSync('localMySkills')
  const list = Array.isArray(saved) ? saved : MY_SKILLS
  const next = { ...params, id: `local-${Date.now()}`, desc: params.intro || params.desc || '' }
  wx.setStorageSync('localMySkills', [next, ...list])
  return next
}

export async function updateSkill(params: { skillId: string; skill: Record<string, any> }) {
  if (USE_CLOUD) {
    try {
      const res = await callCloudFunction('updateSkill', params)
      return res.data
    } catch (e) {
      console.warn('[API] updateSkill cloud failed, fallback local', e)
    }
  }
  const saved = wx.getStorageSync('localMySkills')
  const list = Array.isArray(saved) ? saved : MY_SKILLS
  const next = list.map((item: any) => (item.id === params.skillId || item._id === params.skillId)
    ? { ...item, ...params.skill, desc: params.skill.intro || params.skill.desc || item.desc }
    : item)
  wx.setStorageSync('localMySkills', next)
  return next.find((item: any) => item.id === params.skillId || item._id === params.skillId)
}

export async function deleteSkill(params: { skillId: string }) {
  if (USE_CLOUD) {
    try {
      return await callCloudFunction('deleteSkill', params)
    } catch (e) {
      console.warn('[API] deleteSkill cloud failed, fallback local', e)
    }
  }
  const saved = wx.getStorageSync('localMySkills')
  const list = Array.isArray(saved) ? saved : MY_SKILLS
  wx.setStorageSync('localMySkills', list.filter((item: any) => item.id !== params.skillId && item._id !== params.skillId))
  return { code: 0, msg: '已删除' }
}

export async function getMyLearnWants() {
  return MY_LEARN_WANTS
}

export async function getMyInterests() {
  return MY_INTERESTS
}

export async function getMyReviews() {
  return MY_REVIEWS
}

// ----- 关注/取消关注 -----
export async function followUser(params: { targetUserId: string; action: 'follow' | 'unfollow' }) {
  if (USE_CLOUD) {
    try {
      const res = await callCloudFunction('followUser', params)
      return res.isFollowing as boolean
    } catch (e) {
      console.warn('[API] followUser cloud failed', e)
    }
  }
  return params.action === 'follow'
}

// ----- 更新资料 -----
export async function updateProfile(params: { field?: string; value?: any; profile?: Record<string, any> } | Record<string, any>) {
  if (USE_CLOUD) {
    try {
      const res = await callCloudFunction('updateProfile', params)
      return res.currentUser || res.userData || res
    } catch (e) {
      console.warn('[API] updateProfile cloud failed', e)
    }
  }
  const profile = (params as any).profile || ((params as any).field ? { [(params as any).field]: (params as any).value } : params)
  const cached = wx.getStorageSync('profileDraft') || {}
  const localUser = {
    ...MY_PROFILE,
    ...cached,
    ...profile,
    bio: profile.intro || profile.bio || cached.bio || MY_PROFILE.bio,
  }
  wx.setStorageSync('profileDraft', localUser)
  return localUser
}

// ============ 切换云函数模式 ============
// 当云函数准备好后，在开发者工具 Console 执行:
//   setCloudMode(true)
// 即可全局切换到云函数模式
export function setCloudMode(enabled: boolean) {
  ;(window as any).USE_CLOUD = enabled
}
