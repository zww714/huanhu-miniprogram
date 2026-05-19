import { View, Text, ScrollView, Image } from '@tarojs/components'
import Taro, { useDidShow } from '@tarojs/taro'
import { useState } from 'react'
import './index.css'
import { getCurrentUser, getMyPosts, getMySkills as fetchMySkills, updateProfile } from '../../utils/api'

import {
  AVATAR_STORAGE_KEY,
  MY_PROFILE,
  MY_SKILLS,
  MY_LEARN_WANTS,
  MY_INTERESTS,
  MY_REVIEWS,
  MY_POSTS,
  SYSTEM_AVATARS,
} from '../../utils/mock'

const QUICK_ENTRIES = [
  { key: 'favorites', icon: '★', label: '我的收藏', desc: '收藏的帖子和技能', url: '/pages/my-favorites/index', tone: 'blue' },
  { key: 'history', icon: '◷', label: '浏览记录', desc: '最近看过的内容', url: '', tone: 'green' },
  { key: 'activities', icon: '日', label: '我的活动', desc: '报名和参与记录', url: '/pages/my-activities/index', tone: 'blue' },
  { key: 'settings', icon: '⚙', label: '设置', desc: '账号与隐私', url: '/pages/settings/index', tone: 'purple' },
]

export default function Profile() {
  const [avatarUrl, setAvatarUrl] = useState(MY_PROFILE.avatar || '')
  const [profileData, setProfileData] = useState<any>(MY_PROFILE)
  const [mySkills, setMySkills] = useState<any[]>(MY_SKILLS)
  const [myPosts, setMyPosts] = useState<any[]>(MY_POSTS)

  const toast = (msg: string) => Taro.showToast({ title: msg, icon: 'none' })
  const go = (url: string) => Taro.navigateTo({ url })
  const safeGo = (url?: string) => {
    if (!url) {
      toast('功能开发中')
      return
    }
    go(url)
  }

  const saveAvatar = (nextAvatar: string) => {
    if (!nextAvatar) return
    setAvatarUrl(nextAvatar)
    Taro.setStorageSync(AVATAR_STORAGE_KEY, nextAvatar)
  }

  const updateProfileAvatar = async (nextAvatar: string) => {
    saveAvatar(nextAvatar)
    try {
      await updateProfile({ profile: { avatar: nextAvatar } })
    } catch (e) {
      console.warn('[Profile] update avatar failed, saved locally', e)
    }
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

  const p = profileData
  const systemAvatar = SYSTEM_AVATARS.find((item) => item.id === avatarUrl)
  const reviewAverage = MY_REVIEWS.length
    ? (MY_REVIEWS.reduce((sum, review) => sum + review.rating, 0) / MY_REVIEWS.length).toFixed(1)
    : '4.8'
  const profileRating = String(p.rating || reviewAverage || '4.8')
  const userId = p.user_id || p.id || p._id || MY_PROFILE.user_id
  const stats = p.stats || {}
  const statValues = {
    skills: p.skillCount ?? stats.skills ?? mySkills.length,
    posts: p.postCount ?? stats.posts ?? myPosts.length,
    followers: p.followerCount ?? stats.followers ?? 0,
    following: p.followingCount ?? stats.following ?? 0,
  }
  const metaItems = [p.school || '浙江大学', p.college, p.major, p.grade, p.campus].filter(Boolean)
  const wantTags = (p.wantToLearn || p.learnWants || MY_LEARN_WANTS.map((item) => item.name)).slice(0, 3)
  const interestTags = (p.interests || MY_INTERESTS).slice(0, 3)
  const avatarText = (p.name || MY_PROFILE.name || '我').charAt(0)

  useDidShow(() => {
    const cachedAvatar = Taro.getStorageSync(AVATAR_STORAGE_KEY)
    const profileDraft = Taro.getStorageSync('profileDraft')
    if (profileDraft && typeof profileDraft === 'object') {
      setProfileData({
        ...MY_PROFILE,
        ...profileDraft,
        name: profileDraft.nickname || profileDraft.name || MY_PROFILE.name,
        bio: profileDraft.intro || profileDraft.bio || MY_PROFILE.bio,
      })
    } else {
      setProfileData(MY_PROFILE)
    }
    setAvatarUrl(cachedAvatar || MY_PROFILE.avatar || '')

    getCurrentUser()
      .then((user) => {
        if (!user) return
        const merged = {
          ...MY_PROFILE,
          ...user,
          user_id: user.user_id || user.id || user._id || MY_PROFILE.user_id,
          name: user.name || user.nickname || MY_PROFILE.name,
          bio: user.intro || user.bio || MY_PROFILE.bio,
          stats: user.stats || {
            skills: user.skillCount ?? MY_PROFILE.stats.skills,
            posts: user.postCount ?? MY_PROFILE.stats.posts,
            followers: user.followerCount ?? MY_PROFILE.stats.followers,
            following: user.followingCount ?? MY_PROFILE.stats.following,
          },
        }
        setProfileData(merged)
        setAvatarUrl(cachedAvatar || user.avatar || MY_PROFILE.avatar || '')
      })
      .catch((e) => console.warn('[Profile] getCurrentUser failed, fallback to mock', e))

    fetchMySkills()
      .then((skills) => {
        if (Array.isArray(skills) && skills.length) setMySkills(skills)
      })
      .catch((e) => console.warn('[Profile] getMySkills failed, fallback to mock', e))

    getMyPosts()
      .then((posts) => {
        if (Array.isArray(posts)) setMyPosts(posts)
      })
      .catch((e) => console.warn('[Profile] getMyPosts failed, fallback to mock', e))
  })

  return (
    <ScrollView scrollY className='profile-scroll' showScrollbar={false} enhanced bounces={false}>
      <View className='profile-page'>
        <View className='profile-card'>
          <View className='profile-main-row'>
            <View className='avatar-wrap' onClick={handleAvatarTap}>
              {avatarUrl && !systemAvatar ? (
                <Image className='avatar-image' src={avatarUrl} mode='aspectFill' />
              ) : (
                <View className='avatar' style={{ backgroundColor: systemAvatar?.bg || '#2563EB' }}>
                  <Text style={{ color: systemAvatar?.color || '#FFFFFF' }}>{systemAvatar?.text || avatarText}</Text>
                </View>
              )}
              <View className='avatar-edit-tip'><Text>换</Text></View>
            </View>

            <View className='profile-info'>
              <View className='name-row'>
                <Text className='profile-name'>{p.name || MY_PROFILE.name}</Text>
                {p.verified !== false && <View className='verify-dot'><Text>✓</Text></View>}
              </View>
              <Text className='profile-meta' numberOfLines={2}>{metaItems.join(' · ')}</Text>
              <Text className='profile-bio' numberOfLines={2}>
                {p.bio || p.intro || '热爱校园互助，期待和更多同学交换技能与经验。'}
              </Text>
            </View>

            <View className='rating-card'>
              <Text className='rating-label'>评分</Text>
              <Text className='rating-score'>{profileRating}</Text>
              <Text className='rating-stars'>★★★★★</Text>
            </View>
          </View>

          <View className='profile-tag-lines'>
            <View className='profile-tag-line'>
              <Text className='info-label'>想学</Text>
              <Text className='info-text' numberOfLines={1}>{wantTags.join('、') || '暂未填写'}</Text>
            </View>
            <View className='profile-tag-line'>
              <Text className='info-label'>兴趣</Text>
              <Text className='info-text' numberOfLines={1}>{interestTags.join('、') || '暂未填写'}</Text>
            </View>
          </View>

          <View className='edit-profile-btn' onClick={() => go('/pages/edit-profile/index')}>
            <Text>编辑资料</Text>
          </View>
        </View>

        <View className='stats-card'>
          {[
            { label: '技能', value: statValues.skills, icon: '技', url: `/pages/my-skills/index?userId=${encodeURIComponent(userId)}&self=1` },
            { label: '发布', value: statValues.posts, icon: '发', url: '/pages/my-posts/index' },
            { label: '粉丝', value: statValues.followers, icon: '粉', url: '/pages/my-followers/index' },
            { label: '关注', value: statValues.following, icon: '关', url: '/pages/my-following/index' },
          ].map((item, index) => (
            <View key={item.label} className={`stat-item ${index < 3 ? 'with-line' : ''}`} onClick={() => safeGo(item.url)}>
              <Text className='stat-icon'>{item.icon}</Text>
              <Text className='stat-value'>{item.value}</Text>
              <Text className='stat-label'>{item.label}</Text>
            </View>
          ))}
        </View>

        <View className='menu-card'>
          {QUICK_ENTRIES.map((entry, index) => (
            <View key={entry.key} className={`menu-row ${index === QUICK_ENTRIES.length - 1 ? 'last' : ''}`} onClick={() => safeGo(entry.url)}>
              <Text className={`menu-icon menu-icon--${entry.tone}`}>{entry.icon}</Text>
              <View className='menu-text'>
                <Text className='menu-label'>{entry.label}</Text>
                <Text className='menu-desc'>{entry.desc}</Text>
              </View>
              <Text className='menu-arrow'>›</Text>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  )
}
