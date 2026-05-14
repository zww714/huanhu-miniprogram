import { View, Text, ScrollView } from '@tarojs/components'
import Taro, { useDidShow, useLoad } from '@tarojs/taro'
import { useMemo, useState, useCallback } from 'react'
import { getFollowers, followUser as apiFollowUser } from '../../utils/api'
import {
  getPublicUser,
  normalizePublicUserId,
  openUnifiedUserProfile,
} from '../../utils/publicProfiles'
import './index.css'

function firstChar(name?: string) {
  return name?.charAt(0) || '同'
}

export default function UserFollowers() {
  const [routeUserId, setRouteUserId] = useState('')
  const [followers, setFollowers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [tick, setTick] = useState(0)

  useLoad((options) => {
    setRouteUserId(normalizePublicUserId(String(options?.userId || options?.id || '')))
  })

  const loadFollowers = useCallback(() => {
    if (!routeUserId) return
    setLoading(true)
    getFollowers({ userId: routeUserId })
      .then((res) => {
        setFollowers(res.data || [])
      })
      .catch((e) => {
        console.warn('[UserFollowers] getFollowers failed', e)
        setFollowers([])
      })
      .finally(() => setLoading(false))
  }, [routeUserId])

  useDidShow(() => {
    loadFollowers()
    setTick((v) => v + 1)
  })

  const user = useMemo(() => getPublicUser(routeUserId), [routeUserId])

  const openUser = (target: any) => {
    openUnifiedUserProfile(target.userId || target.id, target.name)
  }

  const followUser = async (target: any) => {
    const targetId = target.userId || target.id
    try {
      await apiFollowUser({ targetUserId: targetId })
      setFollowers((prev) => prev.map((u) =>
        (u.userId === targetId) ? { ...u, isFollowing: true, isMutual: true } : u
      ))
      Taro.showToast({ title: '已关注', icon: 'success' })
    } catch (e) {
      console.warn('[UserFollowers] follow failed', e)
      Taro.showToast({ title: '关注失败', icon: 'none' })
    }
  }

  const goChat = (target: any) => {
    const targetId = target.userId || target.id
    Taro.navigateTo({
      url: `/pages/chat/index?userId=${encodeURIComponent(targetId)}&id=${encodeURIComponent(targetId)}&name=${encodeURIComponent(target.name || '同学')}&category=${encodeURIComponent('个人主页')}`
    })
  }

  const showMore = (target: any) => {
    Taro.showActionSheet({
      itemList: ['查看主页', '举报用户', '拉黑用户'],
      success: ({ tapIndex }) => {
        if (tapIndex === 0) openUser(target)
        if (tapIndex === 1) Taro.showToast({ title: '举报已提交', icon: 'success' })
        if (tapIndex === 2) {
          Taro.showModal({
            title: '拉黑用户',
            content: '拉黑后对方将无法与你互动，确定拉黑吗？',
            confirmText: '拉黑',
            confirmColor: '#EF4444',
            success: ({ confirm }) => {
              if (!confirm) return
              Taro.showToast({ title: '已拉黑（仅本地），完整功能需云函数', icon: 'success' })
            },
          })
        }
      },
    })
  }

  return (
    <ScrollView scrollY className='relation-page' showScrollbar={false} enhanced bounces={false}>
      <View className='relation-header'>
        <Text className='back' onClick={() => Taro.navigateBack()}>←</Text>
        <View>
          <Text className='page-title'>TA的粉丝</Text>
          <Text className='page-subtitle'>{user.name} 的粉丝，共 {followers.length} 人</Text>
        </View>
      </View>

      <View className='user-list'>
        {loading && (
          <View className='loading-state'>
            <Text>加载中...</Text>
          </View>
        )}
        {!loading && !followers.length && (
          <View className='empty-state'>
            <Text>TA还没有粉丝</Text>
          </View>
        )}
        {followers.map((item) => (
          <View className='user-card' key={item.userId || item.id}>
            <View className='avatar' onClick={() => openUser(item)}>
              <Text>{firstChar(item.name)}</Text>
            </View>
            <View className='user-main' onClick={() => openUser(item)}>
              <View className='name-row'>
                <Text className='user-name'>{item.name}</Text>
                {item.isSpecial && <Text className='special-tag'>特别关注</Text>}
              </View>
              <Text className='user-meta'>{[item.college, item.grade, item.campus].filter(Boolean).join(' · ')}</Text>
              <Text className='user-intro' numberOfLines={1}>{item.intro || 'TA还没有完善更多资料'}</Text>
            </View>
            <View className='side-actions'>
              <View
                className={item.isFollowing ? 'follow-btn following' : 'follow-btn'}
                onClick={() => item.isFollowing ? goChat(item) : followUser(item)}
              >
                <Text>{item.isFollowing ? '发消息' : '关注'}</Text>
              </View>
              <Text className='more' onClick={() => showMore(item)}>...</Text>
            </View>
          </View>
        ))}
      </View>
      <View className='safe-bottom' />
    </ScrollView>
  )
}
