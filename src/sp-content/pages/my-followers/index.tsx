import { useState, useCallback } from 'react'
import Taro, { useDidShow } from '@tarojs/taro'
import { Text, View } from '@tarojs/components'
import { getFollowers, followUser as apiFollowUser, unfollowUser as apiUnfollowUser, blockUser as apiBlockUser, setSpecialFollow as apiSetSpecialFollow } from '../../../utils/api'
import { openUnifiedUserProfile } from '../../../utils/publicProfiles'
import { MOCK_RELATIONS } from '../../../utils/mock'
import './index.css'

const fallbackFollowers = MOCK_RELATIONS.filter((user) => user.isFollower)

export default function MyFollowers() {
  const [followers, setFollowers] = useState<any[]>(fallbackFollowers)
  const [total, setTotal] = useState(fallbackFollowers.length)
  const [loading, setLoading] = useState(false)

  const loadFollowers = useCallback(() => {
    setLoading(false)
    getFollowers({})
      .then((res) => {
        const data = Array.isArray(res.data) ? res.data : []
        const next = data.length ? data : fallbackFollowers
        setFollowers(next)
        setTotal(data.length ? (res.total || data.length) : fallbackFollowers.length)
      })
      .catch((e) => {
        console.warn('[MyFollowers] getFollowers failed', e)
        setFollowers(fallbackFollowers)
        setTotal(fallbackFollowers.length)
      })
      .finally(() => setLoading(false))
  }, [])

  useDidShow(() => {
    loadFollowers()
  })

  const unfollowedCount = followers.filter((u) => !u.isFollowing).length

  const goUser = (userId: string) => {
    openUnifiedUserProfile(userId)
  }

  const followBack = async (userId: string, silent = false) => {
    try {
      const res = await apiFollowUser({ targetUserId: userId })
      setFollowers((prev) => prev.map((u) =>
        u.userId === userId ? { ...u, isFollowing: true, isMutual: true } : u
      ))
      if (!silent) Taro.showToast({ title: '已回关', icon: 'success' })
    } catch (e) {
      console.warn('[MyFollowers] followBack failed', e)
      if (!silent) Taro.showToast({ title: '操作失败', icon: 'none' })
    }
  }

  const followBackAll = async () => {
    const toFollow = followers.filter((u) => !u.isFollowing)
    if (!toFollow.length) {
      Taro.showToast({ title: '暂无需要回关的人', icon: 'none' })
      return
    }
    Taro.showModal({
      title: '一键回关',
      content: `确认回关所有未关注的 ${toFollow.length} 位粉丝吗？`,
      success: async ({ confirm }) => {
        if (!confirm) return
        // 批量操作，串行执行
        for (const user of toFollow) {
          await followBack(user.userId, true)
        }
        Taro.showToast({ title: '已全部回关', icon: 'success' })
      },
    })
  }

  const confirmRemove = (user: any) => {
    Taro.showModal({
      title: '移除粉丝',
      content: `确定将 ${user.name} 从粉丝列表移除吗（不移除粉丝数）？`,
      confirmText: '移除',
      confirmColor: '#EF4444',
      success: ({ confirm }) => {
        if (!confirm) return
        setFollowers((prev) => prev.filter((item) => item.userId !== user.userId))
        Taro.showToast({ title: '已移除', icon: 'success' })
      },
    })
  }

  const confirmBlock = (user: any) => {
    Taro.showModal({
      title: '拉黑用户',
      content: `拉黑后将不再显示 ${user.name}，确定继续吗？`,
      confirmText: '拉黑',
      confirmColor: '#EF4444',
      success: async ({ confirm }) => {
        if (!confirm) return
        try {
          await apiBlockUser({ targetUserId: user.userId })
          setFollowers((prev) => prev.filter((item) => item.userId !== user.userId))
          Taro.showToast({ title: '已拉黑', icon: 'success' })
        } catch (e) {
          console.warn('[MyFollowers] block failed', e)
          Taro.showToast({ title: '操作失败', icon: 'none' })
        }
      },
    })
  }

  const reportUser = () => {
    Taro.showActionSheet({
      itemList: ['资料不真实', '骚扰或广告', '不友善内容'],
      success: () => Taro.showToast({ title: '已提交举报', icon: 'success' }),
      fail: () => undefined,
    })
  }

  const toggleSpecial = async (user: any) => {
    const nextSpecial = !user.isSpecial
    try {
      await apiSetSpecialFollow({ targetUserId: user.userId, isSpecial: nextSpecial })
      setFollowers((prev) => prev.map((item) =>
        item.userId === user.userId ? { ...item, isSpecial: nextSpecial } : item
      ))
      Taro.showToast({ title: nextSpecial ? '已设为特别关注' : '已取消特别关注', icon: 'success' })
    } catch (e) {
      console.warn('[MyFollowers] toggleSpecial failed', e)
      Taro.showToast({ title: '操作失败', icon: 'none' })
    }
  }

  const showMore = (user: any) => {
    Taro.showActionSheet({
      itemList: ['查看主页', user.isSpecial ? '取消特别关注' : '设为特别关注', '移除粉丝', '举报', '拉黑'],
      success: ({ tapIndex }) => {
        if (tapIndex === 0) goUser(user.userId)
        if (tapIndex === 1) toggleSpecial(user)
        if (tapIndex === 2) confirmRemove(user)
        if (tapIndex === 3) reportUser()
        if (tapIndex === 4) confirmBlock(user)
      },
      fail: () => undefined,
    })
  }

  if (loading) {
    return (
      <View className='relation-page'>
        <View className='loading-state'>
          <Text>加载中...</Text>
        </View>
      </View>
    )
  }

  return (
    <View className='relation-page'>
      <View className='page-header'>
        <View>
          <Text className='page-title'>我的粉丝</Text>
          <Text className='page-subtitle'>共 {total} 人，{unfollowedCount} 人待回关</Text>
        </View>
        <View className='header-actions'>
          <View className='primary-pill' onClick={followBackAll}>
            <Text>一键回关</Text>
          </View>
          <View className='outline-pill' onClick={() => Taro.showToast({ title: '可通过每条右侧 ... 管理关系', icon: 'none' })}>
            <Text>管理</Text>
          </View>
        </View>
      </View>

      <View className='user-list'>
        {!followers.length && (
          <View className='empty-state'>
            <Text>还没有粉丝</Text>
          </View>
        )}
        {followers.map((user) => (
          <View className='user-card' key={user.userId}>
            <View className='avatar' onClick={() => goUser(user.userId)}>
              <Text>{(user.name || '同').slice(0, 1)}</Text>
            </View>
            <View className='user-main'>
              <View className='name-row'>
                <Text className='user-name' onClick={() => goUser(user.userId)}>{user.name}</Text>
                {user.isSpecial && <Text className='special-tag'>特别关注</Text>}
              </View>
              <Text className='user-meta'>{[user.college, user.grade, user.campus].filter(Boolean).join(' · ')}</Text>
              <Text className='user-intro'>{user.intro || 'TA还没有完善更多资料'}</Text>
            </View>
            <View className='side-actions'>
              <View
                className={`follow-btn ${user.isFollowing ? 'muted' : ''}`}
                onClick={() => user.isFollowing ? undefined : followBack(user.userId)}
              >
                <Text>{user.isMutual ? '互相关注' : user.isFollowing ? '已关注' : '回关'}</Text>
              </View>
              <View className='more-btn' onClick={() => showMore(user)}>
                <Text>...</Text>
              </View>
            </View>
          </View>
        ))}
      </View>

      {!loading && !followers.length && (
        <View className='safe-bottom' />
      )}
    </View>
  )
}
