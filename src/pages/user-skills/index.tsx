import { View, Text, ScrollView } from '@tarojs/components'
import Taro, { useLoad } from '@tarojs/taro'
import { useMemo, useState } from 'react'
import { getPublicSkills, getPublicUser, normalizePublicUserId } from '../../utils/publicProfiles'
import './index.css'

export default function UserSkills() {
  const [userId, setUserId] = useState('')

  useLoad((options) => {
    setUserId(normalizePublicUserId(String(options?.userId || options?.id || '')))
  })

  const user = useMemo(() => getPublicUser(userId), [userId])
  const skills = useMemo(() => getPublicSkills(user.id), [user.id])

  const openSkill = (skillId: string) => {
    Taro.navigateTo({ url: `/pages/skill-detail/index?userId=${encodeURIComponent(user.id)}&skillId=${encodeURIComponent(skillId)}` })
  }

  return (
    <ScrollView scrollY className='viewer-page' showScrollbar={false} enhanced bounces={false}>
      <View className='viewer-header'>
        <Text className='back' onClick={() => Taro.navigateBack()}>‹</Text>
        <View>
          <Text className='viewer-title'>TA的技能</Text>
          <Text className='viewer-subtitle'>{user.name} 公开的技能与作品证明</Text>
        </View>
      </View>

      <View className='list-card'>
        {!skills.length && (
          <View className='empty-state'>
            <Text>TA暂未公开技能</Text>
          </View>
        )}
        {skills.map((skill) => (
          <View className='skill-item' key={`${skill.userId}-${skill.id}`} onClick={() => openSkill(skill.id)}>
            <View className='skill-head'>
              <Text className='skill-title'>{skill.name}</Text>
              <Text className='level-pill'>Lv.{skill.level}</Text>
            </View>
            <Text className='skill-intro'>{skill.intro}</Text>
            <View className='skill-meta'>
              <Text>{skill.proofCount} 个证明材料</Text>
              <Text>{skill.workCount} 个作品</Text>
            </View>
            <View className='tag-row'>
              {skill.tags.map((tag) => <Text className='tag' key={tag}>{tag}</Text>)}
            </View>
          </View>
        ))}
      </View>
      <View className='safe-bottom' />
    </ScrollView>
  )
}
