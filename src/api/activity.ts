/**
 * Activity API. Public activity pages use cloud data only.
 */
import { callCloudFunction, apiWarn, getUseCloud, addCloudDocument } from './base'
import type { Activity } from '../utils/mock'

export async function createActivity(params: {
  title: string; organizer: string; time: string; location: string;
  participants?: number; maxParticipants?: number; category?: string; tags?: string[]
}) {
  const title = params.title.trim()
  const organizer = params.organizer.trim()
  const time = params.time.trim()
  const location = params.location.trim()
  const tags = (params.tags || []).map((t) => t.trim()).filter(Boolean)
  if (!title || !organizer || !time || !location) throw new Error('活动名称、组织方、时间和地点不能为空')

  const activity = {
    title, organizer, time, location,
    participants: Number(params.participants || 0),
    participantCount: Number(params.participants || 0),
    maxParticipants: Number(params.maxParticipants || 20),
    category: params.category || '兴趣',
    tags,
    status: 'normal',
    visibility: 'public',
    source: 'publish',
  }

  if (getUseCloud()) {
    const res = await addCloudDocument('activities', activity)
    return { ...activity, id: res._id, _id: res._id }
  }
  throw new Error('发布活动需要云端环境')
}

export async function getActivities(params?: { category?: string; page?: number; keyword?: string }) {
  if (getUseCloud()) {
    try {
      const res = await callCloudFunction('getActivities', params)
      return (res.data || []) as Activity[]
    } catch (e) { apiWarn('[API] getActivities cloud failed', e) }
  }
  return []
}

export async function registerActivity(params: {
  activityId: string
  name?: string
  phone?: string
  note?: string
  activity?: Partial<Activity>
}) {
  if (getUseCloud()) {
    try {
      const res = await callCloudFunction('activity', { action: 'register', ...params })
      return res.data || { registered: true }
    } catch (e) { apiWarn('[API] registerActivity failed', e); throw e }
  }
  throw new Error('活动报名需要云端登录后使用')
}

export async function getMyActivityRegistrations() {
  if (getUseCloud()) {
    try {
      const res = await callCloudFunction('activity', { action: 'getMyRegistrations' })
      return Array.isArray(res.data) ? res.data : []
    } catch (e) { apiWarn('[API] getMyActivityRegistrations failed', e) }
  }
  return []
}

export async function cancelActivityRegistration(params: { registrationId?: string; activityId?: string }) {
  if (getUseCloud()) {
    try {
      const res = await callCloudFunction('activity', { action: 'cancelRegistration', ...params })
      return res.data || { canceled: true }
    } catch (e) { apiWarn('[API] cancelActivityRegistration failed', e); throw e }
  }
  throw new Error('取消报名需要云端登录后使用')
}

export async function getActivityDetail(params: { activityId: string }) {
  if (getUseCloud()) {
    try {
      const res = await callCloudFunction('activity', { action: 'getDetail', ...params })
      return res.data || null
    } catch (e) { apiWarn('[API] getActivityDetail failed', e) }
  }
  return null
}
