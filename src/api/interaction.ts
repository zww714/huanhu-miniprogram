/**
 * Interaction API: likes, favorites and local fallback state.
 */
import { callCloudFunction, apiWarn, getUseCloud } from './base'

const FAVORITES_KEY = 'localFavorites'

function readLocalFavorites(): any[] {
  const cached = wx.getStorageSync(FAVORITES_KEY)
  return Array.isArray(cached) ? cached : []
}

function writeLocalFavorites(items: any[]) {
  wx.setStorageSync(FAVORITES_KEY, items)
}

function normalizeFavorite(targetId: string, targetType = 'post') {
  const fallbackAuthor = {
    id: '',
    _id: '',
    name: '同学',
    avatar: '',
    college: '浙江大学',
    grade: '在读',
    verified: false,
  }

  return {
    id: `${targetType}_${targetId}`,
    _id: `${targetType}_${targetId}`,
    targetType,
    targetId,
    postId: targetId,
    createdAt: new Date().toISOString(),
    post: {
      id: targetId,
      _id: targetId,
      title: '收藏内容',
      excerpt: '',
      tags: [],
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
    } catch (e) { apiWarn('[API] toggleFavorite failed', e); throw e }
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
    } catch (e) { apiWarn('[API] getInteractionStatus failed', e); throw e }
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
    } catch (e) { apiWarn('[API] getMyFavorites failed', e); throw e }
  }

  const targetType = params?.targetType || 'post'
  return readLocalFavorites().filter((item) => !item.targetType || item.targetType === targetType)
}
