import { View, Text, ScrollView } from '@tarojs/components'
import Taro, { useLoad } from '@tarojs/taro'
import { useEffect, useMemo, useState } from 'react'
import { getUserSkills } from '../../../api'
import { getPublicSkills, getPublicUser, normalizePublicUserId } from '../../../utils/publicProfiles'
import './index.scss'

const FALLBACK_SKILLS = [
  { id: 'photo', name: '摄影', level: 4, intro: '擅长人像与街拍，擅长用光影表达故事。', tags: ['人像', '街拍', '光影', '后期'], icon: '▣' },
  { id: 'design', name: '产品设计', level: 3, intro: '关注用户体验，擅长产品界面与交互设计。', tags: ['交互设计', 'UI设计', '原型设计'], icon: '◇' },
]

function normalizeSkill(skill: any, index: number) {
  return {
    id: skill.id || skill._id || FALLBACK_SKILLS[index]?.id || `skill-${index}`,
    name: skill.name || FALLBACK_SKILLS[index]?.name || '技能',
    level: Number(skill.level || skill.skillLevel || FALLBACK_SKILLS[index]?.level || 3),
    intro: skill.intro || skill.desc || FALLBACK_SKILLS[index]?.intro || 'TA 还没有填写技能介绍。',
    tags: Array.isArray(skill.tags) && skill.tags.length ? skill.tags : FALLBACK_SKILLS[index]?.tags || [],
    icon: skill.icon || FALLBACK_SKILLS[index]?.icon || '✦',
  }
}

export default function UserSkills() {
  const [userId, setUserId] = useState('')
  const [remoteSkills, setRemoteSkills] = useState<any[]>([])

  useLoad((options) => {
    setUserId(normalizePublicUserId(String(options?.userId || options?.id || '')))
  })

  const user = useMemo(() => getPublicUser(userId), [userId])
  const skills = useMemo(() => {
    const source = remoteSkills.length ? remoteSkills : getPublicSkills(user.id)
    return (source.length ? source : FALLBACK_SKILLS).map(normalizeSkill)
  }, [remoteSkills, user.id])

  useEffect(() => {
    if (!user.id) return
    let alive = true
    getUserSkills({ userId: user.id })
      .then((data) => {
        if (!alive || !Array.isArray(data)) return
        setRemoteSkills(data)
      })
      .catch(() => undefined)
    return () => { alive = false }
  }, [user.id])

  const goBack = () => {
    const pages = getCurrentPages()
    if (pages.length > 1) Taro.navigateBack()
    else Taro.navigateTo({ url: `/sp-profile/pages/profile/view?userId=${encodeURIComponent(user.id)}` })
  }

  const openSkill = (skillId: string) => {
    Taro.navigateTo({ url: `/sp-content/pages/skill-detail/index?userId=${encodeURIComponent(user.id)}&skillId=${encodeURIComponent(skillId)}` })
  }

  return (
    <ScrollView scrollY className='skill-page' showScrollbar={false} enhanced bounces={false}>
      <View className='page-shell'>
        <View className='top-nav'>
          <Text className='back-icon' onClick={goBack}>‹</Text>
          <Text className='page-title'>TA的技能</Text>
          <View className='nav-spacer' />
        </View>

        <View className='count-line'>
          <Text className='dot' />
          <Text>公开技能 </Text>
          <Text className='count-number'>{skills.length}</Text>
          <Text> 项</Text>
        </View>

        <View className='skill-list'>
          {skills.map((skill) => (
            <View className='skill-card' key={skill.id} onClick={() => openSkill(skill.id)}>
              <View className='skill-icon'><Text>{skill.icon}</Text></View>
              <View className='skill-main'>
                <View className='skill-head'>
                  <Text className='skill-name'>{skill.name}</Text>
                  <Text className='level-pill'>Lv.{skill.level}</Text>
                </View>
                <Text className='skill-intro' numberOfLines={1}>{skill.intro}</Text>
                <View className='tag-row'>
                  {skill.tags.slice(0, 4).map((tag) => <Text className='tag' key={tag}>{tag}</Text>)}
                </View>
              </View>
              <Text className='arrow'>›</Text>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  )
}


