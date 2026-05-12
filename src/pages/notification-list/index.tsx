import { useState } from 'react'
import Taro, { useDidShow, useLoad } from '@tarojs/taro'
import { Image, ScrollView, Text, View } from '@tarojs/components'
import { type AppNotification, type NotificationType } from '../../utils/mock'
import {
  blockNotificationType,
  getBlockedNotificationTypes,
  getVisibleNotifications,
  markTypeRead,
  notificationTitles,
  removeNotification,
  updateNotification,
} from '../../utils/notifications'
import './index.css'

const validTypes: NotificationType[] = ['likes', 'follows', 'comments', 'system']

function Avatar({ name, avatar }: { name?: string; avatar?: string }) {
  return (
    <View className='notice-avatar'>
      {avatar ? <Image className='avatar-img' src={avatar} mode='aspectFill' /> : <Text>{(name || '系').charAt(0)}</Text>}
    </View>
  )
}

export default function NotificationList() {
  const [type, setType] = useState<NotificationType>('likes')
  const [items, setItems] = useState<AppNotification[]>([])
  const [blocked, setBlocked] = useState(false)

  const refresh = (nextType = type) => {
    setBlocked(getBlockedNotificationTypes().includes(nextType))
    setItems(getVisibleNotifications(nextType))
  }

  useLoad((options) => {
    const queryType = String(options?.type || 'likes') as NotificationType
    const nextType = validTypes.includes(queryType) ? queryType : 'likes'
    setType(nextType)
    refresh(nextType)
  })

  useDidShow(() => refresh())

  const unreadCount = items.filter((item) => !item.read).length
  const title = notificationTitles[type]

  const handleBack = () => Taro.navigateBack()
  const markOne = (item: AppNotification, read: boolean) => {
    updateNotification(item.id, { read })
    refresh()
  }
  const deleteOne = (item: AppNotification) => {
    Taro.showModal({
      title: '删除通知',
      content: '确定要删除这条通知吗？',
      confirmText: '删除',
      confirmColor: '#EF4444',
      success: (res) => {
        if (!res.confirm) return
        removeNotification(item.id)
        refresh()
        Taro.showToast({ title: '已删除', icon: 'success' })
      },
    })
  }
  const blockType = () => {
    Taro.showModal({
      title: '屏蔽通知',
      content: '确定要屏蔽此类通知吗？',
      confirmText: '屏蔽',
      confirmColor: '#EF4444',
      success: (res) => {
        if (!res.confirm) return
        blockNotificationType(type)
        refresh()
        Taro.showToast({ title: '已屏蔽', icon: 'none' })
      },
    })
  }
  const handleMore = (item: AppNotification) => {
    Taro.showActionSheet({
      itemList: [item.read ? '标为未读' : '标为已读', '删除通知', '屏蔽此类通知'],
      success: (res) => {
        if (res.tapIndex === 0) markOne(item, !item.read)
        if (res.tapIndex === 1) deleteOne(item)
        if (res.tapIndex === 2) blockType()
      },
    })
  }
  const handleAllRead = () => {
    markTypeRead(type)
    refresh()
    Taro.showToast({ title: '已全部标为已读', icon: 'success' })
  }
  const handleNoticeTap = (item: AppNotification) => {
    if (!item.read) updateNotification(item.id, { read: true })
    if (item.targetType === 'post' && item.targetId) {
      Taro.navigateTo({ url: `/pages/post-detail/index?postId=${encodeURIComponent(item.targetId)}` })
      return
    }
    if (item.targetType === 'user' && item.targetId) {
      Taro.navigateTo({ url: `/pages/user-detail/index?userId=${encodeURIComponent(item.targetId)}` })
      return
    }
    if (item.targetType === 'activity') {
      Taro.showToast({ title: '活动详情后续开放', icon: 'none' })
      refresh()
      return
    }
    Taro.showModal({ title: item.title, content: item.content, showCancel: false })
    refresh()
  }

  return (
    <View className='notice-page'>
      <View className='notice-nav'>
        <Text className='nav-action' onClick={handleBack}>‹</Text>
        <Text className='nav-title'>{title}</Text>
        <Text className='nav-action'>•••</Text>
      </View>

      <View className='notice-summary'>
        <View>
          <Text className='summary-title'>{title}</Text>
          <Text className='summary-desc'>{blocked ? '已屏蔽此类通知' : `未读 ${unreadCount} 条`}</Text>
        </View>
        {!blocked && items.length > 0 && (
          <View className='read-all-btn' onClick={handleAllRead}>
            <Text>全部已读</Text>
          </View>
        )}
      </View>

      <ScrollView scrollY className='notice-scroll' showScrollbar={false}>
        {blocked ? (
          <View className='empty-card'>
            <Text className='empty-title'>已屏蔽此类通知</Text>
            <Text className='empty-desc'>后续可以在通知设置页重新开启。</Text>
          </View>
        ) : items.length ? (
          <View className='notice-list'>
            {items.map((item) => (
              <View className={item.read ? 'notice-item' : 'notice-item unread'} key={item.id}>
                {!item.read && <View className='unread-dot' />}
                <View className='notice-body' onClick={() => handleNoticeTap(item)}>
                  <Avatar name={item.fromUserName || title} avatar={item.fromUserAvatar} />
                  <View className='notice-main'>
                    <View className='notice-title-row'>
                      <Text className={item.read ? 'notice-title' : 'notice-title unread'}>{item.title}</Text>
                      <Text className='notice-time'>{item.createdAt}</Text>
                    </View>
                    <Text className='notice-content'>{item.content}</Text>
                    {!!item.targetTitle && <Text className='notice-target'>{item.targetTitle}</Text>}
                  </View>
                </View>
                <Text className='notice-more' onClick={() => handleMore(item)}>•••</Text>
              </View>
            ))}
          </View>
        ) : (
          <View className='empty-card'>
            <Text className='empty-title'>暂无通知</Text>
            <Text className='empty-desc'>这里会展示新的{title}。</Text>
          </View>
        )}
        <View className='bottom-space' />
      </ScrollView>
    </View>
  )
}
