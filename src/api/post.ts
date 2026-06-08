/**
 * Post API. Formal pages must not fall back to mock post statistics.
 */
import {
  callCloudFunction, apiWarn, getUseCloud,
  uploadCloudFile,
} from './base'
import type { Post } from '../utils/mock'

function normalizePost(post: any) {
  const createdAt = post.createdAt || ''
  const createdAtMs = typeof createdAt === 'string'
    ? Date.parse(createdAt) || 0
    : Number(createdAt?.getTime?.() || createdAt?.$date || 0)
  return {
    ...post,
    id: post.id || post._id,
    author: post.author || { name: post.authorName || '同学', college: post.authorCollege || '浙江大学', grade: post.authorGrade || '在读' },
    tags: Array.isArray(post.tags) ? post.tags : [],
    likeCount: typeof post.likeCount === 'number' ? post.likeCount : undefined,
    commentCount: typeof post.commentCount === 'number' ? post.commentCount : undefined,
    favoriteCount: typeof post.favoriteCount === 'number' ? post.favoriteCount : typeof post.collectCount === 'number' ? post.collectCount : undefined,
    collectCount: typeof post.collectCount === 'number' ? post.collectCount : typeof post.favoriteCount === 'number' ? post.favoriteCount : undefined,
    authorId: post.authorId || post.userId || post.author?.id || post.author?.userId,
    userId: post.userId || post.authorId || post.author?.id || post.author?.userId,
    canManage: !!post.canManage,
    createdAt,
    createdAtMs,
  }
}

export async function getPosts(params?: { category?: string; page?: number; userId?: string; keyword?: string; tag?: string }) {
  if (getUseCloud()) {
    try {
      const res = await callCloudFunction('getPosts', params)
      return (res.data || []).map(normalizePost) as Post[]
    } catch (e) { apiWarn('[API] getPosts cloud failed', e) }
  }
  return []
}

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
  const localPost = {
    id,
    _id: id,
    title,
    excerpt: content.slice(0, 80),
    content,
    cover: image || '',
    mainCategory: params.mainCategory || '兴趣',
    tags,
    visibility: params.visibility,
    userId: 'local-user',
    author: { name: '我', avatar: '', college: '浙江大学', grade: '在读' },
    images: image ? [image] : [],
    source: 'local',
  }
  const saved = wx.getStorageSync('localMinePosts')
  wx.setStorageSync('localMinePosts', [localPost, ...(Array.isArray(saved) ? saved : [])])
  return localPost
}

export async function getMyPosts() {
  if (getUseCloud()) {
    try {
      const res = await callCloudFunction('getMyPosts')
      return (res.data || []).map(normalizePost)
    } catch (e) { apiWarn('[API] getMyPosts cloud failed', e) }
  }
  const saved = wx.getStorageSync('localMinePosts')
  return (Array.isArray(saved) ? saved : []).map((item: any) => normalizePost(item))
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
