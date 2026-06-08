/**
 * Activity API.
 */
import { callCloudFunction, delay, apiWarn, getUseCloud, getCloudCollection, addCloudDocument } from './base'
import { ACTIVITIES } from '../utils/mock'
import type { Activity } from '../utils/mock'

const LOCAL_REGISTRATIONS_KEY = 'localActivityRegistrations'

function readLocalRegistrations(): any[] {
  const cached = wx.getStorageSync(LOCAL_REGISTRATIONS_KEY)
  return Array.isArray(cached) ? cached : []
}

function writeLocalRegistrations(items: any[]) {
  wx.setStorageSync(LOCAL_REGISTRATIONS_KEY, items)
}

function findActivity(activityId: string) {
  return ACTIVITIES.find((activity: any) => String(activity.id || activity._id || activity.title) === String(activityId))
}

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
    maxParticipants: Number(params.maxParticipants || 20),
    category: params.category || '兴趣', tags,
    cover: 'linear-gradient(135deg, #3B82F6 0%, #6366F1 100%)',
    seedTag: 'huanhu-initial-v1', source: 'publish',
  }

  if (getUseCloud()) {
    const res = await addCloudDocument('activities', activity)
    return { ...activity, id: res._id, _id: res._id }
  }
  return { ...activity, id: `local_${Date.now()}` }
}

export async function getActivities(params?: { category?: string; page?: number; keyword?: string }) {
  if (getUseCloud()) {
    try {
      const res = await callCloudFunction('getActivities', params)
      return res.data as Activity[]
    } catch (e) { apiWarn('[API] getActivities cloud failed', e) }
    try {
      let activities = await getCloudCollection('activities', 20, { seedTag: 'huanhu-initial-v1' })
      if (params?.category && params.category !== '全部' && params.category !== '热门') {
        activities = activities.filter((a: any) => a.category === params.category)
      }
      return activities.map((a: any) => ({ ...a, id: a.id || a._id })) as Activity[]
    } catch (e) { apiWarn('[API] getActivities database failed', e) }
  }
  await delay()
  let activities = [...ACTIVITIES]
  if (params?.category && params.category !== '全部' && params.category !== '热门') {
    activities = activities.filter((a) => a.category === params.category)
  }
  return activities
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
    } catch (e) { apiWarn('[API] registerActivity failed', e) }
  }

  const activity = {
    ...(findActivity(params.activityId) || {}),
    ...(params.activity || {}),
    id: params.activityId,
  }
  const registration = {
    id: `local_registration_${params.activityId}`,
    activityId: params.activityId,
    activity,
    name: params.name || '',
    phone: params.phone || '',
    note: params.note || '',
    createdAt: new Date().toISOString(),
  }
  const current = readLocalRegistrations()
  writeLocalRegistrations([registration, ...current.filter((item) => String(item.activityId) !== String(params.activityId))])
  return { registered: true, registration }
}

export async function getMyActivityRegistrations() {
  if (getUseCloud()) {
    try {
      const res = await callCloudFunction('activity', { action: 'getMyRegistrations' })
      const data = res.data || []
      if (Array.isArray(data) && data.length) return data
    } catch (e) { apiWarn('[API] getMyActivityRegistrations failed', e) }
  }
  return readLocalRegistrations()
}

export async function cancelActivityRegistration(params: { registrationId?: string; activityId?: string }) {
  if (getUseCloud()) {
    try {
      const res = await callCloudFunction('activity', { action: 'cancelRegistration', ...params })
      return res.data || { canceled: true }
    } catch (e) { apiWarn('[API] cancelActivityRegistration failed', e) }
  }
  const next = readLocalRegistrations().filter((item) => (
    String(item.id) !== String(params.registrationId || '') &&
    String(item.activityId) !== String(params.activityId || '')
  ))
  writeLocalRegistrations(next)
  return { canceled: true }
}

export async function getActivityDetail(params: { activityId: string }) {
  if (getUseCloud()) {
    try {
      const res = await callCloudFunction('activity', { action: 'getDetail', ...params })
      return res.data || null
    } catch (e) { apiWarn('[API] getActivityDetail failed', e) }
  }
  return findActivity(params.activityId) || null
}
