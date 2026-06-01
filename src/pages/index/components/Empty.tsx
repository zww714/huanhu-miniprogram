import { memo } from 'react'
import { Text, View } from '@tarojs/components'

interface Props {}

const Empty = memo(function Empty(_props: Props) {
  return (
    <View className='home-empty'>
      <Text className='home-empty-title'>没有找到相关内容</Text>
      <Text className='home-empty-desc'>换个关键词试试，或发布你的需求</Text>
    </View>
  )
})

export default Empty
