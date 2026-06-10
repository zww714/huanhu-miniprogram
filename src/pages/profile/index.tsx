import { View, Text, ScrollView, Image } from '@tarojs/components'
import Taro, { useDidShow } from '@tarojs/taro'
import { useState } from 'react'
import ErrorBoundary from '../../components/common/ErrorBoundary'
import './index.scss'
import { getCurrentUser, updateProfile } from '../../api'
import { getUserStats } from '../../api/stats'
import { getGenderSymbol, getGenderTone } from '../../utils/gender'
import { smoothNavigateTo } from '../../utils/navigation'

import {
  AVATAR_STORAGE_KEY,
  SYSTEM_AVATARS,
} from '../../utils/mock'

const QUICK_ENTRIES = [
  { key: 'favorites', icon: '☆', label: '我的收藏', desc: '收藏的帖子和技能', path: '/sp-content/pages/my-favorites/index', tone: 'blue' },
  { key: 'history', icon: '◷', label: '浏览记录', desc: '最近看过的内容', path: '/sp-content/pages/browse-history/index', tone: 'green' },
  { key: 'activities', icon: '□', label: '我的活动', desc: '报名和参与记录', path: '/sp-content/pages/my-activities/index', tone: 'blue' },
  { key: 'settings', icon: '◇', label: '设置', desc: '账号与隐私', path: '/sp-profile/pages/settings/index', tone: 'purple' },
]

const PROFILE_STORAGE_KEY = 'profileDraft'

const EMPTY_PROFILE = {
  user_id: '',
  name: '同学',
  avatar: '',
  gender: 'private',
  verified: false,
  school: '浙江大学',
  college: '',
  major: '',
  grade: '',
  campus: '',
  bio: '',
  intro: '',
  wantToLearn: [],
  learnWants: [],
  interests: [],
  skillCount: 0,
  postCount: 0,
  followerCount: 0,
  followingCount: 0,
  rating: 0,
  stats: { skills: 0, posts: 0, followers: 0, following: 0 },
}

function getSavedProfile() {
  const saved = Taro.getStorageSync(PROFILE_STORAGE_KEY)
  if (!saved || typeof saved !== 'object') return {}
  return saved as Record<string, any>
}

function getDisplayProfile() {
  const saved = getSavedProfile()
  return {
    ...EMPTY_PROFILE,
    ...saved,
    name: saved.name || saved.nickname || EMPTY_PROFILE.name,
    bio: saved.bio || saved.intro || EMPTY_PROFILE.bio,
    intro: saved.intro || saved.bio || EMPTY_PROFILE.intro,
  }
}

export default function Profile() {
  const initialProfile = getDisplayProfile()
  const [avatarUrl, setAvatarUrl] = useState(initialProfile.avatar || '')
  const [profileData, setProfileData] = useState<any>(initialProfile)
  const [mySkills, setMySkills] = useState<any[]>([])
  const [myPosts, setMyPosts] = useState<any[]>([])

  const toast = (msg: string) => Taro.showToast({ title: msg, icon: 'none' })
  const go = (url: string) => smoothNavigateTo(url)
  const safeGo = (url?: string) => {
    if (!url) {
      toast('功能开发中')
      return
    }
    go(url)
  }
  const withProfileParams = (path: string, extra: Record<string, string | number> = {}) => {
    const params = {
      from: 'profile',
      userId: String(userId),
      name: String(p.name || EMPTY_PROFILE.name),
      ...extra,
    }
    const query = Object.entries(params)
      .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`)
      .join('&')
    return `${path}?${query.toString()}`
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
        if (res.tapIndex === 0) go('/sp-profile/pages/avatar-select/index')
        if (res.tapIndex === 1) chooseAvatarImage('camera')
        if (res.tapIndex === 2) chooseAvatarImage('album')
      },
      fail: () => undefined,
    })
  }

  const p = profileData
  const systemAvatar = SYSTEM_AVATARS.find((item) => item.id === avatarUrl)
  const userId = p.user_id || p.id || p._id || ''
  const stats = p.stats || {}
  const statValues = {
    skills: p.skillCount ?? stats.skills ?? mySkills.length ?? 0,
    posts: p.postCount ?? stats.posts ?? myPosts.length ?? 0,
    followers: p.followerCount ?? stats.followers ?? 0,
    following: p.followingCount ?? stats.following ?? 0,
  }
  const metaItems = [p.school || '浙江大学', p.college, p.major, p.grade, p.campus].filter(Boolean)
  const wantTags = (p.wantToLearn || p.learnWants || p.want || []).slice(0, 3)
  const interestTags = (p.interests || []).slice(0, 3)
  const avatarText = (p.name || EMPTY_PROFILE.name || '我').charAt(0)
  const genderSymbol = getGenderSymbol(p)
  const genderTone = getGenderTone(p)

  useDidShow(() => {
    const nextProfile = getDisplayProfile()
    setProfileData(nextProfile)
    setAvatarUrl(nextProfile.avatar || '')
    ;(async () => {
      let currentProfile = nextProfile
      try {
        const currentUser = await getCurrentUser()
        if (currentUser) {
          currentProfile = {
            ...nextProfile,
            ...currentUser,
            user_id: currentUser.user_id || currentUser.id || currentUser._id || nextProfile.user_id,
            name: currentUser.name || currentUser.nickname || nextProfile.name,
            bio: currentUser.bio || currentUser.intro || nextProfile.bio,
            intro: currentUser.intro || currentUser.bio || nextProfile.intro,
            rating: 0,
          }
          setProfileData(currentProfile)
          if (currentUser.avatar) setAvatarUrl(currentUser.avatar)
        }
      } catch (e) {
        console.warn('[Profile] load current user failed', e)
      }

      const nextUserId = currentProfile.user_id || currentProfile.id || currentProfile._id || ''
      if (!nextUserId) return
      try {
        const realStats = await getUserStats(String(nextUserId))
        const normalizedStats = {
          skills: realStats.skillCount ?? 0,
          posts: realStats.postCount ?? 0,
          followers: realStats.followerCount ?? 0,
          following: realStats.followingCount ?? 0,
        }
        setMySkills(Array.from({ length: normalizedStats.skills }))
        setMyPosts(Array.from({ length: normalizedStats.posts }))
        setProfileData((current: any) => ({
          ...current,
          skillCount: normalizedStats.skills,
          postCount: normalizedStats.posts,
          followerCount: normalizedStats.followers,
          followingCount: normalizedStats.following,
          stats: {
            ...(current.stats || {}),
            ...normalizedStats,
          },
          rating: 0,
        }))
      } catch (e) {
        console.warn('[Profile] load user stats failed', e)
      }
    })()
  })

  return (
    <ErrorBoundary>
    <ScrollView scrollY className='profile-scroll' showScrollbar={false} enhanced bounces={false}>
      <View className='profile-page'>
        <View className='profile-card'>
          <View className='profile-main-row'>
            <View className='avatar-wrap' onClick={handleAvatarTap}>
              {avatarUrl && !systemAvatar ? (
                <Image className='avatar-image' src={avatarUrl} mode='aspectFill' lazyLoad />
              ) : (
                <View className='avatar' style={{ backgroundColor: systemAvatar?.bg || '#2563EB' }}>
                  <Text style={{ color: systemAvatar?.color || '#FFFFFF' }}>{systemAvatar?.text || avatarText}</Text>
                </View>
              )}
              <View className='avatar-edit-tip'><Text>换</Text></View>
            </View>

            <View className='profile-info'>
              <View className='name-row'>
                <Text className='profile-name'>{p.name || EMPTY_PROFILE.name}</Text>
                {genderSymbol ? <Text className={`gender-symbol gender-symbol--${genderTone}`}>{genderSymbol}</Text> : null}
                {p.verified !== false && <View className='verify-dot'><Text>✓</Text></View>}
              </View>
              <Text className='profile-meta' numberOfLines={2}>{metaItems.join(' · ') || '完善资料后展示学院、年级和校区'}</Text>
              <Text className='profile-bio' numberOfLines={2}>
                {p.bio || p.intro || '还没有填写个人介绍'}
              </Text>
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

          <View className='edit-profile-btn' onClick={() => go('/sp-profile/pages/edit-profile/index')}>
            <Text>编辑资料</Text>
          </View>
        </View>

        <View className='stats-card'>
          {[
            { label: '技能', value: statValues.skills, url: withProfileParams('/sp-content/pages/my-skills/index', { self: 1 }) },
            { label: '发布', value: statValues.posts, url: withProfileParams('/sp-content/pages/my-posts/index', { self: 1 }) },
            { label: '粉丝', value: statValues.followers, url: withProfileParams('/sp-content/pages/my-followers/index') },
            { label: '关注', value: statValues.following, url: withProfileParams('/sp-content/pages/my-following/index') },
          ].map((item, index) => (
            <View key={item.label} className={`stat-item ${index < 3 ? 'with-line' : ''}`} onClick={() => safeGo(item.url)}>
              <Text className='stat-value'>{item.value}</Text>
              <Text className='stat-label'>{item.label}</Text>
            </View>
          ))}
        </View>

        <View className='menu-card'>
          {QUICK_ENTRIES.map((entry, index) => (
            <View key={entry.key} className={`menu-row ${index === QUICK_ENTRIES.length - 1 ? 'last' : ''}`} onClick={() => safeGo(withProfileParams(entry.path))}>
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
    </ErrorBoundary>
  )
}
