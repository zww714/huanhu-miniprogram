import { useState, useCallback } from 'react'
import Taro, { useDidShow } from '@tarojs/taro'
import { Text, View } from '@tarojs/components'
import { getFollowing, unfollowUser as apiUnfollowUser, blockUser as apiBlockUser, setSpecialFollow as apiSetSpecialFollow } from '../../utils/api'
import { openUnifiedUserProfile } from '../../utils/publicProfiles'
import { MOCK_RELATIONS } from '../../utils/mock'
import './index.css'

const getFallbackFollowing = (filter: 'all' | 'special') => {
  const list = MOCK_RELATIONS.filter((user) => user.isFollowing)
  return filter === 'special' ? list.filter((user) => user.isSpecial) : list
}

export default function MyFollowing() {
  const [filter, setFilter] = useState<'all' | 'special'>('all')
  const [following, setFollowing] = useState<any[]>(getFallbackFollowing('all'))
  const [total, setTotal] = useState(getFallbackFollowing('all').length)
  const [loading, setLoading] = useState(false)
  const [manageMode, setManageMode] = useState(false)
  const [selectedIds, setSelectedIds] = useState<string[]>([])

  const loadFollowing = useCallback(() => {
    const fallback = getFallbackFollowing(filter)
    setLoading(false)
    setFollowing(fallback)
    setTotal(fallback.length)
    getFollowing({ filter: filter === 'special' ? 'special' : undefined })
      .then((res) => {
        const data = Array.isArray(res.data) ? res.data : []
        const next = data.length ? data : fallback
        setFollowing(next)
        setTotal(data.length ? (res.total || data.length) : fallback.length)
      })
      .catch((e) => {
        console.warn('[MyFollowing] getFollowing failed', e)
        setFollowing(fallback)
        setTotal(fallback.length)
      })
      .finally(() => setLoading(false))
  }, [filter])

  useDidShow(() => {
    loadFollowing()
  })

  const visibleUsers = following
  const allSelected = visibleUsers.length > 0 && selectedIds.length === visibleUsers.length

  const goUser = (userId: string) => {
    openUnifiedUserProfile(userId)
  }

  const toggleSelect = (userId: string) => {
    setSelectedIds((current) => current.includes(userId) ? current.filter((id) => id !== userId) : [...current, userId])
  }

  const toggleSpecial = async (userId: string) => {
    const target = following.find((u) => u.userId === userId)
    const nextSpecial = !target?.isSpecial
    try {
      await apiSetSpecialFollow({ targetUserId: userId, isSpecial: nextSpecial })
      setFollowing((prev) => prev.map((u) => u.userId === userId ? { ...u, isSpecial: nextSpecial } : u))
      Taro.showToast({ title: nextSpecial ? '已设为特别关注' : '已取消特别关注', icon: 'success' })
    } catch (e) {
      console.warn('[MyFollowing] toggleSpecial failed', e)
      Taro.showToast({ title: '操作失败', icon: 'none' })
    }
  }

  const confirmUnfollow = async (ids: string[]) => {
    if (!ids.length) {
      Taro.showToast({ title: '请先选择用户', icon: 'none' })
      return
    }
    Taro.showModal({
      title: '取消关注',
      content: ids.length > 1 ? `确认取消关注选中的 ${ids.length} 位同学吗？` : '确认取消关注该用户吗？',
      confirmText: '取消关注',
      confirmColor: '#EF4444',
      success: async ({ confirm }) => {
        if (!confirm) return
        for (const id of ids) {
          try {
            await apiUnfollowUser({ targetUserId: id })
          } catch (e) {
            console.warn('[MyFollowing] unfollow failed for', id, e)
          }
        }
        setFollowing((prev) => prev.filter((u) => !ids.includes(u.userId)))
        setTotal((prev) => Math.max(0, prev - ids.length))
        setSelectedIds([])
        Taro.showToast({ title: '已取消关注', icon: 'success' })
      },
    })
  }

  const confirmBlock = async (ids: string[]) => {
    if (!ids.length) {
      Taro.showToast({ title: '请先选择用户', icon: 'none' })
      return
    }
    Taro.showModal({
      title: '拉黑用户',
      content: ids.length > 1 ? `确认拉黑选中的 ${ids.length} 位同学吗？` : '拉黑后将不再显示该用户，确定继续吗？',
      confirmText: '拉黑',
      confirmColor: '#EF4444',
      success: async ({ confirm }) => {
        if (!confirm) return
        for (const id of ids) {
          try {
            await apiBlockUser({ targetUserId: id })
          } catch (e) {
            console.warn('[MyFollowing] block failed for', id, e)
          }
        }
        setFollowing((prev) => prev.filter((u) => !ids.includes(u.userId)))
        setSelectedIds([])
        Taro.showToast({ title: '已拉黑', icon: 'success' })
      },
    })
  }

  const reportUser = () => {
    Taro.showActionSheet({
      itemList: ['资料不真实', '骚扰或广告', '不友善内容'],
      success: () => Taro.showToast({ title: '已提交举报', icon: 'success' }),
    })
  }

  const batchSpecial = async () => {
    if (!selectedIds.length) {
      Taro.showToast({ title: '请先选择用户', icon: 'none' })
      return
    }
    for (const id of selectedIds) {
      try {
        await apiSetSpecialFollow({ targetUserId: id, isSpecial: true })
      } catch (e) {
        console.warn('[MyFollowing] batchSpecial failed for', id, e)
      }
    }
    setFollowing((prev) => prev.map((u) => selectedIds.includes(u.userId) ? { ...u, isSpecial: true } : u))
    Taro.showToast({ title: '已设为特别关注', icon: 'success' })
  }

  const showMore = (user: any) => {
    Taro.showActionSheet({
      itemList: ['查看主页', user.isSpecial ? '取消特别关注' : '设为特别关注', '取消关注', '举报', '拉黑'],
      success: ({ tapIndex }) => {
        if (tapIndex === 0) goUser(user.userId)
        if (tapIndex === 1) toggleSpecial(user.userId)
        if (tapIndex === 2) confirmUnfollow([user.userId])
        if (tapIndex === 3) reportUser()
        if (tapIndex === 4) confirmBlock([user.userId])
      },
    })
  }

  if (loading) {
    return (
      <View className='following-page'>
        <View className='loading-state'>
          <Text>加载中...</Text>
        </View>
      </View>
    )
  }

  return (
    <View className='following-page'>
      <View className='page-header'>
        <View>
          <Text className='page-title'>我的关注</Text>
          <Text className='page-subtitle'>共 {total} 人，{following.filter((u) => u.isSpecial).length} 位特别关注</Text>
        </View>
        <View className={`outline-pill ${manageMode ? 'active' : ''}`} onClick={() => { setManageMode(!manageMode); setSelectedIds([]) }}>
          <Text>{manageMode ? '完成' : '管理'}</Text>
        </View>
      </View>

      <View className='filter-row'>
        <View className={`filter-pill ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}>
          <Text>全部</Text>
        </View>
        <View className={`filter-pill ${filter === 'special' ? 'active' : ''}`} onClick={() => setFilter('special')}>
          <Text>特别关注</Text>
        </View>
      </View>

      {manageMode && (
        <View className='batch-top'>
          <Text onClick={() => setSelectedIds(allSelected ? [] : visibleUsers.map((u) => u.userId))}>{allSelected ? '取消全选' : '全选'}</Text>
          <Text>{selectedIds.length ? `已选 ${selectedIds.length} 人` : '选择需要管理的关注'}</Text>
        </View>
      )}

      <View className='user-list'>
        {!visibleUsers.length && (
          <View className='empty-state'>
            <Text>
              {filter === 'special' ? '还没有特别关注的人' : '还没有关注的人'}
            </Text>
          </View>
        )}
        {visibleUsers.map((user) => (
          <View className='user-card' key={user.userId} onClick={() => manageMode ? toggleSelect(user.userId) : undefined}>
            {manageMode && (
              <View className={`check-box ${selectedIds.includes(user.userId) ? 'checked' : ''}`}>
                <Text>{selectedIds.includes(user.userId) ? '✓' : ''}</Text>
              </View>
            )}
            <View className='avatar' onClick={(e) => { e.stopPropagation(); goUser(user.userId) }}>
              <Text>{(user.name || '同').slice(0, 1)}</Text>
            </View>
            <View className='user-main'>
              <View className='name-row'>
                <Text className='user-name' onClick={(e) => { e.stopPropagation(); goUser(user.userId) }}>{user.name}</Text>
                {user.isSpecial && <Text className='special-tag'>特别关注</Text>}
              </View>
              <Text className='user-meta'>{[user.college, user.grade, user.campus].filter(Boolean).join(' · ')}</Text>
              <Text className='user-intro'>{user.intro || 'TA还没有完善更多资料'}</Text>
            </View>
            {!manageMode && (
              <View className='side-actions'>
                <View className='followed-btn' onClick={() => confirmUnfollow([user.userId])}>
                  <Text>已关注</Text>
                </View>
                <View className='more-btn' onClick={() => showMore(user)}>
                  <Text>...</Text>
                </View>
              </View>
            )}
          </View>
        ))}
      </View>

      {manageMode && (
        <View className='batch-bar'>
          <Text className='batch-count'>已选 {selectedIds.length} 人</Text>
          <Text className='batch-action' onClick={batchSpecial}>特别关注</Text>
          <Text className='batch-danger' onClick={() => confirmUnfollow(selectedIds)}>取消关注</Text>
          <Text className='batch-danger' onClick={() => confirmBlock(selectedIds)}>拉黑</Text>
        </View>
      )}
    </View>
  )
}
