import { View, Text, ScrollView } from '@tarojs/components'
import Taro, { useDidShow, useLoad } from '@tarojs/taro'
import { useMemo, useState } from 'react'
import { getPosts } from '../../utils/api'
import {
  CURRENT_USER,
  MOCK_POSTS,
  MY_INTERESTS,
  MY_LEARN_WANTS,
  MY_PROFILE,
  MY_REVIEWS,
  MY_SKILLS,
  PARTNER_USERS,
  SKILL_ID_BY_NAME,
  SKILL_USERS,
  USER_DETAILS,
} from '../../utils/mock'
import './index.css'

const tabs = [
  { key: 'posts', label: '发布' },
  { key: 'reviews', label: '评价' },
]

type ProfilePost = {
  id?: string
  _id?: string
  title: string
  excerpt?: string
  content?: string
  categoryTag?: string
  mainCategory?: string
  tags?: string[]
  likes?: number
  comments?: number
  userId?: string
  authorId?: string
  author?: {
    name?: string
  }
}

type DetailUser = {
  id: string
  name: string
  verified: boolean
  school: string
  major: string
  gender?: 'male' | 'female' | 'private'
  campus?: string
  bio: string
  stats: Array<{ label: string; value: number; key: string }>
  skillChips: Array<{ name: string; level: number; featured?: boolean }>
  wants: string[]
  interests: string[]
  reviews: Array<{ id: string; reviewerName: string; rating?: number; tags: string[]; content: string; relatedTitle?: string; createdAt: string }>
  isSelf: boolean
}

function getMyProfileDraft() {
  const draft = Taro.getStorageSync('profileDraft')
  if (!draft || typeof draft !== 'object') return MY_PROFILE
  return {
    ...MY_PROFILE,
    ...draft,
    name: draft.nickname || draft.name || MY_PROFILE.name,
    bio: draft.intro || draft.bio || MY_PROFILE.bio,
  }
}

function getGenderText(gender?: string) {
  if (gender === 'male') return '男'
  if (gender === 'female') return '女'
  return ''
}

function getPostId(post: ProfilePost) {
  return String(post.id || post._id || post.title)
}

function getRouteIdentity(options: Record<string, unknown>) {
  return {
    id: decodeURIComponent(String(options.userId || options.id || '')),
    name: decodeURIComponent(String(options.name || '')),
  }
}

function getStats(stats: any, postsFallback = 0) {
  return [
    { label: '技能', value: Number(stats?.skills ?? 0), key: 'skills' },
    { label: '发布', value: Number(stats?.posts ?? postsFallback), key: 'posts' },
    { label: '粉丝', value: Number(stats?.followers ?? 0), key: 'followers' },
    { label: '关注', value: Number(stats?.following ?? 0), key: 'following' },
  ]
}

function normalizeSkillChips(source: any): DetailUser['skillChips'] {
  const skills = source?.skillChips || source?.skills || []
  return skills.slice(0, 4).map((skill: any, index: number) => ({
    name: skill.name,
    level: Number(skill.level || 1),
    featured: Boolean(skill.featured || index === 0),
  })).filter((skill: DetailUser['skillChips'][number]) => !!skill.name)
}

function normalizeReviews(source: any) {
  return (source?.reviews || []).slice(0, 3).map((review: any) => ({
    id: String(review.id),
    reviewerName: review.reviewerName || review.reviewer || '同学',
    rating: review.rating,
    tags: review.tags || [],
    content: review.content || '',
    relatedTitle: review.relatedTitle || review.skill,
    createdAt: review.createdAt || review.time || '最近',
  }))
}

function buildCurrentUser(): DetailUser {
  const profile = getMyProfileDraft()
  return {
    id: CURRENT_USER.id,
    name: profile.name,
    verified: true,
    school: profile.school,
    major: `${profile.college} · ${profile.grade}${profile.campus ? ` · ${profile.campus}` : ''}`,
    gender: profile.gender,
    campus: profile.campus,
    bio: profile.bio,
    stats: getStats(profile.stats, 0),
    skillChips: MY_SKILLS.slice(0, 4).map((skill, index) => ({
      name: skill.name,
      level: skill.level,
      featured: index === 0,
    })),
    wants: MY_LEARN_WANTS.map((item) => item.name),
    interests: MY_INTERESTS,
    reviews: MY_REVIEWS.map((review) => ({
      id: review.id,
      reviewerName: review.reviewerName,
      rating: review.rating,
      tags: review.tags,
      content: review.content,
      relatedTitle: review.relatedTitle,
      createdAt: review.createdAt,
    })),
    isSelf: true,
  }
}

function buildFromUserDetail(raw: any, id: string): DetailUser {
  return {
    id,
    name: raw.name || '同学',
    verified: Boolean(raw.verified),
    school: raw.school || '浙江大学',
    major: [raw.college, raw.grade].filter(Boolean).join(' · ') || raw.major || '在读',
    bio: raw.bio || '正在寻找可以一起交流的同学。',
    stats: getStats(raw.stats, raw.recentPosts?.length || raw.posts?.length || 0),
    skillChips: normalizeSkillChips(raw),
    wants: raw.learn_wants || raw.wants || [],
    interests: raw.interests || [],
    reviews: normalizeReviews(raw),
    isSelf: false,
  }
}

function buildFromListUser(raw: any): DetailUser {
  const id = String(raw.id || raw.userId || raw.name)
  const skills = raw.skills || raw.canTeach || raw.skillChips || []
  return {
    id,
    name: raw.name || '同学',
    verified: Boolean(raw.verified),
    school: '浙江大学',
    major: [raw.college, raw.grade, raw.major].filter(Boolean).join(' · ') || '在读',
    bio: raw.bio || raw.desc || '正在寻找可以一起交流的同学。',
    stats: getStats(raw.stats, 0),
    skillChips: normalizeSkillChips({ skills }),
    wants: raw.learnWants || raw.want || raw.wants || [],
    interests: raw.tags || [],
    reviews: [],
    isSelf: false,
  }
}

function buildFromPostAuthor(raw: ProfilePost): DetailUser {
  const id = String(raw.authorId || raw.userId || raw.author?.name || '')
  return {
    id,
    name: raw.author?.name || '同学',
    verified: false,
    school: '浙江大学',
    major: '在读',
    bio: '正在换乎分享技能、兴趣或活动内容。',
    stats: getStats({ posts: MOCK_POSTS.filter((post) => post.authorId === id || post.userId === id).length }, 0),
    skillChips: [],
    wants: [],
    interests: raw.tags || [],
    reviews: [],
    isSelf: false,
  }
}

function resolveUser(id: string, name: string): DetailUser {
  const currentNames = [CURRENT_USER.id, MY_PROFILE.user_id, MY_PROFILE.name, CURRENT_USER.name]
  if ((id && currentNames.includes(id)) || (name && currentNames.includes(name))) {
    return buildCurrentUser()
  }

  const detailEntry = Object.entries(USER_DETAILS).find(([key, raw]: [string, any]) => (
    key === name || raw.name === name || String(raw.id || raw.userId || '') === id
  ))
  if (detailEntry) return buildFromUserDetail(detailEntry[1], String(detailEntry[1].id || detailEntry[1].userId || detailEntry[0]))

  const listUser = [...SKILL_USERS, ...PARTNER_USERS].find((raw: any) => (
    String(raw.id || raw.userId || '') === id || raw.name === name
  ))
  if (listUser) return buildFromListUser(listUser)

  const postAuthor = MOCK_POSTS.find((post) => (
    post.authorId === id || post.userId === id || post.author?.name === name
  ))
  if (postAuthor) return buildFromPostAuthor(postAuthor)

  return {
    id: id || name || 'unknown-user',
    name: name || '同学',
    verified: false,
    school: '浙江大学',
    major: '在读',
    bio: '暂时还没有更多资料。',
    stats: getStats({}, 0),
    skillChips: [],
    wants: [],
    interests: [],
    reviews: [],
    isSelf: false,
  }
}

function mergePendingPost(posts: ProfilePost[]) {
  const pending = Taro.getStorageSync('pendingPost')
  if (!pending?.title) return posts

  const pendingId = getPostId(pending)
  const exists = posts.some((post) => getPostId(post) === pendingId)
  return exists ? posts : [pending, ...posts]
}

export default function UserDetail() {
  const [following, setFollowing] = useState(false)
  const [activeTab, setActiveTab] = useState('posts')
  const [posts, setPosts] = useState<ProfilePost[]>([])
  const [loadingPosts, setLoadingPosts] = useState(true)
  const [routeUser, setRouteUser] = useState({ id: '', name: '' })

  useLoad((options) => {
    setRouteUser(getRouteIdentity(options || {}))
  })

  const detailUser = useMemo(() => resolveUser(routeUser.id, routeUser.name), [routeUser.id, routeUser.name])

  const toast = (title: string) => Taro.showToast({ title, icon: 'none' })
  const handleBack = () => Taro.navigateBack()
  const goSkillDetail = (skillName: string) => {
    const skillId = SKILL_ID_BY_NAME[skillName] || encodeURIComponent(skillName)
    Taro.navigateTo({ url: `/pages/skill-detail/index?userId=${encodeURIComponent(detailUser.id)}&skillId=${encodeURIComponent(skillId)}` })
  }
  const goChat = () => {
    Taro.navigateTo({
      url: `/pages/contact-request/index?userId=${encodeURIComponent(detailUser.id)}&name=${encodeURIComponent(detailUser.name)}&category=${encodeURIComponent('个人主页')}&source=user-detail`,
    })
  }

  useDidShow(() => {
    let alive = true

    async function loadPosts() {
      setLoadingPosts(true)
      try {
        const data = await getPosts({ page: 0 })
        if (!alive) return
        const matched = (data || []).filter((post: ProfilePost) => (
          post.authorId === detailUser.id
          || post.userId === detailUser.id
          || post.author?.name === detailUser.name
        ))
        setPosts(mergePendingPost(matched))
      } catch (e) {
        console.warn('[UserDetail] load posts failed', e)
        if (alive) setPosts(mergePendingPost([]))
      } finally {
        if (alive) setLoadingPosts(false)
      }
    }

    loadPosts()
    return () => {
      alive = false
    }
  })

  return (
    <ScrollView scrollY className='user-page' showScrollbar={false} enhanced bounces={false}>
      <View className='nav-bar'>
        <Text className='back-icon' onClick={handleBack}>‹</Text>
      </View>

      <View className='profile-head'>
        <View className='avatar'>
          <Text className='avatar-text'>{detailUser.name.charAt(0)}</Text>
        </View>
        <View className='profile-main'>
          <View className='name-row'>
            <Text className='user-name'>{detailUser.name}</Text>
            {detailUser.verified && <Text className='verify-badge'>✓</Text>}
            {detailUser.verified && <Text className='verify-text'>已认证</Text>}
          </View>
          <Text className='school-line'>{detailUser.school} · {detailUser.major}</Text>
          {!!getGenderText(detailUser.gender) && <Text className='gender-badge'>{getGenderText(detailUser.gender)}</Text>}
          <Text className='bio'>{detailUser.bio}</Text>
        </View>
      </View>

      <View className='stat-row'>
        {detailUser.stats.map(item => (
          <View
            className='stat-item'
            key={item.key}
            onClick={() => item.key === 'posts' ? setActiveTab('posts') : toast(item.label)}
          >
            <Text className='stat-value'>{item.value}</Text>
            <Text className='stat-label'>{item.label}</Text>
          </View>
        ))}
      </View>

      <View className='action-row'>
        {detailUser.isSelf ? (
          <>
            <View className='primary-btn' onClick={() => Taro.navigateTo({ url: '/pages/edit-profile/index' })}>
              <Text>编辑资料</Text>
            </View>
            <View className='secondary-btn' onClick={() => Taro.navigateTo({ url: '/pages/my-skills/index' })}>
              <Text>管理技能</Text>
            </View>
          </>
        ) : (
          <>
            <View className='primary-btn' onClick={goChat}>
              <Text className='msg-icon'>◆</Text>
              <Text>发消息</Text>
            </View>
            <View
              className={following ? 'secondary-btn following' : 'secondary-btn'}
              onClick={() => setFollowing(!following)}
            >
              <Text className='follow-icon'>♡</Text>
              <Text>{following ? '已关注' : '关注TA'}</Text>
            </View>
          </>
        )}
      </View>

      <View className='info-card'>
        <View className='section-title blue'>
          <Text>我会</Text>
        </View>
        <View className='chip-wrap'>
          {detailUser.skillChips.length ? detailUser.skillChips.map(skill => (
            <View className={skill.featured ? 'skill-chip gold' : 'skill-chip'} key={skill.name} onClick={() => goSkillDetail(skill.name)}>
              <Text>{skill.name}</Text>
              <Text className='chip-level'>Lv.{skill.level}</Text>
              {skill.featured && <Text className='crown'>★</Text>}
            </View>
          )) : <Text className='empty-inline'>暂未展示技能</Text>}
        </View>
      </View>

      <View className='info-card compact'>
        <View className='section-title orange'>
          <Text>想学</Text>
        </View>
        <View className='chip-wrap'>
          {detailUser.wants.length ? detailUser.wants.map(item => (
            <Text className='want-chip' key={item}>{item}</Text>
          )) : <Text className='empty-inline'>暂未填写想学内容</Text>}
        </View>
      </View>

      <View className='info-card compact'>
        <View className='section-title blue'>
          <Text>兴趣标签</Text>
        </View>
        <View className='chip-wrap'>
          {detailUser.interests.length ? detailUser.interests.map(item => (
            <Text className='interest-chip' key={item}>{item}</Text>
          )) : <Text className='empty-inline'>暂未填写兴趣标签</Text>}
        </View>
      </View>

      <View className='content-card'>
        <View className='tab-row'>
          {tabs.map(tab => (
            <View
              className={activeTab === tab.key ? 'tab active' : 'tab'}
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
            >
              <Text>{tab.label}</Text>
            </View>
          ))}
        </View>

        {activeTab === 'posts' && (
          <View className='profile-post-list'>
            {!posts.length && (
              <View className='empty-state'>
                <Text>{loadingPosts ? '正在加载发布...' : '暂无公开发布'}</Text>
              </View>
            )}
            {posts.map((post) => (
              <View
                className='profile-post-item'
                key={getPostId(post)}
                onClick={() => Taro.navigateTo({ url: `/pages/post-detail/index?postId=${encodeURIComponent(getPostId(post))}` })}
              >
                <View className='profile-post-head'>
                  <Text className='profile-post-title'>{post.title}</Text>
                  <Text className='profile-post-type'>{post.categoryTag || `${post.mainCategory || '动态'} · 发布`}</Text>
                </View>
                <Text className='profile-post-content' numberOfLines={2}>
                  {post.excerpt || post.content || '暂无内容'}
                </Text>
                {!!post.tags?.length && (
                  <View className='profile-post-tags'>
                    {post.tags.slice(0, 3).map((tag) => (
                      <Text className='profile-post-tag' key={tag}>{tag}</Text>
                    ))}
                  </View>
                )}
                <View className='profile-post-meta'>
                  <Text>♡ {post.likes || 0}</Text>
                  <Text>评论 {post.comments || 0}</Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {activeTab === 'reviews' && (
          <View className='profile-post-list'>
            {!detailUser.reviews.length && (
              <View className='empty-state'>
                <Text>暂无收到的评价</Text>
              </View>
            )}
            {detailUser.reviews.map((review) => (
              <View className='profile-post-item' key={review.id}>
                <View className='profile-post-head'>
                  <Text className='profile-post-title'>{review.reviewerName}</Text>
                  <Text className='profile-post-type'>{review.rating ? `★ ${review.rating}` : review.createdAt}</Text>
                </View>
                <View className='profile-post-tags'>
                  {review.tags.map((tag) => <Text className='profile-post-tag' key={tag}>{tag}</Text>)}
                </View>
                <Text className='profile-post-content'>{review.content}</Text>
                {!!review.relatedTitle && (
                  <View className='profile-post-meta'>
                    <Text>关联：{review.relatedTitle}</Text>
                    <Text>{review.createdAt}</Text>
                  </View>
                )}
              </View>
            ))}
          </View>
        )}
      </View>

      <View className='safe-bottom' />
    </ScrollView>
  )
}
