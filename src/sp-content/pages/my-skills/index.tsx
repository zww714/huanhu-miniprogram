import { useMemo, useState } from 'react'
import Taro, { useDidShow } from '@tarojs/taro'
import { ScrollView, Text, View } from '@tarojs/components'
import { getCurrentUser, getMySkills } from '../../../api'
import { smoothNavigateTo } from '../../../utils/navigation'
import './index.scss'

type ActiveTab = 'all' | 'self' | 'verified'

type SkillItem = {
  id: string
  userId: string
  name: string
  level: number
  desc: string
  tags: string[]
  verified: boolean
  proofCount: number
}

function normalizeSkill(skill: any, index: number, userId: string): SkillItem {
  const name = typeof skill === 'string' ? skill : skill?.name || skill?.title || ''
  return {
    id: String(skill?.id || skill?._id || `skill-${index}-${name}`),
    userId: String(skill?.userId || userId || ''),
    name,
    level: Number(skill?.level || skill?.skillLevel || 0),
    desc: skill?.desc || skill?.intro || skill?.summary || '',
    tags: Array.isArray(skill?.tags) ? skill.tags : [],
    verified: !!skill?.verified || Number(skill?.proofCount || 0) > 0,
    proofCount: Number(skill?.proofCount || skill?.verifiedCount || 0),
  }
}

function normalizeWants(user: any) {
  const source = user?.wantToLearn || user?.learnWants || user?.want || []
  return (Array.isArray(source) ? source : [])
    .map((item: any, index: number) => {
      if (typeof item === 'string') return { id: `want-${index}-${item}`, name: item, target: '' }
      return {
        id: String(item?.id || item?._id || `want-${index}-${item?.name || item?.title || ''}`),
        name: String(item?.name || item?.title || '').trim(),
        target: String(item?.target || item?.desc || item?.intro || '').trim(),
      }
    })
    .filter((item) => !!item.name)
}

export default function MySkillsPage() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('all')
  const [skills, setSkills] = useState<SkillItem[]>([])
  const [wants, setWants] = useState<Array<{ id: string; name: string; target: string }>>([])
  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState('')

  useDidShow(() => {
    let alive = true
    setLoading(true)
    Promise.all([
      getCurrentUser().catch(() => null),
      getMySkills().catch(() => []),
    ]).then(([user, skillData]) => {
      if (!alive) return
      const currentUserId = String(user?.id || user?._id || user?.user_id || '')
      setUserId(currentUserId)
      setSkills((Array.isArray(skillData) ? skillData : [])
        .map((item, index) => normalizeSkill(item, index, currentUserId))
        .filter((item) => !!item.name))
      setWants(normalizeWants(user))
    }).finally(() => {
      if (alive) setLoading(false)
    })
    return () => { alive = false }
  })

  const verifiedSkills = useMemo(() => skills.filter((skill) => skill.verified || skill.proofCount > 0), [skills])

  const goEditSelfSkill = () => smoothNavigateTo('/sp-content/pages/edit-skills/index?type=can')
  const goEditLearnWant = () => smoothNavigateTo('/sp-content/pages/edit-skills/index?type=want')
  const goCreateVerified = () => smoothNavigateTo('/sp-content/pages/edit-verified-skill/index')

  const goSkillDetail = (skill: SkillItem) => {
    smoothNavigateTo(`/sp-content/pages/skill-detail/index?userId=${encodeURIComponent(skill.userId || userId)}&skillId=${encodeURIComponent(skill.id)}`)
  }

  const renderSkillCard = (skill: SkillItem, tone: 'self' | 'verified') => (
    <View key={skill.id} className={`skill-card ${tone}`} onClick={() => goSkillDetail(skill)}>
      <View className='skill-card-head'>
        <View className='skill-card-left'>
          <Text className='skill-name'>{skill.name}</Text>
          {skill.level ? <Text className={`skill-level ${tone === 'self' ? 'self' : 'verified-badge'}`}>Lv.{skill.level}</Text> : null}
        </View>
        <Text className='skill-arrow'>›</Text>
      </View>
      <Text className='skill-desc'>{skill.desc || '暂无技能介绍'}</Text>
      <View className='skill-tags'>
        {skill.tags.slice(0, 4).map((tag) => (
          <Text key={tag} className={`tag ${tone}`}>{tag}</Text>
        ))}
      </View>
    </View>
  )

  const renderSelfSkills = () => (
    <>
      <View className='section-header'>
        <View className='section-header-left'>
          <Text className='section-title'>自定义技能</Text>
          <View className='section-badge self'><Text>{skills.length}</Text></View>
        </View>
        <Text className='section-action' onClick={goEditSelfSkill}>编辑</Text>
      </View>
      <Text className='section-desc'>展示你已公开的真实技能资料。</Text>

      {skills.length ? (
        skills.map((skill) => renderSkillCard(skill, 'self'))
      ) : (
        <View className='empty-card' onClick={goEditSelfSkill}>
          <Text className='empty-text'>{loading ? '正在加载...' : '还没有自定义技能，点击添加'}</Text>
        </View>
      )}

      <View className='section-header' style={{ marginTop: '24rpx' }}>
        <View className='section-header-left'>
          <Text className='section-title'>我想学</Text>
          <View className='section-badge want'><Text>{wants.length}</Text></View>
        </View>
        <Text className='section-action' onClick={goEditLearnWant}>编辑</Text>
      </View>
      {wants.length ? (
        wants.map((item) => (
          <View key={item.id} className='skill-card want'>
            <View className='skill-card-head'>
              <Text className='skill-name want'>{item.name}</Text>
            </View>
            <Text className='skill-desc'>{item.target || '暂无学习说明'}</Text>
          </View>
        ))
      ) : (
        <View className='empty-card' onClick={goEditLearnWant}>
          <Text className='empty-text'>{loading ? '正在加载...' : '还没有想学的内容，点击添加'}</Text>
        </View>
      )}
    </>
  )

  const renderVerifiedSkills = () => (
    <>
      <View className='section-header'>
        <View className='section-header-left'>
          <Text className='section-title'>认证技能</Text>
          <View className='section-badge verified'><Text>{verifiedSkills.length}</Text></View>
        </View>
        <Text className='section-action' onClick={goCreateVerified}>添加</Text>
      </View>
      <Text className='section-desc'>只展示已提交并有真实证明材料的技能。</Text>

      {verifiedSkills.length ? (
        verifiedSkills.map((skill) => renderSkillCard(skill, 'verified'))
      ) : (
        <View className='empty-card' onClick={goCreateVerified}>
          <Text className='empty-text'>{loading ? '正在加载...' : '暂无认证技能，点击提交证明'}</Text>
        </View>
      )}
    </>
  )

  const showSelf = activeTab === 'all' || activeTab === 'self'
  const showVerified = activeTab === 'all' || activeTab === 'verified'

  return (
    <View className='my-skills-page'>
      <View className='tab-bar'>
        {([
          { key: 'all' as ActiveTab, label: '全部' },
          { key: 'self' as ActiveTab, label: '自定义' },
          { key: 'verified' as ActiveTab, label: '认证' },
        ]).map((tab) => (
          <View
            key={tab.key}
            className={`tab-item ${activeTab === tab.key ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.key)}
          >
            <Text className='tab-label'>{tab.label}</Text>
          </View>
        ))}
      </View>

      <ScrollView scrollY className='my-skills-scroll' showScrollbar={false} enhanced bounces={false}>
        {showVerified && activeTab === 'verified' ? renderVerifiedSkills() : null}
        {showSelf && activeTab === 'self' ? renderSelfSkills() : null}
        {activeTab === 'all' ? (
          <>
            {renderSelfSkills()}
            <View className='divider-line' />
            {renderVerifiedSkills()}
          </>
        ) : null}
        <View className='bottom-space' />
      </ScrollView>
    </View>
  )
}
