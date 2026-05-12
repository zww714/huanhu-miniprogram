import Taro from '@tarojs/taro'
import {
  BLOCKED_NOTIFICATION_TYPES_KEY,
  NOTIFICATIONS,
  NOTIFICATIONS_STORAGE_KEY,
  type AppNotification,
  type NotificationType,
} from './mock'

export const notificationTitles: Record<NotificationType, string> = {
  likes: '赞和收藏',
  follows: '新增关注',
  comments: '评论和@',
  system: '系统通知',
}

export function getBlockedNotificationTypes(): NotificationType[] {
  const blocked = Taro.getStorageSync(BLOCKED_NOTIFICATION_TYPES_KEY)
  return Array.isArray(blocked) ? blocked : []
}

export function getNotifications(): AppNotification[] {
  const saved = Taro.getStorageSync(NOTIFICATIONS_STORAGE_KEY)
  if (Array.isArray(saved) && saved.length) return saved
  Taro.setStorageSync(NOTIFICATIONS_STORAGE_KEY, NOTIFICATIONS)
  return NOTIFICATIONS
}

export function saveNotifications(notifications: AppNotification[]) {
  Taro.setStorageSync(NOTIFICATIONS_STORAGE_KEY, notifications)
}

export function getVisibleNotifications(type?: NotificationType) {
  const blockedTypes = getBlockedNotificationTypes()
  return getNotifications().filter((item) => {
    if (type && item.type !== type) return false
    return !item.blocked && !blockedTypes.includes(item.type)
  })
}

export function getUnreadCounts() {
  const counts: Record<NotificationType, number> = {
    likes: 0,
    follows: 0,
    comments: 0,
    system: 0,
  }

  getVisibleNotifications().forEach((item) => {
    if (!item.read) counts[item.type] += 1
  })

  return counts
}

export function updateNotification(id: string, patch: Partial<AppNotification>) {
  const next = getNotifications().map((item) => item.id === id ? { ...item, ...patch } : item)
  saveNotifications(next)
  return next
}

export function removeNotification(id: string) {
  const next = getNotifications().filter((item) => item.id !== id)
  saveNotifications(next)
  return next
}

export function markTypeRead(type: NotificationType) {
  const next = getNotifications().map((item) => (
    item.type === type && !item.blocked ? { ...item, read: true } : item
  ))
  saveNotifications(next)
  return next
}

export function blockNotificationType(type: NotificationType) {
  const blocked = Array.from(new Set([...getBlockedNotificationTypes(), type]))
  Taro.setStorageSync(BLOCKED_NOTIFICATION_TYPES_KEY, blocked)
  const next = getNotifications().map((item) => item.type === type ? { ...item, blocked: true } : item)
  saveNotifications(next)
  return next
}
