import Taro from '@tarojs/taro'
import { CURRENT_USER } from './mock'

export type RatingRecord = {
  id: string
  targetUserId: string
  targetUserName: string
  raterUserId: string
  raterUserName: string
  rating: number
  tags: string[]
  content: string
  relatedType: 'skill' | 'post' | 'activity' | 'chat' | 'profile'
  createdAt: string
  updatedAt: string
}

export type RatingSummary = {
  average: number
  count: number
  distribution: Record<1 | 2 | 3 | 4 | 5, number>
  latest: RatingRecord[]
}

const RATING_STORAGE_KEY = 'huanhuRatings'

const SEED_RATINGS: RatingRecord[] = [
  {
    id: 'seed-rating-1',
    targetUserId: CURRENT_USER.id,
    targetUserName: CURRENT_USER.name,
    raterUserId: 'u1',
    raterUserName: '科研小达人',
    rating: 5,
    tags: ['沟通顺畅', '很有帮助'],
    content: 'Python 思路讲得很清楚，给的资料也很实用。',
    relatedType: 'skill',
    createdAt: '2天前',
    updatedAt: '2天前',
  },
  {
    id: 'seed-rating-2',
    targetUserId: CURRENT_USER.id,
    targetUserName: CURRENT_USER.name,
    raterUserId: 'u_photo',
    raterUserName: '光影捕手',
    rating: 4.8,
    tags: ['准时靠谱', '体验不错'],
    content: '交流很顺畅，后续还想继续约项目复盘。',
    relatedType: 'profile',
    createdAt: '5天前',
    updatedAt: '5天前',
  },
  {
    id: 'seed-rating-3',
    targetUserId: '10086',
    targetUserName: '陈同学',
    raterUserId: 'u_math',
    raterUserName: '上岸锦鲤',
    rating: 4.6,
    tags: ['技能扎实'],
    content: '数据分析建议很具体，适合入门同学。',
    relatedType: 'post',
    createdAt: '1周前',
    updatedAt: '1周前',
  },
]

function readRatings(): RatingRecord[] {
  const saved = Taro.getStorageSync(RATING_STORAGE_KEY)
  if (Array.isArray(saved)) return saved
  Taro.setStorageSync(RATING_STORAGE_KEY, SEED_RATINGS)
  return SEED_RATINGS
}

function writeRatings(records: RatingRecord[]) {
  Taro.setStorageSync(RATING_STORAGE_KEY, records)
}

export function getRatingsForUser(userId: string) {
  return readRatings().filter((item) => item.targetUserId === userId)
}

export function getMyRatingForUser(userId: string) {
  return readRatings().find((item) => item.targetUserId === userId && item.raterUserId === CURRENT_USER.id)
}

export function getRatingSummary(userId: string, fallbackAverage = 4.8): RatingSummary {
  const records = getRatingsForUser(userId)
  const distribution: RatingSummary['distribution'] = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }

  records.forEach((item) => {
    const bucket = Math.max(1, Math.min(5, Math.round(item.rating))) as 1 | 2 | 3 | 4 | 5
    distribution[bucket] += 1
  })

  const average = records.length
    ? records.reduce((sum, item) => sum + item.rating, 0) / records.length
    : fallbackAverage

  return {
    average,
    count: records.length,
    distribution,
    latest: records.slice().reverse().slice(0, 3),
  }
}

export function saveRating(params: {
  targetUserId: string
  targetUserName: string
  rating: number
  tags: string[]
  content: string
  relatedType?: RatingRecord['relatedType']
}) {
  const now = '刚刚'
  const records = readRatings()
  const existingIndex = records.findIndex((item) => (
    item.targetUserId === params.targetUserId && item.raterUserId === CURRENT_USER.id
  ))
  const next: RatingRecord = {
    id: existingIndex >= 0 ? records[existingIndex].id : `rating-${Date.now()}`,
    targetUserId: params.targetUserId,
    targetUserName: params.targetUserName,
    raterUserId: CURRENT_USER.id,
    raterUserName: CURRENT_USER.name,
    rating: params.rating,
    tags: params.tags,
    content: params.content,
    relatedType: params.relatedType || 'profile',
    createdAt: existingIndex >= 0 ? records[existingIndex].createdAt : now,
    updatedAt: now,
  }

  if (existingIndex >= 0) records[existingIndex] = next
  else records.push(next)
  writeRatings(records)
  return next
}
