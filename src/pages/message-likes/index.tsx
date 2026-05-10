import Taro from '@tarojs/taro'
import { Text, View } from '@tarojs/components'
import { MOCK_POSTS, MY_SKILLS } from '../../utils/mock'
import './index.css'

const NOTICES = [
  { id: 'l1', user: '科研小达人', action: '赞了你的发布', target: MOCK_POSTS[0].title, time: '刚刚', postId: MOCK_POSTS[0].id },
  { id: 'l2', user: '光影捕手', action: '收藏了你的技能', target: MY_SKILLS[0].name, time: '12分钟前' },
  { id: 'l3', user: '上岸锦鲤', action: '赞了你的发布', target: MOCK_POSTS[2].title, time: '昨天', postId: MOCK_POSTS[2].id },
]

export default function MessageLikes() {
  return (
    <View style={{ minHeight: '100vh', backgroundColor: '#F8FAFC', padding: '12px' }}>
      {NOTICES.map((item) => (
        <View key={item.id} onClick={() => item.postId && Taro.navigateTo({ url: `/pages/post-detail/index?id=${item.postId}` })} style={{ display: 'flex', gap: '12px', backgroundColor: '#FFF', borderRadius: '12px', padding: '14px', marginBottom: '10px', border: '1px solid #FEE2E2' }}>
          <View style={{ width: '42px', height: '42px', borderRadius: '50%', backgroundColor: '#FEE2E2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ color: '#EF4444', fontSize: '18px' }}>♥</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: '15px', fontWeight: '700', color: '#1E293B' }}>{item.user}</Text>
            <Text style={{ fontSize: '13px', color: '#64748B', marginTop: '4px' }}>{item.action}</Text>
            <Text style={{ fontSize: '13px', color: '#2563EB', marginTop: '6px' }} numberOfLines={1}>{item.target}</Text>
            <Text style={{ fontSize: '11px', color: '#94A3B8', marginTop: '6px' }}>{item.time}</Text>
          </View>
        </View>
      ))}
    </View>
  )
}
