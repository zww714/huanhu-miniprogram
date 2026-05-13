import { useMemo, useState } from 'react'
import Taro, { useLoad } from '@tarojs/taro'
import { ScrollView, Text, View } from '@tarojs/components'
import { INTEREST_DETAILS } from '../../utils/mock'
import './index.css'

export default function InterestDetail() {
  const [interestName, setInterestName] = useState('')

  useLoad((options) => {
    setInterestName(decodeURIComponent(String(options?.interestName || '')))
  })

  const detail = useMemo(() => INTEREST_DETAILS[interestName], [interestName])

  const handleBack = () => Taro.navigateBack()
  const goPost = (postId: string) => Taro.navigateTo({ url: `/pages/post-detail/index?id=${encodeURIComponent(postId)}` })
  const goChat = (id: string, name: string) => Taro.navigateTo({
    url: `/pages/contact-request/index?userId=${encodeURIComponent(id)}&name=${encodeURIComponent(name)}&category=${encodeURIComponent(interestName || '兴趣搭子')}&source=interest-detail`,
  })

  if (!detail) {
    return (
      <View className='interest-page'>
        <View className='interest-nav'>
          <Text className='nav-action' onClick={handleBack}>‹</Text>
          <Text className='nav-title'>兴趣详情</Text>
          <Text className='nav-action'>•••</Text>
        </View>
        <View className='empty-card'>
          <Text className='empty-title'>暂未找到兴趣内容</Text>
          <Text className='empty-desc'>可以先返回我的页面，选择其他兴趣标签看看。</Text>
        </View>
      </View>
    )
  }

  return (
    <View className='interest-page'>
      <View className='interest-nav'>
        <Text className='nav-action' onClick={handleBack}>‹</Text>
        <Text className='nav-title'>兴趣详情</Text>
        <Text className='nav-action'>•••</Text>
      </View>

      <ScrollView scrollY className='interest-scroll' showScrollbar={false} enhanced bounces={false}>
        <View className='hero-card'>
          <Text className='interest-name'>{detail.name}</Text>
          <Text className='interest-intro'>{detail.intro}</Text>
        </View>

        <View className='section-card'>
          <Text className='section-title'>相关搭子</Text>
          {detail.partners.length ? detail.partners.map((partner) => (
            <View className='partner-item' key={partner.id}>
              <View className='partner-avatar'><Text>{partner.name.charAt(0)}</Text></View>
              <View className='partner-main'>
                <Text className='item-title'>{partner.name}</Text>
                <Text className='item-desc'>{partner.desc}</Text>
                <View className='tag-row'>
                  {partner.tags.map((tag) => <Text className='tag' key={tag}>{tag}</Text>)}
                </View>
              </View>
              <View className='small-btn' onClick={() => goChat(partner.id, partner.name)}><Text>联系</Text></View>
            </View>
          )) : <Text className='empty-line'>暂无相关搭子</Text>}
        </View>

        <View className='section-card'>
          <Text className='section-title'>相关帖子</Text>
          {detail.posts.length ? detail.posts.map((post) => (
            <View className='post-item' key={post.id} onClick={() => goPost(post.id)}>
              <Text className='item-title'>{post.title}</Text>
              <Text className='item-desc'>{post.excerpt}</Text>
              <View className='tag-row'>
                {post.tags.map((tag) => <Text className='tag' key={tag}>{tag}</Text>)}
              </View>
              <View className='meta-row'>
                <Text>♡ {post.likes}</Text>
                <Text>评论 {post.comments}</Text>
              </View>
            </View>
          )) : <Text className='empty-line'>暂无相关帖子</Text>}
        </View>

        <View className='section-card'>
          <Text className='section-title'>相关活动</Text>
          {detail.activities.length ? detail.activities.map((activity) => (
            <View className='activity-item' key={activity.id}>
              <Text className='item-title'>{activity.title}</Text>
              <Text className='item-desc'>{activity.time} · {activity.location}</Text>
              <View className='tag-row'>
                {activity.tags.map((tag) => <Text className='tag' key={tag}>{tag}</Text>)}
              </View>
            </View>
          )) : <Text className='empty-line'>暂无相关活动</Text>}
        </View>

        <View className='bottom-space' />
      </ScrollView>
    </View>
  )
}
