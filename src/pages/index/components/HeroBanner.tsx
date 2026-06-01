import { memo } from 'react'
import { Text, View } from '@tarojs/components'

interface Props {
  title: string
  desc: string
  features: [string, string, string][]
}

const HeroBanner = memo(function HeroBanner({ title, desc, features }: Props) {
  return (
    <View className='home-hero'>
      <View className='home-hero-paper' />
      <View className='home-hero-art home-hero-art--one' />
      <View className='home-hero-art home-hero-art--two' />
      <View className='home-hero-content'>
        <Text className='home-hero-title'>{title}</Text>
        <Text className='home-hero-desc'>{desc}</Text>
      </View>
      <View className='home-hero-features'>
        {features.map((item) => (
          <View className='home-hero-feature' key={item[1]}>
            <Text className='home-hero-feature-icon'>{item[0]}</Text>
            <View>
              <Text className='home-hero-feature-title'>{item[1]}</Text>
              <Text className='home-hero-feature-desc'>{item[2]}</Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  )
})

export default HeroBanner
