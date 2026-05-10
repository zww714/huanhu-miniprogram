import { useState } from 'react'
import Taro, { useLoad } from '@tarojs/taro'
import { Image, Input, ScrollView, Text, Textarea, View } from '@tarojs/components'
import { createActivity, createPost, publishPartnerProfile, publishSkillNeed } from '../../utils/api'
import './index.css'

type PublishMode = 'skill' | 'partner' | 'activity' | 'post'

const QUICK_SKILLS = ['AI工具', 'Python', '数据分析', '英语交流', '摄影', '产品设计', '羽毛球']
const QUICK_INTERESTS = ['运动', '游戏', '摄影', '学习', '音乐', '旅行', '桌游', '电影']
const ACTIVITY_CATEGORIES = ['技能交换', '兴趣', '志愿', '其他']
const ACTIVITY_TAGS = ['讲座', '运动', '摄影', '桌游', '学习', '公益', '线下']
const POST_CATEGORIES = ['科研', '升学', '兴趣', '工作']
const POST_TAGS = ['AI', '编程', '摄影', '考研', '论文', '活动', '求助', '经验']

function splitTags(value: string) {
  return value
    .split(/[、,，\s]+/)
    .map((item) => item.trim())
    .filter(Boolean)
}

function toggleItem(list: string[], item: string) {
  return list.includes(item) ? list.filter((value) => value !== item) : [...list, item]
}

export default function Publish() {
  const [mode, setMode] = useState<PublishMode>('skill')
  const [type, setType] = useState<'can' | 'want'>('can')
  const [canName, setCanName] = useState('')
  const [wantName, setWantName] = useState('')
  const [canDesc, setCanDesc] = useState('')
  const [wantDesc, setWantDesc] = useState('')
  const [level, setLevel] = useState(3)
  const [partnerBio, setPartnerBio] = useState('')
  const [partnerInterests, setPartnerInterests] = useState<string[]>([])
  const [partnerInterestInput, setPartnerInterestInput] = useState('')
  const [activityTitle, setActivityTitle] = useState('')
  const [activityOrganizer, setActivityOrganizer] = useState('')
  const [activityTime, setActivityTime] = useState('')
  const [activityLocation, setActivityLocation] = useState('')
  const [activityMaxParticipants, setActivityMaxParticipants] = useState('20')
  const [activityCategory, setActivityCategory] = useState('兴趣')
  const [activityTags, setActivityTags] = useState<string[]>([])
  const [activityTagInput, setActivityTagInput] = useState('')
  const [postTitle, setPostTitle] = useState('')
  const [postContent, setPostContent] = useState('')
  const [postCategory, setPostCategory] = useState('兴趣')
  const [postTags, setPostTags] = useState<string[]>([])
  const [postTagInput, setPostTagInput] = useState('')
  const [postImage, setPostImage] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useLoad((options) => {
    if (options?.mode === 'partner' || options?.mode === 'activity' || options?.mode === 'skill' || options?.mode === 'post') {
      setMode(options.mode)
    }
  })

  const currentName = type === 'can' ? canName : wantName
  const currentDesc = type === 'can' ? canDesc : wantDesc
  const setCurrentName = type === 'can' ? setCanName : setWantName
  const setCurrentDesc = type === 'can' ? setCanDesc : setWantDesc

  const pageTitle = mode === 'partner' ? '发布兴趣搭子' : mode === 'activity' ? '发布活动' : mode === 'post' ? '发布帖子' : '发布技能'

  const publishSkill = async () => {
    if (!currentName.trim()) {
      Taro.showToast({ title: '请输入技能名称', icon: 'none' })
      return
    }

    await publishSkillNeed({
      type,
      name: currentName,
      level,
      desc: currentDesc,
    })
    Taro.setStorageSync('pendingSkillNeed', {
      type,
      name: currentName.trim(),
      level,
      desc: currentDesc.trim(),
    })
    Taro.reLaunch({ url: '/pages/index/index?refresh=1&tab=0' })
  }

  const publishPartner = async () => {
    const interests = Array.from(new Set([...partnerInterests, ...splitTags(partnerInterestInput)]))
    if (!partnerBio.trim()) {
      Taro.showToast({ title: '请输入一句话个人介绍', icon: 'none' })
      return
    }
    if (!interests.length) {
      Taro.showToast({ title: '请填写兴趣爱好', icon: 'none' })
      return
    }

    await publishPartnerProfile({
      bio: partnerBio,
      interests,
    })
    Taro.setStorageSync('pendingPartnerProfile', {
      bio: partnerBio.trim(),
      interests,
      tags: interests,
      lookingFor: `${interests[0]}搭子`,
    })
    Taro.reLaunch({ url: '/pages/index/index?refresh=1&tab=1' })
  }

  const publishActivity = async () => {
    const tags = Array.from(new Set([...activityTags, ...splitTags(activityTagInput)]))
    if (!activityTitle.trim() || !activityOrganizer.trim() || !activityTime.trim() || !activityLocation.trim()) {
      Taro.showToast({ title: '请补全活动信息', icon: 'none' })
      return
    }

    const activity = await createActivity({
      title: activityTitle,
      organizer: activityOrganizer,
      time: activityTime,
      location: activityLocation,
      maxParticipants: Number(activityMaxParticipants || 20),
      category: activityCategory,
      tags,
    })
    Taro.setStorageSync('pendingActivity', activity)
    Taro.reLaunch({ url: '/pages/index/index?refresh=1&tab=2' })
  }

  const choosePostImage = async () => {
    const res = await Taro.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
    })
    const image = res.tempFilePaths?.[0]
    if (image) setPostImage(image)
  }

  const publishPost = async () => {
    const tags = Array.from(new Set([...postTags, ...splitTags(postTagInput)]))
    if (!postTitle.trim()) {
      Taro.showToast({ title: '请输入帖子标题', icon: 'none' })
      return
    }
    if (!postContent.trim()) {
      Taro.showToast({ title: '请输入帖子内容', icon: 'none' })
      return
    }

    const post = await createPost({
      title: postTitle,
      content: postContent,
      tags: tags.length ? tags : [postCategory],
      visibility: '公开',
      mainCategory: postCategory,
      image: postImage,
    })
    Taro.setStorageSync('pendingPost', post)
    Taro.reLaunch({ url: '/pages/discover/index?refresh=1' })
  }

  const handlePublish = async () => {
    if (submitting) return
    setSubmitting(true)
    Taro.showLoading({ title: '发布中...' })
    try {
      if (mode === 'partner') {
        await publishPartner()
      } else if (mode === 'activity') {
        await publishActivity()
      } else if (mode === 'post') {
        await publishPost()
      } else {
        await publishSkill()
      }
      Taro.showToast({ title: '发布成功', icon: 'success' })
    } catch (e) {
      console.warn('[Publish] publish failed', e)
      Taro.showToast({ title: '发布失败，请检查网络或权限', icon: 'none' })
    } finally {
      Taro.hideLoading()
      setSubmitting(false)
    }
  }

  const renderTypeButton = (value: 'can' | 'want', label: string) => {
    const selected = type === value
    return (
      <View
        onClick={() => setType(value)}
        style={{
          flex: 1,
          height: '48px',
          borderRadius: '10px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: selected ? '#2563EB' : '#FFF',
          border: selected ? '1px solid #2563EB' : '1px solid #E2E8F0',
        }}
      >
        <Text style={{ fontSize: '15px', fontWeight: '600', color: selected ? '#FFF' : '#64748B' }}>
          {label}
        </Text>
      </View>
    )
  }

  const renderChip = (label: string, selected: boolean, onClick: () => void) => (
    <View
      key={label}
      onClick={onClick}
      style={{
        padding: '6px 14px',
        borderRadius: '100px',
        backgroundColor: selected ? '#2563EB' : '#F1F5F9',
      }}
    >
      <Text style={{ fontSize: '13px', color: selected ? '#FFF' : '#64748B' }}>{label}</Text>
    </View>
  )

  const renderSkillForm = () => (
    <>
      <View style={{ display: 'flex', gap: '10px', marginBottom: '18px' }}>
        {renderTypeButton('can', '我会')}
        {renderTypeButton('want', '我想学')}
      </View>

      <View style={{ marginBottom: '16px' }}>
        <Text style={{ fontSize: '14px', fontWeight: '600', color: '#1E293B', marginBottom: '8px' }}>技能名称</Text>
        <View style={{ minHeight: '46px', backgroundColor: '#FFF', borderRadius: '10px', border: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', padding: '0 14px' }}>
          <Input
            placeholder={type === 'can' ? '例如：Python、摄影、AI工具' : '例如：产品设计、羽毛球、数据分析'}
            value={currentName}
            onInput={(e) => setCurrentName(e.detail.value)}
            style={{ width: '100%', height: '44px', minHeight: '44px', lineHeight: '22px', fontSize: '15px', color: '#1E293B' }}
          />
        </View>
      </View>

      <View style={{ marginBottom: '18px' }}>
        <Text style={{ fontSize: '14px', fontWeight: '600', color: '#1E293B', marginBottom: '8px' }}>快速选择</Text>
        <View style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {QUICK_SKILLS.map((skill) => renderChip(skill, currentName === skill, () => setCurrentName(skill)))}
        </View>
      </View>

      {type === 'can' && (
        <View style={{ marginBottom: '18px' }}>
          <Text style={{ fontSize: '14px', fontWeight: '600', color: '#1E293B', marginBottom: '8px' }}>熟练程度</Text>
          <View style={{ display: 'flex', gap: '8px' }}>
            {[1, 2, 3, 4, 5].map((item) => (
              <View
                key={item}
                onClick={() => setLevel(item)}
                style={{
                  width: '40px',
                  height: '36px',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: level === item ? '#2563EB' : '#FFF',
                  border: level === item ? '1px solid #2563EB' : '1px solid #E2E8F0',
                }}
              >
                <Text style={{ fontSize: '14px', fontWeight: '600', color: level === item ? '#FFF' : '#64748B' }}>
                  Lv.{item}
                </Text>
              </View>
            ))}
          </View>
        </View>
      )}

      <View style={{ marginBottom: '20px' }}>
        <Text style={{ fontSize: '14px', fontWeight: '600', color: '#1E293B', marginBottom: '8px' }}>
          {type === 'can' ? '补充说明' : '学习目标'}
        </Text>
        <Textarea
          placeholder={type === 'can' ? '简单说说你能帮同学解决什么问题' : '简单说说你想学到什么程度'}
          value={currentDesc}
          onInput={(e) => setCurrentDesc(e.detail.value)}
          style={{ width: '100%', height: '120px', padding: '12px 14px', backgroundColor: '#FFF', borderRadius: '10px', border: '1px solid #E2E8F0', fontSize: '14px', color: '#1E293B', boxSizing: 'border-box' }}
        />
      </View>
    </>
  )

  const renderPartnerForm = () => (
    <>
      <View style={{ marginBottom: '16px' }}>
        <Text style={{ fontSize: '14px', fontWeight: '600', color: '#1E293B', marginBottom: '8px' }}>一句话个人介绍</Text>
        <Textarea
          placeholder="例如：想找周末一起拍照、运动和自习的同学"
          value={partnerBio}
          onInput={(e) => setPartnerBio(e.detail.value)}
          maxlength={80}
          style={{ width: '100%', height: '92px', padding: '12px 14px', backgroundColor: '#FFF', borderRadius: '10px', border: '1px solid #E2E8F0', fontSize: '14px', color: '#1E293B', boxSizing: 'border-box' }}
        />
      </View>

      <View style={{ marginBottom: '16px' }}>
        <Text style={{ fontSize: '14px', fontWeight: '600', color: '#1E293B', marginBottom: '8px' }}>兴趣爱好</Text>
        <View style={{ minHeight: '46px', backgroundColor: '#FFF', borderRadius: '10px', border: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', padding: '0 14px' }}>
          <Input
            placeholder="可输入多个，例如：摄影、桌游、跑步"
            value={partnerInterestInput}
            onInput={(e) => setPartnerInterestInput(e.detail.value)}
            style={{ width: '100%', height: '44px', minHeight: '44px', lineHeight: '22px', fontSize: '15px', color: '#1E293B' }}
          />
        </View>
      </View>

      <View style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        {QUICK_INTERESTS.map((item) =>
          renderChip(item, partnerInterests.includes(item), () => setPartnerInterests(toggleItem(partnerInterests, item)))
        )}
      </View>
    </>
  )

  const renderActivityForm = () => (
    <>
      <View style={{ marginBottom: '16px' }}>
        <Text style={{ fontSize: '14px', fontWeight: '600', color: '#1E293B', marginBottom: '8px' }}>活动名称</Text>
        <View style={{ minHeight: '46px', backgroundColor: '#FFF', borderRadius: '10px', border: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', padding: '0 14px' }}>
          <Input value={activityTitle} placeholder="例如：周末羽毛球组队" onInput={(e) => setActivityTitle(e.detail.value)} style={{ width: '100%', height: '44px', minHeight: '44px', lineHeight: '22px', fontSize: '15px', color: '#1E293B' }} />
        </View>
      </View>

      <View style={{ marginBottom: '16px' }}>
        <Text style={{ fontSize: '14px', fontWeight: '600', color: '#1E293B', marginBottom: '8px' }}>组织方</Text>
        <View style={{ minHeight: '46px', backgroundColor: '#FFF', borderRadius: '10px', border: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', padding: '0 14px' }}>
          <Input value={activityOrganizer} placeholder="例如：浙江大学羽毛球社" onInput={(e) => setActivityOrganizer(e.detail.value)} style={{ width: '100%', height: '44px', minHeight: '44px', lineHeight: '22px', fontSize: '15px', color: '#1E293B' }} />
        </View>
      </View>

      <View style={{ marginBottom: '16px' }}>
        <Text style={{ fontSize: '14px', fontWeight: '600', color: '#1E293B', marginBottom: '8px' }}>时间</Text>
        <View style={{ minHeight: '46px', backgroundColor: '#FFF', borderRadius: '10px', border: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', padding: '0 14px' }}>
          <Input value={activityTime} placeholder="例如：本周六 14:00" onInput={(e) => setActivityTime(e.detail.value)} style={{ width: '100%', height: '44px', minHeight: '44px', lineHeight: '22px', fontSize: '15px', color: '#1E293B' }} />
        </View>
      </View>

      <View style={{ marginBottom: '16px' }}>
        <Text style={{ fontSize: '14px', fontWeight: '600', color: '#1E293B', marginBottom: '8px' }}>地点</Text>
        <View style={{ minHeight: '46px', backgroundColor: '#FFF', borderRadius: '10px', border: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', padding: '0 14px' }}>
          <Input value={activityLocation} placeholder="例如：紫金港体育馆" onInput={(e) => setActivityLocation(e.detail.value)} style={{ width: '100%', height: '44px', minHeight: '44px', lineHeight: '22px', fontSize: '15px', color: '#1E293B' }} />
        </View>
      </View>

      <View style={{ marginBottom: '16px' }}>
        <Text style={{ fontSize: '14px', fontWeight: '600', color: '#1E293B', marginBottom: '8px' }}>人数上限</Text>
        <View style={{ minHeight: '46px', backgroundColor: '#FFF', borderRadius: '10px', border: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', padding: '0 14px' }}>
          <Input type="number" value={activityMaxParticipants} placeholder="20" onInput={(e) => setActivityMaxParticipants(e.detail.value)} style={{ width: '100%', height: '44px', minHeight: '44px', lineHeight: '22px', fontSize: '15px', color: '#1E293B' }} />
        </View>
      </View>

      <View style={{ marginBottom: '16px' }}>
        <Text style={{ fontSize: '14px', fontWeight: '600', color: '#1E293B', marginBottom: '8px' }}>分类</Text>
        <View style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {ACTIVITY_CATEGORIES.map((item) => renderChip(item, activityCategory === item, () => setActivityCategory(item)))}
        </View>
      </View>

      <View style={{ marginBottom: '16px' }}>
        <Text style={{ fontSize: '14px', fontWeight: '600', color: '#1E293B', marginBottom: '8px' }}>标签</Text>
        <View style={{ minHeight: '46px', backgroundColor: '#FFF', borderRadius: '10px', border: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', padding: '0 14px', marginBottom: '10px' }}>
          <Input value={activityTagInput} placeholder="可输入多个，例如：运动、线下" onInput={(e) => setActivityTagInput(e.detail.value)} style={{ width: '100%', height: '44px', minHeight: '44px', lineHeight: '22px', fontSize: '15px', color: '#1E293B' }} />
        </View>
        <View style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {ACTIVITY_TAGS.map((item) => renderChip(item, activityTags.includes(item), () => setActivityTags(toggleItem(activityTags, item))))}
        </View>
      </View>
    </>
  )

  const renderPostForm = () => (
    <>
      <View style={{ marginBottom: '16px' }}>
        <Text style={{ fontSize: '14px', fontWeight: '600', color: '#1E293B', marginBottom: '8px' }}>标题</Text>
        <View style={{ minHeight: '46px', backgroundColor: '#FFF', borderRadius: '10px', border: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', padding: '0 14px' }}>
          <Input
            value={postTitle}
            placeholder="例如：求推荐好用的 AI 写作工具"
            onInput={(e) => setPostTitle(e.detail.value)}
            style={{ width: '100%', height: '44px', minHeight: '44px', lineHeight: '22px', fontSize: '15px', color: '#1E293B' }}
          />
        </View>
      </View>

      <View style={{ marginBottom: '16px' }}>
        <Text style={{ fontSize: '14px', fontWeight: '600', color: '#1E293B', marginBottom: '8px' }}>内容</Text>
        <Textarea
          value={postContent}
          placeholder="分享你的想法、经验或问题..."
          onInput={(e) => setPostContent(e.detail.value)}
          style={{ width: '100%', height: '150px', padding: '12px 14px', backgroundColor: '#FFF', borderRadius: '10px', border: '1px solid #E2E8F0', fontSize: '14px', color: '#1E293B', boxSizing: 'border-box' }}
        />
      </View>

      <View style={{ marginBottom: '16px' }}>
        <Text style={{ fontSize: '14px', fontWeight: '600', color: '#1E293B', marginBottom: '8px' }}>分类</Text>
        <View style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {POST_CATEGORIES.map((item) => renderChip(item, postCategory === item, () => setPostCategory(item)))}
        </View>
      </View>

      <View style={{ marginBottom: '16px' }}>
        <Text style={{ fontSize: '14px', fontWeight: '600', color: '#1E293B', marginBottom: '8px' }}>标签</Text>
        <View style={{ minHeight: '46px', backgroundColor: '#FFF', borderRadius: '10px', border: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', padding: '0 14px', marginBottom: '10px' }}>
          <Input
            value={postTagInput}
            placeholder="可输入多个，例如：AI、论文、求助"
            onInput={(e) => setPostTagInput(e.detail.value)}
            style={{ width: '100%', height: '44px', minHeight: '44px', lineHeight: '22px', fontSize: '15px', color: '#1E293B' }}
          />
        </View>
        <View style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {POST_TAGS.map((item) => renderChip(item, postTags.includes(item), () => setPostTags(toggleItem(postTags, item))))}
        </View>
      </View>

      <View style={{ marginBottom: '20px' }}>
        <Text style={{ fontSize: '14px', fontWeight: '600', color: '#1E293B', marginBottom: '8px' }}>图片</Text>
        {postImage ? (
          <View onClick={choosePostImage} style={{ width: '100%', height: '150px', borderRadius: '10px', overflow: 'hidden', border: '1px solid #E2E8F0', backgroundColor: '#FFF' }}>
            <Image src={postImage} mode="aspectFill" style={{ width: '100%', height: '150px' }} />
          </View>
        ) : (
          <View onClick={choosePostImage} style={{ height: '100px', borderRadius: '10px', border: '1px dashed #CBD5E1', backgroundColor: '#FFF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ fontSize: '14px', color: '#64748B' }}>+ 选择图片</Text>
          </View>
        )}
      </View>
    </>
  )

  return (
    <View style={{ minHeight: '100vh', backgroundColor: '#F8FAFC' }}>
      <View style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', backgroundColor: '#FFF', borderBottom: '1px solid #F1F5F9' }}>
        <Text onClick={() => Taro.navigateBack()} style={{ fontSize: '16px', color: '#64748B' }}>取消</Text>
        <Text style={{ fontSize: '17px', fontWeight: '600', color: '#1E293B' }}>{pageTitle}</Text>
        <Text onClick={handlePublish} style={{ fontSize: '16px', fontWeight: '600', color: submitting ? '#94A3B8' : '#2563EB' }}>
          {submitting ? '发布中' : '发布'}
        </Text>
      </View>

      <ScrollView scrollY style={{ height: 'calc(100vh - 52px)' }}>
        <View style={{ padding: '16px', paddingBottom: '100px' }}>
          {mode === 'skill' && renderSkillForm()}
          {mode === 'partner' && renderPartnerForm()}
          {mode === 'activity' && renderActivityForm()}
          {mode === 'post' && renderPostForm()}
        </View>
      </ScrollView>
    </View>
  )
}
