import { useState } from 'react'
import Taro, { useLoad } from '@tarojs/taro'
import { ScrollView, Text, View } from '@tarojs/components'
import { AVATAR_STORAGE_KEY, SYSTEM_AVATARS } from '../../utils/mock'
import './index.css'

export default function AvatarSelect() {
  const [selectedAvatar, setSelectedAvatar] = useState('')

  useLoad(() => {
    setSelectedAvatar(Taro.getStorageSync(AVATAR_STORAGE_KEY) || '')
  })

  const handleBack = () => Taro.navigateBack()
  const handleSelect = (avatarId: string) => {
    setSelectedAvatar(avatarId)
    Taro.setStorageSync(AVATAR_STORAGE_KEY, avatarId)
    Taro.navigateBack()
  }

  return (
    <View className='avatar-page'>
      <View className='avatar-nav'>
        <Text className='nav-action' onClick={handleBack}>‹</Text>
        <Text className='nav-title'>选择头像</Text>
        <Text className='nav-action'>•••</Text>
      </View>

      <ScrollView scrollY className='avatar-scroll' showScrollbar={false} enhanced bounces={false}>
        <View className='intro-card'>
          <Text className='intro-title'>系统默认头像</Text>
          <Text className='intro-desc'>选择一个头像后会立即保存，并返回我的页面。</Text>
        </View>

        <View className='avatar-grid-card'>
          <View className='avatar-grid'>
            {SYSTEM_AVATARS.map((avatar) => {
              const selected = selectedAvatar === avatar.id
              return (
                <View
                  className={`avatar-option ${selected ? 'selected' : ''}`}
                  key={avatar.id}
                  onClick={() => handleSelect(avatar.id)}
                >
                  <View className='avatar-preview' style={{ backgroundColor: avatar.bg }}>
                    <Text style={{ color: avatar.color }}>{avatar.text}</Text>
                  </View>
                  <Text className='avatar-name'>{avatar.name}</Text>
                  {selected && <Text className='selected-mark'>已选</Text>}
                </View>
              )
            })}
          </View>
        </View>

        <View className='bottom-space' />
      </ScrollView>
    </View>
  )
}
