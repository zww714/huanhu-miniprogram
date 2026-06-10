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

function normalizeFavorite(targetId: string, targetType = 'post', post?: any) {
  const source = post || {}
  const sourceAuthor = source.author || {}
  const fallbackAuthor = {
    id: source.authorId || source.userId || sourceAuthor.id || sourceAuthor._id || '',
    _id: source.authorId || source.userId || sourceAuthor.id || sourceAuthor._id || '',
    name: source.authorName || sourceAuthor.name || '同学',
    avatar: source.authorAvatar || sourceAuthor.avatar || '',
    college: source.college || sourceAuthor.college || '浙江大学',
    grade: source.grade || sourceAuthor.grade || '',
    verified: !!(source.verified || sourceAuthor.verified),
  }
  const title = source.title || source.name || '收藏内容'
  const excerpt = source.excerpt || source.summary || source.desc || source.content || ''
  const tags = Array.isArray(source.tags) ? source.tags : []

  return {
    id: `${targetType}_${targetId}`,
    _id: `${targetType}_${targetId}`,
    targetType,
    targetId,
    postId: targetId,
    createdAt: new Date().toISOString(),
    post: {
      ...source,
      id: source.id || source._id || targetId,
      _id: source._id || source.id || targetId,
      title,
      excerpt,
      tags,
      authorId: source.authorId || source.userId || fallbackAuthor.id,
      author: { ...fallbackAuthor, ...sourceAuthor },
    },
  }
}

function syncLocalFavorite(targetId: string, targetType: string, favorited: boolean, post?: any) {
  const current = readLocalFavorites()
  const withoutTarget = current.filter((item) => !(item.targetType === targetType && String(item.targetId || item.postId) === String(targetId)))
  writeLocalFavorites(favorited ? [normalizeFavorite(targetId, targetType, post), ...withoutTarget] : withoutTarget)
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
  targetType?: string; targetId: string; post?: any
}): Promise<{ favorited: boolean; favoriteCount: number }> {
  const targetType = params.targetType || 'post'
  if (getUseCloud()) {
    try {
      const res = await callCloudFunction('toggleFavorite', { targetType, targetId: params.targetId })
      const data = res.data || { favorited: false, favoriteCount: 0 }
      syncLocalFavorite(params.targetId, targetType, !!data.favorited, params.post)
      return data
    } catch (e) { apiWarn('[API] toggleFavorite failed, use local fallback', e) }
  }

  const current = readLocalFavorites()
  const exists = current.some((item) => item.targetType === targetType && String(item.targetId || item.postId) === String(params.targetId))
  const next = exists
    ? current.filter((item) => !(item.targetType === targetType && String(item.targetId || item.postId) === String(params.targetId)))
    : [normalizeFavorite(params.targetId, targetType, params.post), ...current]
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
    } catch (e) { apiWarn('[API] getInteractionStatus failed, use local fallback', e) }
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
    } catch (e) { apiWarn('[API] getMyFavorites failed, use local fallback', e) }
  }

  const targetType = params?.targetType || 'post'
  return readLocalFavorites().filter((item) => !item.targetType || item.targetType === targetType)
}
