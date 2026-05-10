import Taro from '@tarojs/taro'
import { Text, View } from '@tarojs/components'
import { COMMENTS, POST_DETAIL } from '../../utils/mock'
import './index.css'

export default function MessageComments() {
  return (
    <View style={{ minHeight: '100vh', backgroundColor: '#F8FAFC', padding: '12px' }}>
      {COMMENTS.map((comment, index) => (
        <View key={comment.id} onClick={() => Taro.navigateTo({ url: `/pages/post-detail/index?id=${POST_DETAIL.id}` })} style={{ backgroundColor: '#FFF', borderRadius: '12px', padding: '14px', marginBottom: '10px', border: '1px solid #DBEAFE' }}>
          <View style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
            <View style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: '#DBEAFE', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: '10px' }}>
              <Text style={{ color: '#2563EB', fontWeight: '700' }}>{comment.author.name.charAt(0)}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: '15px', fontWeight: '700', color: '#1E293B' }}>{comment.author.name}</Text>
              <Text style={{ fontSize: '12px', color: '#94A3B8', marginTop: '2px' }}>{index === 1 ? '@了你' : '评论了你的帖子'} · {comment.time}</Text>
            </View>
          </View>
          <Text style={{ fontSize: '13px', color: '#475569', lineHeight: '20px' }}>{comment.content}</Text>
          <Text style={{ fontSize: '13px', color: '#2563EB', marginTop: '8px' }} numberOfLines={1}>{POST_DETAIL.title}</Text>
        </View>
      ))}
    </View>
  )
}
