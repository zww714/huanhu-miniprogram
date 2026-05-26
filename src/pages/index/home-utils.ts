/**
 * 首页工具函数 & 类型定义
 * 从 index.tsx 拆出的纯函数和数据
 */

// ============ 类型定义 ============
export type SkillItem = {
  name: string
  level?: number
  desc?: string
}

export type SkillUser = {
  id?: string | number
  _id?: string
  name?: string
  avatar?: string
  college?: string
  major?: string
  grade?: string
  campus?: string
  verified?: boolean
  match?: number
  matchRate?: number
  bio?: string
  intro?: string
  type?: string
  can?: SkillItem[]
  skills?: SkillItem[]
  canTeach?: Array<string | SkillItem>
  want?: string[]
  learnWants?: string[]
  wantToLearn?: string[]
  interests?: string[]
  lookingFor?: string
  stats?: {
    skills?: number
    likes?: number
    completed?: number
  }
  tags?: string[]
  [key: string]: any
}

export type Activity = {
  id?: string | number
  _id?: string
  title?: string
  organizer?: string
  time?: string
  location?: string
  cover?: string
  participants?: number
  participantCount?: number
  maxParticipants?: number
  category?: string
  tags?: string[]
  status?: string
  [key: string]: any
}

// ============ 常量 ============
export const SKILL_FILTERS = ['全部', '热门', 'AI工具', 'Python', '数据分析', '设计', '考研']
export const PARTNER_FILTERS = ['全部', '运动', '学习', '摄影', '桌游', '音乐', '旅行']
export const ACTIVITY_FILTERS = ['全部', '热门', '讲座', '比赛', '工作坊', '志愿', '社团']
export const SEARCH_SUGGESTIONS = ['Python', '机器学习', '摄影搭子', '论文降重', 'AI工具', '校园活动']

// ============ 首页常量 ============
export const TABS = ['技能交换', '兴趣搭子', '社区活动']

export const TODAY_RECOMMENDATIONS = [
  {
    id: 'hot-skill', label: '本周热门技能', title: 'Python入门',
    desc: '1.2k 人想学', badge: 'TOP', tone: 'hot', category: 'Python',
    detail: '从基础语法到数据分析入门，适合想快速完成课程作业和科研数据处理的同学。',
    user: { id: 'u1', name: '科研小达人', avatar: '', college: '计算机学院', grade: '研一' },
  },
  {
    id: 'new-help', label: '最新求助', title: '论文降重技巧求助',
    desc: '18分钟前 · 计算机学院', badge: 'NEW', tone: 'new', category: '考研',
    detail: '同学正在寻找论文表达优化、引用整理和重复率检查经验，适合有写作经验的同学响应。',
    user: { id: 'u_math', name: '上岸锦鲤', avatar: '', college: '数学学院', grade: '研一' },
  },
  {
    id: 'match', label: '高匹配同学', title: '326 位同学',
    desc: '与你技能高度匹配', badge: '', tone: 'match', category: '热门',
    detail: '系统根据你会的技能、想学内容和兴趣标签推荐高匹配同学，可直接发起聊天。',
    user: { id: 'u_photo', name: '光影捕手', avatar: '', college: '艺术学院', grade: '大二' },
  },
]

export const HOT_TOPICS = [
  {
    id: 'library-seat', badge: '热', title: '浙大图书馆自习位拼友（可固定）',
    stats: '126 讨论 · 89 收藏',
    detail: '寻找固定自习搭子，主要集中在紫金港图书馆和西区教学楼，适合备考、论文和课程复习同学。',
    user: { id: 'u_frontend', name: '前端小结', avatar: '', college: '计算机学院', grade: '大三' },
  },
  {
    id: 'exam-school', badge: '新', title: '# 考研择校交流互助帖',
    stats: '642 讨论 · 312 收藏',
    detail: '围绕择校、复习节奏、资料整理和面试经验交流，适合升学方向同学互相补信息差。',
    user: { id: 'u_math', name: '上岸锦鲤', avatar: '', college: '数学学院', grade: '研一' },
  },
]

// ============ 工具函数 ============
export function textOf(value: unknown) {
  if (value === null || value === undefined) return ''
  if (typeof value === 'object') return JSON.stringify(value)
  return String(value)
}

export function lower(value: unknown) {
  return textOf(value).toLowerCase()
}

export function includesText(value: unknown, keyword: string) {
  return lower(value).includes(keyword)
}

export function getRecordId(item: { id?: string | number; _id?: string; name?: string }) {
  return (item.id ?? item._id ?? item.name ?? '').toString()
}

export function firstChar(name?: string) {
  return (name || '?').charAt(0)
}

export function isRenderableImage(src?: string) {
  return !!src && src.length > 20 && !src.startsWith('linear-gradient')
}

export function normalizeSkill(item: string | SkillItem): SkillItem {
  return typeof item === 'string' ? { name: item } : item
}

export function userSkills(user: SkillUser) {
  const source = user.can?.length ? user.can : user.skills?.length ? user.skills : user.canTeach || []
  return source.map(normalizeSkill)
}

export function userWants(user: SkillUser) {
  return (user.wantToLearn?.length ? user.wantToLearn : user.want?.length ? user.want : user.learnWants || [])
}

export function userInterestLabels(user: SkillUser) {
  return user.interests || user.tags || []
}

export function getUserName(user: SkillUser) {
  return user.name || '同学'
}

export function getUserCampus(user: SkillUser, index = 0) {
  return user.campus || ''
}

export function getUserCollege(user: SkillUser) {
  return user.college || user.major || ''
}

export function getUserIntro(user: SkillUser) {
  return user.intro || user.bio || ''
}

export function getMatchRate(user: SkillUser, index = 0) {
  return user.matchRate ?? user.match ?? 0
}

export function getCompletedCount(user: SkillUser, index = 0) {
  return typeof user.stats?.completed === 'number' ? user.stats.completed : 0
}

export function getActivityCampus(activity: Activity) {
  return activity.location || activity.campus || ''
}

export function userMatchesKeyword(user: SkillUser, keyword: string) {
  if (!keyword) return true
  return (
    includesText(user.name, keyword) ||
    includesText(user.college, keyword) ||
    includesText(user.intro, keyword) ||
    includesText(user.bio, keyword) ||
    userSkills(user).some((s) => includesText(s.name, keyword)) ||
    userWants(user).some((w) => includesText(w, keyword)) ||
    userInterestLabels(user).some((t) => includesText(t, keyword))
  )
}

export function activityMatchesKeyword(activity: Activity, keyword: string) {
  if (!keyword) return true
  return (
    includesText(activity.title, keyword) ||
    includesText(activity.organizer, keyword) ||
    includesText(activity.location, keyword) ||
    includesText(activity.category, keyword) ||
    (activity.tags || []).some((t) => includesText(t, keyword))
  )
}

// ============ Pending data merge ============
export function mergePendingSkill(users: SkillUser[]) {
  const pending = wx.getStorageSync('myPendingSkills')
  if (!pending?.type) return users
  const pendingId = `pending_${pending.name}`
  const exists = users.some((u) => getRecordId(u) === pendingId || u.name === pending.name)
  if (pending.type === 'can') {
    const nextUser: SkillUser = {
      id: pendingId, name: pending.name,
      can: [{ name: pending.name, level: Number(pending.level || 3) }],
      grade: '刚刚发布', type: 'pending',
    }
    return exists ? users : [nextUser, ...users]
  }
  if (pending.type === 'want') {
    const nextUser: SkillUser = {
      id: pendingId, name: pending.name,
      want: [pending.name], grade: '刚刚发布', type: 'pending',
    }
    return exists ? users : [nextUser, ...users]
  }
  return users
}

export function mergePendingPartner(partners: SkillUser[]) {
  const pending = wx.getStorageSync('myPendingSkills')
  if (!pending) return partners
  const pendingId = `pending_${pending.name}`
  const exists = partners.some((u) => getRecordId(u) === pendingId || u.name === pending.name)
  if (!exists && pending.name) {
    return [
      { id: pendingId, name: pending.name, tags: [pending.name], grade: '刚刚发布', type: 'pending' } as SkillUser,
      ...partners,
    ]
  }
  return partners
}

export function mergePendingActivity(activities: Activity[]) {
  const pending = wx.getStorageSync('myPendingActivity')
  if (!pending?.title) return activities
  const pendingId = `pending_${pending.title}`
  const exists = activities.some((a) => a.id === pendingId || a._id === pendingId)
  return exists ? activities : [{ ...pending, id: pendingId }, ...activities]
}
