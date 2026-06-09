import { View, Text, ScrollView, Image } from '@tarojs/components'
import Taro, { useDidShow, useLoad } from '@tarojs/taro'
import { useCallback, useMemo, useState } from 'react'
import { getFollowers } from '../../../api'
import { CURRENT_USER } from '../../../utils/mock'
import { getPublicUser, getRelationForUser, normalizePublicUserId, openUnifiedUserProfile } from '../../../utils/publicProfiles'
import './index.scss'

function avatarColor(index: number) {
  return ['#DBEAFE', '#E0F2FE', '#FCE7F3', '#FDE68A', '#EDE9FE', '#DCFCE7'][index % 6]
}

function isRenderableImage(src?: string) {
  return !!src && !src.startsWith('linear-gradient') && !src.includes('/assets/avatar.png')
}

export default function UserFollowers() {
  const [routeUserId, setRouteUserId] = useState('')
  const [followers, setFollowers] = useState<any[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)

  useLoad((options) => {
    setRouteUserId(normalizePublicUserId(String(options?.userId || options?.id || ''), String(options?.name || '')))
  })

  const user = useMemo(() => getPublicUser(routeUserId), [routeUserId])
  const localFollower = useMemo(() => {
    if (!routeUserId || followers.length) return null
    const relation = getRelationForUser(routeUserId)
    if (!relation.isFollowing) return null
    return {
      id: CURRENT_USER.id,
      userId: CURRENT_USER.id,
      name: CURRENT_USER.name || '我',
      avatar: CURRENT_USER.avatar,
      school: CURRENT_USER.school || '浙江大学',
      college: CURRENT_USER.college,
      grade: CURRENT_USER.grade,
      intro: CURRENT_USER.bio || CURRENT_USER.intro || '当前用户',
    }
  }, [followers.length, routeUserId])
  const list = localFollower ? [localFollower] : followers
  const displayTotal = Math.max(total, list.length)

  const loadFollowers = useCallback(() => {
    if (!routeUserId) return
    setLoading(true)
    getFollowers({ userId: routeUserId })
      .then((res) => {
        setFollowers(res.data || [])
        setTotal(Number(res.total ?? (res.data || []).length))
      })
      .catch((e) => {
        console.warn('[UserFollowers] getFollowers failed', e)
        setFollowers([])
        setTotal(0)
      })
      .finally(() => setLoading(false))
  }, [routeUserId])

  useDidShow(() => {
    loadFollowers()
  })

  const goBack = () => {
    const pages = getCurrentPages()
    if (pages.length > 1) Taro.navigateBack()
    else Taro.navigateTo({ url: `/sp-profile/pages/profile/view?userId=${encodeURIComponent(user.id)}` })
  }

  const openUser = (target: any) => {
    openUnifiedUserProfile(target.userId || target.id || target._id, target.name)
  }

  return (
    <ScrollView scrollY className='relation-page' showScrollbar={false} enhanced bounces={false}>
      <View className='page-shell'>
        <View className='top-nav'>
          <Text className='back-icon' onClick={goBack}>‹</Text>
          <Text className='page-title'>TA的粉丝</Text>
          <View className='nav-spacer' />
        </View>

        <View className='count-line'>
          <Text>共 </Text>
          <Text className='count-number'>{displayTotal}</Text>
          <Text> 位粉丝</Text>
        </View>

        <View className='user-list'>
          {loading && !list.length ? <Text className='empty-text'>加载中...</Text> : null}
          {!loading && !list.length ? <Text className='empty-text'>暂无粉丝</Text> : null}
          {list.map((item, index) => (
            <View className='user-card' key={item.userId || item.id || item._id} onClick={() => openUser(item)}>
              <View className='avatar' style={{ backgroundColor: avatarColor(index) }}>
                {isRenderableImage(item.avatar) ? <Image className='avatar-img' src={item.avatar} mode='aspectFill' lazyLoad /> : <Text>{(item.name || '?').charAt(0)}</Text>}
              </View>
              <View className='user-main'>
                <Text className='user-name'>{item.name || '同学'}</Text>
                <Text className='user-meta'>{[item.school || '浙江大学', item.college, item.grade].filter(Boolean).join(' · ')}</Text>
                <Text className='user-intro' numberOfLines={1}>{item.intro || item.bio || 'TA 还没有填写简介'}</Text>
              </View>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  )
}
