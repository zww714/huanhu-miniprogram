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

const MESSAGE_TAB_INDEX = 2

export function getBlockedNotificationTypes(): NotificationType[] {
  const blocked = Taro.getStorageSync(BLOCKED_NOTIFICATION_TYPES_KEY)
  return Array.isArray(blocked) ? blocked : []
}

export function getNotifications(): AppNotification[] {
  const saved = Taro.getStorageSync(NOTIFICATIONS_STORAGE_KEY)
  if (Array.isArray(saved) && saved.length) {
    const hasLegacyCommentTarget = saved.some((item) => item.type === 'comments' && item.targetType !== 'post')
    if (!hasLegacyCommentTarget) return saved
  }
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

export function getNotificationUnreadTotal() {
  const counts = getUnreadCounts()
  return Object.values(counts).reduce((sum, count) => sum + count, 0)
}

export function updateMessageTabUnread(extraUnread = 0) {
  const total = getNotificationUnreadTotal() + Math.max(0, extraUnread)
  try {
    if (total > 0) {
      Taro.setTabBarBadge({
        index: MESSAGE_TAB_INDEX,
        text: total > 99 ? '99+' : String(total),
      })
      return total
    }
    Taro.removeTabBarBadge({ index: MESSAGE_TAB_INDEX })
    Taro.hideTabBarRedDot({ index: MESSAGE_TAB_INDEX })
    return 0
  } catch (e) {
    return total
  }
}

export function updateNotification(id: string, patch: Partial<AppNotification>) {
  const next = getNotifications().map((item) => item.id === id ? { ...item, ...patch } : item)
  saveNotifications(next)
  updateMessageTabUnread()
  return next
}

export function removeNotification(id: string) {
  const next = getNotifications().filter((item) => item.id !== id)
  saveNotifications(next)
  updateMessageTabUnread()
  return next
}

export function markTypeRead(type: NotificationType) {
  const next = getNotifications().map((item) => (
    item.type === type && !item.blocked ? { ...item, read: true } : item
  ))
  saveNotifications(next)
  updateMessageTabUnread()
  return next
}

export function markAllNotificationsRead() {
  const blockedTypes = getBlockedNotificationTypes()
  const next = getNotifications().map((item) => (
    !item.blocked && !blockedTypes.includes(item.type) ? { ...item, read: true } : item
  ))
  saveNotifications(next)
  updateMessageTabUnread()
  return next
}

export function blockNotificationType(type: NotificationType) {
  const blocked = Array.from(new Set([...getBlockedNotificationTypes(), type]))
  Taro.setStorageSync(BLOCKED_NOTIFICATION_TYPES_KEY, blocked)
  const next = getNotifications().map((item) => item.type === type ? { ...item, blocked: true } : item)
  saveNotifications(next)
  updateMessageTabUnread()
  return next
}
