import { useEffect, useMemo, useState } from 'react'
import Taro, { useLoad } from '@tarojs/taro'
import { ScrollView, Text, View } from '@tarojs/components'
import { getActivities, getPosts, getUsers } from '../../../api'
import './index.scss'

function includesInterest(values: unknown[], interestName: string) {
  const keyword = interestName.trim()
  if (!keyword) return false
  return values.filter(Boolean).some((value) => String(value).includes(keyword))
}

export default function InterestDetail() {
  const [interestName, setInterestName] = useState('')
  const [users, setUsers] = useState<any[]>([])
  const [posts, setPosts] = useState<any[]>([])
  const [activities, setActivities] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useLoad((options) => {
    setInterestName(decodeURIComponent(String(options?.interestName || '')))
  })

  useEffect(() => {
    let alive = true
    setLoading(true)
    Promise.all([
      getUsers({ page: 0 }).catch(() => []),
      getPosts({ page: 0 }).catch(() => []),
      getActivities({ page: 0 }).catch(() => []),
    ]).then(([userData, postData, activityData]) => {
      if (!alive) return
      setUsers(Array.isArray(userData) ? userData : [])
      setPosts(Array.isArray(postData) ? postData : [])
      setActivities(Array.isArray(activityData) ? activityData : [])
    }).finally(() => {
      if (alive) setLoading(false)
    })
    return () => { alive = false }
  }, [])

  const relatedPartners = useMemo(() => users.filter((user) => includesInterest([
    ...(user.interests || []),
    ...(user.wantToLearn || user.learnWants || user.want || []),
    user.lookingFor,
    user.bio,
    user.intro,
  ], interestName)), [interestName, users])

  const relatedPosts = useMemo(() => posts.filter((post) => includesInterest([
    post.title,
    post.summary,
    post.excerpt,
    post.content,
    ...(post.tags || []),
  ], interestName)), [interestName, posts])

  const relatedActivities = useMemo(() => activities.filter((activity) => includesInterest([
    activity.title,
    activity.description,
    activity.location,
    ...(activity.tags || []),
  ], interestName)), [activities, interestName])

  const handleBack = () => Taro.navigateBack()
  const goPost = (postId: string) => Taro.navigateTo({ url: `/sp-content/pages/post-detail/index?postId=${encodeURIComponent(postId)}` })
  const goChat = (id: string, name: string) => Taro.navigateTo({
    url: `/sp-social/pages/contact-request/index?userId=${encodeURIComponent(id)}&name=${encodeURIComponent(name)}&category=${encodeURIComponent(interestName || '兴趣搭子')}&source=interest-detail`,
  })

  return (
    <View className='interest-page'>
      <View className='interest-nav'>
        <Text className='nav-action' onClick={handleBack}>‹</Text>
        <Text className='nav-title'>兴趣详情</Text>
        <Text className='nav-action'>•••</Text>
      </View>

      <ScrollView scrollY className='interest-scroll' showScrollbar={false} enhanced bounces={false}>
        <View className='hero-card'>
          <Text className='interest-name'>{interestName || '兴趣'}</Text>
          <Text className='interest-intro'>以下内容来自真实用户、帖子和活动数据。</Text>
        </View>

        <View className='section-card'>
          <Text className='section-title'>相关搭子</Text>
          {relatedPartners.length ? relatedPartners.map((partner) => (
            <View className='partner-item' key={partner.id || partner._id}>
              <View className='partner-avatar'><Text>{String(partner.name || '同').charAt(0)}</Text></View>
              <View className='partner-main'>
                <Text className='item-title'>{partner.name || '同学'}</Text>
                <Text className='item-desc'>{partner.bio || partner.intro || partner.lookingFor || 'TA 还没有填写简介。'}</Text>
              </View>
              <View className='small-btn' onClick={() => goChat(partner.id || partner._id, partner.name || '同学')}><Text>联系</Text></View>
            </View>
          )) : <Text className='empty-line'>{loading ? '正在加载...' : '暂无相关搭子'}</Text>}
        </View>

        <View className='section-card'>
          <Text className='section-title'>相关帖子</Text>
          {relatedPosts.length ? relatedPosts.map((post) => (
            <View className='post-item' key={post.id || post._id} onClick={() => goPost(post.id || post._id)}>
              <Text className='item-title'>{post.title}</Text>
              <Text className='item-desc'>{post.summary || post.excerpt || post.content || '暂无摘要'}</Text>
              <View className='tag-row'>
                {(post.tags || []).slice(0, 3).map((tag: string) => <Text className='tag' key={tag}>{tag}</Text>)}
              </View>
            </View>
          )) : <Text className='empty-line'>{loading ? '正在加载...' : '暂无相关帖子'}</Text>}
        </View>

        <View className='section-card'>
          <Text className='section-title'>相关活动</Text>
          {relatedActivities.length ? relatedActivities.map((activity) => (
            <View className='activity-item' key={activity.id || activity._id}>
              <Text className='item-title'>{activity.title}</Text>
              <Text className='item-desc'>{[activity.time, activity.location].filter(Boolean).join(' · ') || activity.description || '暂无活动说明'}</Text>
              <View className='tag-row'>
                {(activity.tags || []).slice(0, 3).map((tag: string) => <Text className='tag' key={tag}>{tag}</Text>)}
              </View>
            </View>
          )) : <Text className='empty-line'>{loading ? '正在加载...' : '暂无相关活动'}</Text>}
        </View>

        <View className='bottom-space' />
      </ScrollView>
    </View>
  )
}
