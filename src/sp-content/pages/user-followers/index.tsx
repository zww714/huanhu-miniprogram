import { View, Text, ScrollView, Image } from '@tarojs/components'
import Taro, { useDidShow, useLoad } from '@tarojs/taro'
import { useCallback, useMemo, useState } from 'react'
import { getFollowers } from '../../../api'
import { getPublicUser, normalizePublicUserId, openUnifiedUserProfile } from '../../../utils/publicProfiles'
import './index.scss'

const MOCK_FOLLOWERS = [
  { id: 'fan-1', name: '小鹿同学', school: '浙江大学', college: '管理学院', grade: '大二', intro: '热爱生活，喜欢记录美好瞬间 ✨' },
  { id: 'fan-2', name: '星河入梦', school: '浙江大学', college: '计算机学院', grade: '大三', intro: '代码改变世界，Coffee first ☕' },
  { id: 'fan-3', name: '柠檬气泡水', school: '浙江大学', college: '外国语学院', grade: '大一', intro: 'ENFJ | 喜欢语言与旅行 🌍' },
  { id: 'fan-4', name: '山川与海', school: '浙江大学', college: '机械工程学院', grade: '大二', intro: '运动 / 摄影 / 探索未知' },
  { id: 'fan-5', name: '晚风轻拂', school: '浙江大学', college: '传媒与国际文化学院', grade: '大三', intro: '传播美好，记录成长 📷' },
  { id: 'fan-6', name: '追光者', school: '浙江大学', college: '材料科学与工程学院', grade: '大四', intro: '保持热爱，奔赴山海 🚀' },
]

function avatarColor(index: number) {
  return ['#DBEAFE', '#E0F2FE', '#FCE7F3', '#FDE68A', '#EDE9FE', '#DCFCE7'][index % 6]
}

function isRenderableImage(src?: string) {
  return !!src && !src.startsWith('linear-gradient') && !src.includes('/assets/avatar.png')
}

export default function UserFollowers() {
  const [routeUserId, setRouteUserId] = useState('')
  const [followers, setFollowers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useLoad((options) => {
    setRouteUserId(normalizePublicUserId(String(options?.userId || options?.id || '')))
  })

  const user = useMemo(() => getPublicUser(routeUserId), [routeUserId])
  const list = followers.length ? followers : MOCK_FOLLOWERS

  const loadFollowers = useCallback(() => {
    if (!routeUserId) return
    setLoading(true)
    getFollowers({ userId: routeUserId })
      .then((res) => setFollowers(res.data || []))
      .catch((e) => {
        console.warn('[UserFollowers] getFollowers failed', e)
        setFollowers([])
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
    openUnifiedUserProfile(target.userId || target.id, target.name)
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
          <Text className='count-number'>{user.followerCount || list.length}</Text>
          <Text> 位粉丝</Text>
        </View>

        <View className='user-list'>
          {loading && !list.length && <Text className='empty-text'>加载中...</Text>}
          {list.map((item, index) => (
            <View className='user-card' key={item.userId || item.id} onClick={() => openUser(item)}>
              <View className='avatar' style={{ backgroundColor: avatarColor(index) }}>
                {isRenderableImage(item.avatar) ? <Image className='avatar-img' src={item.avatar} mode='aspectFill' /> : <Text>{(item.name || '?').charAt(0)}</Text>}
              </View>
              <View className='user-main'>
                <Text className='user-name'>{item.name || '同学'}</Text>
                <Text className='user-meta'>{[item.school || '浙江大学', item.college, item.grade].filter(Boolean).join(' · ')}</Text>
                <Text className='user-intro' numberOfLines={1}>{item.intro || 'TA 还没有填写简介'}</Text>
              </View>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  )
}

