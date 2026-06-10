import Taro from '@tarojs/taro'
import { Text, View } from '@tarojs/components'
import './index.scss'

const SETTINGS = [
  {
    key: 'privacy',
    title: '隐私设置',
    desc: '主页展示、联系权限和浏览记录',
    icon: '隐',
    tone: 'purple',
    type: 'detail',
  },
  {
    key: 'notice',
    title: '消息通知',
    desc: '点赞、收藏、关注、评论与系统提醒',
    icon: '通',
    tone: 'green',
    type: 'detail',
  },
  {
    key: 'verify',
    title: '校园认证',
    desc: '完善认证后显示蓝色认证标识',
    icon: '认',
    tone: 'blue',
    type: 'link',
    url: '/sp-common/pages/verify/index',
  },
  {
    key: 'login',
    title: '登录 / 切换账号',
    desc: '重新授权或切换微信账号',
    icon: '账',
    tone: 'blue',
    type: 'link',
    url: '/sp-common/pages/login/index',
  },
  {
    key: 'cache',
    title: '清除缓存',
    desc: '清理本地临时数据，不影响云端资料',
    icon: '清',
    tone: 'orange',
    type: 'cache',
  },
  {
    key: 'about',
    title: '关于换乎',
    desc: '版本和平台说明',
    icon: '换',
    tone: 'blue',
    type: 'detail',
  },
]

export default function Settings() {
  const openDetail = (type: string, title: string) => {
    Taro.navigateTo({
      url: `/sp-profile/pages/settings-detail/index?type=${encodeURIComponent(type)}&title=${encodeURIComponent(title)}`,
      fail: () => Taro.showToast({ title: '功能开发中', icon: 'none' }),
    })
  }

  const openLink = (url?: string) => {
    if (!url) return
    Taro.navigateTo({
      url,
      fail: () => Taro.showToast({ title: '功能开发中', icon: 'none' }),
    })
  }

  const clearCache = () => {
    Taro.showModal({
      title: '清除缓存',
      content: '将清理最近搜索、临时草稿和本地浏览记录，云端资料不受影响。',
      confirmText: '清除',
      confirmColor: '#2563EB',
      success: ({ confirm }) => {
        if (!confirm) return
        ;['homeRecentSearches', 'pendingPost', 'pendingSkillNeed', 'pendingPartnerProfile', 'pendingActivity'].forEach((key) => {
          try {
            Taro.removeStorageSync(key)
          } catch (e) {
            console.warn('[Settings] clear cache failed for', key, e)
          }
        })
        Taro.showToast({ title: '缓存已清除', icon: 'success' })
      },
    })
  }

  const handleItemClick = (item: typeof SETTINGS[number]) => {
    if (item.type === 'cache') {
      clearCache()
      return
    }
    if (item.type === 'link') {
      openLink(item.url)
      return
    }
    openDetail(item.key, item.title)
  }

  return (
    <View className='settings-page'>
      <View className='settings-card'>
        {SETTINGS.map((item, index) => (
          <View
            key={item.key}
            className={`settings-row ${index === SETTINGS.length - 1 ? 'last' : ''}`}
            onClick={() => handleItemClick(item)}
          >
            <View className={`settings-icon settings-icon--${item.tone}`}>
              <Text>{item.icon}</Text>
            </View>
            <View className='settings-main'>
              <Text className='settings-title'>{item.title}</Text>
              <Text className='settings-desc'>{item.desc}</Text>
            </View>
            <Text className='settings-arrow'>›</Text>
          </View>
        ))}
      </View>
    </View>
  )
}
