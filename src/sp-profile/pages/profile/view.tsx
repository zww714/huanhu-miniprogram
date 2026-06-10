import { View, Text, ScrollView, Image } from '@tarojs/components'
import Taro, { useLoad } from '@tarojs/taro'
import { useEffect, useMemo, useState } from 'react'
import {
  followUser as apiFollowUser,
  getSavedLoginUser,
  getFollowStatus,
  getUserDetail,
  getUserPosts,
  getUserSkills,
  unfollowUser as apiUnfollowUser,
} from '../../../api'
import { getUserStats } from '../../../api/stats'
import {
  normalizePublicUserId,
  type PublicUser,
} from '../../../utils/publicProfiles'
import { getGenderSymbol, getGenderTone } from '../../../utils/gender'
import './view.scss'

type FollowState = {
  isFollowing: boolean
  isFollower: boolean
  isMutual: boolean
  isSpecial: boolean
  isBlocked: boolean
}

const DEFAULT_FOLLOW: FollowState = {
  isFollowing: false,
  isFollower: false,
  isMutual: false,
  isSpecial: false,
  isBlocked: false,
}

function firstChar(name?: string) {
  return (name || 'TA').charAt(0)
}

function isRenderableImage(src?: string) {
  return !!src && !src.startsWith('linear-gradient') && !src.includes('/assets/avatar.png')
}

function normalizeSkillItem(skill: any, index = 0) {
  if (typeof skill === 'string') {
    return { id: `want-${index}-${skill}`, name: skill, level: 0, tags: [] as string[], proofCount: 0 }
  }
  return {
    ...skill,
    id: skill.id || skill._id || `skill-${index}`,
    name: skill.name || skill.title || '技能',
    level: Number(skill.level || skill.skillLevel || 0),
    tags: Array.isArray(skill.tags) ? skill.tags : [],
    proofCount: Number(skill.proofCount || skill.verifiedCount || (skill.verified ? 1 : 0) || 0),
  }
}

function normalizePostItem(post: any, index = 0) {
  return {
    ...post,
    id: post.id || post._id || `post-${index}`,
    title: post.title || 'TA的发布',
    summary: post.summary || post.excerpt || post.content || '',
    tags: Array.isArray(post.tags) ? post.tags : [],
  }
}

export default function ProfileView() {
  const [routeUser, setRouteUser] = useState({ id: '', name: '' })
  const [remoteUser, setRemoteUser] = useState<any>(null)
  const [remoteSkills, setRemoteSkills] = useState<any[]>([])
  const [remotePosts, setRemotePosts] = useState<any[]>([])
  const [realStats, setRealStats] = useState({ followerCount: 0, followingCount: 0, postCount: 0, skillCount: 0 })
  const [followState, setFollowState] = useState<FollowState>(DEFAULT_FOLLOW)
  const [followLoading, setFollowLoading] = useState(false)

  useLoad((options) => {
    setRouteUser({
      id: decodeURIComponent(String(options?.userId || options?.id || '')),
      name: decodeURIComponent(String(options?.name || '')),
    })
  })

  const userId = useMemo(() => normalizePublicUserId(routeUser.id, routeUser.name), [routeUser.id, routeUser.name])

  useEffect(() => {
    if (!userId) return
    let alive = true

    getUserDetail({ userId })
      .then((user) => {
        if (alive && user) setRemoteUser(user)
      })
      .catch(() => undefined)

    getFollowStatus({ targetUserId: userId })
      .then((status) => {
        if (!alive || !status) return
        setFollowState({
          isFollowing: !!status.isFollowing,
          isFollower: !!status.isFollower,
          isMutual: !!status.isMutual,
          isSpecial: !!status.isSpecial,
          isBlocked: !!status.isBlocked || !!status.blockedByTarget,
        })
      })
      .catch(() => undefined)

    getUserStats(userId)
      .then((stats) => {
        if (!alive) return
        setRealStats({
          followerCount: stats.followerCount ?? 0,
          followingCount: stats.followingCount ?? 0,
          postCount: stats.postCount ?? 0,
          skillCount: stats.skillCount ?? 0,
        })
      })
      .catch(() => undefined)

    getUserSkills({ userId })
      .then((data) => {
        if (alive && Array.isArray(data)) setRemoteSkills(data)
      })
      .catch(() => undefined)

    getUserPosts({ userId })
      .then((data) => {
        if (alive && Array.isArray(data)) setRemotePosts(data)
      })
      .catch(() => undefined)

    return () => { alive = false }
  }, [userId])

  const fallback = useMemo<PublicUser>(() => ({
    id: userId,
    name: routeUser.name || '同学',
    avatar: '',
    verified: false,
    school: '浙江大学',
    college: '',
    major: '',
    grade: '',
    campus: '',
    intro: '',
    canTeach: [],
    wantToLearn: [],
    interests: [],
    followerCount: 0,
    followingCount: 0,
    gender: 'private',
  } as PublicUser), [routeUser.name, userId])

  const skills = useMemo(() => {
    const source = remoteSkills.length
      ? remoteSkills
      : remoteUser?.canTeach || remoteUser?.skills || []
    return (Array.isArray(source) ? source : []).map(normalizeSkillItem).filter((skill) => !!skill.name)
  }, [remoteSkills, remoteUser])

  const wants = useMemo(() => {
    const source = remoteUser?.wantToLearn || remoteUser?.learnWants || remoteUser?.want || []
    return (Array.isArray(source) ? source : []).map(String).filter(Boolean)
  }, [remoteUser])

  const posts = useMemo(() => {
    return remotePosts.map(normalizePostItem)
  }, [remotePosts])

  const verifiedSkills = useMemo(() => skills.filter((skill) => Number(skill.proofCount || 0) > 0 || !!skill.verified), [skills])

  const user = useMemo<PublicUser>(() => ({
    ...fallback,
    ...(remoteUser || {}),
    id: remoteUser?.id || remoteUser?._id || fallback.id,
    name: remoteUser?.name || remoteUser?.nickname || fallback.name,
    avatar: remoteUser?.avatar || fallback.avatar,
    verified: remoteUser?.verified ?? fallback.verified,
    school: remoteUser?.school || fallback.school,
    college: remoteUser?.college || fallback.college,
    major: remoteUser?.major || fallback.major,
    grade: remoteUser?.grade || fallback.grade,
    campus: remoteUser?.campus || fallback.campus,
    intro: remoteUser?.intro || remoteUser?.bio || fallback.intro,
    canTeach: skills as any,
    wantToLearn: wants,
    followerCount: realStats.followerCount,
    followingCount: realStats.followingCount,
    gender: remoteUser?.gender || fallback.gender || 'private',
  }), [fallback, realStats.followerCount, realStats.followingCount, remoteUser, skills, wants])

  const savedUser = getSavedLoginUser()
  const isSelf = !!savedUser && (user.id === savedUser.id || user.id === savedUser._id || user.name === savedUser.name)
  const metaLine = [user.school, user.college, user.grade, user.campus].filter(Boolean).join(' · ')
  const displayedSkillCount = realStats.skillCount || skills.length + wants.length
  const displayedPostCount = realStats.postCount || posts.length
  const displayedFollowerCount = Math.max(user.followerCount || 0, followState.isFollowing ? 1 : 0)
  const displayedFollowingCount = user.followingCount || 0

  const goBack = () => {
    const pages = getCurrentPages()
    if (pages.length > 1) Taro.navigateBack()
    else Taro.switchTab({ url: '/pages/index/index' })
  }

  const goChat = () => {
    if (isSelf) {
      Taro.switchTab({ url: '/pages/profile/index' })
      return
    }
    Taro.navigateTo({
      url: `/sp-social/pages/chat/index?userId=${encodeURIComponent(user.id)}&id=${encodeURIComponent(user.id)}&name=${encodeURIComponent(user.name)}&category=${encodeURIComponent('个人主页')}`,
    })
  }

  const toggleFollow = async () => {
    if (isSelf || followLoading) return
    const wasFollowing = followState.isFollowing
    const nextFollowing = !wasFollowing

    setFollowState((prev) => ({
      ...prev,
      isFollowing: nextFollowing,
      isMutual: nextFollowing ? prev.isMutual : false,
    }))
    setRealStats((prev) => ({
      ...prev,
      followerCount: Math.max(0, prev.followerCount + (nextFollowing ? 1 : -1)),
    }))

    setFollowLoading(true)
    try {
      if (wasFollowing) {
        await apiUnfollowUser({ targetUserId: user.id })
        Taro.showToast({ title: '已取消关注', icon: 'success' })
      } else {
        const res = await apiFollowUser({ targetUserId: user.id })
        setFollowState((prev) => ({ ...prev, isFollowing: true, isMutual: !!res?.isMutual }))
        Taro.showToast({ title: '关注成功', icon: 'success' })
      }
    } catch (e) {
      console.warn('[ProfileView] follow toggle failed', e)
      setFollowState((prev) => ({
        ...prev,
        isFollowing: wasFollowing,
        isMutual: wasFollowing ? prev.isMutual : false,
      }))
      setRealStats((prev) => ({
        ...prev,
        followerCount: Math.max(0, prev.followerCount + (nextFollowing ? -1 : 1)),
      }))
      Taro.showToast({ title: '关注失败，请稍后重试', icon: 'none' })
    } finally {
      setFollowLoading(false)
    }
  }

  const reportUser = () => {
    Taro.showActionSheet({
      itemList: ['垃圾广告', '不友善内容', '虚假信息', '骚扰行为', '其他'],
      success: () => Taro.showToast({ title: '举报已提交', icon: 'success' }),
      fail: () => undefined,
    })
  }

  const goOverview = (key: 'skills' | 'posts' | 'followers' | 'following') => {
    const pathMap: Record<string, string> = {
      skills: '/sp-content/pages/user-skills/index',
      posts: '/sp-content/pages/user-posts/index',
      followers: '/sp-content/pages/user-followers/index',
      following: '/sp-content/pages/user-following/index',
    }
    Taro.navigateTo({ url: `${pathMap[key] || pathMap.skills}?userId=${encodeURIComponent(user.id)}&name=${encodeURIComponent(user.name)}` })
  }

  const openPost = (postId: string) => {
    Taro.navigateTo({ url: `/sp-content/pages/post-detail/index?postId=${encodeURIComponent(postId)}&from=user-profile` })
  }

  const renderSkillSection = (title: string, items: any[], empty: string, tone = '') => (
    <View className='profile-skill-section'>
      <Text className='profile-skill-title'>{title}</Text>
      <View className='profile-skill-tags'>
        {items.length ? items.slice(0, 4).map((item: any) => (
          <Text className={`profile-skill-tag ${tone}`} key={item.id || item.name || item}>{item.name || item}</Text>
        )) : <Text className='profile-skill-empty'>{empty}</Text>}
      </View>
    </View>
  )

  return (
    <ScrollView scrollY className='view-scroll' showScrollbar={false} enhanced bounces={false}>
      <View className='view-page'>
        <View className='nav-bar'>
          <View className='nav-back' onClick={goBack}><Text>‹</Text></View>
          <Text className='nav-title'>TA的主页</Text>
          <View className='nav-spacer' />
        </View>

        <View className='profile-card'>
          <View className='profile-main-row'>
            <View className='avatar-wrap'>
              {isRenderableImage(user.avatar) ? (
                <Image className='avatar-img' src={user.avatar} mode='aspectFill' lazyLoad />
              ) : (
                <View className='avatar-fallback'>
                  <Text>{firstChar(user.name)}</Text>
                </View>
              )}
            </View>

            <View className='profile-info'>
              <View className='name-row'>
                <Text className='profile-name'>{user.name}</Text>
                <Text className={`gender-symbol gender-symbol--${getGenderTone(user as any)}`}>{getGenderSymbol(user as any)}</Text>
                {user.verified && (
                  <View className='verify-dot'><Text>✓</Text></View>
                )}
              </View>
              <Text className='profile-meta' numberOfLines={2}>{metaLine || '浙江大学 · 在读'}</Text>
              <Text className='profile-bio' numberOfLines={2}>{user.intro || 'TA 还没有填写简介。'}</Text>
            </View>
          </View>

          {!isSelf && (
            <View className='card-actions'>
              <View className='act-chat' onClick={goChat}>
                <Text>发消息</Text>
              </View>
              <View
                className={followState.isFollowing ? 'act-follow following' : 'act-follow'}
                onClick={toggleFollow}
              >
                <Text>{followLoading ? '处理中' : followState.isFollowing ? '已关注' : '+ 关注TA'}</Text>
              </View>
            </View>
          )}
        </View>

        <View className='stats-card'>
          {[
            { label: '技能', value: displayedSkillCount, icon: '</>', key: 'skills' as const },
            { label: '发布', value: displayedPostCount, icon: '+', key: 'posts' as const },
            { label: '粉丝', value: displayedFollowerCount, icon: '○', key: 'followers' as const },
            { label: '关注', value: displayedFollowingCount, icon: '●', key: 'following' as const },
          ].map((item, index) => (
            <View key={item.key} className={`stat-item ${index < 3 ? 'with-line' : ''}`} onClick={() => goOverview(item.key)}>
              <Text className='stat-icon'>{item.icon}</Text>
              <Text className='stat-value'>{item.value}</Text>
              <Text className='stat-label'>{item.label}</Text>
            </View>
          ))}
        </View>

        <View className='profile-post-section'>
          <View className='profile-section-head'>
            <Text className='profile-section-title'>已发布</Text>
            <Text className='profile-section-more' onClick={() => goOverview('posts')}>查看全部</Text>
          </View>
          {posts.length ? posts.slice(0, 3).map((post) => (
            <View className='profile-post-item' key={post.id} onClick={() => openPost(post.id)}>
              <Text className='profile-post-title' numberOfLines={1}>{post.title}</Text>
              <Text className='profile-post-summary' numberOfLines={2}>{post.summary || '暂无内容摘要'}</Text>
              <View className='profile-post-tags'>
                {post.tags.slice(0, 3).map((tag: string) => <Text key={tag}>{tag}</Text>)}
              </View>
            </View>
          )) : (
            <Text className='profile-post-empty'>TA 还没有发布公开内容</Text>
          )}
        </View>

        <View className='profile-skill-sections'>
          {renderSkillSection('TA会', skills, '暂未公开')}
          {renderSkillSection('TA想学', wants, '暂未填写', 'want')}
          {renderSkillSection('已认证', verifiedSkills, '暂无认证技能', 'verified')}
        </View>

        {!isSelf && (
          <View className='report-bar'>
            <Text className='report-link' onClick={reportUser}>举报TA</Text>
          </View>
        )}
      </View>
    </ScrollView>
  )
}
