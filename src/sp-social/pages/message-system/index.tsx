import Taro from '@tarojs/taro'
import { Text, View } from '@tarojs/components'
import './index.scss'

const NOTICES = [
  {
    id: 's1',
    title: '技能收藏提醒',
    content: '你的技能「Python编程」已被 3 位同学收藏，可以完善技能说明提升匹配率。',
    time: '昨天 18:20',
    action: '查看我的技能',
    url: '/sp-content/pages/my-skills/index',
  },
  {
    id: 's2',
    title: '活动报名提醒',
    content: '本周五化学实验技能培训开始报名啦，感兴趣的话可以去社区活动页查看。',
    time: '周三 09:15',
    action: '去首页',
    url: '/pages/index/index?tab=2',
  },
  {
    id: 's3',
    title: '资料完善建议',
    content: '补充一句话个人介绍后，同学在发现页和兴趣搭子页能更快了解你。',
    time: '周一 12:00',
    action: '编辑资料',
    url: '/sp-profile/pages/edit-profile/index',
  },
]

export default function MessageSystem() {
  const go = (url: string) => {
    if (url.startsWith('/pages/index')) {
      Taro.switchTab({ url: '/pages/index/index' })
      return
    }
    Taro.navigateTo({ url })
  }

  return (
    <View style={{ minHeight: '100vh', backgroundColor: '#F8FAFC', padding: '12px' }}>
      {NOTICES.map((notice) => (
        <View key={notice.id} style={{ backgroundColor: '#FFF', borderRadius: '12px', padding: '14px', marginBottom: '10px', border: '1px solid #E2E8F0' }}>
          <View style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
            <View style={{ width: '34px', height: '34px', borderRadius: '50%', backgroundColor: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: '10px' }}>
              <Text style={{ color: '#2563EB', fontSize: '16px', fontWeight: '700' }}>i</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ display: 'block', fontSize: '15px', fontWeight: '700', color: '#1E293B' }}>{notice.title}</Text>
              <Text style={{ display: 'block', fontSize: '11px', color: '#94A3B8', marginTop: '2px' }}>{notice.time}</Text>
            </View>
          </View>
          <Text style={{ display: 'block', fontSize: '13px', color: '#475569', lineHeight: '20px' }}>{notice.content}</Text>
          <View onClick={() => go(notice.url)} style={{ marginTop: '12px', padding: '8px 0', borderRadius: '8px', backgroundColor: '#EFF6FF', textAlign: 'center' }}>
            <Text style={{ fontSize: '13px', color: '#2563EB', fontWeight: '600' }}>{notice.action}</Text>
          </View>
        </View>
      ))}
    </View>
  )
}


