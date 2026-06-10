import { View, Text, ScrollView, Image, Textarea } from '@tarojs/components'
import Taro, { useLoad } from '@tarojs/taro'
import { useEffect, useMemo, useState } from 'react'
import {
  followUser as apiFollowUser,
  getFollowStatus,
  getPosts,
  getUserDetail,
  getUserSkills,
  unfollowUser as apiUnfollowUser,
} from '../../api'
import { CURRENT_USER } from '../../utils/mock'
import {
  getPublicPosts,
  getPublicSkills,
  getPublicUser,
  getRelationForUser,
  normalizePublicUserId,
  setPendingPublicPost,
  upsertRelation,
  type PublicPost,
  type PublicSkill,
  type PublicUser,
} from '../../utils/publicProfiles'
import { getGenderSymbol, getGenderTone } from '../../utils/gender'
import { getMyRatingForUser, getRatingSummary, saveRating } from '../../utils/ratings'
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

function normalizeSkill(skill: any, userId: string): PublicSkill {
  return {
    id: skill.id || skill._id || encodeURIComponent(skill.name || 'skill'),
    userId: skill.userId || userId,
    name: skill.name || '技能',
    level: Number(skill.level || skill.skillLevel || 3),
    intro: skill.intro || skill.desc || '',
    tags: Array.isArray(skill.tags) ? skill.tags : [],
    proofCount: Number(skill.proofCount || 0),
    workCount: Number(skill.workCount || 0),
  }
}

function normalizePost(post: any, userId: string, userName: string): PublicPost {
  return {
    id: post.id || post._id || `post-${Date.now()}`,
    authorId: post.authorId || post.userId || userId,
    authorName: post.authorName || post.author?.name || userName,
    title: post.title || 'TA 的发布',
    summary: post.summary || post.excerpt || post.content || '',
    content: post.content || post.summary || post.excerpt || '',
    tags: Array.isArray(post.tags) ? post.tags : [],
    visibility: post.visibility || 'public',
    likeCount: Number(post.likeCount ?? post.likes ?? 0),
    commentCount: Number(post.commentCount ?? post.comments ?? 0),
    createdAt: post.createdAt || post.time || '最近',
  }
}

function formatTime(value?: string) {
  if (!value) return '最近'
  const parsed = Date.parse(value)
  if (!Number.isNaN(parsed)) {
    const days = Math.max(0, Math.floor((Date.now() - parsed) / 86400000))
    if (days === 0) return '今天'
    if (days < 30) return `${days}天前`
  }
  return value
}

export default function ProfileView() {
  const [routeUser, setRouteUser] = useState({ id: '', name: '' })
  const [remoteUser, setRemoteUser] = useState<any>(null)
  const [remoteSkills, setRemoteSkills] = useState<PublicSkill[]>([])
  const [remotePosts, setRemotePosts] = useState<PublicPost[]>([])
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

    getUserSkills({ userId })
      .then((skills) => {
        if (alive && Array.isArray(skills)) setRemoteSkills(skills.map((item) => normalizeSkill(item, userId)))
      })
      .catch(() => undefined)

    getPosts({ userId, page: 0 })
      .then((posts) => {
        if (!alive || !Array.isArray(posts)) return
        const name = routeUser.name || remoteUser?.name || '同学'
        setRemotePosts(posts.map((item) => normalizePost(item, userId, name)))
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
    const skills = remoteSkills.length
      ? remoteSkills
      : (remoteUser.canTeach || remoteUser.skills || []).map((item: any) => normalizeSkill(item, remoteUser.id || remoteUser._id || fallback.id))

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
      canTeach: skills.length ? skills : getPublicSkills(fallback.id),
      wantToLearn: remoteUser.wantToLearn || remoteUser.learnWants || fallback.wantToLearn,
      interests: remoteUser.interests || fallback.interests,
      followerCount: remoteUser.followerCount ?? remoteUser.stats?.followers ?? fallback.followerCount,
      followingCount: remoteUser.followingCount ?? remoteUser.stats?.following ?? fallback.followingCount,
      gender: remoteUser.gender || (fallback as any).gender,
    }
  }, [remoteUser, remoteSkills, routeUser.name, userId])

  const isSelf = user.id === CURRENT_USER.id || user.name === CURRENT_USER.name
  const skills = user.canTeach.length ? user.canTeach : getPublicSkills(user.id)
  const posts = remotePosts.length ? remotePosts : getPublicPosts(user.id)
  const postPreview = posts[0]
  const metaLine = [user.school, user.college, user.grade, user.campus].filter(Boolean).join(' · ')
  const ratingFallback = Number(remoteUser?.rating ?? 0)
  const ratingSummary = getRatingSummary(user.id, (Number.isFinite(ratingFallback) ? ratingFallback : 0) + ratingVersion * 0)
  const myRating = getMyRatingForUser(user.id)
  const rating = ratingSummary.average.toFixed(1)

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
    const pathMap = {
      skills: '/sp-content/pages/user-skills/index',
      posts: '/sp-content/pages/user-posts/index',
      followers: '/sp-content/pages/user-followers/index',
      following: '/sp-content/pages/user-following/index',
    }
    Taro.navigateTo({ url: `${pathMap[key]}?userId=${encodeURIComponent(user.id)}` })
  }

  const goSkill = (skill: PublicSkill) => {
    Taro.navigateTo({
      url: `/sp-content/pages/skill-detail/index?userId=${encodeURIComponent(user.id)}&skillId=${encodeURIComponent(skill.id)}`,
    })
  }

  const openPost = (post: PublicPost) => {
    setPendingPublicPost(post, user)
    Taro.navigateTo({ url: `/sp-content/pages/post-detail/index?postId=${encodeURIComponent(post.id)}&from=profile-view` })
  }

  const renderSection = (
    title: string,
    tone: 'blue' | 'orange' | 'gray',
    children: React.ReactNode,
    onAll?: () => void,
  ) => (
    <View className='view-section-card'>
      <View className='section-head'>
        <Text className='section-title'>{title}</Text>
        {!!onAll && <Text className='view-all' onClick={onAll}>查看全部 ›</Text>}
      </View>
      <View className={`tag-wrap tag-wrap--${tone}`}>{children}</View>
    </View>
  )

  return (
    <ScrollView scrollY className='view-scroll' showScrollbar={false} enhanced bounces={false}>
      <View className='view-page'>
        <View className='view-nav'>
          <View className='back-btn' onClick={goBack}><Text>‹</Text></View>
          <Text className='nav-title'>TA的主页</Text>
          <View className='nav-placeholder' />
        </View>

        <View className='hero-card'>
          <View className='hero-main'>
            <View className='avatar-box'>
              {isRenderableImage(user.avatar) ? (
                <Image className='avatar-img' src={user.avatar} mode='aspectFill' lazyLoad />
              ) : (
                <View className='avatar-fallback'><Text>{firstChar(user.name)}</Text></View>
              )}
            </View>

            <View className='profile-copy'>
              <View className='name-row'>
                <Text className='user-name'>{user.name}</Text>
                {getGenderSymbol(user as any) ? (
                  <Text className={`view-gender view-gender--${getGenderTone(user as any)}`}>{getGenderSymbol(user as any)}</Text>
                ) : null}
                {user.verified && <Text className='verify-badge'>✓</Text>}
              </View>
              <Text className='meta-line' numberOfLines={2}>{metaLine || '浙江大学 · 在读'}</Text>
              <Text className='bio-text' numberOfLines={2}>{user.intro || 'TA 还没有填写简介。'}</Text>
            </View>

            <View className='rating-card' onClick={openRatingPanel}>
              <Text className='rating-label'>评分</Text>
              <Text className='rating-score'>{rating}</Text>
              <Text className='rating-stars'>★★★★★</Text>
              {!isSelf ? <Text className='rating-action'>{myRating ? `你已评分 ${myRating.rating.toFixed(1)}` : '去评价'}</Text> : null}
            </View>
          </View>

          <View className='inline-info'>
            <View className='inline-item'>
              <Text className='inline-label'>想学</Text>
              <Text className='inline-text' numberOfLines={1}>{(user.wantToLearn || []).slice(0, 3).join('、') || '暂未填写'}</Text>
            </View>
            <View className='inline-item'>
              <Text className='inline-label'>兴趣</Text>
              <Text className='inline-text' numberOfLines={1}>{(user.interests || []).slice(0, 3).join('、') || '暂未填写'}</Text>
            </View>
          </View>

          {!isSelf && (
            <View className='action-row'>
              <View className='message-btn' onClick={goChat}><Text className='btn-icon'>○</Text><Text>发消息</Text></View>
              <View className={followState.isFollowing ? 'follow-btn following' : 'follow-btn'} onClick={toggleFollow}>
                <Text className='btn-icon'>+</Text><Text>{followState.isFollowing ? '已关注' : '关注TA'}</Text>
              </View>
            </View>
          )}

          {!isSelf && <View className='report-btn' onClick={reportUser}><Text>⚐ 举报TA</Text></View>}
        </View>

        <View className='stats-card'>
          {[
            { key: 'skills', label: '技能', value: skills.length },
            { key: 'posts', label: '发布', value: posts.length },
            { key: 'followers', label: '粉丝', value: user.followerCount || 0 },
            { key: 'following', label: '关注', value: user.followingCount || 0 },
          ].map((item, index) => (
            <View className={`stat-item ${index < 3 ? 'with-line' : ''}`} key={item.key} onClick={() => goOverview(item.key as any)}>
              <Text className='stat-value'>{item.value}</Text>
              <Text className='stat-label'>{item.label}</Text>
            </View>
          ))}
        </View>

        {renderSection('擅长技能', 'blue', (
          skills.length ? skills.slice(0, 4).map((skill) => (
            <View className='skill-chip' key={skill.id} onClick={() => goSkill(skill)}>
              <Text className='chip-symbol'>{skill.name.slice(0, 1)}</Text>
              <Text>{skill.name}</Text>
              <Text className='level-text'>Lv.{skill.level}</Text>
            </View>
          )) : <Text className='empty-text'>TA 暂未公开技能</Text>
        ), () => goOverview('skills'))}

        {renderSection('想学习', 'orange', (
          user.wantToLearn.length ? user.wantToLearn.slice(0, 4).map((item) => (
            <Text className='soft-chip' key={item}>{item}</Text>
          )) : <Text className='empty-text'>TA 暂未填写想学习的内容</Text>
        ))}

        {renderSection('兴趣标签', 'gray', (
          user.interests.length ? user.interests.slice(0, 4).map((item) => (
            <Text className='soft-chip' key={item}>{item}</Text>
          )) : <Text className='empty-text'>TA 暂未填写兴趣标签</Text>
        ))}

        <View className='post-card'>
          <View className='section-head'>
            <View>
              <Text className='section-title'>TA的发布</Text>
              <Text className='section-subtitle'>公开发布内容</Text>
            </View>
            <Text className='view-all' onClick={() => goOverview('posts')}>查看全部 ›</Text>
          </View>

          {postPreview ? (
            <View className='post-preview' onClick={() => openPost(postPreview)}>
              <View className='post-cover'><Text>{postPreview.title.slice(0, 1)}</Text></View>
              <View className='post-main'>
                <Text className='post-title' numberOfLines={1}>{postPreview.title}</Text>
                <Text className='post-summary' numberOfLines={2}>{postPreview.summary || postPreview.content}</Text>
                <View className='post-meta'>
                  <Text>◎ {postPreview.likeCount}</Text>
                  <Text>☰ {postPreview.commentCount}</Text>
                  <Text>{formatTime(postPreview.createdAt)}</Text>
                </View>
              </View>
            </View>
          ) : (
            <Text className='empty-text'>TA 暂未发布公开内容</Text>
          )}
        </View>

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
                placeholder='可以补充一次具体的合作体验'
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








