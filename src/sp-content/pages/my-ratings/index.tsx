import { Text, View } from '@tarojs/components'
import './index.scss'

export default function MyRatings() {
  return (
    <View className='ratings-page'>
      <View className='empty-rating-card'>
        <Text className='empty-rating-title'>评价功能暂未开放</Text>
        <Text className='empty-rating-desc'>当前版本没有交易评价体系，因此不展示星级或评价记录。</Text>
      </View>
    </View>
  )
}
