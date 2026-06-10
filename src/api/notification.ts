/**
 * API 通知模块
 */
import { callCloudFunction, apiWarn, getUseCloud } from './base'

const NOTIFICATION_SETTINGS_KEY = 'huanhuNotificationSettings'

function isNotificationEnabled(type?: string) {
  if (!type) return true
  const saved = wx.getStorageSync(NOTIFICATION_SETTINGS_KEY)
  if (!saved || typeof saved !== 'object') return true
  return saved[type] !== false
}

function applyNotificationSettings(counts: Record<string, number>) {
  return Object.keys(counts).reduce((next, key) => ({
    ...next,
    [key]: isNotificationEnabled(key) ? Number(counts[key] || 0) : 0,
  }), {} as Record<string, number>)
}

export async function getNotificationUnreadCounts() {
  if (getUseCloud()) {
    try {
      const res = await callCloudFunction('notification', { action: 'getUnreadCounts' })
      return applyNotificationSettings(res.data || { likes: 0, follows: 0, comments: 0, system: 0 })
    } catch (e) { apiWarn('[API] getNotificationUnreadCounts failed', e) }
  }
  return applyNotificationSettings({ likes: 0, follows: 0, comments: 0, system: 0 })
}

export async function getNotifications(params: {
  type?: string; filter?: string; page?: number; pageSize?: number
}) {
  if (!isNotificationEnabled(params.type)) return { data: [], total: 0 }
  if (getUseCloud()) {
    try {
      const res = await callCloudFunction('notification', { action: 'getNotifications', ...params })
      return { data: res.data || [], total: res.total || 0 }
    } catch (e) { apiWarn('[API] getNotifications failed', e) }
  }
  return { data: [], total: 0 }
}

export async function markNotificationsRead(params: { ids?: string[]; type?: string; all?: boolean }) {
  if (getUseCloud()) {
    try {
      const res = await callCloudFunction('notification', { action: 'markRead', ...params })
      return res.data || { marked: true }
    } catch (e) { apiWarn('[API] markNotificationsRead failed', e) }
  }
  return { marked: true }
}

export async function deleteNotification(params: { id: string }) {
  if (getUseCloud()) {
    try {
      const res = await callCloudFunction('notification', { action: 'delete', ...params })
      return res.data || { deleted: true }
    } catch (e) { apiWarn('[API] deleteNotification failed', e) }
  }
  return { deleted: true }
}
