import { useMemo, useState } from 'react'
import Taro, { useLoad } from '@tarojs/taro'
import { ScrollView, Text, View } from '@tarojs/components'
import { SKILLS_DETAIL, type SkillDetail, type SkillProof } from '../../utils/mock'
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

export default function SkillDetailPage() {
  const [skillId, setSkillId] = useState('')
  const [userId, setUserId] = useState('')

  useLoad((options) => {
    setSkillId(String(options?.skillId || options?.id || ''))
    setUserId(String(options?.userId || ''))
  })

  const skill: SkillDetail | undefined = useMemo(() => {
    return SKILLS_DETAIL.find((item) => {
      const matchesSkill = item.id === skillId
      const matchesUser = !userId || item.userId === userId
      return matchesSkill && matchesUser
    })
  }, [skillId, userId])

  const handleBack = () => Taro.navigateBack()
  const handleMore = () => Taro.showToast({ title: '更多功能稍后开放', icon: 'none' })
  const handleContact = () => {
    if (!skill) return
    Taro.navigateTo({
      url: `/pages/chat/index?id=${encodeURIComponent(skill.userId)}&skillId=${encodeURIComponent(skill.id)}&name=${encodeURIComponent('TA')}&category=${encodeURIComponent(skill.name)}`,
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
          <Text className='empty-desc'>可能是技能已被删除，或跳转参数缺少 skillId。</Text>
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
        <View className='contact-btn' onClick={handleContact}>
          <Text>联系TA</Text>
        </View>
      </View>
    </View>
  )
}
