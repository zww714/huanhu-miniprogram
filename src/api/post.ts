/**
 * API 帖子模块 — 帖子的 CRUD、数据规范化
 */
import {
  initCloud, callCloudFunction, delay, apiWarn, getUseCloud,
  getCloudCollection, uploadCloudFile,
} from './base'
import { MOCK_POSTS, MY_POSTS } from '../utils/mock'
import type { Post } from '../utils/mock'

// ============ 帖子规范化 ============
function normalizePost(post: any) {
  const seedMap: Record<string, any> = {
    post_python: MOCK_POSTS[0],
    post_photo: MOCK_POSTS[1],
    post_math: MOCK_POSTS[2],
    post_ai: MOCK_POSTS[3],
  }
  const cleanSeed = seedMap[post._id] || seedMap[post.id]
  const authorMap: Record<string, any> = {
    user_chen: { name: '陈同学', avatar: '', college: '物理学院', grade: '博士在读' },
    user_photo: { name: '光影捕手', college: '艺术学院', grade: '大二' },
    user_orange: { name: '上岸锦鲤', college: '数学学院', grade: '研一' },
    user_xiong: { name: '论文苦手', college: '人文学院', grade: '大三' },
  }
  const createdAt = post.createdAt || cleanSeed?.createdAt || ''
  const createdAtMs = typeof createdAt === 'string'
    ? Date.parse(createdAt) || 0
    : Number(createdAt?.getTime?.() || createdAt?.$date || 0)
  return {
    ...(cleanSeed || post), ...post,
    ...(cleanSeed ? {
      title: cleanSeed.title, excerpt: cleanSeed.excerpt,
      content: cleanSeed.content || cleanSeed.excerpt, categoryTag: cleanSeed.categoryTag,
      mainCategory: cleanSeed.mainCategory, tags: cleanSeed.tags, cover: cleanSeed.cover,
    } : {}),
    id: post.id || post._id || cleanSeed?.id,
    author: post.author || cleanSeed?.author || authorMap[post.userId] || { name: '陈同学', college: '浙江大学', grade: '在读' },
    tags: Array.isArray(cleanSeed?.tags || post.tags) ? (cleanSeed?.tags || post.tags) : [],
    likes: Number(post.likes ?? post.likeCount ?? cleanSeed?.likes ?? 0),
    comments: Number(post.comments ?? post.commentCount ?? cleanSeed?.comments ?? 0),
    likeCount: Number(post.likeCount ?? post.likes ?? cleanSeed?.likes ?? 0),
    commentCount: Number(post.commentCount ?? post.comments ?? cleanSeed?.comments ?? 0),
    collectCount: Number(post.collectCount ?? post.favoriteCount ?? 0),
    favoriteCount: Number(post.favoriteCount ?? post.collectCount ?? 0),
    authorId: post.authorId || post.userId || cleanSeed?.authorId,
    userId: post.userId || post.authorId || cleanSeed?.userId,
    canManage: !!post.canManage, createdAt, createdAtMs,
  }
}

// ============ 获取帖子列表 ============
export async function getPosts(params?: { category?: string; page?: number; userId?: string; keyword?: string; tag?: string }) {
  if (getUseCloud()) {
    try {
      const res = await callCloudFunction('getPosts', params)
      return (res.data || []).map(normalizePost) as Post[]
    } catch (e) { apiWarn('[API] getPosts cloud failed', e) }
  }
  await delay()
  let posts = [...MOCK_POSTS]
  if (params?.category && params.category !== '全部') {
    posts = posts.filter(p => p.mainCategory === params.category || p.category === params.category)
  }
  if (params?.keyword) {
    const kw = params.keyword.toLowerCase()
    posts = posts.filter((p: any) =>
      [p.title, p.content, p.excerpt, p.summary, p.mainCategory, p.category, ...(p.tags || [])]
        .some((v) => String(v || '').toLowerCase().includes(kw))
    )
  }
  return posts.map((p: any) => normalizePost(p))
}

// ============ 创建帖子 ============
export async function createPost(params: {
  title: string; content: string; tags: string[]; visibility: string; mainCategory?: string; image?: string
}) {
  const title = params.title.trim()
  const content = params.content.trim()
  const tags = params.tags.map((t) => t.trim()).filter(Boolean)
  if (!title || !content) throw new Error('标题和内容不能为空')

  let image = params.image || ''
  if (getUseCloud() && image && !image.startsWith('cloud://') && !image.startsWith('http')) {
    try { image = await uploadCloudFile(image) } catch (e) { apiWarn('[API] upload post image failed', e); image = '' }
  }

  const post = {
    title, excerpt: content.slice(0, 80), content,
    cover: image || 'linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%)',
    categoryTag: `${params.mainCategory || '兴趣'} · 动态`, mainCategory: params.mainCategory || '兴趣',
    tags, visibility: params.visibility, likes: 0, comments: 0,
    userId: 'user_chen', author: { name: '陈同学', avatar: '', college: '物理学院', grade: '博士在读' },
    images: image ? [image] : [], seedTag: 'huanhu-initial-v1', source: 'publish',
  }

  if (getUseCloud()) {
    try {
      const res = await callCloudFunction('createPost', {
        title, content, summary: content.slice(0, 80), tags,
        visibility: params.visibility, category: params.mainCategory || '兴趣',
        mainCategory: params.mainCategory || '兴趣', images: image ? [image] : [], image,
      })
      return normalizePost(res.data)
    } catch (e) { apiWarn('[API] createPost cloud failed', e) }
  }
  const id = `local_${Date.now()}`
  const localPost = { ...post, id, _id: id }
  const saved = wx.getStorageSync('localMinePosts')
  wx.setStorageSync('localMinePosts', [localPost, ...(Array.isArray(saved) ? saved : [])])
  return localPost
}

// ============ 我的帖子 ============
export async function getMyPosts() {
  if (getUseCloud()) {
    try {
      const res = await callCloudFunction('getMyPosts')
      return (res.data || []).map(normalizePost)
    } catch (e) { apiWarn('[API] getMyPosts cloud failed', e) }
  }
  const saved = wx.getStorageSync('localMinePosts')
  const localPosts = Array.isArray(saved) ? saved : []
  return [...localPosts, ...MY_POSTS].map((item: any) => normalizePost(item))
}

export async function getUserPosts(params: { userId: string }) {
  if (getUseCloud()) {
    try {
      const res = await callCloudFunction('getUserPosts', params)
      return (res.data || []).map(normalizePost)
    } catch (e) { apiWarn('[API] getUserPosts cloud failed', e) }
  }
  return []
}

export async function getPostDetail(params: { postId: string }) {
  if (getUseCloud()) {
    try {
      const res = await callCloudFunction('getPostDetail', params)
      return normalizePost(res.data)
    } catch (e) { apiWarn('[API] getPostDetail cloud failed', e) }
  }
  return undefined
}

export async function updatePost(params: { postId: string; post: Record<string, any> }) {
  if (getUseCloud()) {
    try { return await callCloudFunction('updatePost', params) }
    catch (e) { apiWarn('[API] updatePost cloud failed', e) }
  }
  const editedPosts = wx.getStorageSync('editedPosts') || {}
  wx.setStorageSync('editedPosts', { ...editedPosts, [params.postId]: params.post })
  return { code: 0, msg: '保存成功' }
}

export async function deletePost(params: { postId: string }) {
  if (getUseCloud()) {
    try { return await callCloudFunction('deletePost', params) }
    catch (e) { apiWarn('[API] deletePost cloud failed', e) }
  }
  const saved = wx.getStorageSync('localMinePosts')
  if (Array.isArray(saved)) {
    wx.setStorageSync('localMinePosts', saved.filter((item: any) => item.id !== params.postId && item._id !== params.postId))
  }
  return { code: 0, msg: '已删除' }
}
