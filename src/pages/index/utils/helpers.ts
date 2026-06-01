// ========================================
// 首页纯工具函数
// 不含任何 React 渲染逻辑或组件定义
// ========================================

import Taro from "@tarojs/taro"
import type { SkillItem, SkillUser, Activity } from "./constants"

export function textOf(value: unknown) {
  return String(value || "").trim()
}

export function lower(value: unknown) {
  return textOf(value).toLowerCase()
}

export function includesText(value: unknown, keyword: string) {
  return !!keyword && lower(value).includes(keyword)
}

export function getRecordId(item: { id?: string | number; _id?: string; name?: string }) {
  return String(item.id || item._id || item.name || "")
}

export function firstChar(name?: string) {
  return name ? name.charAt(0) : '同'
}

export function isRenderableImage(src?: string) {
  return !!src && !src.startsWith("linear-gradient") && !src.includes("/assets/avatar.png")
}

export function normalizeSkill(item: string | SkillItem): SkillItem {
  return typeof item === "string" ? { name: item } : item
}

export function userSkills(user: SkillUser) {
  const raw = user.canTeach?.length ? user.canTeach : user.can?.length ? user.can : user.skills || []
  return raw
    .map(normalizeSkill)
    .filter((skill) => !!skill?.name)
    .map((skill) => ({
      ...skill,
      level: Number((skill.level as any)?.$numberInt || skill.level || 0),
    }))
}

export function userWants(user: SkillUser) {
  return (user.wantToLearn?.length ? user.wantToLearn : user.want?.length ? user.want : user.learnWants || [])
    .filter(Boolean)
    .map(String)
}

export function userInterestLabels(user: SkillUser) {
  return Array.from(new Set([...(user.interests || []), ...(user.tags || [])].filter(Boolean).map(String)))
}

export function getUserName(user: SkillUser) {
  return user.name || '同学'
}

export function getUserCampus(user: SkillUser, index = 0) {
  return user.campus || ['紫金港校区', '玉泉校区', '西溪校区', '华家池校区', '之江校区'][index % 5]
}

export function getUserCollege(user: SkillUser) {
  if (user.college && user.college !== '浙江大学') return user.college
  if (lower(user.major).includes('计算机')) return '计算机科学与技术学院'
  if (lower(user.major).includes('外语') || lower(user.major).includes('英语')) return '外国语学院'
  if (lower(user.major).includes('材料')) return '材料学院'
  if (lower(user.major).includes('电')) return '电气工程学院'
  return user.college || '计算机科学与技术学院'
}

export function getUserIntro(user: SkillUser) {
  return user.intro || user.bio || user.lookingFor || '喜欢拆解技术，擅长用清晰步骤解决问题。'
}

export function getMatchRate(user: SkillUser, index = 0) {
  return Number(user.matchRate || user.match || [92, 88, 90][index % 3])
}

export function getCompletedCount(user: SkillUser, index = 0) {
  return Number(user.completedCount || user.exchangeCount || [23, 16, 12][index % 3])
}

export function getActivityCampus(activity: Activity) {
  if (activity.campus) return activity.campus
  const location = activity.location || ""
  if (location.includes('玉泉')) return '玉泉校区'
  if (location.includes('西溪')) return '西溪校区'
  if (location.includes('华家池')) return '华家池校区'
  return '紫金港校区'
}

export function userMatchesKeyword(user: SkillUser, keyword: string) {
  if (!keyword) return true
  const pool = [
    getUserName(user),
    getUserCollege(user),
    user.major,
    user.grade,
    user.campus,
    getUserIntro(user),
    ...userSkills(user).map((skill) => skill.name),
    ...userWants(user),
    ...userInterestLabels(user),
  ]
  return pool.some((item) => includesText(item, keyword))
}

export function activityMatchesKeyword(activity: Activity, keyword: string) {
  if (!keyword) return true
  const pool = [
    activity.title,
    activity.description,
    activity.category,
    activity.location,
    activity.organizer,
    ...(activity.tags || []),
  ]
  return pool.some((item) => includesText(item, keyword))
}

export function mergePendingSkill(users: SkillUser[]) {
  const pending = Taro.getStorageSync("pendingSkillNeed")
  if (!pending?.name) return users
  return users.map((user, index) => {
    const isCurrentUser = user._id === "user_chen" || index === 0
    if (!isCurrentUser) return user
    if (pending.type === "can") {
      const level = Number(pending.level || 3)
      const can = userSkills(user).filter((skill) => skill.name !== pending.name)
      return {
        ...user,
        can: [...can, { name: pending.name, level }],
        skills: [...(user.skills || []).filter((skill) => skill.name !== pending.name), {
          name: pending.name,
          level,
          desc: pending.desc || "",
        }],
      }
    }
    const wants = userWants(user).filter((item) => item !== pending.name)
    return {
      ...user,
      want: [...wants, pending.name],
      learnWants: [...wants, pending.name],
    }
  })
}

export function mergePendingPartner(partners: SkillUser[]) {
  const pending = Taro.getStorageSync("pendingPartnerProfile")
  if (!pending?.bio && !pending?.interests?.length) return partners
  return partners.map((user, index) => {
    const isCurrentUser = user._id === "user_chen" || index === 0
    if (!isCurrentUser) return user
    const interests = Array.from(new Set([...(user.interests || []), ...(pending.interests || [])]))
    return {
      ...user,
      bio: pending.bio || user.bio,
      interests,
      tags: Array.from(new Set([...(user.tags || []), ...interests])),
      lookingFor: pending.lookingFor || user.lookingFor || `${interests[0] || '兴趣'}搭子`,
    }
  })
}

export function mergePendingActivity(activities: Activity[]) {
  const pending = Taro.getStorageSync("pendingActivity")
  if (!pending?.title) return activities
  const pendingId = pending.id || pending._id || `pending_${pending.title}`
  const exists = activities.some((activity) => (activity.id || activity._id || activity.title) === pendingId)
  return exists ? activities : [{ ...pending, id: pendingId }, ...activities]
}