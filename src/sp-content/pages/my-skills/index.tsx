import { useState } from 'react'
import Taro from '@tarojs/taro'
import { Image, ScrollView, Text, View } from '@tarojs/components'
import {
  MY_LEARN_WANTS, MY_PROFILE, MY_SKILLS, MY_VERIFIED_SKILLS,
  SKILL_ID_BY_NAME, VERIFICATION_STATUS_TEXT,
  type VerificationStatus,
} from '../../../utils/mock'
import { openUnifiedUserProfile } from '../../../utils/publicProfiles'
import './index.scss'

/** 验证状态对应的颜色 */
const STATUS_STYLE: Record<VerificationStatus, { bg: string; color: string; icon: string }> = {
  unverified: { bg: '#F1F5F9', color: '#64748B', icon: '○' },
  pending:    { bg: '#FEF3C7', color: '#D97706', icon: '⏳' },
  verifying:  { bg: '#DBEAFE', color: '#2563EB', icon: '🔄' },
  approved:   { bg: '#D1FAE5', color: '#059669', icon: '✓' },
  rejected:   { bg: '#FEE2E2', color: '#DC2626', icon: '✕' },
}

/** 统计认证技能各状态数量 */
function countByStatus(skills: typeof MY_VERIFIED_SKILLS) {
  const map: Record<string, number> = { approved: 0, pending: 0, verifying: 0, rejected: 0, unverified: 0 }
  skills.forEach((s) => { map[s.verificationStatus] = (map[s.verificationStatus] || 0) + 1 })
  return map
}

type ActiveTab = 'all' | 'self' | 'verified'

export default function MySkillsPage() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('all')
  const statusCount = countByStatus(MY_VERIFIED_SKILLS)

  // ===== 导航 =====
  const goBack = () => Taro.navigateBack()
  const goEditSelfSkill = () => Taro.navigateTo({ url: '/sp-content/pages/edit-skills/index?type=can' })
  const goEditLearnWant = () => Taro.navigateTo({ url: '/sp-content/pages/edit-skills/index?type=want' })

  const goSelfSkillDetail = (skillName: string) => {
    const skillId = SKILL_ID_BY_NAME[skillName] || encodeURIComponent(skillName)
    Taro.navigateTo({
      url: `/sp-content/pages/skill-detail/index?userId=${encodeURIComponent(MY_PROFILE.user_id)}&skillId=${encodeURIComponent(skillId)}`,
    })
  }

  const goVerifiedSkillDetail = (skill: typeof MY_VERIFIED_SKILLS[number]) => {
    Taro.navigateTo({
      url: `/sp-content/pages/skill-proof-detail/index?skillId=${encodeURIComponent(skill.id)}&skillName=${encodeURIComponent(skill.name)}&userId=${encodeURIComponent(MY_PROFILE.user_id)}&type=verified`,
    })
  }

  const goCreateVerified = () => {
    Taro.navigateTo({ url: '/sp-content/pages/edit-verified-skill/index' })
  }

  // ===== 渲染：自定义技能 =====
  const renderSelfSkills = () => (
    <>
      <View className='section-header'>
        <View className='section-header-left'>
          <Text className='section-icon'>🎨</Text>
          <Text className='section-title'>自定义技能</Text>
          <View className='section-badge self'><Text>{MY_SKILLS.length}</Text></View>
        </View>
        <Text className='section-action' onClick={goEditSelfSkill}>编辑 ›</Text>
      </View>
      <Text className='section-desc'>天马行空，自由描述你的技能——无需证明，随心展示</Text>

      {MY_SKILLS.length ? (
        MY_SKILLS.map((skill) => (
          <View key={skill.name} className='skill-card self' onClick={() => goSelfSkillDetail(skill.name)}>
            <View className='skill-card-head'>
              <View className='skill-card-left'>
                <Text className='skill-name'>{skill.name}</Text>
                <Text className='skill-level self'>Lv.{skill.level}</Text>
              </View>
              <Text className='skill-arrow'>›</Text>
            </View>
            <Text className='skill-desc'>{skill.desc}</Text>
            <View className='skill-tags'>
              {skill.tags.map((tag) => (
                <Text key={tag} className='tag self'>{tag}</Text>
              ))}
            </View>
          </View>
        ))
      ) : (
        <View className='empty-card' onClick={goEditSelfSkill}>
          <Text className='empty-text'>还没有自定义技能，点击添加</Text>
        </View>
      )}

      <View className='section-header' style={{ marginTop: '24rpx' }}>
        <View className='section-header-left'>
          <Text className='section-icon'>📖</Text>
          <Text className='section-title'>我想学</Text>
          <View className='section-badge want'><Text>{MY_LEARN_WANTS.length}</Text></View>
        </View>
        <Text className='section-action' onClick={goEditLearnWant}>编辑 ›</Text>
      </View>
      {MY_LEARN_WANTS.length ? (
        MY_LEARN_WANTS.map((item) => (
          <View key={item.name} className='skill-card want'>
            <View className='skill-card-head'>
              <Text className='skill-name want'>{item.name}</Text>
            </View>
            <Text className='skill-desc'>{item.target}</Text>
          </View>
        ))
      ) : (
        <View className='empty-card' onClick={goEditLearnWant}>
          <Text className='empty-text'>还没有想学的内容，点击添加</Text>
        </View>
      )}
    </>
  )

  // ===== 渲染：认证技能 =====
  const renderVerifiedSkills = () => (
    <>
      <View className='section-header'>
        <View className='section-header-left'>
          <Text className='section-icon'>✅</Text>
          <Text className='section-title'>认证技能</Text>
          <View className='section-badge verified'><Text>{MY_VERIFIED_SKILLS.length}</Text></View>
        </View>
        <Text className='section-action' onClick={goCreateVerified}>添加 ›</Text>
      </View>
      <Text className='section-desc'>提供证明材料 + 官方验证链接，平台审核后授予认证标识</Text>

      {/* 状态统计条 */}
      <View className='status-bar'>
        <View className='status-item'>
          <Text className='status-count approved'>{statusCount.approved}</Text>
          <Text className='status-label'>已验证</Text>
        </View>
        <View className='status-item'>
          <Text className='status-count verifying'>{statusCount.verifying}</Text>
          <Text className='status-label'>验证中</Text>
        </View>
        <View className='status-item'>
          <Text className='status-count pending'>{statusCount.pending}</Text>
          <Text className='status-label'>待审核</Text>
        </View>
        <View className='status-item'>
          <Text className='status-count rejected'>{statusCount.rejected}</Text>
          <Text className='status-label'>未通过</Text>
        </View>
      </View>

      {MY_VERIFIED_SKILLS.length ? (
        MY_VERIFIED_SKILLS.map((skill) => {
          const st = STATUS_STYLE[skill.verificationStatus]
          const needsVerify = skill.verificationStatus === 'pending' || skill.verificationStatus === 'verifying'

          return (
            <View
              key={skill.id}
              className='skill-card verified'
              onClick={() => goVerifiedSkillDetail(skill)}
            >
              {/* 顶部：名称 + 状态 */}
              <View className='skill-card-head'>
                <View className='skill-card-left'>
                  <Text className='skill-name'>{skill.name}</Text>
                  <View className='skill-level verified-badge' style={{ backgroundColor: `${st.bg} !important` }}>
                    <Text>{st.icon}</Text>
                  </View>
                </View>
                <View className='status-tag' style={{ backgroundColor: st.bg }}>
                  <Text style={{ color: st.color }}>{VERIFICATION_STATUS_TEXT[skill.verificationStatus]}</Text>
                </View>
              </View>

              {/* 描述 */}
              <Text className='skill-desc'>{skill.desc}</Text>

              {/* 验证来源信息 */}
              {skill.verificationSource && (
                <View className='verify-source'>
                  <View className='verify-source-row'>
                    <Text className='verify-source-label'>验证平台</Text>
                    <Text className='verify-source-value'>{skill.verificationSource.platformName}</Text>
                  </View>
                  <View className='verify-source-row'>
                    <Text className='verify-source-label'>证书编号</Text>
                    <Text className='verify-source-value code'>{skill.verificationSource.verificationCode}</Text>
                    <Text
                      className='verify-action'
                      onClick={(e) => {
                        e.stopPropagation()
                        Taro.setClipboardData({
                          data: skill.verificationSource.platformUrl,
                          success: () => Taro.showToast({ title: '链接已复制，可前往验证', icon: 'success' }),
                        })
                      }}
                    >
                      🔗 去验证
                    </Text>
                  </View>
                </View>
              )}

              {/* 审核反馈 */}
              {skill.verificationFeedback?.comment && (
                <View className='feedback-bar' style={{ backgroundColor: skill.verificationStatus === 'rejected' ? '#FEF2F2' : '#ECFDF5' }}>
                  <Text className='feedback-text'>
                    {skill.verificationStatus === 'rejected' ? '❌ ' : '✅ '}
                    {skill.verificationFeedback.comment}
                  </Text>
                </View>
              )}

              {/* 待处理的提示 */}
              {needsVerify && (
                <View className='verify-hint'>
                  <Text className='verify-hint-text'>等待平台审核中，审核结果将通知你</Text>
                </View>
              )}

              {/* 标签 */}
              <View className='skill-tags'>
                {skill.tags.map((tag) => (
                  <Text key={tag} className='tag verified'>{tag}</Text>
                ))}
              </View>
            </View>
          )
        })
      ) : (
        <View className='empty-card' onClick={goCreateVerified}>
          <Text className='empty-text'>还没有认证技能，点击提交首个认证</Text>
        </View>
      )}
    </>
  )

  // ===== 主要渲染 =====
  const showSelf = activeTab === 'all' || activeTab === 'self'
  const showVerified = activeTab === 'all' || activeTab === 'verified'

  return (
    <View className='my-skills-page'>
      {/* 顶部导航 */}
      <View className='my-skills-nav'>
        <Text className='nav-back' onClick={goBack}>‹ 返回</Text>
        <Text className='nav-title'>我的技能</Text>
        <View style={{ width: '80rpx' }} />
      </View>

      {/* 分段切换 */}
      <View className='tab-bar'>
        {([
          { key: 'all' as ActiveTab, label: '全部', icon: '📋' },
          { key: 'self' as ActiveTab, label: '自定义', icon: '🎨' },
          { key: 'verified' as ActiveTab, label: '认证', icon: '✅' },
        ]).map((tab) => (
          <View
            key={tab.key}
            className={`tab-item ${activeTab === tab.key ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.key)}
          >
            <Text className='tab-icon'>{tab.icon}</Text>
            <Text className='tab-label'>{tab.label}</Text>
          </View>
        ))}
      </View>

      {/* 内容 */}
      <ScrollView scrollY className='my-skills-scroll' showScrollbar={false} enhanced bounces={false}>
        {showVerified && activeTab === 'verified' ? renderVerifiedSkills() : null}
        {showSelf && activeTab === 'self' ? renderSelfSkills() : null}
        {activeTab === 'all' ? (
          <>
            {renderVerifiedSkills()}
            <View className='divider-line' />
            {renderSelfSkills()}
          </>
        ) : null}
        <View className='bottom-space' />
      </ScrollView>
    </View>
  )
}
