import { View, Text, ScrollView, Image } from '@tarojs/components'
import Taro, { useDidShow, useLoad } from '@tarojs/taro'
import { useCallback, useMemo, useState } from 'react'
import { getFollowing } from '../../../utils/api'
import { getPublicUser, normalizePublicUserId, openUnifiedUserProfile } from '../../../utils/publicProfiles'
import '../user-followers/index.css'

const MOCK_FOLLOWING = [
  { id: 'follow-1', name: '夏日微风', school: '浙江大学', college: '计算机科学与技术', grade: '大三', intro: '专注前端开发，热爱开源与分享' },
  { id: 'follow-2', name: '林间小鹿', school: '浙江大学', college: '建筑学', grade: '大二', intro: '建筑设计爱好者，喜欢观察生活' },
  { id: 'follow-3', name: '云朵收藏家', school: '浙江大学', college: '传播学', grade: '大四', intro: '记录学生生活，分享校园美好' },
  { id: 'follow-4', name: '程序员阿泽', school: '浙江大学', college: '软件工程', grade: '大三', intro: '代码改变世界，产品连接用户' },
  { id: 'follow-5', name: '野生小丸子', school: '浙江大学', college: '心理学', grade: '大二', intro: '心理学学习中，喜欢文字与音乐' },
  { id: 'follow-6', name: '航拍小陈', school: '浙江大学', college: '电子信息', grade: '大四', intro: '用镜头记录世界，航拍爱好者' },
]

function avatarColor(index: number) {
  return ['#DBEAFE', '#E0F2FE', '#FCE7F3', '#FDE68A', '#EDE9FE', '#DCFCE7'][index % 6]
}

function isRenderableImage(src?: string) {
  return !!src && !src.startsWith('linear-gradient') && !src.includes('/assets/avatar.png')
}

export default function UserFollowing() {
  const [routeUserId, setRouteUserId] = useState('')
  const [followingList, setFollowingList] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useLoad((options) => {
    setRouteUserId(normalizePublicUserId(String(options?.userId || options?.id || '')))
  })

  const user = useMemo(() => getPublicUser(routeUserId), [routeUserId])
  const list = followingList.length ? followingList : MOCK_FOLLOWING

  const loadFollowing = useCallback(() => {
    if (!routeUserId) return
    setLoading(true)
    getFollowing({ userId: routeUserId })
      .then((res) => setFollowingList(res.data || []))
      .catch((e) => {
        console.warn('[UserFollowing] getFollowing failed', e)
        setFollowingList([])
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
    openUnifiedUserProfile(target.userId || target.id, target.name)
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
          <Text className='count-number'>{user.followingCount || list.length}</Text>
          <Text> 位关注</Text>
        </View>

        <View className='user-list'>
          {loading && !list.length && <Text className='empty-text'>加载中...</Text>}
          {list.map((item, index) => (
            <View className='user-card' key={item.userId || item.id} onClick={() => openUser(item)}>
              <View className='avatar' style={{ backgroundColor: avatarColor(index) }}>
                {isRenderableImage(item.avatar) ? <Image className='avatar-img' src={item.avatar} mode='aspectFill' /> : <Text>{(item.name || '?').charAt(0)}</Text>}
              </View>
              <View className='user-main'>
                <View className='name-row'>
                  <Text className='user-name'>{item.name || '同学'}</Text>
                  <Text className='school-pill'>浙大</Text>
                </View>
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

