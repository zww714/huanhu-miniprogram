import { useMemo, useState } from 'react'
import Taro, { useLoad } from '@tarojs/taro'
import { ScrollView, Text, View } from '@tarojs/components'
import { CURRENT_USER, SKILLS_DETAIL, type SkillDetail, type SkillProof } from '../../utils/mock'
import { PUBLIC_SKILLS } from '../../utils/publicProfiles'
import './index.css'

const proofTypeText: Record<SkillProof['type'], string> = {
  portfolio: '作品集',
  project: '项目经历',
  certificate: '证书',
  link: '作品链接',
}

function getLevelPercent(level: number) {
  return `${Math.min(Math.max(level, 1), 5) * 20}%`
}

function publicSkillToDetail(skill: typeof PUBLIC_SKILLS[number]): SkillDetail {
  return {
    id: skill.id,
    userId: skill.userId,
    name: skill.name,
    level: skill.level,
    levelText: skill.level >= 5 ? '专家级应用' : skill.level >= 4 ? '熟练掌握' : '持续提升中',
    category: '技能交换',
    icon: skill.name.slice(0, 1),
    verified: skill.proofCount > 0,
    summary: skill.intro,
    abilityDescription: skill.intro,
    canHelp: skill.tags.map((tag) => `${tag} 交流`),
    proofs: [],
    tags: skill.tags,
  }
}

export default function SkillDetailPage() {
  const [skillId, setSkillId] = useState('')
  const [userId, setUserId] = useState('')

  useLoad((options) => {
    setSkillId(String(options?.skillId || options?.id || ''))
    setUserId(String(options?.userId || ''))
  })

  const skill: SkillDetail | undefined = useMemo(() => {
    const publicSkill = PUBLIC_SKILLS.find((item) => item.id === skillId && (!userId || item.userId === userId))
    if (publicSkill) return publicSkillToDetail(publicSkill)

    const exact = SKILLS_DETAIL.find((item) => {
      const matchesSkill = item.id === skillId
      const matchesUser = !userId || item.userId === userId
      return matchesSkill && matchesUser
    })
    if (exact) return exact

    const template = SKILLS_DETAIL.find((item) => item.id === skillId)
    if (!template || !userId) return template

    return {
      ...template,
      userId,
      verified: false,
      proofs: [],
    }
  }, [skillId, userId])

  const isOwner = !!skill && skill.userId === CURRENT_USER.id
  const handleBack = () => Taro.navigateBack()
  const handleMore = () => Taro.showToast({ title: '更多功能后续开放', icon: 'none' })
  const handleEditSkill = () => Taro.navigateTo({ url: `/pages/edit-skills/index?skillId=${encodeURIComponent(skill?.id || '')}` })
  const handleSubmitProof = () => Taro.showToast({ title: '证明材料提交功能后续接入', icon: 'none' })
  const handleContact = () => {
    if (!skill) return
    Taro.navigateTo({
      url: `/pages/contact-request/index?userId=${encodeURIComponent(skill.userId)}&skillId=${encodeURIComponent(skill.id)}&name=${encodeURIComponent('TA')}&category=${encodeURIComponent(skill.name)}&source=skill-detail`,
    })
  }
  const handleProofClick = (proof: SkillProof) => {
    if (!skill || !proof.id) {
      Taro.showToast({ title: '证明材料不存在', icon: 'none' })
      return
    }
    Taro.navigateTo({
      url: `/pages/skill-proof-detail/index?skillId=${encodeURIComponent(skill.id)}&proofId=${encodeURIComponent(proof.id)}&userId=${encodeURIComponent(skill.userId)}`,
    })
  }

  if (!skill) {
    return (
      <View className='skill-page'>
        <View className='skill-nav'>
          <Text className='nav-action' onClick={handleBack}>‹</Text>
          <Text className='nav-title'>技能详情</Text>
          <Text className='nav-action' onClick={handleMore}>•••</Text>
        </View>
        <View className='empty-wrap'>
          <Text className='empty-title'>没有找到该技能</Text>
          <Text className='empty-desc'>可能是技能已删除，或跳转参数缺少 skillId。</Text>
        </View>
      </View>
    )
  }

  return (
    <View className='skill-page'>
      <View className='skill-nav'>
        <Text className='nav-action' onClick={handleBack}>‹</Text>
        <Text className='nav-title'>{skill.name} 技能详情</Text>
        <Text className='nav-action' onClick={handleMore}>•••</Text>
      </View>

      <ScrollView scrollY className='skill-scroll' showScrollbar={false} enhanced bounces={false}>
        <View className='hero-card'>
          <View className='skill-icon'>
            <Text>{skill.icon}</Text>
          </View>
          <View className='hero-main'>
            <View className='hero-title-row'>
              <Text className='skill-name'>{skill.name}</Text>
              <Text className={skill.verified ? 'verify-badge' : 'verify-badge muted'}>
                {skill.verified ? '已认证' : '未认证'}
              </Text>
            </View>
            <Text className='skill-level'>Lv.{skill.level} {skill.levelText}</Text>
            <Text className='skill-category'>{skill.category}</Text>
            <Text className='skill-summary'>{skill.summary}</Text>
          </View>
        </View>

        <View className='info-card'>
          <Text className='section-title'>能力等级</Text>
          <View className='level-row'>
            <Text className='level-main'>Lv.{skill.level}</Text>
            <Text className='level-text'>{skill.levelText}</Text>
          </View>
          <View className='progress-track'>
            <View className='progress-fill' style={{ width: getLevelPercent(skill.level) }} />
          </View>
          <Text className='ability-desc'>{skill.abilityDescription}</Text>
        </View>

        <View className='info-card'>
          <Text className='section-title'>我可以帮你</Text>
          <View className='help-list'>
            {skill.canHelp.map((item) => (
              <View className='help-item' key={item}>
                <Text className='help-dot'>✓</Text>
                <Text className='help-text'>{item}</Text>
              </View>
            ))}
          </View>
        </View>

        <View className='info-card'>
          <Text className='section-title'>技能证明 / 作品</Text>
          {skill.proofs.length ? (
            <View className='proof-list'>
              {skill.proofs.map((proof) => (
                <View className='proof-item clickable' key={`${proof.type}-${proof.title}`} onClick={() => handleProofClick(proof)}>
                  <View className='proof-icon'>
                    <Text>{proofTypeText[proof.type].slice(0, 2)}</Text>
                  </View>
                  <View className='proof-body'>
                    <View className='proof-head'>
                      <Text className='proof-title'>{proof.title}</Text>
                      <Text className='proof-type'>{proofTypeText[proof.type]}</Text>
                    </View>
                    <Text className='proof-desc'>{proof.desc}</Text>
                    {!!proof.url && <Text className='proof-link'>{proof.url}</Text>}
                    <Text className='proof-more'>查看详情 ›</Text>
                  </View>
                </View>
              ))}
            </View>
          ) : (
            <View className='proof-empty'>
              <Text>暂无证明材料，可以先通过聊天进一步了解 TA 的能力。</Text>
            </View>
          )}
        </View>

        <View className='info-card'>
          <Text className='section-title'>相关标签</Text>
          <View className='tag-wrap'>
            {skill.tags.map((tag) => (
              <Text className='skill-tag' key={tag}>{tag}</Text>
            ))}
          </View>
        </View>

        <View className='bottom-space' />
      </ScrollView>

      <View className='bottom-bar'>
        {isOwner ? (
          <View className='owner-actions'>
            <View className='secondary-action' onClick={handleEditSkill}>
              <Text>编辑技能</Text>
            </View>
            <View className='contact-btn' onClick={handleSubmitProof}>
              <Text>提交证明</Text>
            </View>
          </View>
        ) : (
          <View className='contact-btn' onClick={handleContact}>
            <Text>联系TA</Text>
          </View>
        )}
      </View>
    </View>
  )
}
