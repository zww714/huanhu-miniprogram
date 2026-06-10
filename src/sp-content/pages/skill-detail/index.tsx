import { useEffect, useMemo, useState } from 'react'
import Taro, { useLoad } from '@tarojs/taro'
import { ScrollView, Text, View } from '@tarojs/components'
import { getSavedLoginUser, getSkillDetail, getSkillProofCount, getSkillProofs, getUserSkills } from '../../../api'
import { recordBrowse } from '../../../utils/history'
import './index.scss'

type SkillProof = {
  id?: string
  type?: 'portfolio' | 'project' | 'certificate' | 'link'
  title?: string
  desc?: string
  url?: string
}

type SkillDetail = {
  id: string
  userId: string
  name: string
  level: number
  levelText: string
  category: string
  icon: string
  verified: boolean
  summary: string
  abilityDescription: string
  canHelp: string[]
  proofs: SkillProof[]
  tags: string[]
  isOwner?: boolean
}

const proofTypeText: Record<string, string> = {
  portfolio: '作品集',
  project: '项目经历',
  certificate: '证书',
  link: '作品链接',
}

function getLevelPercent(level: number) {
  return `${Math.min(Math.max(level, 1), 5) * 20}%`
}

function normalizeSkill(raw: any, skillId: string, userId: string): SkillDetail | undefined {
  if (!raw) return undefined
  const id = String(raw.id || raw._id || skillId || '')
  const name = String(raw.name || raw.title || '')
  if (!id || !name) return undefined
  const level = Number(raw.level || raw.skillLevel || 1)
  const intro = raw.summary || raw.intro || raw.desc || ''
  return {
    id,
    userId: String(raw.userId || userId || ''),
    name,
    level,
    levelText: raw.levelText || (level >= 4 ? '熟练掌握' : '持续学习中'),
    category: raw.category || '技能',
    icon: raw.icon || name.slice(0, 1),
    verified: !!raw.verified || Number(raw.proofCount || 0) > 0,
    summary: intro,
    abilityDescription: raw.abilityDescription || intro,
    canHelp: Array.isArray(raw.canHelp) ? raw.canHelp : [],
    proofs: Array.isArray(raw.proofs) ? raw.proofs : [],
    tags: Array.isArray(raw.tags) ? raw.tags : [],
    isOwner: !!raw.isOwner,
  }
}

export default function SkillDetailPage() {
  const [skillId, setSkillId] = useState('')
  const [userId, setUserId] = useState('')
  const [remoteSkill, setRemoteSkill] = useState<SkillDetail | undefined>()
  const [cloudProofs, setCloudProofs] = useState<SkillProof[]>([])
  const [proofCount, setProofCount] = useState(0)
  const [loading, setLoading] = useState(true)

  useLoad((options) => {
    setSkillId(String(options?.skillId || options?.id || ''))
    setUserId(String(options?.userId || ''))
  })

  useEffect(() => {
    if (!skillId) return
    let alive = true
    setLoading(true)

    const loadSkill = async () => {
      let detail: SkillDetail | undefined
      try {
        const data = await getSkillDetail({ skillId, userId })
        detail = normalizeSkill(data, skillId, userId)
      } catch (e) {
        console.warn('[SkillDetail] getSkillDetail failed', e)
      }

      if (!detail && userId) {
        try {
          const skills = await getUserSkills({ userId })
          const found = Array.isArray(skills)
            ? skills.find((item: any) => String(item.id || item._id) === skillId)
            : undefined
          detail = normalizeSkill(found, skillId, userId)
        } catch (e) {
          console.warn('[SkillDetail] getUserSkills failed', e)
        }
      }

      if (!alive) return
      setRemoteSkill(detail)
      if (detail) {
        recordBrowse({ id: detail.id, type: 'skill', title: detail.name, subtitle: detail.summary })
      }
    }

    Promise.all([
      loadSkill(),
      getSkillProofs({ skillId, userId })
        .then((proofs) => { if (alive) setCloudProofs(Array.isArray(proofs) ? proofs as SkillProof[] : []) })
        .catch(() => { if (alive) setCloudProofs([]) }),
      getSkillProofCount({ skillId })
        .then((count) => { if (alive) setProofCount(Number(count || 0)) })
        .catch(() => { if (alive) setProofCount(0) }),
    ]).finally(() => {
      if (alive) setLoading(false)
    })

    return () => { alive = false }
  }, [skillId, userId])

  const savedUser = getSavedLoginUser()
  const skill = remoteSkill
  const proofs = useMemo(() => {
    const source = cloudProofs.length ? cloudProofs : skill?.proofs || []
    return source.filter((proof) => !!proof?.title)
  }, [cloudProofs, skill])
  const isOwner = !!skill && (!!skill.isOwner || !!savedUser && (skill.userId === savedUser.id || skill.userId === savedUser._id))
  const hasVerifiedProof = proofCount > 0 || proofs.length > 0 || !!skill?.verified

  const handleBack = () => Taro.navigateBack()
  const handleMore = () => Taro.showToast({ title: '更多功能后续开放', icon: 'none' })
  const handleEditSkill = () => Taro.navigateTo({ url: `/sp-content/pages/edit-skills/index?skillId=${encodeURIComponent(skill?.id || '')}` })
  const handleSubmitProof = () => {
    Taro.showToast({ title: '证明材料提交功能即将开放', icon: 'none' })
  }
  const handleContact = () => {
    if (!skill) return
    Taro.navigateTo({
      url: `/sp-social/pages/contact-request/index?userId=${encodeURIComponent(skill.userId)}&skillId=${encodeURIComponent(skill.id)}&name=${encodeURIComponent('TA')}&category=${encodeURIComponent(skill.name)}&source=skill-detail`,
    })
  }
  const handleProofClick = (proof: SkillProof) => {
    if (!skill || !proof.id) {
      Taro.showToast({ title: '证明材料不存在', icon: 'none' })
      return
    }
    Taro.navigateTo({
      url: `/sp-content/pages/skill-proof-detail/index?skillId=${encodeURIComponent(skill.id)}&proofId=${encodeURIComponent(proof.id)}&userId=${encodeURIComponent(skill.userId)}`,
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
          <Text className='empty-title'>{loading ? '正在加载技能...' : '没有找到该技能'}</Text>
          <Text className='empty-desc'>{loading ? '请稍候' : '该技能可能已删除，或当前账号没有查看权限。'}</Text>
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
              <Text className={hasVerifiedProof ? 'verify-badge' : 'verify-badge muted'}>
                {hasVerifiedProof ? '已认证' : '未认证'}
              </Text>
            </View>
            <Text className='skill-level'>Lv.{skill.level} {skill.levelText}</Text>
            <Text className='skill-category'>{skill.category}</Text>
            <Text className='skill-summary'>{skill.summary || 'TA 还没有填写技能介绍。'}</Text>
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
          <Text className='ability-desc'>{skill.abilityDescription || '暂无详细说明'}</Text>
        </View>

        <View className='info-card'>
          <Text className='section-title'>可以帮忙</Text>
          {skill.canHelp.length ? (
            <View className='help-list'>
              {skill.canHelp.map((item) => (
                <View className='help-item' key={item}>
                  <Text className='help-dot'>✓</Text>
                  <Text className='help-text'>{item}</Text>
                </View>
              ))}
            </View>
          ) : (
            <View className='proof-empty'><Text>TA 暂未填写可提供的帮助内容。</Text></View>
          )}
        </View>

        <View className='info-card'>
          <Text className='section-title'>技能证明 / 作品</Text>
          {proofs.length ? (
            <View className='proof-list'>
              {proofs.map((proof, index) => (
                <View className='proof-item clickable' key={`${proof.type}-${proof.title}-${index}`} onClick={() => handleProofClick(proof)}>
                  <View className='proof-icon'>
                    <Text>{(proofTypeText[proof.type || 'project'] || '证明').slice(0, 2)}</Text>
                  </View>
                  <View className='proof-body'>
                    <View className='proof-head'>
                      <Text className='proof-title'>{proof.title}</Text>
                      <Text className='proof-type'>{proofTypeText[proof.type || 'project'] || '证明'}</Text>
                    </View>
                    <Text className='proof-desc'>{proof.desc || '暂无说明'}</Text>
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
          {skill.tags.length ? (
            <View className='tag-wrap'>
              {skill.tags.map((tag) => (
                <Text className='skill-tag' key={tag}>{tag}</Text>
              ))}
            </View>
          ) : (
            <View className='proof-empty'><Text>暂无相关标签。</Text></View>
          )}
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
