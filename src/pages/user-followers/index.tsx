import { View, Text, ScrollView } from '@tarojs/components'
import Taro, { useDidShow, useLoad } from '@tarojs/taro'
import { useMemo, useState } from 'react'
import {
  getFollowersForUser,
  getPublicUser,
  getRelationForUser,
  normalizePublicUserId,
  openUnifiedUserProfile,
  upsertRelation,
  type PublicUser,
} from '../../utils/publicProfiles'
import './index.css'

function firstChar(name?: string) {
  return name?.charAt(0) || '同'
}

export default function UserFollowers() {
  const [userId, setUserId] = useState('')
  const [tick, setTick] = useState(0)

  useLoad((options) => {
    setUserId(normalizePublicUserId(String(options?.userId || options?.id || '')))
  })

  useDidShow(() => setTick((value) => value + 1))

  const user = useMemo(() => getPublicUser(userId), [userId])
  const followers = useMemo(() => getFollowersForUser(user.id), [user.id, tick])

  const openUser = (target: PublicUser) => {
    openUnifiedUserProfile(target.id, target.name)
  }

  const followUser = (target: PublicUser) => {
    const relation = getRelationForUser(target.id)
    upsertRelation(target.id, { isFollowing: true, isMutual: relation.isFollower })
    setTick((value) => value + 1)
    Taro.showToast({ title: '已关注', icon: 'success' })
  }

  const goChat = (target: PublicUser) => {
    Taro.navigateTo({ url: `/pages/chat/index?userId=${encodeURIComponent(target.id)}&id=${encodeURIComponent(target.id)}&name=${encodeURIComponent(target.name)}&category=${encodeURIComponent('个人主页')}` })
  }

  const showMore = (target: PublicUser) => {
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
              upsertRelation(target.id, { isBlocked: true, isFollowing: false, isMutual: false, isSpecial: false })
              setTick((value) => value + 1)
              Taro.showToast({ title: '已拉黑', icon: 'success' })
            },
          })
        }
      },
    })
  }

  return (
    <ScrollView scrollY className='relation-page' showScrollbar={false} enhanced bounces={false}>
      <View className='relation-header'>
        <Text className='back' onClick={() => Taro.navigateBack()}>‹</Text>
        <View>
          <Text className='page-title'>TA的粉丝</Text>
          <Text className='page-subtitle'>{user.name} 的粉丝，共 {followers.length} 人</Text>
        </View>
      </View>

      <View className='user-list'>
        {!followers.length && (
          <View className='empty-state'>
            <Text>TA还没有粉丝</Text>
          </View>
        )}
        {followers.map((item) => {
          const relation = getRelationForUser(item.id)
          return (
            <View className='user-card' key={item.id}>
              <View className='avatar' onClick={() => openUser(item)}>
                <Text>{firstChar(item.name)}</Text>
              </View>
              <View className='user-main' onClick={() => openUser(item)}>
                <View className='name-row'>
                  <Text className='user-name'>{item.name}</Text>
                  {relation.isSpecial && <Text className='special-tag'>特别关注</Text>}
                </View>
                <Text className='user-meta'>{[item.college, item.grade, item.campus].filter(Boolean).join(' · ')}</Text>
                <Text className='user-intro' numberOfLines={1}>{item.intro || 'TA还没有完善更多资料'}</Text>
              </View>
              <View className='side-actions'>
                <View className={relation.isFollowing ? 'follow-btn following' : 'follow-btn'} onClick={() => relation.isFollowing ? goChat(item) : followUser(item)}>
                  <Text>{relation.isFollowing ? '发消息' : '关注'}</Text>
                </View>
                <Text className='more' onClick={() => showMore(item)}>...</Text>
              </View>
            </View>
          )
        })}
      </View>
      <View className='safe-bottom' />
    </ScrollView>
  )
}
