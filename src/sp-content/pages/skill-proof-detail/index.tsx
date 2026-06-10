import { useEffect, useState } from 'react'
import Taro, { useLoad } from '@tarojs/taro'
import { Image, ScrollView, Text, View } from '@tarojs/components'
import { getSavedLoginUser, getSkillProofDetail } from '../../../api'
import './index.scss'

type ProofDetail = {
  id: string
  skillId: string
  userId: string
  title: string
  type: 'portfolio' | 'project' | 'certificate' | 'link'
  status: 'approved' | 'pending' | 'draft'
  description?: string
  relatedSkill?: string
  level?: number
  submitterName?: string
  createdAt?: string
  updatedAt?: string
  images?: string[]
  links?: Array<{ title: string; url: string }>
  tags?: string[]
  detail?: Record<string, any>
}

const typeText: Record<string, string> = {
  portfolio: '作品集',
  project: '项目经历',
  certificate: '证书',
  link: '链接',
}

const statusText: Record<string, string> = {
  approved: '已通过',
  pending: '待审核',
  draft: '未提交',
}

function DetailRow({ label, value }: { label: string; value?: string }) {
  if (!value) return null
  return (
    <View className='detail-item'>
      <Text className='detail-label'>{label}</Text>
      <Text className='detail-value'>{value}</Text>
    </View>
  )
}

export default function SkillProofDetailPage() {
  const [proofId, setProofId] = useState('')
  const [proof, setProof] = useState<ProofDetail | null>(null)
  const [loading, setLoading] = useState(true)

  useLoad((options) => {
    setProofId(String(options?.proofId || ''))
  })

  useEffect(() => {
    if (!proofId) {
      setLoading(false)
      setProof(null)
      return
    }
    let alive = true
    setLoading(true)
    getSkillProofDetail({ proofId })
      .then((data) => {
        if (alive) setProof(data || null)
      })
      .catch((e) => {
        console.warn('[SkillProofDetail] load failed', e)
        if (alive) setProof(null)
      })
      .finally(() => {
        if (alive) setLoading(false)
      })
    return () => { alive = false }
  }, [proofId])

  const currentUser = getSavedLoginUser()
  const currentUserId = currentUser?.id || currentUser?._id || currentUser?.user_id
  const isOwnProof = !!proof && !!currentUserId && currentUserId === proof.userId

  const handleBack = () => Taro.navigateBack()
  const handleMore = () => Taro.showToast({ title: '更多功能后续开放', icon: 'none' })
  const handleOwnerAction = () => {
    Taro.showToast({ title: '证明材料提交功能后续接入', icon: 'none' })
  }
  const handleCopyLink = (url: string) => {
    Taro.setClipboardData({
      data: url,
      success: () => Taro.showToast({ title: '链接已复制', icon: 'success' }),
    })
  }
  const handleContact = () => {
    if (!proof) return
    Taro.navigateTo({
      url: `/sp-social/pages/contact-request/index?userId=${encodeURIComponent(proof.userId)}&skillId=${encodeURIComponent(proof.skillId)}&proofId=${encodeURIComponent(proof.id)}&name=${encodeURIComponent(proof.submitterName || '同学')}&category=${encodeURIComponent(proof.relatedSkill || '技能交流')}&source=skill-proof`,
    })
  }

  const renderProofContent = (item: ProofDetail) => {
    const detail = item.detail || {}
    if (item.type === 'project') {
      return (
        <View className='detail-list'>
          <DetailRow label='项目名称' value={detail.projectName} />
          <DetailRow label='项目简介' value={detail.projectIntro} />
          <DetailRow label='负责内容' value={detail.role} />
          <DetailRow label='使用工具' value={Array.isArray(detail.tools) ? detail.tools.join('、') : ''} />
          <DetailRow label='成果说明' value={detail.result} />
        </View>
      )
    }
    if (item.type === 'portfolio') {
      return (
        <View className='detail-list'>
          <DetailRow label='作品名称' value={detail.workName} />
          <DetailRow label='作品简介' value={detail.workIntro} />
          <DetailRow label='适用场景' value={Array.isArray(detail.scenes) ? detail.scenes.join('、') : ''} />
        </View>
      )
    }
    if (item.type === 'certificate') {
      return (
        <View className='detail-list'>
          <DetailRow label='证书名称' value={detail.certificateName} />
          <DetailRow label='发证机构' value={detail.issuer} />
          <DetailRow label='证书时间' value={detail.issuedAt} />
          <DetailRow label='证书编号' value={detail.certificateNo} />
        </View>
      )
    }
    return (
      <View className='detail-list'>
        <DetailRow label='链接标题' value={item.title} />
        <DetailRow label='说明' value={item.description} />
      </View>
    )
  }

  if (!proof) {
    return (
      <View className='proof-page'>
        <View className='proof-nav'>
          <Text className='nav-action' onClick={handleBack}>‹</Text>
          <Text className='nav-title'>证明材料详情</Text>
          <Text className='nav-action' onClick={handleMore}>•••</Text>
        </View>
        <View className='empty-wrap'>
          <Text className='empty-title'>{loading ? '正在加载证明材料...' : '未找到证明材料'}</Text>
          <Text className='empty-desc'>{loading ? '请稍候' : '该证明材料可能已删除，或当前账号没有查看权限。'}</Text>
        </View>
      </View>
    )
  }

  return (
    <View className='proof-page'>
      <View className='proof-nav'>
        <Text className='nav-action' onClick={handleBack}>‹</Text>
        <Text className='nav-title'>证明材料详情</Text>
        <Text className='nav-action' onClick={handleMore}>•••</Text>
      </View>

      <ScrollView scrollY className='proof-scroll' showScrollbar={false} enhanced bounces={false}>
        <View className='page-body'>
          <View className='card main-card'>
            <View className='proof-title-row'>
              <Text className='proof-title'>{proof.title}</Text>
              <Text className={`status-badge ${proof.status}`}>{statusText[proof.status] || '未提交'}</Text>
            </View>
            <View className='badge-row'>
              <Text className='type-badge'>{typeText[proof.type] || '证明'}</Text>
              <Text className='skill-badge'>{proof.relatedSkill || '关联技能'}{proof.level ? ` Lv.${proof.level}` : ''}</Text>
            </View>
            <View className='meta-grid'>
              <Text className='meta-item'>提交人：{proof.submitterName || '同学'}</Text>
              <Text className='meta-item'>提交时间：{proof.createdAt || '暂无'}</Text>
              <Text className='meta-item'>更新时间：{proof.updatedAt || '暂无'}</Text>
            </View>
          </View>

          <View className='card'>
            <Text className='section-title'>材料说明</Text>
            <Text className='desc-text'>{proof.description || '暂无说明'}</Text>
          </View>

          <View className='card'>
            <Text className='section-title'>证明内容</Text>
            {renderProofContent(proof)}
          </View>

          <View className='card'>
            <Text className='section-title'>附件 / 图片</Text>
            {(proof.images || []).length ? (
              <View className='image-list'>
                {(proof.images || []).map((src) => (
                  <Image className='proof-image' src={src} mode='aspectFill' key={src} lazyLoad />
                ))}
              </View>
            ) : (
              <Text className='muted-text'>暂无图片材料</Text>
            )}
          </View>

          <View className='card'>
            <Text className='section-title'>相关链接</Text>
            {(proof.links || []).length ? (
              <View className='link-list'>
                {(proof.links || []).map((link) => (
                  <View className='link-item' key={link.url} onClick={() => handleCopyLink(link.url)}>
                    <View>
                      <Text className='link-title'>{link.title}</Text>
                      <Text className='link-url'>{link.url}</Text>
                    </View>
                    <Text className='link-action'>复制</Text>
                  </View>
                ))}
              </View>
            ) : (
              <Text className='muted-text'>暂无相关链接</Text>
            )}
          </View>

          <View className='card'>
            <Text className='section-title'>关联技能标签</Text>
            <View className='tag-wrap'>
              {proof.relatedSkill ? <Text className='tag primary'>{proof.relatedSkill}</Text> : null}
              {(proof.tags || []).map((tag) => (
                <Text className='tag' key={tag}>{tag}</Text>
              ))}
              {!proof.relatedSkill && !(proof.tags || []).length ? <Text className='muted-text'>暂无标签</Text> : null}
            </View>
          </View>

          <View className='card action-card'>
            {isOwnProof ? (
              <View className='owner-actions'>
                <View className='action-btn primary' onClick={handleOwnerAction}>
                  <Text>编辑证明材料</Text>
                </View>
                <View className='action-btn secondary' onClick={handleOwnerAction}>
                  <Text>补充材料</Text>
                </View>
                <View className='action-btn secondary' onClick={handleOwnerAction}>
                  <Text>提交审核</Text>
                </View>
              </View>
            ) : (
              <View className='action-btn primary' onClick={handleContact}>
                <Text>联系TA了解更多</Text>
              </View>
            )}
          </View>

          <View className='bottom-space' />
        </View>
      </ScrollView>
    </View>
  )
}
