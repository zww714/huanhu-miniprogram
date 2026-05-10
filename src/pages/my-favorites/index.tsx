import Taro from '@tarojs/taro'
import { Text, View } from '@tarojs/components'
import { MOCK_POSTS, MY_SKILLS } from '../../utils/mock'
import './index.css'

export default function MyFavorites() {
  const posts = MOCK_POSTS.slice(1, 4)
  const skills = MY_SKILLS.slice(0, 2)
  return (
    <View style={{ minHeight: '100vh', backgroundColor: '#F8FAFC', padding: '12px' }}>
      <Text style={{ display: 'block', fontSize: '15px', fontWeight: '700', color: '#1E293B', marginBottom: '10px' }}>收藏的帖子</Text>
      {posts.map((post) => (
        <View key={post.id} onClick={() => Taro.navigateTo({ url: `/pages/post-detail/index?id=${post.id}` })} style={{ backgroundColor: '#FFF', borderRadius: '12px', padding: '14px', marginBottom: '10px', border: '1px solid #E2E8F0' }}>
          <Text style={{ fontSize: '15px', fontWeight: '700', color: '#1E293B' }}>{post.title}</Text>
          <Text style={{ fontSize: '13px', color: '#64748B', marginTop: '6px' }}>{post.excerpt}</Text>
        </View>
      ))}
      <Text style={{ display: 'block', fontSize: '15px', fontWeight: '700', color: '#1E293B', margin: '18px 0 10px' }}>收藏的技能</Text>
      {skills.map((skill) => (
        <View key={skill.name} style={{ backgroundColor: '#FFF', borderRadius: '12px', padding: '14px', marginBottom: '10px', border: '1px solid #E2E8F0' }}>
          <Text style={{ fontSize: '15px', fontWeight: '700', color: '#1E293B' }}>{skill.name}</Text>
          <Text style={{ fontSize: '13px', color: '#64748B', marginTop: '6px' }}>{skill.desc}</Text>
        </View>
      ))}
    </View>
  )
}
