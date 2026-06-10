/**
 * User API. Formal pages read from cloud/database only; mock data is not used
 * as a display fallback for public users, follows, or posts.
 */
import {
  callCloudFunction, delay, apiWarn, getUseCloud,
  getCloudCollection, getCloudDocument, updateCloudDocument,
  LOGIN_USER_KEY,
} from './base'
import type { SkillUser } from '../utils/mock'

export async function getUsers(params?: { category?: string; page?: number }) {
  if (getUseCloud()) {
    try {
      const res = await callCloudFunction('getUsers', params)
      return (res.data || []) as SkillUser[]
    } catch (e) { apiWarn('[API] getUsers cloud failed', e) }

    try {
      let users = await getCloudCollection('users', 50)
      if (params?.category && params.category !== '全部' && params.category !== '热门') {
        users = users.filter((u: any) =>
          (u.skills || u.canTeach || u.can || []).some((s: any) => String(s.name || s).includes(params.category!))
        )
      }
      return users as SkillUser[]
    } catch (e) { apiWarn('[API] getUsers database failed', e) }
  }
  return []
}

export async function getPartners(params?: { category?: string }) {
  if (getUseCloud()) {
    try {
      const users = await getUsers()
      let partners = users.map((user: any) => ({
        ...user,
        id: user.id || user._id,
        tags: user.interests || [],
        lookingFor: user.lookingFor || (user.learnWants && user.learnWants[0]) || (user.wantToLearn && user.wantToLearn[0]) || '',
      }))
      if (params?.category && params.category !== '全部') {
        partners = partners.filter((user: any) =>
          user.tags?.some((tag: string) => tag.includes(params.category!))
        )
      }
      return partners
    } catch (e) { apiWarn('[API] getPartners cloud failed', e) }
  }
  return []
}

export async function login() {
  if (getUseCloud()) {
    try {
      const res = await callCloudFunction('login')
      return res.currentUser || res.userData
    } catch (e) { apiWarn('[API] login cloud failed', e) }
  }
  await delay()
  return wx.getStorageSync(LOGIN_USER_KEY) || wx.getStorageSync('profileDraft') || null
}

export async function getCurrentUser() {
  if (getUseCloud()) {
    try {
      const res = await callCloudFunction('getCurrentUser')
      return res.currentUser || res.userData
    } catch (e) { apiWarn('[API] getCurrentUser cloud failed', e) }
  }
  await delay()
  return wx.getStorageSync(LOGIN_USER_KEY) || wx.getStorageSync('profileDraft') || null
}

export async function saveWechatProfile(params: { nickName?: string; avatarUrl?: string }) {
  const user = await login().catch(() => null)
  const nextProfile = {
    name: params.nickName || user?.name || '微信用户',
    nickname: params.nickName || user?.nickname || user?.name || '微信用户',
    avatar: params.avatarUrl || user?.avatar || '',
  }
  if (getUseCloud() && user?._id) {
    await updateCloudDocument('users', user._id, nextProfile)
    const updated = await getCloudDocument('users', user._id)
    wx.setStorageSync(LOGIN_USER_KEY, updated)
    return updated
  }
  const localUser = { ...(user || {}), ...nextProfile }
  wx.setStorageSync(LOGIN_USER_KEY, localUser)
  wx.setStorageSync('profileDraft', { ...(wx.getStorageSync('profileDraft') || {}), ...localUser })
  return localUser
}

export function getSavedLoginUser() { return wx.getStorageSync(LOGIN_USER_KEY) }

export async function getUserDetail(params: { userId?: string; userName?: string }) {
  if (getUseCloud()) {
    try {
      const res = await callCloudFunction('getUserDetail', params)
      return res.userData
    } catch (e) { apiWarn('[API] getUserDetail cloud failed', e) }
  }
  return null
}

export async function getMyProfile() {
  const current = await getCurrentUser()
  return current || wx.getStorageSync('profileDraft') || {}
}

export async function updateProfile(params: { field?: string; value?: any; profile?: Record<string, any> } | Record<string, any>) {
  if (getUseCloud()) {
    try {
      const res = await callCloudFunction('updateProfile', params)
      return res.currentUser || res.userData || res
    } catch (e) { apiWarn('[API] updateProfile cloud failed', e) }
  }
  const profile = (params as any).profile || ((params as any).field ? { [(params as any).field]: (params as any).value } : params)
  const cached = wx.getStorageSync('profileDraft') || {}
  const localUser = { ...cached, ...profile, bio: profile.intro || profile.bio || cached.bio || '' }
  wx.setStorageSync('profileDraft', localUser)
  wx.setStorageSync(LOGIN_USER_KEY, { ...(wx.getStorageSync(LOGIN_USER_KEY) || {}), ...localUser })
  return localUser
}

export async function followUser(params: { targetUserId: string }) {
  if (getUseCloud()) {
    try {
      const res = await callCloudFunction('followUser', params)
      return res.data || { isFollowing: true, isMutual: false }
    } catch (e) { apiWarn('[API] followUser cloud failed', e); throw e }
  }
  throw new Error('关注需要云端登录后使用')
}

export async function unfollowUser(params: { targetUserId: string }) {
  if (getUseCloud()) {
    try {
      const res = await callCloudFunction('unfollowUser', params)
      return res.data || { isFollowing: false, isMutual: false }
    } catch (e) { apiWarn('[API] unfollowUser cloud failed', e); throw e }
  }
  throw new Error('取消关注需要云端登录后使用')
}

export async function getFollowStatus(params: { targetUserId: string }) {
  if (getUseCloud()) {
    try {
      const res = await callCloudFunction('getFollowStatus', params)
      return res.data
    } catch (e) { apiWarn('[API] getFollowStatus cloud failed', e) }
  }
  return { isFollowing: false, isFollower: false, isMutual: false, isSpecial: false, isBlocked: false }
}

export async function getFollowers(params: { userId?: string; page?: number; pageSize?: number }) {
  if (getUseCloud()) {
    try {
      const res = await callCloudFunction('getFollowers', params)
      return { data: res.data || [], total: res.total || 0 }
    } catch (e) { apiWarn('[API] getFollowers cloud failed', e) }
  }
  return { data: [], total: 0 }
}

export async function getFollowing(params: { userId?: string; page?: number; pageSize?: number; filter?: string }) {
  if (getUseCloud()) {
    try {
      const res = await callCloudFunction('getFollowing', params)
      return { data: res.data || [], total: res.total || 0 }
    } catch (e) { apiWarn('[API] getFollowing cloud failed', e) }
  }
  return { data: [], total: 0 }
}

export async function setSpecialFollow(params: { targetUserId: string; isSpecial: boolean }) {
  if (getUseCloud()) {
    try {
      const res = await callCloudFunction('setSpecialFollow', params)
      return res.data || { isSpecial: params.isSpecial }
    } catch (e) { apiWarn('[API] setSpecialFollow cloud failed', e); throw e }
  }
  throw new Error('特别关注需要云端登录后使用')
}

export async function blockUser(params: { targetUserId: string; isBlocked?: boolean }) {
  if (getUseCloud()) {
    try {
      const res = await callCloudFunction('blockUser', params)
      return res.data || { isBlocked: true, isFollowing: false }
    } catch (e) { apiWarn('[API] blockUser cloud failed', e); throw e }
  }
  throw new Error('拉黑需要云端登录后使用')
}
