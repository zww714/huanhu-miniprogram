import { View, Text, ScrollView, Image, Textarea } from '@tarojs/components'
import Taro, { useLoad } from '@tarojs/taro'
import { useEffect, useMemo, useState } from 'react'
import {
  followUser as apiFollowUser,
  getFollowStatus,
  getUserDetail,
  unfollowUser as apiUnfollowUser,
} from '../../../api'
import { CURRENT_USER } from '../../../utils/mock'
import {
  getPublicSkills,
  getPublicUser,
  getRelationForUser,
  normalizePublicUserId,
  upsertRelation,
  type PublicUser,
} from '../../../utils/publicProfiles'
import { getGenderSymbol, getGenderTone } from '../../../utils/gender'
import { getMyRatingForUser, getRatingSummary, saveRating } from '../../../utils/ratings'
import './view.scss'

const RATING_TAGS = ['沟通顺畅', '很有帮助', '技能扎实', '准时靠谱', '体验不错']

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

export default function ProfileView() {
  const [routeUser, setRouteUser] = useState({ id: '', name: '' })
  const [remoteUser, setRemoteUser] = useState<any>(null)
  const [followState, setFollowState] = useState<FollowState>(DEFAULT_FOLLOW)
  const [followLoading, setFollowLoading] = useState(false)
  const [ratingVersion, setRatingVersion] = useState(0)
  const [ratingPanelVisible, setRatingPanelVisible] = useState(false)
  const [draftRating, setDraftRating] = useState(5)
  const [draftTags, setDraftTags] = useState<string[]>(['沟通顺畅'])
  const [draftContent, setDraftContent] = useState('')

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
      canTeach: remoteUser.canTeach || remoteUser.skills || getPublicSkills(fallback.id),
      followerCount: remoteUser.followerCount ?? remoteUser.stats?.followers ?? fallback.followerCount,
      followingCount: remoteUser.followingCount ?? remoteUser.stats?.following ?? fallback.followingCount,
      gender: remoteUser.gender || (fallback as any).gender,
    }
  }, [remoteUser, routeUser.name, userId])

  const isSelf = user.id === CURRENT_USER.id || user.name === CURRENT_USER.name
  const metaLine = [user.school, user.college, user.grade, user.campus].filter(Boolean).join(' · ')
  const ratingFallback = Number(remoteUser?.rating ?? 4.8)
  const ratingSummary = getRatingSummary(user.id, (Number.isFinite(ratingFallback) ? ratingFallback : 4.8) + ratingVersion * 0)
  const myRating = getMyRatingForUser(user.id)
  const rating = ratingSummary.average.toFixed(1)
  const skills = Array.isArray(user.canTeach) ? user.canTeach : getPublicSkills(user.id)
  const fullStars = Math.round(ratingSummary.average)

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

  const openRatingPanel = () => {
    if (isSelf) {
      Taro.navigateTo({ url: `/sp-content/pages/my-ratings/index?userId=${encodeURIComponent(user.id)}&name=${encodeURIComponent(user.name)}` })
      return
    }
    const existing = getMyRatingForUser(user.id)
    setDraftRating(existing?.rating || 5)
    setDraftTags(existing?.tags?.length ? existing.tags : ['沟通顺畅'])
    setDraftContent(existing?.content || '')
    setRatingPanelVisible(true)
  }

  const toggleDraftTag = (tag: string) => {
    setDraftTags((current) => current.includes(tag)
      ? current.filter((item) => item !== tag)
      : [...current, tag]
    )
  }

  const submitRating = () => {
    saveRating({
      targetUserId: user.id,
      targetUserName: user.name,
      rating: draftRating,
      tags: draftTags,
      content: draftContent.trim(),
      relatedType: 'profile',
    })
    setRatingPanelVisible(false)
    setRatingVersion((current) => current + 1)
    Taro.showToast({ title: myRating ? '评价已更新' : '评价已提交', icon: 'success' })
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

  return (
    <ScrollView scrollY className='view-scroll' showScrollbar={false} enhanced bounces={false}>
      <View className='view-page'>
        <View className='nav-bar'>
          <View className='nav-back' onClick={goBack}><Text>‹</Text></View>
          <Text className='nav-title'>TA的主页</Text>
          <View className='nav-spacer' />
        </View>

        {/* ── 个人资料卡片 ── */}
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

            <View className='rating-card' onClick={openRatingPanel}>
              <Text className='rating-label'>评分</Text>
              <Text className='rating-score'>{rating}</Text>
              <Text className='rating-stars'>
                {String('★').repeat(fullStars).padEnd(5, '☆')}
              </Text>
            </View>
          </View>

          {/* ── 操作按钮 ── */}
          {!isSelf && (
            <View className='card-actions'>
              <View className='act-chat' onClick={goChat}>
                <Text>💬 发消息</Text>
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

        {/* ── 统计行 ── */}
        <View className='stats-card'>
          {[
            { label: '技能', value: skills.length, icon: '</>', key: 'skills' as const },
            { label: '发布', value: 0, icon: '+', key: 'posts' as const },
            { label: '粉丝', value: user.followerCount || 0, icon: '○', key: 'followers' as const },
            { label: '关注', value: user.followingCount || 0, icon: '◎', key: 'following' as const },
          ].map((item, index) => (
            <View key={item.key} className={`stat-item ${index < 3 ? 'with-line' : ''}`} onClick={() => goOverview(item.key)}>
              <Text className='stat-icon'>{item.icon}</Text>
              <Text className='stat-value'>{item.value}</Text>
              <Text className='stat-label'>{item.label}</Text>
            </View>
          ))}
        </View>

      {/* ── 举报 ── */}
        {!isSelf && (
          <View className='report-bar'>
            <Text className='report-link' onClick={reportUser}>⚐ 举报TA</Text>
          </View>
        )}

        {/* ── 评价弹窗 ── */}
        {ratingPanelVisible ? (
          <View className='rating-mask' onClick={() => setRatingPanelVisible(false)}>
            <View className='rating-panel' onClick={(event) => event.stopPropagation()}>
              <View className='rating-panel-head'>
                <Text className='rating-panel-title'>{myRating ? '修改评价' : `评价 ${user.name}`}</Text>
                <Text className='rating-panel-close' onClick={() => setRatingPanelVisible(false)}>×</Text>
              </View>
              <View className='star-row'>
                {[1, 2, 3, 4, 5].map((star) => (
                  <Text
                    key={star}
                    className={star <= draftRating ? 'star active' : 'star'}
                    onClick={() => setDraftRating(star)}
                  >
                    ★
                  </Text>
                ))}
              </View>
              <View className='rating-tag-row'>
                {RATING_TAGS.map((tag) => (
                  <Text
                    key={tag}
                    className={draftTags.includes(tag) ? 'rating-tag active' : 'rating-tag'}
                    onClick={() => toggleDraftTag(tag)}
                  >
                    {tag}
                  </Text>
                ))}
              </View>
              <Textarea
                className='rating-textarea'
                value={draftContent}
                maxlength={120}
                placeholder='可以补充一下具体的合作体验'
                onInput={(event) => setDraftContent(String(event.detail.value || ''))}
              />
              <View className='rating-submit' onClick={submitRating}><Text>提交评价</Text></View>
            </View>
          </View>
        ) : null}
      </View>
    </ScrollView>
  )
}
