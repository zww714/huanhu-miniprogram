import { View, Text, ScrollView, Image } from '@tarojs/components'
import Taro, { useLoad } from '@tarojs/taro'
import { useEffect, useMemo, useState } from 'react'
import {
  followUser as apiFollowUser,
  getFollowStatus,
  getUserStats,
  getUserDetail,
  unfollowUser as apiUnfollowUser,
} from '../../../api'
import { CURRENT_USER } from '../../../utils/mock'
import {
  getPublicPosts,
  getPublicUser,
  getRelationForUser,
  normalizePublicUserId,
  upsertRelation,
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

function calcMatchDegree(user: PublicUser, skills: any[]) {
  if (!(user as any).hasRealSkillData) return 0
  const wants = Array.isArray(user.wantToLearn) ? user.wantToLearn : []
  const verifiedSkillCount = skills.filter((skill) => Number(skill.proofCount || 0) > 0).length
  return Math.min(100, verifiedSkillCount * 30 + skills.length * 15 + wants.length * 5)
}

export default function ProfileView() {
  const [routeUser, setRouteUser] = useState({ id: '', name: '' })
  const [remoteUser, setRemoteUser] = useState<any>(null)
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
      .catch(() => setFollowState(getRelationForUser(userId)))

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

    return () => { alive = false }
  }, [userId])

  const user = useMemo<PublicUser>(() => {
    const fallback = getPublicUser(userId, routeUser.name)
    if (!remoteUser) return fallback
    return {
      ...fallback,
      ...remoteUser,
      id: remoteUser.id || remoteUser._id || fallback.id,
      name: remoteUser.name || remoteUser.nickname || fallback.name,
      avatar: remoteUser.avatar || fallback.avatar,
      verified: remoteUser.verified ?? fallback.verified,
      school: remoteUser.school || fallback.school,
      college: remoteUser.college || fallback.college,
      major: remoteUser.major || fallback.major,
      grade: remoteUser.grade || fallback.grade,
      campus: remoteUser.campus || fallback.campus,
      intro: remoteUser.intro || remoteUser.bio || fallback.intro,
      canTeach: remoteUser.canTeach || remoteUser.skills || [],
      wantToLearn: remoteUser.wantToLearn || remoteUser.learnWants || remoteUser.want || fallback.wantToLearn,
      followerCount: realStats.followerCount,
      followingCount: realStats.followingCount,
      gender: remoteUser.gender || (fallback as any).gender,
      hasRealSkillData: Array.isArray(remoteUser.canTeach) || Array.isArray(remoteUser.skills),
    }
  }, [realStats.followerCount, realStats.followingCount, remoteUser, routeUser.name, userId])

  const isSelf = user.id === CURRENT_USER.id || user.name === CURRENT_USER.name
  const metaLine = [user.school, user.college, user.grade, user.campus].filter(Boolean).join(' · ')
  const skills = Array.isArray(user.canTeach) ? user.canTeach : []
  const posts = getPublicPosts(user.id)
  const wants = Array.isArray(user.wantToLearn) ? user.wantToLearn : []
  const verifiedSkills = skills.filter((skill: any) => Number(skill.proofCount || 0) > 0)
  const matchDegree = calcMatchDegree(user, skills)

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
    setFollowLoading(true)
    try {
      if (followState.isFollowing) {
        await apiUnfollowUser({ targetUserId: user.id })
        setFollowState((prev) => ({ ...prev, isFollowing: false, isMutual: false }))
        upsertRelation(user.id, { isFollowing: false, isMutual: false })
        Taro.showToast({ title: '已取消关注', icon: 'success' })
      } else {
        const res = await apiFollowUser({ targetUserId: user.id })
        setFollowState((prev) => ({ ...prev, isFollowing: true, isMutual: !!res?.isMutual }))
        upsertRelation(user.id, { isFollowing: true, isMutual: !!res?.isMutual })
        Taro.showToast({ title: '关注成功', icon: 'success' })
      }
    } catch (e) {
      console.warn('[ProfileView] follow toggle failed', e)
      Taro.showToast({ title: '操作失败', icon: 'none' })
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
    Taro.navigateTo({ url: `${pathMap[key] || pathMap.skills}?userId=${encodeURIComponent(user.id)}` })
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
                {getGenderSymbol(user as any) && (
                  <Text className={`gender-symbol gender-symbol--${getGenderTone(user as any)}`}>{getGenderSymbol(user as any)}</Text>
                )}
                {user.verified && (
                  <View className='verify-dot'><Text>✓</Text></View>
                )}
              </View>
              <Text className='profile-meta' numberOfLines={2}>{metaLine || '浙江大学 · 在读'}</Text>
              <Text className='profile-bio' numberOfLines={2}>{user.intro || 'TA 还没有填写简介。'}</Text>
            </View>

            <View className='rating-card'>
              <Text className='rating-label'>匹配程度</Text>
              <Text className='rating-score'>{matchDegree}</Text>
              <Text className='rating-stars'>基于技能</Text>
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
                <Text>{followState.isFollowing ? '已关注' : '+ 关注TA'}</Text>
              </View>
            </View>
          )}
        </View>

        <View className='stats-card'>
          {[
            { label: '技能', value: realStats.skillCount, icon: '</>', key: 'skills' as const },
            { label: '发布', value: realStats.postCount, icon: '+', key: 'posts' as const },
            { label: '粉丝', value: user.followerCount || 0, icon: '●', key: 'followers' as const },
            { label: '关注', value: user.followingCount || 0, icon: '●', key: 'following' as const },
          ].map((item, index) => (
            <View key={item.key} className={`stat-item ${index < 3 ? 'with-line' : ''}`} onClick={() => goOverview(item.key)}>
              <Text className='stat-icon'>{item.icon}</Text>
              <Text className='stat-value'>{item.value}</Text>
              <Text className='stat-label'>{item.label}</Text>
            </View>
          ))}
        </View>

        <View className='profile-skill-sections'>
          {renderSkillSection('我会', skills, '暂未公开')}
          {renderSkillSection('我想学', wants, '暂未填写', 'want')}
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
