import { View, Text, ScrollView, Image } from '@tarojs/components'
import Taro, { useDidShow } from '@tarojs/taro'
import { useState } from 'react'
import './index.css'

import {
  AVATAR_STORAGE_KEY,
  MY_PROFILE,
  MY_SKILLS,
  MY_LEARN_WANTS,
  MY_INTERESTS,
  MY_REVIEWS,
  MY_POSTS,
  SKILL_ID_BY_NAME,
  SYSTEM_AVATARS,
} from '../../utils/mock'

const QUICK_ENTRIES = [
  { key: 'partners', icon: '搭', label: '我的搭子', desc: '3 个', url: '/pages/my-partners/index' },
  { key: 'activities', icon: '活', label: '我的活动', desc: '2 个', url: '/pages/my-activities/index' },
  { key: 'favorites', icon: '藏', label: '我的收藏', desc: '5 条', url: '/pages/my-favorites/index' },
  { key: 'settings', icon: '设', label: '设置', desc: '账号与隐私', url: '/pages/settings/index' },
]

const LEVEL_COLORS: Record<number, { bg: string; text: string; label: string }> = {
  5: { bg: '#FEF3C7', text: '#92400E', label: 'Lv.5' },
  4: { bg: '#FEF9C3', text: '#A16207', label: 'Lv.4' },
  3: { bg: '#F0F9FF', text: '#075985', label: 'Lv.3' },
  2: { bg: '#F1F5F9', text: '#475569', label: 'Lv.2' },
  1: { bg: '#F8FAFC', text: '#64748B', label: 'Lv.1' },
}

export default function Profile() {
  const [activeTab, setActiveTab] = useState('posts')
  const [selectedSkillName, setSelectedSkillName] = useState(MY_SKILLS[0]?.name || '')
  const [avatarUrl, setAvatarUrl] = useState(MY_PROFILE.avatar || '')

  const toast = (msg: string) => Taro.showToast({ title: msg, icon: 'none' })
  const go = (url: string) => Taro.navigateTo({ url })
  const saveAvatar = (nextAvatar: string) => {
    if (!nextAvatar) return
    setAvatarUrl(nextAvatar)
    Taro.setStorageSync(AVATAR_STORAGE_KEY, nextAvatar)
  }
  const updateProfileAvatar = (nextAvatar: string) => {
    // Reserved for the real backend flow: upload avatar, then call updateProfile.
    saveAvatar(nextAvatar)
  }
  const chooseAvatarImage = (sourceType: 'camera' | 'album') => {
    const failTitle = sourceType === 'camera' ? '未能获取照片' : '未能选择图片'
    const onSuccess = (tempFilePath?: string) => {
      if (tempFilePath) updateProfileAvatar(tempFilePath)
    }

    if (Taro.chooseMedia) {
      Taro.chooseMedia({
        count: 1,
        mediaType: ['image'],
        sourceType: [sourceType],
        success: (res) => onSuccess(res.tempFiles?.[0]?.tempFilePath),
        fail: (err) => {
          if (String(err?.errMsg || '').includes('cancel')) return
          Taro.showToast({ title: failTitle, icon: 'none' })
        },
      })
      return
    }

    Taro.chooseImage({
      count: 1,
      sourceType: [sourceType],
      success: (res) => onSuccess(res.tempFilePaths?.[0]),
      fail: (err) => {
        if (String(err?.errMsg || '').includes('cancel')) return
        Taro.showToast({ title: failTitle, icon: 'none' })
      },
    })
  }
  const handleAvatarTap = () => {
    Taro.showActionSheet({
      itemList: ['选择系统头像', '拍照', '从照片库选择'],
      success: (res) => {
        if (res.tapIndex === 0) go('/pages/avatar-select/index')
        if (res.tapIndex === 1) chooseAvatarImage('camera')
        if (res.tapIndex === 2) chooseAvatarImage('album')
      },
    })
  }
  const goSkillDetail = (skillName: string) => {
    setSelectedSkillName(skillName)
    const skillId = SKILL_ID_BY_NAME[skillName] || encodeURIComponent(skillName)
    Taro.navigateTo({
      url: `/pages/skill-detail/index?userId=${encodeURIComponent(MY_PROFILE.user_id)}&skillId=${encodeURIComponent(skillId)}`,
    })
  }
  const goInterestDetail = (interestName: string) => {
    Taro.navigateTo({
      url: `/pages/interest-detail/index?interestName=${encodeURIComponent(interestName)}`,
    })
  }
  const goPostDetail = (postId: string) => {
    Taro.navigateTo({ url: `/pages/post-detail/index?postId=${encodeURIComponent(postId)}&from=mine` })
  }
  const goPostManage = (postId: string) => {
    Taro.navigateTo({ url: `/pages/post-manage/index?postId=${encodeURIComponent(postId)}` })
  }

  const p = MY_PROFILE
  const displaySkills = MY_SKILLS.slice(0, 4)
  const systemAvatar = SYSTEM_AVATARS.find((item) => item.id === avatarUrl)
  const reviewAverage = MY_REVIEWS.length
    ? (MY_REVIEWS.reduce((sum, review) => sum + review.rating, 0) / MY_REVIEWS.length).toFixed(1)
    : '0.0'
  const reviewTags = Array.from(new Set(MY_REVIEWS.flatMap((review) => review.tags))).slice(0, 5)

  useDidShow(() => {
    const cachedAvatar = Taro.getStorageSync(AVATAR_STORAGE_KEY)
    setAvatarUrl(cachedAvatar || MY_PROFILE.avatar || '')
  })

  return (
    <ScrollView scrollY className='profile-scroll' showScrollbar={false} enhanced bounces={false}>
      <View className='profile-header'>
        <View className='avatar-wrap' onClick={handleAvatarTap}>
          {avatarUrl && !systemAvatar ? (
            <Image className='avatar-image' src={avatarUrl} mode='aspectFill' />
          ) : (
            <View
              className='avatar'
              style={{
                backgroundColor: systemAvatar?.bg || '#2563EB',
              }}
            >
              <Text style={{ color: systemAvatar?.color || '#FFFFFF' }}>{systemAvatar?.text || p.name.charAt(0)}</Text>
            </View>
          )}
          <View className='avatar-edit-tip'><Text>换</Text></View>
        </View>
        <View className='name-row'>
          <Text className='profile-name'>{p.name}</Text>
          <View className='verify-dot'><Text>✓</Text></View>
        </View>
        <Text className='profile-meta'>{p.school} · {p.college} · {p.grade}</Text>
        <Text className='profile-bio'>{p.bio}</Text>
        <View className='edit-profile-btn' onClick={() => go('/pages/edit-profile/index')}>
          <Text>编辑资料</Text>
        </View>
      </View>

      <View className='stats-card'>
        {[
          { label: '技能', value: p.stats.skills, url: '/pages/my-skills/index' },
          { label: '发布', value: p.stats.posts, url: '/pages/my-posts/index' },
          { label: '粉丝', value: p.stats.followers, url: '/pages/my-followers/index' },
          { label: '关注', value: p.stats.following, url: '/pages/my-following/index' },
        ].map((item, index) => (
          <View key={item.label} className={`stat-item ${index < 3 ? 'with-line' : ''}`} onClick={() => go(item.url)}>
            <Text className='stat-value'>{item.value}</Text>
            <Text className='stat-label'>{item.label}</Text>
          </View>
        ))}
      </View>

      <View className='section-card'>
        <View className='section-head'>
          <Text className='section-title'>我会</Text>
          <View className='section-edit' onClick={() => go('/pages/edit-skills/index?type=can')}>
            <Text>编辑 ›</Text>
          </View>
        </View>
        <View className='skill-list'>
          {displaySkills.map((skill) => {
            const lc = LEVEL_COLORS[skill.level] || LEVEL_COLORS[1]
            const selected = selectedSkillName === skill.name
            return (
              <View
                key={skill.name}
                className={`skill-card ${selected ? 'selected' : ''}`}
                onClick={() => goSkillDetail(skill.name)}
              >
                <View className='level-badge' style={{ backgroundColor: lc.bg }}>
                  <Text style={{ color: lc.text }}>{lc.label}</Text>
                </View>
                <View className='skill-main'>
                  <Text className='skill-name'>{skill.name}</Text>
                  <Text className='skill-desc'>{skill.desc}</Text>
                </View>
                <Text className='skill-more'>查看详情 ›</Text>
              </View>
            )
          })}
        </View>
        {MY_SKILLS.length > 4 && (
          <View className='more-link' onClick={() => go('/pages/my-skills/index')}>
            <Text>查看更多...</Text>
          </View>
        )}
      </View>

      <View className='section-card'>
        <View className='section-head'>
          <Text className='section-title'>我想学</Text>
          <View className='section-edit' onClick={() => go('/pages/edit-skills/index?type=want')}>
            <Text>编辑 ›</Text>
          </View>
        </View>
        <View className='learn-wrap'>
          {MY_LEARN_WANTS.slice(0, 6).map((item) => (
            <Text className='learn-tag' key={item.name}>{item.name}</Text>
          ))}
        </View>
      </View>

      <View className='section-card'>
        <View className='section-head'>
          <Text className='section-title'>兴趣标签</Text>
          <View className='section-edit' onClick={() => toast('兴趣标签编辑稍后接入')}>
            <Text>编辑 ›</Text>
          </View>
        </View>
        <View className='interest-wrap'>
          {MY_INTERESTS.map((tag) => (
            <View className='interest-tag' key={tag} onClick={() => goInterestDetail(tag)}>
              <Text>{tag}</Text>
            </View>
          ))}
        </View>
      </View>

      <View className='quick-grid-card'>
        {QUICK_ENTRIES.map((entry) => (
          <View key={entry.key} className='quick-item' onClick={() => go(entry.url)}>
            <Text className='quick-icon'>{entry.icon}</Text>
            <View className='quick-text'>
              <Text className='quick-label'>{entry.label}</Text>
              <Text className='quick-desc'>{entry.desc}</Text>
            </View>
          </View>
        ))}
      </View>

      <View className='content-card'>
        <View className='tab-row'>
          {[{ key: 'posts', label: '我的发布' }, { key: 'reviews', label: '收到的评价' }].map((tab) => (
            <View key={tab.key} className={`tab-item ${activeTab === tab.key ? 'active' : ''}`} onClick={() => setActiveTab(tab.key)}>
              <Text>{tab.label}</Text>
            </View>
          ))}
        </View>
        {activeTab === 'posts' && (
          <View className='post-list'>
            {MY_POSTS.length ? (
              MY_POSTS.slice(0, 2).map((post) => (
                <View className='post-card' key={post.id} onClick={() => goPostDetail(post.id)}>
                  <View className='post-title-row'>
                    <Text className='post-title'>{post.title}</Text>
                    <Text className='post-time'>{post.time}</Text>
                  </View>
                  <Text className='post-excerpt'>{post.excerpt}</Text>
                  <View className='post-tags'>
                    {post.tags.map((tag) => <Text className='post-tag' key={tag}>{tag}</Text>)}
                  </View>
                  <View className='post-meta-row'>
                    <View className='post-meta'>
                      <Text>♡ {post.likes}</Text>
                      <Text>评论 {post.comments}</Text>
                    </View>
                    <View className='post-manage-btn' onClick={(event) => { event.stopPropagation(); goPostManage(post.id) }}>
                      <Text>管理</Text>
                    </View>
                  </View>
                </View>
              ))
            ) : (
              <View className='empty-posts'>
                <Text className='empty-title'>还没有发布内容</Text>
                <Text className='empty-desc'>分享一个技能、兴趣或活动，让更多同学看到你</Text>
                <View className='publish-btn' onClick={() => go('/pages/publish/index')}>
                  <Text>去发布</Text>
                </View>
              </View>
            )}
          </View>
        )}
        {activeTab === 'reviews' && (
          <View className='review-list'>
            <View className='review-overview'>
              <View className='review-score-block'>
                <Text className='review-score'>{reviewAverage}</Text>
                <Text className='review-score-label'>综合评分</Text>
              </View>
              <View className='review-summary'>
                <Text className='review-summary-title'>收到 {MY_REVIEWS.length} 条评价</Text>
                <Text className='review-summary-desc'>这些评价来自你完成的技能交换、活动搭子或学习互助。</Text>
                <View className='review-common-tags'>
                  {reviewTags.map((tag) => <Text className='review-common-tag' key={tag}>{tag}</Text>)}
                </View>
              </View>
            </View>
            {MY_REVIEWS.map((review) => (
              <View key={review.id} className='review-card'>
                <View className='review-head'>
                  <View className='review-avatar'><Text>{review.reviewerName.charAt(0)}</Text></View>
                  <View className='reviewer-main'>
                    <Text className='reviewer-name'>{review.reviewerName}</Text>
                    <Text className='review-time'>{review.createdAt}</Text>
                  </View>
                  <Text className='review-rating'>★ {review.rating}</Text>
                </View>
                <View className='review-tags'>
                  {review.tags.map((tag: string) => <Text className='review-tag' key={tag}>{tag}</Text>)}
                </View>
                <Text className='review-content'>{review.content}</Text>
                <Text className='review-skill'>
                  {review.relatedType === 'activity' ? '关联活动' : review.relatedType === 'partner' ? '关联搭子' : '关联技能'}：{review.relatedTitle}
                </Text>
              </View>
            ))}
          </View>
        )}
      </View>

      <View className='tabbar-space' />
    </ScrollView>
  )
}
