import Taro from '@tarojs/taro'
import { CURRENT_USER } from './mock'

export type PublicSkill = {
  id: string
  userId: string
  name: string
  level: number
  intro: string
  tags: string[]
  proofCount: number
  workCount: number
}

export type PublicPost = {
  id: string
  authorId: string
  authorName: string
  title: string
  summary: string
  content: string
  tags: string[]
  visibility: 'public' | 'private'
  likeCount: number
  commentCount: number
  createdAt: string
}

export type PublicReview = {
  id: string
  userId: string
  reviewerId: string
  reviewerName: string
  reviewerAvatar?: string
  rating: number
  tags: string[]
  content: string
  relatedType: string
  relatedTitle: string
  createdAt: string
}

export type PublicUser = {
  id: string
  name: string
  avatar?: string
  verified: boolean
  school: string
  college?: string
  major?: string
  grade?: string
  campus?: string
  intro?: string
  canTeach: PublicSkill[]
  wantToLearn: string[]
  interests: string[]
  followerCount: number
  followingCount: number
}

export type PublicRelation = {
  userId: string
  targetUserId: string
  isFollowing: boolean
  isFollower: boolean
  isMutual: boolean
  isSpecial: boolean
  isBlocked: boolean
}

export const PUBLIC_RELATION_STORAGE_KEY = 'publicUserRelations'

export const PUBLIC_USERS: PublicUser[] = [
  {
    id: '10086',
    name: '陈同学',
    verified: true,
    school: '浙江大学',
    college: '计算机学院',
    major: '计算机科学',
    grade: '研一',
    campus: '紫金港',
    intro: '擅长 Python 和数据分析，想找摄影搭子，也欢迎一起交流 AI 工具。',
    canTeach: [],
    wantToLearn: ['摄影', '产品设计', '羽毛球'],
    interests: ['科研', 'AI', '徒步', '摄影', '桌游'],
    followerCount: 86,
    followingCount: 42,
  },
  {
    id: 'u1',
    name: '科研小达人',
    verified: true,
    school: '浙江大学',
    college: '计算机学院',
    major: '人工智能',
    grade: '研一',
    campus: '紫金港',
    intro: '热爱编程和数据分析，擅长 Python 和机器学习，正在做 NLP 相关课题，欢迎交流。',
    canTeach: [],
    wantToLearn: ['摄影', '产品设计'],
    interests: ['编程', '数据分析', 'Python'],
    followerCount: 89,
    followingCount: 30,
  },
  {
    id: 'u_photo',
    name: '光影捕手',
    verified: false,
    school: '浙江大学',
    college: '艺术学院',
    major: '视觉传达',
    grade: '大二',
    campus: '紫金港',
    intro: '周末喜欢扫街和拍校园，也愿意交流构图、修图和器材选择。',
    canTeach: [],
    wantToLearn: ['AI 工具', '产品设计'],
    interests: ['摄影', '校园活动', '设计'],
    followerCount: 120,
    followingCount: 45,
  },
  {
    id: 'u_math',
    name: '上岸锦鲤',
    verified: true,
    school: '浙江大学',
    college: '数学科学学院',
    major: '数学与应用数学',
    grade: '研一',
    campus: '玉泉',
    intro: '整理考研数学和升学经验，喜欢把复杂问题拆成清晰步骤。',
    canTeach: [],
    wantToLearn: ['英语口语', '论文写作'],
    interests: ['升学', '数学', '学习方法'],
    followerCount: 76,
    followingCount: 28,
  },
  {
    id: 'u_career',
    name: '实习记录员',
    verified: false,
    school: '浙江大学',
    college: '管理学院',
    major: '信息管理',
    grade: '大三',
    campus: '紫金港',
    intro: '关注实习、简历和面试复盘，愿意分享求职准备资料。',
    canTeach: [],
    wantToLearn: ['数据分析', '演讲表达'],
    interests: ['实习', '求职', '项目复盘'],
    followerCount: 64,
    followingCount: 39,
  },
  {
    id: 'u_boardgame',
    name: '桌游召集人',
    verified: false,
    school: '浙江大学',
    college: '外国语学院',
    major: '英语',
    grade: '大二',
    campus: '西溪',
    intro: '喜欢桌游和英语交流，常组织轻松的周末局。',
    canTeach: [],
    wantToLearn: ['摄影', 'Python'],
    interests: ['桌游', '英语交流', '社交'],
    followerCount: 35,
    followingCount: 22,
  },
  {
    id: 'u_frontend',
    name: '前端小结',
    verified: true,
    school: '浙江大学',
    college: '计算机学院',
    major: '软件工程',
    grade: '大三',
    campus: '玉泉',
    intro: '喜欢记录前端学习笔记，正在练 React 和小程序开发。',
    canTeach: [],
    wantToLearn: ['产品设计', '后端开发'],
    interests: ['前端', '小程序', '设计系统'],
    followerCount: 52,
    followingCount: 31,
  },
]

export const PUBLIC_SKILLS: PublicSkill[] = [
  {
    id: 'ai-tools',
    userId: '10086',
    name: 'AI工具',
    level: 5,
    intro: '熟练使用各类 AI 工具辅助科研、写作和开发。',
    tags: ['Prompt', '论文写作', '科研效率'],
    proofCount: 2,
    workCount: 1,
  },
  {
    id: 'python',
    userId: '10086',
    name: 'Python',
    level: 4,
    intro: '熟练使用 Python 进行数据分析、机器学习与 Web 开发。',
    tags: ['数据分析', 'Django', 'Flask'],
    proofCount: 1,
    workCount: 1,
  },
  {
    id: 'data-analysis',
    userId: '10086',
    name: '数据分析',
    level: 3,
    intro: '具备数据清洗、可视化和建模基础能力。',
    tags: ['Excel', 'Python', 'ECharts'],
    proofCount: 0,
    workCount: 1,
  },
  {
    id: 'english-communication',
    userId: '10086',
    name: '英语交流',
    level: 2,
    intro: '可以进行日常英语交流、表达纠错和写作修改。',
    tags: ['口语', '写作', '表达纠错'],
    proofCount: 0,
    workCount: 0,
  },
  {
    id: 'python',
    userId: 'u1',
    name: 'Python',
    level: 4,
    intro: '可以独立完成脚本、数据分析和简单机器学习项目。',
    tags: ['Python', '数据分析', '自动化'],
    proofCount: 2,
    workCount: 1,
  },
  {
    id: 'data-analysis',
    userId: 'u1',
    name: '数据分析',
    level: 3,
    intro: '熟悉 pandas、可视化和课程作业分析思路。',
    tags: ['pandas', '可视化', '课程作业'],
    proofCount: 1,
    workCount: 1,
  },
  {
    id: 'photography',
    userId: 'u_photo',
    name: '摄影',
    level: 4,
    intro: '擅长校园人像、活动记录和基础修图流程。',
    tags: ['构图', '修图', '校园摄影'],
    proofCount: 1,
    workCount: 3,
  },
  {
    id: 'math-review',
    userId: 'u_math',
    name: '考研数学',
    level: 4,
    intro: '能帮助梳理数学复习路线和错题整理方法。',
    tags: ['升学', '数学', '复习规划'],
    proofCount: 1,
    workCount: 0,
  },
  {
    id: 'frontend',
    userId: 'u_frontend',
    name: '小程序前端',
    level: 3,
    intro: '熟悉 React/Taro 基础页面开发和组件拆分。',
    tags: ['Taro', 'React', '小程序'],
    proofCount: 1,
    workCount: 2,
  },
]

export const PUBLIC_POSTS: PublicPost[] = [
  {
    id: '1',
    authorId: '10086',
    authorName: '陈同学',
    title: '如何用 Python 高效完成数据分析？',
    summary: '整理了课程作业和科研数据处理中常用的分析流程，适合刚开始接触 pandas 的同学。',
    content: '这篇笔记整理了从明确问题、清洗数据、建立分析字段到输出可视化结果的一套流程。',
    tags: ['Python', '数据分析'],
    visibility: 'public',
    likeCount: 128,
    commentCount: 32,
    createdAt: '2天前',
  },
  {
    id: '4',
    authorId: '10086',
    authorName: '陈同学',
    title: 'AI 工具如何辅助论文写作流程',
    summary: '从文献整理、提纲生成到初稿润色，分享一套适合课程论文和组会汇报的 AI 使用方式。',
    content: 'AI 不能替代思考，但可以帮助提高资料整理和初稿组织效率。',
    tags: ['AI', '论文写作'],
    visibility: 'public',
    likeCount: 67,
    commentCount: 23,
    createdAt: '1周前',
  },
  {
    id: 'u1p1',
    authorId: 'u1',
    authorName: '科研小达人',
    title: 'NLP课程笔记：Transformer原理详解',
    summary: '整理了注意力机制、编码器结构和应用场景，适合刚接触 NLP 的同学。',
    content: '这份笔记重点解释自注意力机制、位置编码和 Transformer 在文本任务中的使用方式。',
    tags: ['编程', '数据分析', 'Python'],
    visibility: 'public',
    likeCount: 34,
    commentCount: 8,
    createdAt: '3天前',
  },
  {
    id: 'u1p2',
    authorId: 'u1',
    authorName: '科研小达人',
    title: '推荐几个好用的科研效率工具',
    summary: '从文献管理、笔记整理到 Prompt 模板，分享我常用的一套科研工作流。',
    content: '工具只是辅助，关键是让文献、想法和实验记录能持续沉淀。',
    tags: ['科研', 'AI工具', '效率'],
    visibility: 'public',
    likeCount: 56,
    commentCount: 12,
    createdAt: '1周前',
  },
  {
    id: '2',
    authorId: 'u_photo',
    authorName: '光影捕手',
    title: '浙大的春天太美了，求摄影搭子',
    summary: '最近樱花和郁金香都开了，想找喜欢摄影的同学一起扫校园。',
    content: '可以一起拍照、修图，也欢迎新手来互相练习。',
    tags: ['摄影', '兴趣搭子'],
    visibility: 'public',
    likeCount: 256,
    commentCount: 45,
    createdAt: '5天前',
  },
  {
    id: '3',
    authorId: 'u_math',
    authorName: '上岸锦鲤',
    title: '考研数学复习经验分享',
    summary: '从基础到强化，整理三个月数学一复习路线和错题复盘方法。',
    content: '最重要的是把错题归类，而不是只追求刷题数量。',
    tags: ['考研', '数学'],
    visibility: 'public',
    likeCount: 512,
    commentCount: 89,
    createdAt: '6天前',
  },
  {
    id: 'career-1',
    authorId: 'u_career',
    authorName: '实习记录员',
    title: '第一次实习面试前，我做了哪些准备',
    summary: '整理简历、项目复盘和常见问题清单，适合准备暑期实习的同学。',
    content: '准备面试时，我会把项目背景、个人贡献和可量化结果拆开复盘。',
    tags: ['实习', '求职', '面试'],
    visibility: 'public',
    likeCount: 88,
    commentCount: 16,
    createdAt: '4天前',
  },
  {
    id: 'front-1',
    authorId: 'u_frontend',
    authorName: '前端小结',
    title: 'Taro 小程序页面样式踩坑记录',
    summary: '记录最近做小程序时遇到的安全区、滚动容器和按钮遮挡问题。',
    content: '页面底部留白要按场景处理，普通页、固定输入框页和浮动按钮页不能套同一套值。',
    tags: ['Taro', '小程序', '前端'],
    visibility: 'public',
    likeCount: 49,
    commentCount: 9,
    createdAt: '2天前',
  },
]

export const PUBLIC_REVIEWS: PublicReview[] = [
  {
    id: 'review-u1-1',
    userId: 'u1',
    reviewerId: 'u_math',
    reviewerName: '上岸锦鲤',
    rating: 5,
    tags: ['讲得清楚', '有耐心'],
    content: 'Python 数据分析讲得很清楚，案例也很实用，帮我解决了课程作业里的大问题。',
    relatedType: 'skill',
    relatedTitle: 'Python 编程',
    createdAt: '5天前',
  },
  {
    id: 'review-photo-1',
    userId: 'u_photo',
    reviewerId: 'u1',
    reviewerName: '科研小达人',
    rating: 5,
    tags: ['准时', '氛围好'],
    content: '一起拍校园照片很轻松，还顺手教了我几个构图小技巧。',
    relatedType: 'activity',
    relatedTitle: '校园摄影',
    createdAt: '1周前',
  },
  {
    id: 'review-current-1',
    userId: '10086',
    reviewerId: 'u1',
    reviewerName: '科研小达人',
    rating: 5,
    tags: ['认真', '专业'],
    content: 'AI 工具流程整理得很系统，对论文写作很有帮助。',
    relatedType: 'skill',
    relatedTitle: 'AI工具',
    createdAt: '3天前',
  },
]

export const PUBLIC_RELATIONS: PublicRelation[] = [
  { userId: CURRENT_USER.id, targetUserId: 'u1', isFollowing: false, isFollower: true, isMutual: false, isSpecial: false, isBlocked: false },
  { userId: CURRENT_USER.id, targetUserId: 'u_photo', isFollowing: true, isFollower: false, isMutual: false, isSpecial: true, isBlocked: false },
  { userId: CURRENT_USER.id, targetUserId: 'u_math', isFollowing: true, isFollower: true, isMutual: true, isSpecial: false, isBlocked: false },
  { userId: CURRENT_USER.id, targetUserId: 'u_career', isFollowing: false, isFollower: true, isMutual: false, isSpecial: false, isBlocked: false },
]

export function normalizePublicUserId(id?: string | number, name?: string) {
  const raw = String(id || '').trim()
  if (raw && raw !== 'undefined') {
    if (raw === '1' && (name === '陈同学' || name === CURRENT_USER.name)) return CURRENT_USER.id
    if (/^\d+$/.test(raw) && raw !== CURRENT_USER.id) return `u${raw}`
    return raw
  }
  const user = PUBLIC_USERS.find((item) => item.name === name)
  return user?.id || ''
}

export function openUnifiedUserProfile(userId?: string | number, name?: string) {
  const normalizedId = normalizePublicUserId(userId, name)
  const isCurrentUser = normalizedId === CURRENT_USER.id || name === CURRENT_USER.name || name === '陈同学'
  if (isCurrentUser) {
    Taro.switchTab({ url: '/pages/profile/index' })
    return
  }
  const query = normalizedId
    ? `userId=${encodeURIComponent(normalizedId)}`
    : `name=${encodeURIComponent(name || '同学')}`
  Taro.navigateTo({ url: `/pages/user-detail/index?${query}` })
}

export function getPublicSkills(userId: string) {
  return PUBLIC_SKILLS.filter((skill) => skill.userId === userId)
}

export function getPublicPosts(userId: string, includePrivate = false) {
  return PUBLIC_POSTS.filter((post) => post.authorId === userId && (includePrivate || post.visibility === 'public'))
}

export function getPublicReviews(userId: string) {
  return PUBLIC_REVIEWS.filter((review) => review.userId === userId)
}

export function getPublicUser(userId?: string, name?: string): PublicUser {
  const normalizedId = normalizePublicUserId(userId, name)
  const found = PUBLIC_USERS.find((user) => user.id === normalizedId || user.name === name)
  const base = found || {
    id: normalizedId || `guest_${Date.now()}`,
    name: name || '同学',
    verified: false,
    school: '浙江大学',
    intro: '',
    canTeach: [],
    wantToLearn: [],
    interests: [],
    followerCount: 0,
    followingCount: 0,
  }
  return {
    ...base,
    canTeach: getPublicSkills(base.id),
  }
}

export function getUserMetaLine(user: PublicUser) {
  const parts = [user.school, user.college, user.major, user.grade, user.campus].filter(Boolean)
  return parts.length > 1 ? parts.join(' · ') : 'TA还没有完善更多资料'
}

export function getUserIntro(user: PublicUser) {
  return user.intro || 'TA还没有完善更多资料'
}

export function readPublicRelations() {
  const cached = Taro.getStorageSync(PUBLIC_RELATION_STORAGE_KEY)
  return Array.isArray(cached) && cached.length ? cached as PublicRelation[] : PUBLIC_RELATIONS
}

export function savePublicRelations(relations: PublicRelation[]) {
  Taro.setStorageSync(PUBLIC_RELATION_STORAGE_KEY, relations)
}

export function getRelationForUser(targetUserId: string) {
  const relations = readPublicRelations()
  return relations.find((item) => item.userId === CURRENT_USER.id && item.targetUserId === targetUserId) || {
    userId: CURRENT_USER.id,
    targetUserId,
    isFollowing: false,
    isFollower: false,
    isMutual: false,
    isSpecial: false,
    isBlocked: false,
  }
}

export function upsertRelation(targetUserId: string, patch: Partial<PublicRelation>) {
  const relations = readPublicRelations()
  const exists = relations.some((item) => item.userId === CURRENT_USER.id && item.targetUserId === targetUserId)
  const next = exists
    ? relations.map((item) => item.userId === CURRENT_USER.id && item.targetUserId === targetUserId ? { ...item, ...patch } : item)
    : [...relations, {
      userId: CURRENT_USER.id,
      targetUserId,
      isFollowing: false,
      isFollower: false,
      isMutual: false,
      isSpecial: false,
      isBlocked: false,
      ...patch,
    }]
  savePublicRelations(next)
  return next
}

export function getFollowersForUser(userId: string) {
  const pool = ['u1', 'u_photo', 'u_math', 'u_career', 'u_boardgame', 'u_frontend', '10086']
  return pool.filter((id) => id !== userId).slice(0, userId === 'u_photo' ? 4 : 3).map((id) => getPublicUser(id))
}

export function getFollowingForUser(userId: string) {
  const pool = ['u_math', 'u_photo', 'u_frontend', 'u_boardgame', 'u1', 'u_career']
  return pool.filter((id) => id !== userId).slice(0, userId === 'u1' ? 4 : 3).map((id) => getPublicUser(id))
}

export function setPendingPublicPost(post: PublicPost, author: PublicUser) {
  Taro.setStorageSync('pendingPost', {
    id: post.id,
    title: post.title,
    excerpt: post.summary,
    content: post.content || post.summary,
    tags: post.tags,
    authorId: post.authorId,
    userId: post.authorId,
    visibility: post.visibility,
    likeCount: post.likeCount,
    commentCount: post.commentCount,
    likes: post.likeCount,
    comments: post.commentCount,
    createdAt: post.createdAt,
    author: {
      id: author.id,
      userId: author.id,
      name: author.name,
      avatar: author.avatar || '',
      college: author.college || '浙江大学',
      grade: author.grade || '在读',
      verified: author.verified,
    },
  })
}
