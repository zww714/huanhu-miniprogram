import Taro from '@tarojs/taro'
import { Text, View } from '@tarojs/components'
import './index.css'

const SETTINGS = [
  {
    key: 'account',
    title: '账号与安全',
    desc: '账号资料、认证与登录安全',
    icon: '盾',
    tone: 'blue',
  },
  {
    key: 'notice',
    title: '消息通知',
    desc: '赞藏、关注、评论与系统提醒',
    icon: '铃',
    tone: 'green',
  },
  {
    key: 'privacy',
    title: '隐私设置',
    desc: '主页可见性与互动权限',
    icon: '锁',
    tone: 'purple',
  },
  {
    key: 'cache',
    title: '清除缓存',
    desc: '清理本地临时数据，不影响云端资料',
    icon: '清',
    tone: 'orange',
  },
  {
    key: 'about',
    title: '关于换乎',
    desc: '版本、平台说明与反馈入口',
    icon: '换',
    tone: 'blue',
  },
]

export default function Settings() {
  const openDetail = (type: string, title: string) => {
    Taro.navigateTo({
      url: `/sp-profile/pages/settings-detail/index?type=${encodeURIComponent(type)}&title=${encodeURIComponent(title)}`,
      fail: () => Taro.showToast({ title: '功能开发中', icon: 'none' }),
    })
  }

  const clearCache = () => {
    Taro.showModal({
      title: '清除缓存',
      content: '将清理最近搜索、临时草稿和本地浏览记录，云端资料不会受影响。',
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
    if (item.key === 'cache') {
      clearCache()
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

      <View className='login-card' onClick={() => Taro.navigateTo({ url: '/sp-common/pages/login/index' })}>
        <Text>登录 / 切换账号</Text>
      </View>
    </View>
  )
}


