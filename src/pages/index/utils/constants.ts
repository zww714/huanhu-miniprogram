// ========================================
// 首页常量、数据类型与模拟数据
// 纯数据定义，不包含任何渲染逻辑
// ========================================

// ============ Tab 配置 ============
export const TABS = ['技能交换', '兴趣搭子', '社区活动']
export const SKILL_FILTERS = ['全部', '热门', 'AI工具', 'Python', '数据分析', '设计', '考研']
export const PARTNER_FILTERS = ['全部', '运动', '学习', '摄影', '桌游', '音乐', '旅行']
export const ACTIVITY_FILTERS = ['全部', '热门', '讲座', '比赛', '工作坊', '志愿', '社团']

export const SEARCH_SUGGESTIONS = ['Python', '机器学习', '摄影搭子', '论文降重', 'AI工具', '校园活动']

// ============ 今日推荐 ============
export const TODAY_RECOMMENDATIONS = [
  {
    id: 'hot-skill',
    label: '本周热门技能',
    title: 'Python入门',
    desc: '1.2k 人想学',
    badge: 'TOP',
    tone: 'hot',
    category: 'Python',
    detail: '从基础语法到数据分析入门，适合想快速完成课程作业和科研数据处理的同学。',
    user: { id: 'u1', name: '科研小达人', avatar: '', college: '计算机学院', grade: '研一' },
  },
  {
    id: 'new-help',
    label: '最新求助',
    title: '论文降重技巧求助',
    desc: '18分钟前 · 计算机学院',
    badge: 'NEW',
    tone: 'new',
    category: '考研',
    detail: '同学正在寻找论文表达优化、引用整理和重复率检查经验，适合有写作经验的同学响应。',
    user: { id: 'u_math', name: '上岸锦鲤', avatar: '', college: '数学学院', grade: '研一' },
  },
  {
    id: 'match',
    label: '高匹配同学',
    title: '326 位同学',
    desc: '与你技能高度匹配',
    badge: '',
    tone: 'match',
    category: '热门',
    detail: '系统根据你会的技能、想学内容和兴趣标签推荐高匹配同学，可直接发起聊天。',
    user: { id: 'u_photo', name: '光影捕手', avatar: '', college: '艺术学院', grade: '大二' },
  },
]

// ============ 热门话题 ============
export const HOT_TOPICS = [
  {
    id: 'library-seat',
    badge: '热',
    title: '浙大图书馆自习位拼友（可固定）',
    stats: '126 讨论 · 89 收藏',
    detail: '寻找固定自习搭子，主要集中在紫金港图书馆和西区教学楼，适合备考、论文和课程复习同学。',
    user: { id: 'u_frontend', name: '前端小结', avatar: '', college: '计算机学院', grade: '大三' },
  },
  {
    id: 'exam-school',
    badge: '新',
    title: '# 考研择校交流互助帖',
    stats: '642 讨论 · 312 收藏',
    detail: '围绕择校、复习节奏、资料整理和面试经验交流，适合升学方向同学互相补信息差。',
    user: { id: 'u_math', name: '上岸锦鲤', avatar: '', college: '数学学院', grade: '研一' },
  },
]

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
  tags?: string[]
  lookingFor?: string
  completedCount?: number
  exchangeCount?: number
  online?: boolean
}

export type Activity = {
  id?: string
  _id?: string
  title?: string
  time?: string
  location?: string
  campus?: string
  description?: string
  participants?: number
  participantCount?: number
  maxParticipants?: number
  cover?: string
  organizer?: string
  tags?: string[]
  category?: string
  status?: string
}
