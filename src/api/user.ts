/**
 * API 用户模块 — 登录、注册、用户详情、关注
 */
import {
  initCloud, callCloudFunction, delay, apiWarn, getUseCloud,
  getCloudCollection, getCloudDocument, updateCloudDocument,
  LOGIN_USER_KEY
} from './base'
import { SKILL_USERS, PARTNER_USERS, USER_DETAILS, USER_DETAIL_PROFILE, MY_PROFILE } from '../utils/mock'
import type { SkillUser } from '../utils/mock'
import { getRelationForUser, upsertRelation } from '../utils/publicProfiles'

// ============ 用户列表 ============
export async function getUsers(params?: { category?: string; page?: number }) {
  if (getUseCloud()) {
    try {
      const res = await callCloudFunction('getUsers', params)
      return res.data as SkillUser[]
    } catch (e) { apiWarn('[API] getUsers cloud failed', e) }
    try {
      let users = await getCloudCollection('users', 20, { seedTag: 'huanhu-initial-v1' })
      if (params?.category && params.category !== '全部' && params.category !== '热门') {
        users = users.filter((u: any) =>
          (u.skills || u.can || []).some((s: any) => s.name?.includes(params.category!))
        )
      }
      return users as SkillUser[]
    } catch (e) { apiWarn('[API] getUsers database failed', e) }
  }
  await delay()
  if (params?.category && params.category !== '全部' && params.category !== '热门') {
    return SKILL_USERS.filter(u => (u.can || []).some(s => s.name.includes(params!.category!)))
  }
  return SKILL_USERS
}

// ============ 兴趣搭子 ============
export async function getPartners(params?: { category?: string }) {
  if (getUseCloud()) {
    try {
      const users = await getUsers()
      let partners = users.map((user: any) => ({
        ...user, id: user.id || user._id,
        tags: user.interests || [],
        lookingFor: user.lookingFor || (user.learnWants && user.learnWants[0]) || (user.want && user.want[0]) || '兴趣搭子',
      }))
      if (params?.category && params.category !== '全部') {
        partners = partners.filter((user: any) =>
          user.tags?.some((tag: string) => tag.includes(params.category!))
        )
      }
      return partners
    } catch (e) { apiWarn('[API] getPartners cloud failed', e) }
  }
  await delay()
  if (params?.category && params.category !== '全部') {
    return PARTNER_USERS.filter(u => u.tags?.some(t => t.includes(params!.category!)))
  }
  return PARTNER_USERS
}

// ============ 登录 ============
export async function login() {
  if (getUseCloud()) {
    try {
      const res = await callCloudFunction('login')
      return res.currentUser || res.userData
    } catch (e) { apiWarn('[API] login cloud failed', e) }
  }
  await delay()
  return MY_PROFILE
}

export async function getCurrentUser() {
  if (getUseCloud()) {
    try {
      const res = await callCloudFunction('getCurrentUser')
      return res.currentUser || res.userData
    } catch (e) { apiWarn('[API] getCurrentUser cloud failed', e) }
  }
  await delay()
  return wx.getStorageSync('profileDraft') || MY_PROFILE
}

export async function saveWechatProfile(params: { nickName?: string; avatarUrl?: string }) {
  const user = await login()
  const nextProfile = {
    name: params.nickName || user?.name || '微信用户',
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
  return localUser
}

export function getSavedLoginUser() { return wx.getStorageSync(LOGIN_USER_KEY) }

// ============ 用户详情 ============
export async function getUserDetail(params: { userId?: string; userName?: string }) {
  if (getUseCloud()) {
    try {
      const res = await callCloudFunction('getUserDetail', params)
      return res.userData
    } catch (e) { apiWarn('[API] getUserDetail cloud failed', e) }
  }
  await delay()
  if (params.userName && USER_DETAILS[params.userName]) return USER_DETAILS[params.userName]
  return USER_DETAIL_PROFILE
}

export async function getMyProfile() { await delay(); return MY_PROFILE }

// ============ 更新资料 ============
export async function updateProfile(params: { field?: string; value?: any; profile?: Record<string, any> } | Record<string, any>) {
  if (getUseCloud()) {
    try {
      const res = await callCloudFunction('updateProfile', params)
      return res.currentUser || res.userData || res
    } catch (e) { apiWarn('[API] updateProfile cloud failed', e) }
  }
  const profile = (params as any).profile || ((params as any).field ? { [(params as any).field]: (params as any).value } : params)
  const cached = wx.getStorageSync('profileDraft') || {}
  const localUser = { ...MY_PROFILE, ...cached, ...profile, bio: profile.intro || profile.bio || cached.bio || MY_PROFILE.bio }
  wx.setStorageSync('profileDraft', localUser)
  return localUser
}

// ============ 关注系统 ============
export async function followUser(params: { targetUserId: string }) {
  if (getUseCloud()) {
    try {
      const res = await callCloudFunction('followUser', params)
      return res.data || { isFollowing: true, isMutual: false }
    } catch (e) { apiWarn('[API] followUser cloud failed', e) }
  }
  const current = getRelationForUser(params.targetUserId)
  const isMutual = !!current.isFollower
  upsertRelation(params.targetUserId, { isFollowing: true, isMutual })
  return { isFollowing: true, isMutual }
}

export async function unfollowUser(params: { targetUserId: string }) {
  if (getUseCloud()) {
    try {
      const res = await callCloudFunction('unfollowUser', params)
      return res.data || { isFollowing: false, isMutual: false }
    } catch (e) { apiWarn('[API] unfollowUser cloud failed', e) }
  }
  upsertRelation(params.targetUserId, { isFollowing: false, isMutual: false, isSpecial: false })
  return { isFollowing: false, isMutual: false }
}

export async function getFollowStatus(params: { targetUserId: string }) {
  if (getUseCloud()) {
    try {
      const res = await callCloudFunction('getFollowStatus', params)
      return res.data
    } catch (e) { apiWarn('[API] getFollowStatus cloud failed', e) }
  }
  return getRelationForUser(params.targetUserId)
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
    } catch (e) { apiWarn('[API] setSpecialFollow cloud failed', e) }
  }
  upsertRelation(params.targetUserId, { isSpecial: params.isSpecial, isFollowing: true })
  return { isSpecial: params.isSpecial }
}

export async function blockUser(params: { targetUserId: string; isBlocked?: boolean }) {
  if (getUseCloud()) {
    try {
      const res = await callCloudFunction('blockUser', params)
      return res.data || { isBlocked: true, isFollowing: false }
    } catch (e) { apiWarn('[API] blockUser cloud failed', e) }
  }
  upsertRelation(params.targetUserId, { isBlocked: true, isFollowing: false, isMutual: false, isSpecial: false })
  return { isBlocked: true, isFollowing: false }
}
