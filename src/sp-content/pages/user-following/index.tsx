import { View, Text, ScrollView, Image } from '@tarojs/components'
import Taro, { useDidShow, useLoad } from '@tarojs/taro'
import { useCallback, useMemo, useState } from 'react'
import { getFollowing } from '../../../api'
import { normalizePublicUserId, openUnifiedUserProfile } from '../../../utils/publicProfiles'
import '../user-followers/index.scss'

function avatarColor(index: number) {
  return ['#DBEAFE', '#E0F2FE', '#FCE7F3', '#FDE68A', '#EDE9FE', '#DCFCE7'][index % 6]
}

function isRenderableImage(src?: string) {
  return !!src && !src.startsWith('linear-gradient') && !src.includes('/assets/avatar.png')
}

export default function UserFollowing() {
  const [routeUserId, setRouteUserId] = useState('')
  const [followingList, setFollowingList] = useState<any[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)

  useLoad((options) => {
    setRouteUserId(normalizePublicUserId(String(options?.userId || options?.id || ''), String(options?.name || '')))
  })

  const user = useMemo(() => ({ id: routeUserId }), [routeUserId])
  const list = followingList

  const loadFollowing = useCallback(() => {
    if (!routeUserId) return
    setLoading(true)
    getFollowing({ userId: routeUserId })
      .then((res) => {
        setFollowingList(res.data || [])
        setTotal(Number(res.total ?? (res.data || []).length))
      })
      .catch((e) => {
        console.warn('[UserFollowing] getFollowing failed', e)
        setFollowingList([])
        setTotal(0)
      })
      .finally(() => setLoading(false))
  }, [routeUserId])

  useDidShow(() => {
    loadFollowing()
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
          <Text className='page-title'>TA的关注</Text>
          <View className='nav-spacer' />
        </View>

        <View className='count-line'>
          <Text>共 </Text>
          <Text className='count-number'>{total}</Text>
          <Text> 位关注</Text>
        </View>

        <View className='user-list'>
          {loading && !list.length ? <Text className='empty-text'>加载中...</Text> : null}
          {!loading && !list.length ? <Text className='empty-text'>暂无关注</Text> : null}
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
