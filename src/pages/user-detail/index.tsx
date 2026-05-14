import { View, Text, ScrollView } from '@tarojs/components'
import Taro, { useDidShow, useLoad } from '@tarojs/taro'
import { useMemo, useState } from 'react'
import {
  CURRENT_USER,
  MOCK_POSTS,
  MOCK_RELATIONS,
  MY_INTERESTS,
  MY_LEARN_WANTS,
  MY_PROFILE,
  MY_REVIEWS,
  MY_SKILLS,
  type UserRelation,
} from '../../utils/mock'
import './index.css'

type ProfilePost = {
  id: string
  title: string
  excerpt: string
  tags: string[]
  likes: number
  comments: number
  createdAt: string
  categoryTag?: string
  authorId: string
  authorName: string
}

type PublicReview = {
  id: string
  reviewerName: string
  reviewerAvatar?: string
  tags: string[]
  content: string
  relatedTitle?: string
  createdAt: string
}

type DetailUser = {
  id: string
  name: string
  avatar?: string
  verified: boolean
  school: string
  college: string
  major: string
  grade: string
  campus: string
  bio: string
  skills: Array<{ name: string; level: number }>
  wants: string[]
  interests: string[]
  posts: ProfilePost[]
  reviews: PublicReview[]
  stats: {
    followers: number
    following: number
  }
  isSelf: boolean
}

const RELATION_STORAGE_KEY = 'myUserRelations'

const CLEAN_PUBLIC_USERS: DetailUser[] = [
  {
    id: 'u1',
    name: '科研小达人',
    verified: true,
    school: '浙江大学',
    college: '计算机学院',
    major: '计算机科学',
    grade: '研一',
    campus: '紫金港',
    bio: '热爱编程和数据分析，擅长 Python 和机器学习。正在做 NLP 相关课题，欢迎交流。',
    skills: [
      { name: '编程', level: 4 },
      { name: '数据分析', level: 3 },
      { name: 'Python', level: 2 },
    ],
    wants: ['摄影', '产品设计'],
    interests: ['编程', '数据分析', 'Python'],
    posts: [
      {
        id: 'u1p1',
        title: 'NLP 课程笔记：Transformer 原理详解',
        excerpt: '整理了课堂上关于注意力机制、编码器结构和应用场景的笔记，适合刚接触 NLP 的同学。',
        tags: ['编程', '数据分析', 'Python'],
        likes: 34,
        comments: 8,
        createdAt: '3天前',
        categoryTag: 'TA发布的内容',
        authorId: 'u1',
        authorName: '科研小达人',
      },
      {
        id: 'u1p2',
        title: '推荐几个好用的科研效率工具',
        excerpt: '从文献管理、笔记整理到 Prompt 模板，分享我常用的一套科研工作流。',
        tags: ['科研', 'AI工具', '效率'],
        likes: 56,
        comments: 12,
        createdAt: '1周前',
        categoryTag: 'TA发布的内容',
        authorId: 'u1',
        authorName: '科研小达人',
      },
      {
        id: 'u1p3',
        title: '校园数据竞赛经验分享',
        excerpt: '复盘一次校内数据竞赛的选题、清洗、建模和展示流程。',
        tags: ['数据分析', '竞赛', 'Python'],
        likes: 28,
        comments: 5,
        createdAt: '2周前',
        categoryTag: 'TA发布的内容',
        authorId: 'u1',
        authorName: '科研小达人',
      },
    ],
    reviews: [
      {
        id: 'r-u1-1',
        reviewerName: '王同学',
        tags: ['讲得清楚', '有耐心'],
        content: 'Python 数据分析讲得很清楚，案例也很实用。',
        relatedTitle: 'Python 入门答疑',
        createdAt: '5天前',
      },
    ],
    stats: { followers: 89, following: 30 },
    isSelf: false,
  },
  {
    id: 'u_photo',
    name: '光影捕手',
    verified: false,
    school: '浙江大学',
    college: '艺术学院',
    major: '视觉传达',
    grade: '大二',
    campus: '紫金港',
    bio: '摄影爱好者，周末喜欢扫街和拍校园，也乐于交流修图流程。',
    skills: [{ name: '摄影', level: 4 }, { name: '修图', level: 3 }],
    wants: ['AI工具', '产品设计'],
    interests: ['摄影', '校园活动', '设计'],
    posts: [
      {
        id: '2',
        title: '浙大的春天太美了，求摄影搭子',
        excerpt: '最近樱花和郁金香都开了，想找喜欢摄影的同学一起扫校园。',
        tags: ['摄影', '兴趣搭子'],
        likes: 256,
        comments: 45,
        createdAt: '5天前',
        categoryTag: 'TA发布的内容',
        authorId: 'u_photo',
        authorName: '光影捕手',
      },
    ],
    reviews: [],
    stats: { followers: 120, following: 45 },
    isSelf: false,
  },
]

const FALLBACK_PUBLIC_USER: DetailUser = {
  id: 'unknown-user',
  name: '同学',
  verified: false,
  school: '浙江大学',
  college: '暂未填写学院',
  major: '暂未填写专业',
  grade: '在读',
  campus: '暂未填写校区',
  bio: 'TA 暂时还没有公开更多资料。',
  skills: [],
  wants: [],
  interests: [],
  posts: [],
  reviews: [],
  stats: { followers: 0, following: 0 },
  isSelf: false,
}

function getMyProfile(): DetailUser {
  const draft = Taro.getStorageSync('profileDraft') || {}
  const profile = { ...MY_PROFILE, ...draft }
  return {
    id: CURRENT_USER.id,
    name: profile.nickname || profile.name || CURRENT_USER.name,
    avatar: CURRENT_USER.avatar,
    verified: true,
    school: '浙江大学',
    college: profile.college || '计算机学院',
    major: profile.major || '计算机科学',
    grade: profile.grade || '研一',
    campus: profile.campus || '紫金港',
    bio: profile.intro || profile.bio || '欢迎来换乎找我交流技能和兴趣。',
    skills: MY_SKILLS.slice(0, 4).map((skill) => ({ name: skill.name, level: skill.level })),
    wants: MY_LEARN_WANTS.map((item) => item.name),
    interests: MY_INTERESTS,
    posts: MOCK_POSTS
      .filter((post) => post.authorId === CURRENT_USER.id || post.userId === CURRENT_USER.id)
      .map((post) => ({
        id: post.id,
        title: post.title,
        excerpt: post.excerpt || post.content || '',
        tags: post.tags || [],
        likes: post.likeCount ?? post.likes ?? 0,
        comments: post.commentCount ?? post.comments ?? 0,
        createdAt: post.createdAt || '最近',
        categoryTag: '我的发布',
        authorId: CURRENT_USER.id,
        authorName: CURRENT_USER.name,
      })),
    reviews: MY_REVIEWS.map((review) => ({
      id: review.id,
      reviewerName: review.reviewerName,
      tags: review.tags,
      content: review.content,
      relatedTitle: review.relatedTitle,
      createdAt: review.createdAt,
    })),
    stats: { followers: Number(profile.stats?.followers || 86), following: Number(profile.stats?.following || 42) },
    isSelf: true,
  }
}

function normalizeId(id: string) {
  if (!id) return ''
  if (/^\d+$/.test(id)) return `u${id}`
  return id
}

function resolveUser(id: string, name: string): DetailUser {
  const normalizedId = normalizeId(id)
  const isSelf = [CURRENT_USER.id, MY_PROFILE.user_id, MY_PROFILE.name, CURRENT_USER.name].includes(id)
    || [CURRENT_USER.id, MY_PROFILE.user_id, MY_PROFILE.name, CURRENT_USER.name].includes(name)
  if (isSelf) return getMyProfile()

  const clean = CLEAN_PUBLIC_USERS.find((user) => user.id === normalizedId || user.name === name)
  if (clean) return clean

  const postAuthor = MOCK_POSTS.find((post) => (
    post.authorId === id || post.userId === id || post.author?.name === name
  ))
  if (postAuthor) {
    const authorId = postAuthor.authorId || postAuthor.userId || normalizedId || 'unknown-user'
    const relatedPosts = MOCK_POSTS.filter((post) => post.authorId === authorId || post.userId === authorId || post.author?.name === postAuthor.author?.name)
    return {
      ...FALLBACK_PUBLIC_USER,
      id: authorId,
      name: postAuthor.author?.name || name || '同学',
      college: postAuthor.author?.college || '暂未填写学院',
      grade: postAuthor.author?.grade || '在读',
      interests: postAuthor.tags || [],
      posts: relatedPosts.map((post) => ({
        id: post.id,
        title: post.title,
        excerpt: post.excerpt || post.content || '',
        tags: post.tags || [],
        likes: post.likeCount ?? post.likes ?? 0,
        comments: post.commentCount ?? post.comments ?? 0,
        createdAt: post.createdAt || '最近',
        categoryTag: 'TA发布的内容',
        authorId,
        authorName: postAuthor.author?.name || name || '同学',
      })),
      stats: { followers: 0, following: 0 },
    }
  }

  return {
    ...FALLBACK_PUBLIC_USER,
    id: normalizedId || name || 'unknown-user',
    name: name || '同学',
  }
}

function readRelations(): UserRelation[] {
  const cached = Taro.getStorageSync(RELATION_STORAGE_KEY)
  return Array.isArray(cached) && cached.length ? cached : MOCK_RELATIONS
}

function saveRelations(relations: UserRelation[]) {
  Taro.setStorageSync(RELATION_STORAGE_KEY, relations)
}

function makeRelation(user: DetailUser): UserRelation {
  return {
    userId: user.id,
    name: user.name,
    avatar: user.avatar || '',
    college: user.college,
    grade: user.grade,
    campus: user.campus,
    intro: user.bio,
    relationType: 'following',
    isFollowing: false,
    isFollower: false,
    isMutual: false,
    isSpecial: false,
    isBlocked: false,
    createdAt: '刚刚',
  }
}

export default function UserDetail() {
  const [routeUser, setRouteUser] = useState({ id: '', name: '' })
  const [activeTab, setActiveTab] = useState<'posts' | 'reviews'>('posts')
  const [relations, setRelations] = useState<UserRelation[]>([])

  useLoad((options) => {
    setRouteUser({
      id: decodeURIComponent(String(options?.userId || options?.id || '')),
      name: decodeURIComponent(String(options?.name || '')),
    })
  })

  useDidShow(() => {
    setRelations(readRelations())
  })

  const detailUser = useMemo(() => resolveUser(routeUser.id, routeUser.name), [routeUser.id, routeUser.name])
  const relation = relations.find((item) => item.userId === detailUser.id) || makeRelation(detailUser)

  const updateRelation = (patch: Partial<UserRelation>) => {
    const exists = relations.some((item) => item.userId === detailUser.id)
    const next = exists
      ? relations.map((item) => item.userId === detailUser.id ? { ...item, ...patch } : item)
      : [...relations, { ...makeRelation(detailUser), ...patch }]
    setRelations(next)
    saveRelations(next)
  }

  const relationText = relation.isSpecial
    ? '特别关注'
    : relation.isMutual
      ? '互相关注'
      : relation.isFollowing
        ? '已关注'
        : '关注TA'

  const follow = () => {
    updateRelation({ isFollowing: true, isMutual: relation.isFollower, relationType: relation.isFollower ? 'mutual' : 'following' })
    Taro.showToast({ title: '已关注', icon: 'success' })
  }

  const unfollow = () => {
    Taro.showModal({
      title: '取消关注',
      content: '确认取消关注该用户吗？',
      confirmText: '取消关注',
      confirmColor: '#EF4444',
      success: ({ confirm }) => {
        if (!confirm) return
        updateRelation({ isFollowing: false, isMutual: false, isSpecial: false, relationType: relation.isFollower ? 'follower' : 'following' })
        Taro.showToast({ title: '已取消关注', icon: 'success' })
      },
    })
  }

  const toggleFollow = () => {
    if (relation.isFollowing) unfollow()
    else follow()
  }

  const toggleSpecial = () => {
    const nextSpecial = !relation.isSpecial
    updateRelation({ isFollowing: true, isSpecial: nextSpecial, relationType: relation.isFollower ? 'mutual' : 'following', isMutual: relation.isFollower })
    Taro.showToast({ title: nextSpecial ? '已设为特别关注' : '已取消特别关注', icon: 'success' })
  }

  const reportUser = () => {
    Taro.showActionSheet({
      itemList: ['垃圾广告', '不友善内容', '虚假信息', '骚扰行为', '其他'],
      success: () => Taro.showToast({ title: '举报已提交', icon: 'success' }),
    })
  }

  const blockUser = () => {
    Taro.showModal({
      title: '拉黑用户',
      content: '拉黑后对方将无法与你互动，确定拉黑吗？',
      confirmText: '拉黑',
      confirmColor: '#EF4444',
      success: ({ confirm }) => {
        if (!confirm) return
        updateRelation({ isBlocked: true, isFollowing: false, isFollower: false, isMutual: false, isSpecial: false })
        Taro.showToast({ title: '已拉黑', icon: 'success' })
      },
    })
  }

  const showMore = () => {
    if (detailUser.isSelf) return
    const itemList = relation.isFollowing
      ? [relation.isSpecial ? '取消特别关注' : '设为特别关注', '取消关注', '举报用户', '拉黑用户']
      : ['关注TA', '举报用户', '拉黑用户']
    Taro.showActionSheet({
      itemList,
      success: ({ tapIndex }) => {
        const item = itemList[tapIndex]
        if (item === '关注TA') follow()
        if (item === '设为特别关注' || item === '取消特别关注') toggleSpecial()
        if (item === '取消关注') unfollow()
        if (item === '举报用户') reportUser()
        if (item === '拉黑用户') blockUser()
      },
    })
  }

  const goChat = () => {
    Taro.navigateTo({
      url: `/pages/chat/index?id=${encodeURIComponent(detailUser.id)}&userId=${encodeURIComponent(detailUser.id)}&name=${encodeURIComponent(detailUser.name)}&category=${encodeURIComponent('个人主页')}`,
    })
  }

  const openPost = (post: ProfilePost) => {
    Taro.setStorageSync('pendingPost', {
      ...post,
      id: post.id,
      authorId: post.authorId,
      userId: post.authorId,
      author: {
        id: post.authorId,
        userId: post.authorId,
        name: post.authorName,
        avatar: '',
        college: detailUser.college,
        grade: detailUser.grade,
      },
    })
    Taro.navigateTo({ url: `/pages/post-detail/index?postId=${encodeURIComponent(post.id)}&from=user-detail` })
  }

  const scrollToSection = (key: string) => {
    if (key === 'posts') setActiveTab('posts')
    if (key === 'skills') Taro.showToast({ title: '已展示 TA 的技能', icon: 'none' })
    if (key === 'followers' || key === 'following') Taro.showToast({ title: '列表查看功能后续开放', icon: 'none' })
  }

  return (
    <ScrollView scrollY className={detailUser.isSelf ? 'user-page self-page' : 'user-page public-page'} showScrollbar={false} enhanced bounces={false}>
      <View className='nav-bar'>
        <Text className='back-icon' onClick={() => Taro.navigateBack()}>‹</Text>
        {!detailUser.isSelf && (
          <View className='more-menu' onClick={showMore}>
            <Text>...</Text>
          </View>
        )}
      </View>

      <View className='public-card'>
        {!detailUser.isSelf && <Text className='public-eyebrow'>对外展示主页</Text>}
        <View className='profile-head'>
          <View className='avatar'>
            <Text className='avatar-text'>{detailUser.name.charAt(0)}</Text>
          </View>
          <View className='profile-main'>
            <View className='name-row'>
              <Text className='user-name'>{detailUser.name}</Text>
              {detailUser.verified && <Text className='verify-badge'>✓</Text>}
              {detailUser.verified && <Text className='verify-text'>已认证</Text>}
              {!detailUser.isSelf && relation.isSpecial && <Text className='special-badge'>★ 特别关注</Text>}
            </View>
            <Text className='school-line'>{detailUser.school} · {detailUser.college} · {detailUser.major} · {detailUser.grade} · {detailUser.campus}</Text>
            <Text className='bio'>{detailUser.bio}</Text>
          </View>
        </View>

        <View className='stat-row'>
          {[
            { key: 'skills', label: '技能', value: detailUser.skills.length },
            { key: 'posts', label: '发布', value: detailUser.posts.length },
            { key: 'followers', label: '粉丝', value: detailUser.stats.followers },
            { key: 'following', label: '关注', value: detailUser.stats.following },
          ].map((item) => (
            <View className='stat-item' key={item.key} onClick={() => scrollToSection(item.key)}>
              <Text className='stat-value'>{item.value}</Text>
              <Text className='stat-label'>{item.label}</Text>
            </View>
          ))}
        </View>

        {!detailUser.isSelf && (
          <View className='action-row'>
            <View className='primary-btn' onClick={goChat}>
              <Text>发消息</Text>
            </View>
            <View className={relation.isFollowing ? 'secondary-btn following' : 'secondary-btn'} onClick={toggleFollow}>
              <Text>{relationText}</Text>
            </View>
          </View>
        )}
      </View>

      {!detailUser.isSelf && (
        <View className='public-hint'>
          <Text className='public-hint-title'>TA 的公开主页</Text>
          <Text className='public-hint-desc'>这里只能查看资料、作品和评价，不提供编辑、管理或删除入口。</Text>
        </View>
      )}

      <View className='info-card'>
        <View className='section-title blue'>
          <Text>{detailUser.isSelf ? '我会' : '擅长技能'}</Text>
        </View>
        <View className='chip-wrap'>
          {detailUser.skills.length ? detailUser.skills.map((skill) => (
            <View className='skill-chip' key={skill.name} onClick={() => Taro.navigateTo({ url: `/pages/skill-detail/index?userId=${encodeURIComponent(detailUser.id)}&skillId=${encodeURIComponent(skill.name)}` })}>
              <Text>{skill.name}</Text>
              <Text className='chip-level'>Lv.{skill.level}</Text>
            </View>
          )) : <Text className='empty-inline'>TA暂未公开技能</Text>}
        </View>
      </View>

      <View className='info-card compact'>
        <View className='section-title orange'>
          <Text>{detailUser.isSelf ? '想学' : '想学习'}</Text>
        </View>
        <View className='chip-wrap'>
          {detailUser.wants.length ? detailUser.wants.map((item) => (
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
          <Text className='content-title'>TA的发布</Text>
          <Text className='content-subtitle'>共 {detailUser.posts.length} 条，点击可查看帖子详情</Text>
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
            {!detailUser.posts.length && (
              <View className='empty-state'>
                <Text>TA还没有发布内容</Text>
              </View>
            )}
            {detailUser.posts.map((post) => (
              <View className='profile-post-item' key={post.id} onClick={() => openPost(post)}>
                <View className='profile-post-head'>
                  <Text className='profile-post-title'>{post.title}</Text>
                  <Text className='profile-post-type'>{post.categoryTag || 'TA发布的内容'}</Text>
                </View>
                <Text className='profile-post-content' numberOfLines={2}>{post.excerpt}</Text>
                <View className='profile-post-tags'>
                  {post.tags.slice(0, 3).map((tag) => <Text className='profile-post-tag' key={tag}>{tag}</Text>)}
                </View>
                <View className='profile-post-meta'>
                  <Text>♡ {post.likes}</Text>
                  <Text>评论 {post.comments}</Text>
                  <Text>{post.createdAt}</Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {activeTab === 'reviews' && (
          <View className='profile-post-list'>
            {!detailUser.reviews.length && (
              <View className='empty-state'>
                <Text>TA暂时还没有收到评价</Text>
              </View>
            )}
            {detailUser.reviews.map((review) => (
              <View className='review-item' key={review.id}>
                <View className='review-avatar'>
                  <Text>{review.reviewerName.charAt(0)}</Text>
                </View>
                <View className='review-main'>
                  <Text className='review-name'>{review.reviewerName}</Text>
                  <View className='profile-post-tags'>
                    {review.tags.map((tag) => <Text className='profile-post-tag green' key={tag}>{tag}</Text>)}
                  </View>
                  <Text className='profile-post-content'>{review.content}</Text>
                  <View className='profile-post-meta'>
                    {!!review.relatedTitle && <Text>关联：{review.relatedTitle}</Text>}
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
