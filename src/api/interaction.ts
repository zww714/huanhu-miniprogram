/**
 * API 交互模块 — 点赞、收藏、交互状态
 */
import { callCloudFunction, apiWarn, getUseCloud } from './base'

export async function toggleLike(params: {
  targetType?: string; targetId: string
}): Promise<{ liked: boolean; likeCount: number }> {
  if (getUseCloud()) {
    try {
      const res = await callCloudFunction('toggleLike', { targetType: params.targetType || 'post', targetId: params.targetId })
      return res.data || { liked: false, likeCount: 0 }
    } catch (e) { apiWarn('[API] toggleLike failed', e); throw e }
  }
  throw new Error('本地模式不支持真实点赞')
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
  throw new Error('本地模式不支持真实收藏')
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
  return { liked: false, favorited: false, likeCount: 0, favoriteCount: 0 }
}

export async function getMyFavorites(params?: { targetType?: string }): Promise<any[]> {
  if (getUseCloud()) {
    try {
      const res = await callCloudFunction('getMyFavorites', { targetType: params?.targetType || 'post' })
      return res.data || []
    } catch (e) { apiWarn('[API] getMyFavorites failed', e) }
  }
  return []
}
