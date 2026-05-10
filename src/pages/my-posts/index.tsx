import Taro from '@tarojs/taro'
import { Text, View } from '@tarojs/components'
import { MOCK_POSTS } from '../../utils/mock'
import './index.css'

export default function MyPosts() {
  const posts = MOCK_POSTS.slice(0, 4)
  return (
    <View style={{ minHeight: '100vh', backgroundColor: '#F8FAFC', padding: '12px' }}>
      {posts.map((post) => (
        <View key={post.id} onClick={() => Taro.navigateTo({ url: `/pages/post-detail/index?id=${post.id}` })} style={{ backgroundColor: '#FFF', borderRadius: '12px', padding: '14px', marginBottom: '10px', border: '1px solid #E2E8F0' }}>
          <Text style={{ fontSize: '16px', fontWeight: '700', color: '#1E293B' }}>{post.title}</Text>
          <Text style={{ fontSize: '13px', color: '#64748B', lineHeight: '20px', marginTop: '6px' }}>{post.excerpt}</Text>
          <View style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
            <Text style={{ fontSize: '12px', color: '#EF4444' }}>♥ {post.likes}</Text>
            <Text style={{ fontSize: '12px', color: '#2563EB' }}>评论 {post.comments}</Text>
          </View>
        </View>
      ))}
    </View>
  )
}
