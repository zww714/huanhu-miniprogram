import { useMemo, useState } from 'react'
import Taro, { useDidShow, useLoad } from '@tarojs/taro'
import { Text, View } from '@tarojs/components'
import { CURRENT_USER } from '../../../utils/mock'
import { getRatingSummary } from '../../../utils/ratings'
import './index.css'

const STARS = [5, 4, 3, 2, 1]

export default function MyRatings() {
  const [target, setTarget] = useState({ userId: CURRENT_USER.id, name: CURRENT_USER.name })
  const [version, setVersion] = useState(0)

  useLoad((options) => {
    setTarget({
      userId: decodeURIComponent(String(options?.userId || CURRENT_USER.id)),
      name: decodeURIComponent(String(options?.name || CURRENT_USER.name)),
    })
  })

  useDidShow(() => setVersion((current) => current + 1))

  const summary = useMemo(() => getRatingSummary(target.userId, 4.8), [target.userId, version])
  const maxCount = Math.max(1, ...Object.values(summary.distribution))

  return (
    <View className='ratings-page'>
      <View className='summary-card'>
        <View>
          <Text className='summary-title'>{target.userId === CURRENT_USER.id ? '我的评分' : `${target.name}的评分`}</Text>
          <Text className='summary-desc'>来自技能交换、帖子互动和主页评价</Text>
        </View>
        <View className='score-box'>
          <Text className='score-number'>{summary.average.toFixed(1)}</Text>
          <Text className='score-stars'>★★★★★</Text>
          <Text className='score-count'>{summary.count || 0} 条评价</Text>
        </View>
      </View>

      <View className='dist-card'>
        <Text className='section-title'>星级分布</Text>
        {STARS.map((star) => {
          const count = summary.distribution[star as 1 | 2 | 3 | 4 | 5]
          const width = `${Math.max(8, Math.round((count / maxCount) * 100))}%`
          return (
            <View className='dist-row' key={star}>
              <Text className='dist-label'>{star}星</Text>
              <View className='dist-track'><View className='dist-fill' style={{ width }} /></View>
              <Text className='dist-count'>{count}</Text>
            </View>
          )
        })}
      </View>

      <View className='review-card'>
        <Text className='section-title'>最近评价</Text>
        {summary.latest.length ? summary.latest.map((item) => (
          <View className='review-item' key={item.id}>
            <View className='review-head'>
              <Text className='review-name'>{item.raterUserName}</Text>
              <Text className='review-score'>{item.rating.toFixed(1)} ★</Text>
            </View>
            <Text className='review-tags'>{item.tags.join(' · ') || '体验不错'}</Text>
            <Text className='review-content'>{item.content || '这位同学还没有写文字评价。'}</Text>
            <Text className='review-time'>{item.updatedAt}</Text>
          </View>
        )) : (
          <View className='empty-state'><Text>暂时还没有收到评价</Text></View>
        )}
      </View>
    </View>
  )
}
