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

function getRelationLabel(user: UserRelation) {
  if (user.isMutual) return '互相关注'
  if (user.isFollowing) return '已关注'
  return '未关注'
}

export default function MyFollowers() {
  const [relations, setRelations] = useState<UserRelation[]>([])

  useDidShow(() => {
    setRelations(readRelations())
  })

  const followers = relations.filter((user) => user.isFollower && !user.isBlocked)
  const unfollowedCount = followers.filter((user) => !user.isFollowing).length

  const updateRelations = (next: UserRelation[]) => {
    setRelations(next)
    saveRelations(next)
  }

  const goUser = (userId: string) => {
    const target = relations.find((user) => user.userId === userId)
    openUnifiedUserProfile(userId, target?.name)
  }

  const followBack = (userId: string, silent = false) => {
    const next = relations.map((user) => user.userId === userId
      ? { ...user, isFollowing: true, isMutual: user.isFollower, relationType: user.isFollower ? 'mutual' as const : user.relationType }
      : user)
    updateRelations(next)
    if (!silent) Taro.showToast({ title: '已回关', icon: 'success' })
  }

  const followBackAll = () => {
    if (!unfollowedCount) {
      Taro.showToast({ title: '暂无需要回关的人', icon: 'none' })
      return
    }
    Taro.showModal({
      title: '一键回关',
      content: `确认回关所有未关注的 ${unfollowedCount} 位粉丝吗？`,
      success: ({ confirm }) => {
        if (!confirm) return
        const next = relations.map((user) => user.isFollower && !user.isFollowing
          ? { ...user, isFollowing: true, isMutual: true, relationType: 'mutual' as const }
          : user)
        updateRelations(next)
        Taro.showToast({ title: '已全部回关', icon: 'success' })
      },
    })
  }

  const confirmRemove = (user: UserRelation) => {
    Taro.showModal({
      title: '移除粉丝',
      content: `确定将 ${user.name} 从粉丝列表移除吗？`,
      confirmText: '移除',
      confirmColor: '#EF4444',
      success: ({ confirm }) => {
        if (!confirm) return
        updateRelations(relations.map((item) => item.userId === user.userId ? { ...item, isFollower: false, isMutual: false } : item))
        Taro.showToast({ title: '已移除', icon: 'success' })
      },
    })
  }

  const confirmBlock = (user: UserRelation) => {
    Taro.showModal({
      title: '拉黑用户',
      content: `拉黑后将不再显示 ${user.name}，确定继续吗？`,
      confirmText: '拉黑',
      confirmColor: '#EF4444',
      success: ({ confirm }) => {
        if (!confirm) return
        updateRelations(relations.map((item) => item.userId === user.userId ? { ...item, isBlocked: true, isFollowing: false, isFollower: false, isMutual: false } : item))
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

  const toggleSpecial = (user: UserRelation) => {
    updateRelations(relations.map((item) => item.userId === user.userId ? { ...item, isSpecial: !item.isSpecial } : item))
    Taro.showToast({ title: user.isSpecial ? '已取消特别关注' : '已设为特别关注', icon: 'success' })
  }

  const showMore = (user: UserRelation) => {
    Taro.showActionSheet({
      itemList: ['查看主页', user.isSpecial ? '取消特别关注' : '设为特别关注', '移除粉丝', '举报', '拉黑'],
      success: ({ tapIndex }) => {
        if (tapIndex === 0) goUser(user.userId)
        if (tapIndex === 1) toggleSpecial(user)
        if (tapIndex === 2) confirmRemove(user)
        if (tapIndex === 3) reportUser()
        if (tapIndex === 4) confirmBlock(user)
      },
    })
  }

  return (
    <View className='relation-page'>
      <View className='page-header'>
        <View>
          <Text className='page-title'>我的粉丝</Text>
          <Text className='page-subtitle'>共 {followers.length} 人，{unfollowedCount} 人待回关</Text>
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
        {followers.map((user) => (
          <View className='user-card' key={user.userId}>
            <View className='avatar' onClick={() => goUser(user.userId)}>
              <Text>{user.name.slice(0, 1)}</Text>
            </View>
            <View className='user-main'>
              <View className='name-row'>
                <Text className='user-name' onClick={() => goUser(user.userId)}>{user.name}</Text>
                {user.isSpecial && <Text className='special-tag'>特别关注</Text>}
              </View>
              <Text className='user-meta'>{user.college} · {user.grade} · {user.campus}</Text>
              <Text className='user-intro'>{user.intro}</Text>
              <Text className='relation-label'>{getRelationLabel(user)}</Text>
            </View>
            <View className='side-actions'>
              <View className={`follow-btn ${user.isFollowing ? 'muted' : ''}`} onClick={() => user.isFollowing ? undefined : followBack(user.userId)}>
                <Text>{user.isMutual ? '互相关注' : user.isFollowing ? '已关注' : '回关'}</Text>
              </View>
              <View className='more-btn' onClick={() => showMore(user)}>
                <Text>...</Text>
              </View>
            </View>
          </View>
        ))}
      </View>
    </View>
  )
}
