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

const SEED_RATINGS: RatingRecord[] = []

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

export function getRatingSummary(userId: string, fallbackAverage = 0): RatingSummary {
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
