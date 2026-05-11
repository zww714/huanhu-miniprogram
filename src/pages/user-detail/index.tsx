import { View, Text, ScrollView } from '@tarojs/components'
import Taro, { useDidShow } from '@tarojs/taro'
import { useState } from 'react'
import { getPosts } from '../../utils/api'
import { SKILL_ID_BY_NAME } from '../../utils/mock'
import './index.css'

const user = {
  name: '陈同学',
  verified: true,
  school: '浙江大学',
  major: '物理学博士在读',
  bio: '擅长用 AI 和编程工具帮助同学快速上手科研与项目实践。',
  stats: [
    { label: '技能', value: 5, key: 'skills' },
    { label: '发布', value: 12, key: 'posts' },
    { label: '粉丝', value: 86, key: 'followers' },
    { label: '关注', value: 42, key: 'following' },
  ],
  skills: [
    {
      name: 'AI工具',
      level: 5,
      desc: '擅长利用 AI 工具完成文献整理、内容生成与学习辅助',
      tags: ['ChatGPT', '提示词', '效率工具'],
      icon: 'AI',
      featured: true,
    },
    {
      name: 'Python 编程',
      level: 5,
      desc: '熟练使用 Python 进行数据分析、机器学习与 Web 开发',
      tags: ['数据分析', 'Django', 'TensorFlow'],
      icon: 'PY',
    },
  ],
  skillChips: [
    { name: 'AI工具', level: 5, featured: true },
    { name: 'Python', level: 4 },
    { name: '数据分析', level: 3 },
    { name: '英语交流', level: 2 },
  ],
  wants: ['摄影', '产品设计', '羽毛球'],
  interests: ['科研', 'AI', '徒步', '摄影', '桌游'],
}

const tabs = [
  { key: 'posts', label: '发布' },
  { key: 'reviews', label: '评价' },
]

const detailUserId = '10086'

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
  author?: {
    name?: string
  }
}

function getPostId(post: ProfilePost) {
  return String(post.id || post._id || post.title)
}

function mergePendingPost(posts: ProfilePost[]) {
  const pending = Taro.getStorageSync('pendingPost')
  if (!pending?.title) return posts

  const pendingId = getPostId(pending)
  const exists = posts.some((post) => getPostId(post) === pendingId)
  return exists ? posts : [pending, ...posts]
}

function isUserPost(post: ProfilePost) {
  return post.userId === 'user_chen' || post.author?.name === user.name
}

export default function UserDetail() {
  const [following, setFollowing] = useState(false)
  const [activeTab, setActiveTab] = useState('posts')
  const [posts, setPosts] = useState<ProfilePost[]>([])
  const [loadingPosts, setLoadingPosts] = useState(true)

  const toast = (title: string) => Taro.showToast({ title, icon: 'none' })
  const handleBack = () => Taro.navigateBack()
  const goSkillDetail = (skillName: string) => {
    const skillId = SKILL_ID_BY_NAME[skillName] || encodeURIComponent(skillName)
    Taro.navigateTo({ url: `/pages/skill-detail/index?userId=${encodeURIComponent(detailUserId)}&skillId=${encodeURIComponent(skillId)}` })
  }

  useDidShow(() => {
    let alive = true

    async function loadPosts() {
      setLoadingPosts(true)
      try {
        const data = await getPosts({ page: 0 })
        if (!alive) return
        setPosts(mergePendingPost((data || []).filter(isUserPost)))
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
        <View className='avatar' />
        <View className='profile-main'>
          <View className='name-row'>
            <Text className='user-name'>{user.name}</Text>
            {user.verified && <Text className='verify-badge'>✓</Text>}
            <Text className='verify-text'>已认证</Text>
          </View>
          <Text className='school-line'>{user.school} · {user.major}</Text>
          <Text className='bio'>{user.bio}</Text>
        </View>
      </View>

      <View className='stat-row'>
        {user.stats.map(item => (
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
        <View className='primary-btn' onClick={() => toast('发消息')}>
          <Text className='msg-icon'>▣</Text>
          <Text>发消息</Text>
        </View>
        <View
          className={following ? 'secondary-btn following' : 'secondary-btn'}
          onClick={() => setFollowing(!following)}
        >
          <Text className='follow-icon'>♙</Text>
          <Text>{following ? '已关注' : '关注TA'}</Text>
        </View>
      </View>

      <View className='info-card'>
        <View className='section-title blue'>
          <Text>我会</Text>
        </View>
        <View className='chip-wrap'>
          {user.skillChips.map(skill => (
            <View className={skill.featured ? 'skill-chip gold' : 'skill-chip'} key={skill.name} onClick={() => goSkillDetail(skill.name)}>
              <Text>{skill.name}</Text>
              <Text className='chip-level'>Lv.{skill.level}</Text>
              {skill.featured && <Text className='crown'>♛</Text>}
            </View>
          ))}
        </View>
      </View>

      <View className='info-card compact'>
        <View className='section-title orange'>
          <Text>我想学</Text>
        </View>
        <View className='chip-wrap'>
          {user.wants.map(item => (
            <Text className='want-chip' key={item}>{item}</Text>
          ))}
        </View>
      </View>

      <View className='info-card compact'>
        <View className='section-title blue'>
          <Text>兴趣标签</Text>
        </View>
        <View className='chip-wrap'>
          {user.interests.map(item => (
            <Text className='interest-chip' key={item}>{item}</Text>
          ))}
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
                onClick={() => Taro.navigateTo({ url: `/pages/post-detail/index?id=${encodeURIComponent(getPostId(post))}` })}
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
                  <Text>♥ {post.likes || 0}</Text>
                  <Text>评论 {post.comments || 0}</Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {activeTab === 'reviews' && (
          <View className='empty-state'>
            <Text>暂无收到的评价</Text>
          </View>
        )}
      </View>

      <View className='safe-bottom' />
    </ScrollView>
  )
}
