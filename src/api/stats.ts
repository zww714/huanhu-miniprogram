/**
 * Real count helpers. If a count cannot be read from cloud data, callers show
 * 0 so the UI stays stable while keeping the real data chain for future users.
 */
import { initCloud, apiWarn, getUseCloud } from './base'

type OptionalNumber = number | undefined

async function countCollection(collectionName: string, where: Record<string, any>): Promise<OptionalNumber> {
  if (!getUseCloud()) return undefined
  try {
    await initCloud()
    const res = await wx.cloud.database().collection(collectionName).where(where).count()
    return Number(res.total || 0)
  } catch (e) {
    apiWarn(`[API] count ${collectionName} failed`, e)
    return undefined
  }
}

async function firstCount(
  candidates: Array<{ collectionName: string; where: Record<string, any> }>
): Promise<OptionalNumber> {
  for (const candidate of candidates) {
    const total = await countCollection(candidate.collectionName, candidate.where)
    if (typeof total === 'number') return total
  }
  return undefined
}

export async function getPostStats(postId: string): Promise<{
  hasRealStats: boolean
  likeCount?: number
  commentCount?: number
  favoriteCount?: number
}> {
  if (!postId) return { hasRealStats: false }
  const [likeCount, commentCount, favoriteCount] = await Promise.all([
    countCollection('likes', { targetType: 'post', targetId: postId, status: 'active' }),
    countCollection('comments', { postId, status: 'active' }),
    countCollection('favorites', { targetType: 'post', targetId: postId, status: 'active' }),
  ])
  return {
    hasRealStats: [likeCount, commentCount, favoriteCount].some((value) => typeof value === 'number'),
    likeCount,
    commentCount,
    favoriteCount,
  }
}

export async function getUserStats(userId: string): Promise<{
  hasRealStats: boolean
  skillCount?: number
  postCount?: number
  followerCount?: number
  followingCount?: number
}> {
  if (!userId) return { hasRealStats: false }
  const [skillCount, postCount, followerCount, followingCount] = await Promise.all([
    firstCount([
      { collectionName: 'user_skills', where: { userId, status: 'active' } },
      { collectionName: 'skills', where: { userId, status: 'active' } },
    ]),
    firstCount([
      { collectionName: 'posts', where: { authorId: userId, status: 'active' } },
      { collectionName: 'posts', where: { userId, status: 'active' } },
    ]),
    firstCount([
      { collectionName: 'follows', where: { targetUserId: userId, status: 'active' } },
      { collectionName: 'follows', where: { followingId: userId, status: 'active' } },
    ]),
    firstCount([
      { collectionName: 'follows', where: { userId, status: 'active' } },
      { collectionName: 'follows', where: { followerId: userId, status: 'active' } },
    ]),
  ])
  return {
    hasRealStats: [skillCount, postCount, followerCount, followingCount].some((value) => typeof value === 'number'),
    skillCount,
    postCount,
    followerCount,
    followingCount,
  }
}

export async function getActivityStats(activityId: string): Promise<{
  hasRealStats: boolean
  registrationCount?: number
}> {
  if (!activityId) return { hasRealStats: false }
  const registrationCount = await firstCount([
    { collectionName: 'activity_signups', where: { activityId, status: 'active' } },
    { collectionName: 'registrations', where: { activityId, status: 'active' } },
  ])
  return { hasRealStats: typeof registrationCount === 'number', registrationCount }
}
