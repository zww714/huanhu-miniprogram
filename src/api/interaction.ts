/**
 * Interaction API: likes, favorites and local fallback state.
 */
import { callCloudFunction, apiWarn, getUseCloud } from './base'
import { MOCK_POSTS } from '../utils/mock'

const FAVORITES_KEY = 'localFavorites'

function readLocalFavorites(): any[] {
  const cached = wx.getStorageSync(FAVORITES_KEY)
  return Array.isArray(cached) ? cached : []
}

function writeLocalFavorites(items: any[]) {
  wx.setStorageSync(FAVORITES_KEY, items)
}

function normalizeFavorite(targetId: string, targetType = 'post') {
  const post = MOCK_POSTS.find((item: any) => String(item.id || item._id || item.title) === String(targetId))
  const fallbackAuthor = {
    id: post?.authorId || post?.userId || '',
    _id: post?.authorId || post?.userId || '',
    name: post?.authorName || post?.author?.name || '同学',
    avatar: post?.author?.avatar || '',
    college: post?.author?.college || '浙江大学',
    grade: post?.author?.grade || '在读',
    verified: !!post?.author?.verified,
  }

  return {
    id: `${targetType}_${targetId}`,
    _id: `${targetType}_${targetId}`,
    targetType,
    targetId,
    postId: targetId,
    createdAt: new Date().toISOString(),
    post: post ? {
      ...post,
      id: post.id || post._id || targetId,
      _id: post._id || post.id || targetId,
      excerpt: post.excerpt || post.summary || post.content || '',
      authorId: post.authorId || post.userId || fallbackAuthor.id,
      author: post.author || fallbackAuthor,
    } : {
      id: targetId,
      _id: targetId,
      title: '收藏内容',
      excerpt: '',
      tags: [],
      likeCount: 0,
      commentCount: 0,
      favoriteCount: 1,
      authorId: '',
      author: fallbackAuthor,
    },
  }
}

export async function toggleLike(params: {
  targetType?: string; targetId: string
}): Promise<{ liked: boolean; likeCount: number }> {
  if (getUseCloud()) {
    try {
      const res = await callCloudFunction('toggleLike', { targetType: params.targetType || 'post', targetId: params.targetId })
      return res.data || { liked: false, likeCount: 0 }
    } catch (e) { apiWarn('[API] toggleLike failed', e); throw e }
  }
  return { liked: false, likeCount: 0 }
}

export async function toggleFavorite(params: {
  targetType?: string; targetId: string
}): Promise<{ favorited: boolean; favoriteCount: number }> {
  if (getUseCloud()) {
    try {
      const res = await callCloudFunction('toggleFavorite', { targetType: params.targetType || 'post', targetId: params.targetId })
      return res.data || { favorited: false, favoriteCount: 0 }
    } catch (e) { apiWarn('[API] toggleFavorite failed', e) }
  }

  const targetType = params.targetType || 'post'
  const current = readLocalFavorites()
  const exists = current.some((item) => item.targetType === targetType && String(item.targetId || item.postId) === String(params.targetId))
  const next = exists
    ? current.filter((item) => !(item.targetType === targetType && String(item.targetId || item.postId) === String(params.targetId)))
    : [normalizeFavorite(params.targetId, targetType), ...current]
  writeLocalFavorites(next)
  return { favorited: !exists, favoriteCount: next.length }
}

export async function getInteractionStatus(params: {
  targetType?: string; targetId: string
}): Promise<{ liked: boolean; favorited: boolean; likeCount: number; favoriteCount: number }> {
  if (getUseCloud()) {
    try {
      const res = await callCloudFunction('getInteractionStatus', { targetType: params.targetType || 'post', targetId: params.targetId })
      return res.data || { liked: false, favorited: false, likeCount: 0, favoriteCount: 0 }
    } catch (e) { apiWarn('[API] getInteractionStatus failed', e) }
  }

  const targetType = params.targetType || 'post'
  const favorites = readLocalFavorites()
  const favorited = favorites.some((item) => item.targetType === targetType && String(item.targetId || item.postId) === String(params.targetId))
  return { liked: false, favorited, likeCount: 0, favoriteCount: favorites.length }
}

export async function getMyFavorites(params?: { targetType?: string }): Promise<any[]> {
  if (getUseCloud()) {
    try {
      const res = await callCloudFunction('getMyFavorites', { targetType: params?.targetType || 'post' })
      const data = res.data || []
      if (Array.isArray(data) && data.length) return data
    } catch (e) { apiWarn('[API] getMyFavorites failed', e) }
  }

  const targetType = params?.targetType || 'post'
  return readLocalFavorites().filter((item) => !item.targetType || item.targetType === targetType)
}
