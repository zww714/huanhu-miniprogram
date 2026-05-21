import { View, Text, ScrollView } from '@tarojs/components'
import Taro, { useDidShow, useLoad } from '@tarojs/taro'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { CURRENT_USER } from '../../utils/mock'
import { getUserDetail, getUserPosts, getUserSkills, followUser as apiFollowUser, unfollowUser as apiUnfollowUser, blockUser as apiBlockUser, setSpecialFollow as apiSetSpecialFollow, getFollowStatus as apiGetFollowStatus } from '../../utils/api'
import { recordBrowse } from '../../utils/history'
import {
  getFollowingForUser,
  getFollowersForUser,
  getPublicPosts,
  getPublicReviews,
  getPublicUser,
  getRelationForUser,
  getUserIntro,
  getUserMetaLine,
  normalizePublicUserId,
  setPendingPublicPost,
  upsertRelation,
  type PublicPost,
  type PublicRelation,
} from '../../utils/publicProfiles'
import './index.css'

type FollowRelation = {
  isFollowing: boolean
  isFollower: boolean
  isMutual: boolean
  isSpecial: boolean
  isBlocked: boolean
}

const DEFAULT_RELATION: FollowRelation = {
  isFollowing: false,
  isFollower: false,
  isMutual: false,
  isSpecial: false,
  isBlocked: false,
}

const reportReasons = ['垃圾广告', '不友善内容', '虚假信息', '骚扰行为', '其他']

function firstChar(name?: string) {
  return name?.charAt(0) || '同'
}

function relationLabel(relation: PublicRelation) {
  if (relation.isSpecial) return '特别关注'
  if (relation.isFollowing && relation.isFollower) return '互相关注'
  if (relation.isFollowing) return '已关注'
  return '关注TA'
}

export default function UserDetail() {
  const [routeUser, setRouteUser] = useState({ id: '', name: '' })
  const [remoteUser, setRemoteUser] = useState<any>(null)
  const [remoteSkills, setRemoteSkills] = useState<any[]>([])
  const [remotePosts, setRemotePosts] = useState<any[]>([])
  const [activeTab, setActiveTab] = useState<'posts' | 'reviews'>('posts')
  const [relation, setRelation] = useState<FollowRelation>(DEFAULT_RELATION)
  const [relationLoading, setRelationLoading] = useState(false)

  useLoad((options) => {
    setRouteUser({
      id: decodeURIComponent(String(options?.userId || options?.id || '')),
      name: decodeURIComponent(String(options?.name || '')),
    })
  })

  useDidShow(() => {
    loadRelation()
  })

  useEffect(() => {
    const userId = normalizePublicUserId(routeUser.id, routeUser.name)
    if (!userId) return
    let alive = true
    getUserDetail({ userId })
      .then((user) => {
        if (!alive || !user) return
        setRemoteUser(user)
        recordBrowse({ id: userId, type: 'user', title: user.name || routeUser.name || '用户', subtitle: user.college || user.school })
      })
      .catch(() => undefined)
    return () => { alive = false }
  }, [routeUser.id, routeUser.name])

  useEffect(() => {
    const userId = normalizePublicUserId(routeUser.id, routeUser.name)
    if (!userId) return
    let alive = true
    getUserPosts({ userId })
      .then((posts) => {
        if (alive && Array.isArray(posts)) setRemotePosts(posts)
      })
      .catch(() => undefined)
    return () => { alive = false }
  }, [routeUser.id, routeUser.name])

  useEffect(() => {
    const userId = normalizePublicUserId(routeUser.id, routeUser.name)
    if (!userId) return
    let alive = true
    getUserSkills({ userId })
      .then((skills) => {
        if (!alive || !Array.isArray(skills)) return
        setRemoteSkills(skills)
      })
      .catch(() => undefined)
    return () => { alive = false }
  }, [routeUser.id, routeUser.name])

  const loadRelation = useCallback(() => {
    const userId = normalizePublicUserId(routeUser.id, routeUser.name)
    if (!userId || userId === CURRENT_USER.id) {
      setRelation(DEFAULT_RELATION)
      return
    }
    setRelationLoading(true)
    apiGetFollowStatus({ targetUserId: userId })
      .then((status) => {
        if (status) {
          setRelation({
            isFollowing: !!status.isFollowing,
            isFollower: !!status.isFollower,
            isMutual: !!status.isMutual,
            isSpecial: !!status.isSpecial,
            isBlocked: !!status.isBlocked || !!status.blockedByTarget,
          })
        }
      })
      .catch(() => undefined)
      .finally(() => setRelationLoading(false))
  }, [routeUser.id, routeUser.name])

  const detailUser = useMemo(() => {
    const userId = normalizePublicUserId(routeUser.id, routeUser.name)
    const fallback = getPublicUser(userId, routeUser.name)
    if (!remoteUser) return fallback
    const canTeach = remoteSkills.length ? remoteSkills : (remoteUser.canTeach || remoteUser.skills || remoteUser.can || fallback.canTeach)
    const wantToLearn = remoteUser.wantToLearn || remoteUser.learnWants || remoteUser.want || fallback.wantToLearn
    return {
      ...fallback,
      ...remoteUser,
      id: remoteUser.id || remoteUser._id || fallback.id,
      name: remoteUser.name || fallback.name,
      intro: remoteUser.intro || remoteUser.bio || fallback.intro,
      canTeach,
      wantToLearn,
      interests: remoteUser.interests || fallback.interests,
      followerCount: remoteUser.followerCount ?? remoteUser.stats?.followers ?? fallback.followerCount,
      followingCount: remoteUser.followingCount ?? remoteUser.stats?.following ?? fallback.followingCount,
    }
  }, [routeUser.id, routeUser.name, remoteUser, remoteSkills])

  const isSelf = detailUser.id === CURRENT_USER.id
  const posts = useMemo(() => {
    const source = remotePosts.length
      ? remotePosts
      : Array.isArray(remoteUser?.posts) && remoteUser.posts.length
      ? remoteUser.posts.map((post: any) => ({
        ...post,
        id: post.id || post._id,
        authorId: post.authorId || post.userId || detailUser.id,
        summary: post.summary || post.excerpt || post.content || '',
        likeCount: post.likeCount ?? post.likes ?? 0,
        commentCount: post.commentCount ?? post.comments ?? 0,
        visibility: post.visibility || 'public',
      }))
      : getPublicPosts(detailUser.id)
    return source.slice(0, 2)
  }, [detailUser.id, remoteUser, remotePosts])
  const reviews = useMemo(() => getPublicReviews(detailUser.id).slice(0, 2), [detailUser.id])
  const followerCount = detailUser.followerCount || 0
  const followingCount = detailUser.followingCount || 0

  const handleFollow = async () => {
    const userId = normalizePublicUserId(routeUser.id, routeUser.name)
    if (!userId) return
    try {
      const res = await apiFollowUser({ targetUserId: userId })
      setRelation((prev) => ({
        ...prev,
        isFollowing: true,
        isMutual: !!res.isMutual,
      }))
      Taro.showToast({ title: '已关注', icon: 'success' })
    } catch (e) {
      console.warn('[UserDetail] follow failed', e)
      Taro.showToast({ title: '关注失败', icon: 'none' })
    }
  }

  const handleUnfollow = () => {
    const userId = normalizePublicUserId(routeUser.id, routeUser.name)
    if (!userId) return
    Taro.showModal({
      title: '取消关注',
      content: '确认取消关注该用户吗？',
      confirmText: '取消关注',
      confirmColor: '#EF4444',
      success: async ({ confirm }) => {
        if (!confirm) return
        try {
          await apiUnfollowUser({ targetUserId: userId })
          setRelation((prev) => ({ ...prev, isFollowing: false, isMutual: false }))
          Taro.showToast({ title: '已取消关注', icon: 'success' })
        } catch (e) {
          console.warn('[UserDetail] unfollow failed', e)
          Taro.showToast({ title: '取消关注失败', icon: 'none' })
        }
      },
    })
  }

  const toggleFollow = () => {
    if (isSelf) {
      Taro.switchTab({ url: '/pages/profile/index' })
      return
    }
    if (relation.isFollowing) handleUnfollow()
    else handleFollow()
  }

  const handleToggleSpecial = () => {
    const userId = normalizePublicUserId(routeUser.id, routeUser.name)
    if (!userId) return
    const nextSpecial = !relation.isSpecial
    apiSetSpecialFollow({ targetUserId: userId, isSpecial: nextSpecial })
      .then(() => {
        setRelation((prev) => ({ ...prev, isSpecial: nextSpecial }))
        Taro.showToast({ title: nextSpecial ? '已设为特别关注' : '已取消特别关注', icon: 'success' })
      })
      .catch((e) => {
        console.warn('[UserDetail] setSpecialFollow failed', e)
        Taro.showToast({ title: '操作失败', icon: 'none' })
      })
  }

  const reportUser = () => {
    Taro.showActionSheet({
      itemList: reportReasons,
      success: () => Taro.showToast({ title: '举报已提交', icon: 'success' }),
      fail: () => undefined,
    })
  }

  const handleBlockUser = () => {
    const userId = normalizePublicUserId(routeUser.id, routeUser.name)
    if (!userId) return
    Taro.showModal({
      title: '拉黑用户',
      content: '拉黑后对方将无法与你互动，确定拉黑吗？',
      confirmText: '拉黑',
      confirmColor: '#EF4444',
      success: async ({ confirm }) => {
        if (!confirm) return
        try {
          await apiBlockUser({ targetUserId: userId })
          setRelation({ isBlocked: true, isFollowing: false, isFollower: false, isMutual: false, isSpecial: false })
          Taro.showToast({ title: '已拉黑', icon: 'success' })
        } catch (e) {
          console.warn('[UserDetail] blockUser failed', e)
          Taro.showToast({ title: '操作失败', icon: 'none' })
        }
      },
    })
  }

  const showMore = () => {
    if (isSelf) return
    const itemList = relation.isFollowing
      ? [relation.isSpecial ? '取消特别关注' : '设为特别关注', '取消关注', '举报用户', '拉黑用户']
      : ['关注TA', '举报用户', '拉黑用户']
    Taro.showActionSheet({
      itemList,
      success: ({ tapIndex }) => {
        const item = itemList[tapIndex]
        if (item === '关注TA') handleFollow()
        if (item === '设为特别关注' || item === '取消特别关注') handleToggleSpecial()
        if (item === '取消关注') handleUnfollow()
        if (item === '举报用户') reportUser()
        if (item === '拉黑用户') handleBlockUser()
      },
      fail: () => undefined,
    })
  }

  const goChat = () => {
    if (isSelf) {
      Taro.switchTab({ url: '/pages/profile/index' })
      return
    }
    Taro.navigateTo({
      url: `/pages/chat/index?userId=${encodeURIComponent(detailUser.id)}&id=${encodeURIComponent(detailUser.id)}&name=${encodeURIComponent(detailUser.name)}&category=${encodeURIComponent('个人主页')}`,
    })
  }

  const goOverview = (key: 'skills' | 'posts' | 'followers' | 'following') => {
    const pathMap = {
      skills: '/pages/user-skills/index',
      posts: '/pages/user-posts/index',
      followers: '/pages/user-followers/index',
      following: '/pages/user-following/index',
    }
    Taro.navigateTo({ url: `${pathMap[key]}?userId=${encodeURIComponent(detailUser.id)}` })
  }

  const goSkill = (skillId: string) => {
    Taro.navigateTo({
      url: `/pages/skill-detail/index?userId=${encodeURIComponent(detailUser.id)}&skillId=${encodeURIComponent(skillId)}`,
    })
  }

  const openPost = (post: PublicPost) => {
    setPendingPublicPost(post, detailUser)
    Taro.navigateTo({ url: `/pages/post-detail/index?postId=${encodeURIComponent(post.id)}&from=user-detail` })
  }

  return (
    <ScrollView scrollY className='user-page public-page' showScrollbar={false} enhanced bounces={false}>
      <View className='nav-bar'>
        <Text className='back-icon' onClick={() => Taro.navigateBack()}>‹</Text>
        {!isSelf && (
          <View className='more-menu' onClick={showMore}>
            <Text>...</Text>
          </View>
        )}
      </View>

      <View className='public-card'>
        <View className='profile-head'>
          <View className='avatar'>
            <Text className='avatar-text'>{firstChar(detailUser.name)}</Text>
          </View>
          <View className='profile-main'>
            <View className='name-row'>
              <Text className='user-name'>{detailUser.name}</Text>
              {detailUser.verified && <Text className='verify-text'>已认证</Text>}
              {!isSelf && relation.isSpecial && <Text className='special-badge'>特别关注</Text>}
            </View>
            <Text className='school-line'>{getUserMetaLine(detailUser)}</Text>
            <Text className='bio' numberOfLines={2}>{getUserIntro(detailUser)}</Text>
          </View>
        </View>

        <View className='stat-row'>
          {[
            { key: 'skills', label: '技能', value: detailUser.canTeach.length },
            { key: 'posts', label: '发布', value: getPublicPosts(detailUser.id).length },
            { key: 'followers', label: '粉丝', value: followerCount },
            { key: 'following', label: '关注', value: followingCount },
          ].map((item) => (
            <View className='stat-item' key={item.key} onClick={() => goOverview(item.key as 'skills' | 'posts' | 'followers' | 'following')}>
              <Text className='stat-value'>{item.value}</Text>
              <Text className='stat-label'>{item.label}</Text>
            </View>
          ))}
        </View>

        {!isSelf && (
          <View className='action-row'>
            <View className='primary-btn' onClick={goChat}>
              <Text>发消息</Text>
            </View>
            <View className={relation.isFollowing ? 'secondary-btn following' : 'secondary-btn'} onClick={toggleFollow}>
              <Text>{relationLabel(relation)}</Text>
            </View>
          </View>
        )}
      </View>

      <View className='info-card'>
        <View className='section-head'>
          <View className='section-title blue'>
            <Text>擅长技能</Text>
          </View>
          {!!detailUser.canTeach.length && <Text className='view-all' onClick={() => goOverview('skills')}>查看全部 ›</Text>}
        </View>
        <View className='chip-wrap'>
          {detailUser.canTeach.length ? detailUser.canTeach.slice(0, 3).map((skill) => (
            <View className='skill-chip' key={`${skill.userId}-${skill.id}`} onClick={() => goSkill(skill.id)}>
              <Text>{skill.name}</Text>
              <Text className='chip-level'>Lv.{skill.level}</Text>
            </View>
          )) : <Text className='empty-inline'>TA暂未公开技能</Text>}
        </View>
      </View>

      <View className='info-card compact'>
        <View className='section-title orange'>
          <Text>想学习</Text>
        </View>
        <View className='chip-wrap'>
          {detailUser.wantToLearn.length ? detailUser.wantToLearn.map((item) => (
            <Text className='want-chip' key={item}>{item}</Text>
          )) : <Text className='empty-inline'>TA暂未填写想学习的内容</Text>}
        </View>
      </View>

      <View className='info-card compact'>
        <View className='section-title blue'>
          <Text>兴趣标签</Text>
        </View>
        <View className='chip-wrap'>
          {detailUser.interests.length ? detailUser.interests.map((item) => (
            <Text className='interest-chip' key={item}>{item}</Text>
          )) : <Text className='empty-inline'>TA暂未公开兴趣标签</Text>}
        </View>
      </View>

      <View className='content-card'>
        <View className='content-heading'>
          <View>
            <Text className='content-title'>TA的发布</Text>
            <Text className='content-subtitle'>只展示公开内容，点击可查看帖子详情</Text>
          </View>
          {!!posts.length && <Text className='view-all' onClick={() => goOverview('posts')}>查看全部 ›</Text>}
        </View>
        <View className='tab-row'>
          {[
            { key: 'posts', label: 'TA的发布' },
            { key: 'reviews', label: '收到的评价' },
          ].map((tab) => (
            <View className={activeTab === tab.key ? 'tab active' : 'tab'} key={tab.key} onClick={() => setActiveTab(tab.key as 'posts' | 'reviews')}>
              <Text>{tab.label}</Text>
            </View>
          ))}
        </View>

        {activeTab === 'posts' && (
          <View className='profile-post-list'>
            {!posts.length && (
              <View className='empty-state'>
                <Text>TA还没有发布内容</Text>
              </View>
            )}
            {posts.map((post) => (
              <View className='profile-post-item' key={post.id} onClick={() => openPost(post)}>
                <View className='profile-post-head'>
                  <Text className='profile-post-title'>{post.title}</Text>
                  <Text className='profile-post-type'>公开</Text>
                </View>
                <Text className='profile-post-content' numberOfLines={2}>{post.summary}</Text>
                <View className='profile-post-tags'>
                  {post.tags.slice(0, 3).map((tag) => <Text className='profile-post-tag' key={tag}>{tag}</Text>)}
                </View>
                <View className='profile-post-meta'>
                  <Text>♡ {post.likeCount}</Text>
                  <Text>评论 {post.commentCount}</Text>
                  <Text>{post.createdAt}</Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {activeTab === 'reviews' && (
          <View className='profile-post-list'>
            {!reviews.length && (
              <View className='empty-state'>
                <Text>TA暂时还没有收到评价</Text>
              </View>
            )}
            {reviews.map((review) => (
              <View className='review-item' key={review.id}>
                <View className='review-avatar'>
                  <Text>{firstChar(review.reviewerName)}</Text>
                </View>
                <View className='review-main'>
                  <Text className='review-name'>{review.reviewerName}</Text>
                  <View className='profile-post-tags'>
                    {review.tags.map((tag) => <Text className='profile-post-tag green' key={tag}>{tag}</Text>)}
                  </View>
                  <Text className='profile-post-content'>{review.content}</Text>
                  <View className='profile-post-meta'>
                    <Text>关联：{review.relatedTitle}</Text>
                    <Text>{review.createdAt}</Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}
      </View>

      <View className='safe-bottom' />
    </ScrollView>
  )
}
