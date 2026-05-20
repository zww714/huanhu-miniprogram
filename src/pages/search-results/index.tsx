import { useMemo, useState } from 'react'
import Taro, { useLoad } from '@tarojs/taro'
import { Image, Text, View } from '@tarojs/components'
import SearchBar from '../../components/common/SearchBar'
import { getActivities, getPartners, getUsers } from '../../utils/api'
import { openUnifiedUserProfile } from '../../utils/publicProfiles'
import './index.css'

type ResultItem = {
  id: string
  type: 'user' | 'partner' | 'activity'
  title: string
  desc: string
  avatar?: string
  tags?: string[]
}

function textOf(value: unknown) {
  return String(value || '').trim()
}

function matchKeyword(item: ResultItem, keyword: string) {
  if (!keyword) return true
  const pool = [item.title, item.desc, ...(item.tags || [])].join(' ').toLowerCase()
  return pool.includes(keyword.toLowerCase())
}

export default function SearchResults() {
  const [keyword, setKeyword] = useState('')
  const [results, setResults] = useState<ResultItem[]>([])
  const [loading, setLoading] = useState(true)

  useLoad(async (options) => {
    const nextKeyword = decodeURIComponent(String(options?.keyword || '')).trim()
    setKeyword(nextKeyword)
    try {
      const [users, partners, activities] = await Promise.all([
        getUsers({ page: 0, keyword: nextKeyword }),
        getPartners(),
        getActivities({ page: 0 }),
      ])
      const userItems: ResultItem[] = (users || []).slice(0, 8).map((user: any) => ({
        id: String(user.id || user._id || user.name || ''),
        type: 'user',
        title: user.name || '同学',
        desc: [user.school || '浙江大学', user.college, user.grade, user.intro || user.bio].filter(Boolean).join(' · '),
        avatar: user.avatar,
        tags: [...(user.interests || []), ...(user.wantToLearn || []), ...(user.tags || [])],
      }))
      const partnerItems: ResultItem[] = (partners || []).slice(0, 6).map((user: any) => ({
        id: String(user.id || user._id || user.name || ''),
        type: 'partner',
        title: user.name || '同学',
        desc: user.lookingFor || user.intro || user.bio || '兴趣搭子',
        avatar: user.avatar,
        tags: [...(user.interests || []), ...(user.tags || [])],
      }))
      const activityItems: ResultItem[] = (activities || []).slice(0, 6).map((activity: any) => ({
        id: String(activity.id || activity._id || activity.title || ''),
        type: 'activity',
        title: activity.title || '校园活动',
        desc: [activity.time, activity.location, activity.description].filter(Boolean).join(' · '),
        avatar: activity.cover,
        tags: activity.tags || [activity.category].filter(Boolean),
      }))
      setResults([...userItems, ...partnerItems, ...activityItems].filter((item) => matchKeyword(item, nextKeyword)))
    } catch (error) {
      console.warn('[SearchResults] load failed', error)
      setResults([
        { id: 'python', type: 'user', title: 'Python 入门互助', desc: '浙江大学 · 计算机学院 · 数据分析与课程作业', tags: ['Python', '数据分析'] },
        { id: 'photo', type: 'partner', title: '摄影搭子', desc: '周末校园扫街，欢迎新手一起练习', tags: ['摄影', '搭子'] },
        { id: 'activity', type: 'activity', title: 'AI 科研工作坊', desc: '紫金港校区 · 工具体验与小组讨论', tags: ['AI工具', '活动'] },
      ].filter((item) => matchKeyword(item, nextKeyword)))
    } finally {
      setLoading(false)
    }
  })

  const visibleResults = useMemo(() => results.filter((item) => matchKeyword(item, keyword.trim())), [keyword, results])

  const openResult = (item: ResultItem) => {
    if (item.type === 'activity') {
      Taro.navigateTo({ url: `/pages/activity-register/index?id=${encodeURIComponent(item.id)}&title=${encodeURIComponent(item.title)}` })
      return
    }
    openUnifiedUserProfile(item.id, item.title)
  }

  return (
    <View className='search-page'>
      <View className='search-header'>
        <SearchBar
          className='search-result-bar'
          value={keyword}
          placeholder='继续搜索'
          onInput={setKeyword}
          onConfirm={setKeyword}
        />
        <Text className='search-summary'>与“{keyword || '全部'}”相关的结果</Text>
      </View>

      <View className='search-list'>
        {loading ? (
          <View className='search-empty'><Text>正在搜索...</Text></View>
        ) : null}
        {!loading && !visibleResults.length ? (
          <View className='search-empty'><Text>没有找到相关内容，换个关键词试试</Text></View>
        ) : null}
        {visibleResults.map((item) => (
          <View className='search-card' key={`${item.type}_${item.id}`} onClick={() => openResult(item)}>
            <View className='search-avatar'>
              {item.avatar ? <Image className='search-avatar-img' src={item.avatar} mode='aspectFill' /> : <Text>{item.title.charAt(0)}</Text>}
            </View>
            <View className='search-main'>
              <View className='search-title-row'>
                <Text className='search-title'>{item.title}</Text>
                <Text className='search-type'>{item.type === 'activity' ? '活动' : item.type === 'partner' ? '搭子' : '同学'}</Text>
              </View>
              <Text className='search-desc' numberOfLines={2}>{item.desc}</Text>
              <View className='search-tags'>
                {(item.tags || []).slice(0, 3).map((tag) => <Text key={tag}>{tag}</Text>)}
              </View>
            </View>
          </View>
        ))}
      </View>
    </View>
  )
}
