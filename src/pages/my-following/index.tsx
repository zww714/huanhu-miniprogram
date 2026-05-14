import { useState } from 'react'
import Taro, { useDidShow } from '@tarojs/taro'
import { Text, View } from '@tarojs/components'
import { MOCK_RELATIONS, type UserRelation } from '../../utils/mock'
import { openUnifiedUserProfile } from '../../utils/publicProfiles'
import './index.css'

const STORAGE_KEY = 'myUserRelations'

function readRelations() {
  const cached = Taro.getStorageSync(STORAGE_KEY)
  return Array.isArray(cached) && cached.length ? cached : MOCK_RELATIONS
}

function saveRelations(relations: UserRelation[]) {
  Taro.setStorageSync(STORAGE_KEY, relations)
}

export default function MyFollowing() {
  const [relations, setRelations] = useState<UserRelation[]>([])
  const [filter, setFilter] = useState<'all' | 'special'>('all')
  const [manageMode, setManageMode] = useState(false)
  const [selectedIds, setSelectedIds] = useState<string[]>([])

  useDidShow(() => {
    setRelations(readRelations())
  })

  const following = relations.filter((user) => user.isFollowing && !user.isBlocked)
  const visibleUsers = following.filter((user) => filter === 'all' || user.isSpecial)
  const allSelected = visibleUsers.length > 0 && selectedIds.length === visibleUsers.length

  const updateRelations = (next: UserRelation[]) => {
    setRelations(next)
    saveRelations(next)
  }

  const goUser = (userId: string) => {
    const target = relations.find((user) => user.userId === userId)
    openUnifiedUserProfile(userId, target?.name)
  }

  const toggleSelect = (userId: string) => {
    setSelectedIds((current) => current.includes(userId) ? current.filter((id) => id !== userId) : [...current, userId])
  }

  const toggleSpecial = (userId: string) => {
    const target = relations.find((user) => user.userId === userId)
    updateRelations(relations.map((user) => user.userId === userId ? { ...user, isSpecial: !user.isSpecial } : user))
    Taro.showToast({ title: target?.isSpecial ? '已取消特别关注' : '已设为特别关注', icon: 'success' })
  }

  const confirmUnfollow = (ids: string[]) => {
    if (!ids.length) {
      Taro.showToast({ title: '请先选择用户', icon: 'none' })
      return
    }
    Taro.showModal({
      title: '取消关注',
      content: ids.length > 1 ? `确认取消关注选中的 ${ids.length} 位同学吗？` : '确认取消关注该用户吗？',
      confirmText: '取消关注',
      confirmColor: '#EF4444',
      success: ({ confirm }) => {
        if (!confirm) return
        updateRelations(relations.map((user) => ids.includes(user.userId)
          ? { ...user, isFollowing: false, isMutual: false, isSpecial: false, relationType: user.isFollower ? 'follower' as const : user.relationType }
          : user))
        setSelectedIds([])
        Taro.showToast({ title: '已取消关注', icon: 'success' })
      },
    })
  }

  const confirmBlock = (ids: string[]) => {
    if (!ids.length) {
      Taro.showToast({ title: '请先选择用户', icon: 'none' })
      return
    }
    Taro.showModal({
      title: '拉黑用户',
      content: ids.length > 1 ? `确认拉黑选中的 ${ids.length} 位同学吗？` : '拉黑后将不再显示该用户，确定继续吗？',
      confirmText: '拉黑',
      confirmColor: '#EF4444',
      success: ({ confirm }) => {
        if (!confirm) return
        updateRelations(relations.map((user) => ids.includes(user.userId)
          ? { ...user, isBlocked: true, isFollowing: false, isFollower: false, isMutual: false, isSpecial: false }
          : user))
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

  const batchSpecial = () => {
    if (!selectedIds.length) {
      Taro.showToast({ title: '请先选择用户', icon: 'none' })
      return
    }
    updateRelations(relations.map((user) => selectedIds.includes(user.userId) ? { ...user, isSpecial: true } : user))
    Taro.showToast({ title: '已设为特别关注', icon: 'success' })
  }

  const showMore = (user: UserRelation) => {
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

  return (
    <View className='following-page'>
      <View className='page-header'>
        <View>
          <Text className='page-title'>我的关注</Text>
          <Text className='page-subtitle'>共 {following.length} 人，{following.filter((user) => user.isSpecial).length} 位特别关注</Text>
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
          <Text onClick={() => setSelectedIds(allSelected ? [] : visibleUsers.map((user) => user.userId))}>{allSelected ? '取消全选' : '全选'}</Text>
          <Text>{selectedIds.length ? `已选 ${selectedIds.length} 人` : '选择需要管理的关注'}</Text>
        </View>
      )}

      <View className='user-list'>
        {visibleUsers.map((user) => (
          <View className='user-card' key={user.userId} onClick={() => manageMode ? toggleSelect(user.userId) : undefined}>
            {manageMode && (
              <View className={`check-box ${selectedIds.includes(user.userId) ? 'checked' : ''}`}>
                <Text>{selectedIds.includes(user.userId) ? '✓' : ''}</Text>
              </View>
            )}
            <View className='avatar' onClick={(event) => { event.stopPropagation(); goUser(user.userId) }}>
              <Text>{user.name.slice(0, 1)}</Text>
            </View>
            <View className='user-main'>
              <View className='name-row'>
                <Text className='user-name' onClick={(event) => { event.stopPropagation(); goUser(user.userId) }}>{user.name}</Text>
                {user.isSpecial && <Text className='special-tag'>特别关注</Text>}
              </View>
              <Text className='user-meta'>{user.college} · {user.grade} · {user.campus}</Text>
              <Text className='user-intro'>{user.intro}</Text>
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
