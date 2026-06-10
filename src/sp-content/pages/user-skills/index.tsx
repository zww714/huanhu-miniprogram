import { View, Text, ScrollView } from '@tarojs/components'
import Taro, { useLoad } from '@tarojs/taro'
import { useEffect, useMemo, useState } from 'react'
import { getUserDetail, getUserSkills } from '../../../api'
import { normalizePublicUserId } from '../../../utils/publicProfiles'
import './index.scss'

function normalizeSkill(skill: any, index: number) {
  if (typeof skill === 'string') {
    return { id: `skill-${index}-${skill}`, name: skill, level: 0, intro: '', tags: [] as string[], proofCount: 0 }
  }
  return {
    id: skill.id || skill._id || `skill-${index}`,
    name: skill.name || skill.title || '技能',
    level: Number(skill.level || skill.skillLevel || 0),
    intro: skill.intro || skill.desc || skill.summary || '',
    tags: Array.isArray(skill.tags) ? skill.tags : [],
    icon: skill.icon || '</>',
    proofCount: Number(skill.proofCount || skill.verifiedCount || (skill.verified ? 1 : 0) || 0),
  }
}

export default function UserSkills() {
  const [userId, setUserId] = useState('')
  const [remoteUser, setRemoteUser] = useState<any>(null)
  const [remoteSkills, setRemoteSkills] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useLoad((options) => {
    setUserId(normalizePublicUserId(String(options?.userId || options?.id || '')))
  })

  useEffect(() => {
    if (!userId) return
    let alive = true
    setLoading(true)
    Promise.all([
      getUserDetail({ userId }).catch(() => undefined),
      getUserSkills({ userId }).catch(() => []),
    ]).then(([user, skills]) => {
      if (!alive) return
      setRemoteUser(user || null)
      setRemoteSkills(Array.isArray(skills) ? skills : [])
    }).finally(() => {
      if (alive) setLoading(false)
    })
    return () => { alive = false }
  }, [userId])

  const user = useMemo(() => ({
    id: remoteUser?.id || remoteUser?._id || userId,
    name: remoteUser?.name || remoteUser?.nickname || '同学',
    wantToLearn: remoteUser?.wantToLearn || remoteUser?.learnWants || remoteUser?.want || [],
  }), [remoteUser, userId])

  const skills = useMemo(() => {
    const source = remoteSkills.length ? remoteSkills : remoteUser?.canTeach || remoteUser?.skills || []
    return (Array.isArray(source) ? source : []).map(normalizeSkill).filter((skill) => !!skill.name)
  }, [remoteSkills, remoteUser])

  const wants = useMemo(() => (
    Array.isArray(user.wantToLearn) ? user.wantToLearn.map(String).filter(Boolean) : []
  ), [user.wantToLearn])

  const verifiedSkills = useMemo(() => skills.filter((skill) => Number(skill.proofCount || 0) > 0), [skills])

  const goBack = () => {
    const pages = getCurrentPages()
    if (pages.length > 1) Taro.navigateBack()
    else Taro.navigateTo({ url: `/sp-profile/pages/profile/view?userId=${encodeURIComponent(user.id)}` })
  }

  const openSkill = (skillId: string) => {
    Taro.navigateTo({ url: `/sp-content/pages/skill-detail/index?userId=${encodeURIComponent(user.id)}&skillId=${encodeURIComponent(skillId)}` })
  }

  const renderSkillCard = (skill: any) => (
    <View className='skill-card' key={skill.id} onClick={() => openSkill(skill.id)}>
      <View className='skill-icon'><Text>{skill.icon || '</>'}</Text></View>
      <View className='skill-main'>
        <View className='skill-head'>
          <Text className='skill-name'>{skill.name}</Text>
          {skill.level ? <Text className='level-pill'>Lv.{skill.level}</Text> : null}
        </View>
        <Text className='skill-intro' numberOfLines={1}>{skill.intro || 'TA 还没有填写技能介绍。'}</Text>
        <View className='tag-row'>
          {skill.tags.slice(0, 4).map((tag: string) => <Text className='tag' key={tag}>{tag}</Text>)}
        </View>
      </View>
      <Text className='arrow'>›</Text>
    </View>
  )

  const renderSection = (title: string, count: number, empty: string, children: any) => (
    <View className='skill-section'>
      <View className='section-title-row'>
        <Text className='section-title'>{title}</Text>
        <Text className='section-count'>{count} 项</Text>
      </View>
      <View className='skill-list'>
        {count ? children : <Text className='section-empty'>{loading ? '正在加载...' : empty}</Text>}
      </View>
    </View>
  )

  return (
    <ScrollView scrollY className='skill-page' showScrollbar={false} enhanced bounces={false}>
      <View className='page-shell'>
        <View className='top-nav'>
          <Text className='back-icon' onClick={goBack}>‹</Text>
          <Text className='page-title'>TA的技能</Text>
          <View className='nav-spacer' />
        </View>

        {renderSection('TA会', skills.length, 'TA 暂未公开会的技能', skills.map(renderSkillCard))}
        {renderSection('TA想学', wants.length, 'TA 暂未填写想学内容', wants.map((name) => (
          <View className='want-card' key={name}>
            <Text>{name}</Text>
          </View>
        )))}
        {renderSection('已认证', verifiedSkills.length, '暂无已认证技能', verifiedSkills.map(renderSkillCard))}
      </View>
    </ScrollView>
  )
}
