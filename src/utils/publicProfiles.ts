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
  gender?: 'male' | 'female' | 'private'
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
  source?: 'local'
}

export const PUBLIC_RELATION_STORAGE_KEY = 'publicUserRelations'

export const PUBLIC_USERS: PublicUser[] = [
  {
    id: '1',
    name: '陈同学',
    gender: 'male',
    verified: true,
    school: '浙江大学',
    college: '物理学院',
    major: '物理',
    grade: '博士在读',
    campus: '紫金港',
    intro: '擅长用 AI 和编程工具帮助同学快速上手科研与项目实践。',
    canTeach: [],
    wantToLearn: ['摄影', '产品设计', '羽毛球', '桌游'],
    interests: ['科研', 'AI', '摄影'],
    followerCount: 0,
    followingCount: 0,
  },
  {
    id: '2',
    name: '小熊软糖',
    gender: 'female',
    verified: true,
    school: '浙江大学',
    college: '计算机学院',
    major: '计算机科学',
    grade: '研一',
    campus: '玉泉',
    intro: '擅长英语学习方法与翻译技巧，帮助提升语言应用能力。',
    canTeach: [],
    wantToLearn: ['Python', '数据分析'],
    interests: ['英语', '学习'],
    followerCount: 0,
    followingCount: 0,
  },
  {
    id: '3',
    name: '橙子汽水',
    gender: 'female',
    verified: true,
    school: '浙江大学',
    college: '电气学院',
    major: '电气工程',
    grade: '大三',
    campus: '紫金港',
    intro: '擅长嵌入式开发与硬件调试，喜欢动手解决实际问题。',
    canTeach: [],
    wantToLearn: ['AI工具', '摄影'],
    interests: ['硬件', '摄影'],
    followerCount: 0,
    followingCount: 0,
  },
  {
    id: 'partner-1',
    name: '陈思思',
    gender: 'female',
    verified: true,
    school: '浙江大学',
    college: '生命科学学院',
    major: '数据科学',
    grade: '大二',
    campus: '紫金港',
    intro: '喜欢周末去西湖边骑行，找一起骑行的伙伴。',
    canTeach: [],
    wantToLearn: ['摄影'],
    interests: ['骑行', '运动'],
    followerCount: 0,
    followingCount: 0,
  },
  {
    id: 'partner-2',
    name: '赵子轩',
    gender: 'male',
    verified: false,
    school: '浙江大学',
    college: '计算机学院',
    major: '计算机科学',
    grade: '大三',
    campus: '玉泉',
    intro: '刚入坑桌游，想找人一起玩狼人杀和阿瓦隆。',
    canTeach: [],
    wantToLearn: ['产品设计'],
    interests: ['桌游', '游戏'],
    followerCount: 0,
    followingCount: 0,
  },
  {
    id: 'partner-3',
    name: '林晓晓',
    gender: 'female',
    verified: true,
    school: '浙江大学',
    college: '外国语学院',
    major: '英语',
    grade: '研一',
    campus: '西溪',
    intro: '摄影爱好者，周末喜欢扫街，找摄影小伙伴互拍。',
    canTeach: [],
    wantToLearn: ['AI工具'],
    interests: ['摄影', '修图', '徒步', '桌游'],
    followerCount: 0,
    followingCount: 0,
  },
  {
    id: 'partner-4',
    name: '周明远',
    gender: 'male',
    verified: true,
    school: '浙江大学',
    college: '数学科学学院',
    major: '数据科学',
    grade: '研一',
    campus: '紫金港',
    intro: '考研党，每天图书馆打卡，找一起学习监督的研友。',
    canTeach: [],
    wantToLearn: ['Python'],
    interests: ['学习', '自习'],
    followerCount: 0,
    followingCount: 0,
  },
  {
    id: 'partner-5',
    name: '吴悦然',
    gender: 'female',
    verified: false,
    school: '浙江大学',
    college: '外国语学院',
    major: '英语',
    grade: '大一',
    campus: '西溪',
    intro: '民谣吉他爱好者，想组校园乐队，找主唱和鼓手。',
    canTeach: [],
    wantToLearn: ['摄影'],
    interests: ['音乐', '吉他'],
    followerCount: 0,
    followingCount: 0,
  },
  {
    id: 'partner-6',
    name: '孙浩宇',
    gender: 'male',
    verified: true,
    school: '浙江大学',
    college: '材料学院',
    major: '材料科学',
    grade: '研二',
    campus: '玉泉',
    intro: '周末喜欢爬山露营，已经走过杭州多条徒步路线。',
    canTeach: [],
    wantToLearn: ['数据分析'],
    interests: ['旅行', '徒步'],
    followerCount: 0,
    followingCount: 0,
  },
  {
    id: 'partner-7',
    name: '郑雅文',
    gender: 'female',
    verified: false,
    school: '浙江大学',
    college: '管理学院',
    major: '数据科学',
    grade: '大四',
    campus: '紫金港',
    intro: '烘焙达人，会做各种蛋糕甜点，想找人一起探店。',
    canTeach: [],
    wantToLearn: ['产品设计'],
    interests: ['美食', '探店'],
    followerCount: 0,
    followingCount: 0,
  },
  {
    id: '10086',
    name: '陈同学',
    gender: 'male',
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
    followerCount: 0,
    followingCount: 0,
  },
  {
    id: 'u1',
    name: '科研小达人',
    gender: 'female',
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
    followerCount: 0,
    followingCount: 0,
  },
  {
    id: 'u_photo',
    name: '光影捕手',
    gender: 'male',
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
    followerCount: 0,
    followingCount: 0,
  },
  {
    id: 'u_math',
    name: '上岸锦鲤',
    gender: 'female',
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
    followerCount: 0,
    followingCount: 0,
  },
  {
    id: 'u_career',
    name: '实习记录员',
    gender: 'male',
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
    followerCount: 0,
    followingCount: 0,
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
    followerCount: 0,
    followingCount: 0,
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
    followerCount: 0,
    followingCount: 0,
  },
]

export const PUBLIC_SKILLS: PublicSkill[] = [
  {
    id: 'home-ai-tools',
    userId: '1',
    name: 'AI工具',
    level: 5,
    intro: '熟悉 AI 工具在科研资料整理、写作和项目实践中的使用。',
    tags: ['Prompt', '科研效率', '论文写作'],
    proofCount: 1,
    workCount: 0,
  },
  {
    id: 'home-python',
    userId: '1',
    name: 'Python',
    level: 4,
    intro: '可以帮助同学入门 Python 数据处理和脚本自动化。',
    tags: ['Python', '数据分析', '自动化'],
    proofCount: 1,
    workCount: 0,
  },
  {
    id: 'home-data-analysis',
    userId: '1',
    name: '数据分析',
    level: 3,
    intro: '能梳理课程作业和科研数据的基础分析流程。',
    tags: ['pandas', '可视化', '课程作业'],
    proofCount: 0,
    workCount: 0,
  },
  {
    id: 'home-paper-writing',
    userId: '1',
    name: '论文写作',
    level: 3,
    intro: '可以交流论文结构、资料整理和初稿修改方法。',
    tags: ['写作', '文献整理', '表达'],
    proofCount: 0,
    workCount: 0,
  },
  {
    id: 'home-english',
    userId: '2',
    name: '英语',
    level: 5,
    intro: '擅长英语学习方法、口语表达和写作修改。',
    tags: ['口语', '写作', '表达'],
    proofCount: 1,
    workCount: 0,
  },
  {
    id: 'home-writing',
    userId: '2',
    name: '写作',
    level: 4,
    intro: '可以帮助优化英文写作结构和表达准确性。',
    tags: ['英文写作', '结构', '修改'],
    proofCount: 0,
    workCount: 0,
  },
  {
    id: 'home-translation',
    userId: '2',
    name: '翻译',
    level: 3,
    intro: '可以交流中英文互译和材料润色技巧。',
    tags: ['翻译', '润色', '表达'],
    proofCount: 0,
    workCount: 0,
  },
  {
    id: 'home-matlab',
    userId: '3',
    name: 'MATLAB',
    level: 5,
    intro: '熟悉 MATLAB 建模、数据处理和课程实验分析。',
    tags: ['MATLAB', '建模', '实验'],
    proofCount: 1,
    workCount: 0,
  },
  {
    id: 'home-embedded',
    userId: '3',
    name: '嵌入式开发',
    level: 2,
    intro: '可以交流单片机、硬件调试和基础嵌入式项目。',
    tags: ['硬件', '调试', '项目'],
    proofCount: 0,
    workCount: 0,
  },
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
    id: 'home-chen-1',
    authorId: '1',
    authorName: '陈同学',
    title: 'AI 工具如何辅助科研入门',
    summary: '整理了从资料检索、文献摘要到实验记录的 AI 工具使用流程。',
    content: '这篇笔记主要分享如何把 AI 工具当成资料整理助手，而不是替代自己的判断。',
    tags: ['AI工具', '科研'],
    visibility: 'public',
    likeCount: 0,
    commentCount: 0,
    createdAt: '2天前',
  },
  {
    id: 'home-bear-1',
    authorId: '2',
    authorName: '小熊软糖',
    title: '英语口语练习的一周计划',
    summary: '分享一个适合课程和面试准备的口语练习节奏。',
    content: '口语练习可以按跟读、复述、主题表达和复盘四步走。',
    tags: ['英语', '写作'],
    visibility: 'public',
    likeCount: 0,
    commentCount: 0,
    createdAt: '3天前',
  },
  {
    id: 'home-orange-1',
    authorId: '3',
    authorName: '橙子汽水',
    title: '硬件调试前需要确认的几件事',
    summary: '从供电、接口、日志到最小复现，整理嵌入式调试前的检查清单。',
    content: '硬件问题先从可观测信号开始排查，逐步缩小范围。',
    tags: ['MATLAB', '嵌入式开发'],
    visibility: 'public',
    likeCount: 0,
    commentCount: 0,
    createdAt: '4天前',
  },
  {
    id: 'partner-1-post',
    authorId: 'partner-1',
    authorName: '陈思思',
    title: '周末西湖骑行搭子招募',
    summary: '想找节奏轻松的骑行伙伴，路线可以从校园到西湖边。',
    content: '希望安全第一，路线提前确认，适合喜欢户外和拍照的同学。',
    tags: ['骑行', '运动'],
    visibility: 'public',
    likeCount: 0,
    commentCount: 0,
    createdAt: '2天前',
  },
  {
    id: 'partner-2-post',
    authorId: 'partner-2',
    authorName: '赵子轩',
    title: '找桌游搭子一起开轻松局',
    summary: '狼人杀、阿瓦隆都可以，新手友好，主要是周末放松。',
    content: '希望大家时间稳定，规则可以现场一起熟悉。',
    tags: ['桌游', '游戏'],
    visibility: 'public',
    likeCount: 0,
    commentCount: 0,
    createdAt: '3天前',
  },
  {
    id: 'partner-3-post',
    authorId: 'partner-3',
    authorName: '林晓晓',
    title: '周末校园扫街摄影约拍',
    summary: '想找摄影小伙伴互拍，地点可以在西溪或紫金港。',
    content: '可以一起练构图、光线和后期，也欢迎新手。',
    tags: ['摄影', '修图'],
    visibility: 'public',
    likeCount: 0,
    commentCount: 0,
    createdAt: '1天前',
  },
  {
    id: 'partner-4-post',
    authorId: 'partner-4',
    authorName: '周明远',
    title: '找图书馆自习监督搭子',
    summary: '考研复习期想找稳定打卡的同学，互相同步计划。',
    content: '主要是数学和专业课复习，希望每天能简单复盘进度。',
    tags: ['学习', '自习'],
    visibility: 'public',
    likeCount: 0,
    commentCount: 0,
    createdAt: '4天前',
  },
  {
    id: 'partner-5-post',
    authorId: 'partner-5',
    authorName: '吴悦然',
    title: '想找校园乐队搭子',
    summary: '民谣吉他爱好者，想找主唱和鼓手一起练歌。',
    content: '先从简单曲目开始，时间可以周末协调。',
    tags: ['音乐', '吉他'],
    visibility: 'public',
    likeCount: 0,
    commentCount: 0,
    createdAt: '5天前',
  },
  {
    id: 'partner-6-post',
    authorId: 'partner-6',
    authorName: '孙浩宇',
    title: '周末徒步路线交流',
    summary: '想找喜欢户外的同学一起规划轻量徒步路线。',
    content: '路线强度以安全和体验为主，出发前会确认天气和装备。',
    tags: ['旅行', '徒步'],
    visibility: 'public',
    likeCount: 0,
    commentCount: 0,
    createdAt: '6天前',
  },
  {
    id: 'partner-7-post',
    authorId: 'partner-7',
    authorName: '郑雅文',
    title: '找探店和烘焙交流搭子',
    summary: '喜欢甜点和咖啡，想找人一起探店或交流烘焙经验。',
    content: '可以从校园周边开始，也可以分享简单烘焙配方。',
    tags: ['美食', '探店'],
    visibility: 'public',
    likeCount: 0,
    commentCount: 0,
    createdAt: '1周前',
  },
  {
    id: '1',
    authorId: '10086',
    authorName: '陈同学',
    title: '如何用 Python 高效完成数据分析？',
    summary: '整理了课程作业和科研数据处理中常用的分析流程，适合刚开始接触 pandas 的同学。',
    content: '这篇笔记整理了从明确问题、清洗数据、建立分析字段到输出可视化结果的一套流程。',
    tags: ['Python', '数据分析'],
    visibility: 'public',
    likeCount: 0,
    commentCount: 0,
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
    likeCount: 0,
    commentCount: 0,
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
    likeCount: 0,
    commentCount: 0,
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
    likeCount: 0,
    commentCount: 0,
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
    likeCount: 0,
    commentCount: 0,
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
    likeCount: 0,
    commentCount: 0,
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
    likeCount: 0,
    commentCount: 0,
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
    likeCount: 0,
    commentCount: 0,
    createdAt: '2天前',
  },
]

export const PUBLIC_REVIEWS: PublicReview[] = []

export const PUBLIC_RELATIONS: PublicRelation[] = []

export function normalizePublicUserId(id?: string | number, name?: string) {
  const raw = String(id || '').trim()
  if (raw && raw !== 'undefined') {
    const namedUser = PUBLIC_USERS.find((item) => item.name === name)
    if (/^\d+$/.test(raw) && namedUser) return namedUser.id
    return raw
  }
  const user = PUBLIC_USERS.find((item) => item.name === name)
  return user?.id || ''
}

export function openUnifiedUserProfile(userId?: string | number, name?: string) {
  const normalizedId = normalizePublicUserId(userId, name)
  const isCurrentUser = normalizedId === CURRENT_USER.id
  if (isCurrentUser) {
    Taro.switchTab({ url: '/pages/profile/index' })
    return
  }
  const query = [
    normalizedId ? `userId=${encodeURIComponent(normalizedId)}` : '',
    name ? `name=${encodeURIComponent(name)}` : '',
  ].filter(Boolean).join('&') || `name=${encodeURIComponent('同学')}`
  Taro.navigateTo({ url: `/sp-profile/pages/profile/view?${query}` })
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
  if (Array.isArray(cached) && cached.length) {
    return (cached as PublicRelation[]).filter((relation) => relation.source === 'local')
  }
  return PUBLIC_RELATIONS
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
      source: 'local',
    }]
  savePublicRelations(next)
  return next
}

export function getFollowersForUser(userId: string) {
  return readPublicRelations()
    .filter((relation) => relation.targetUserId === userId && relation.isFollowing)
    .map((relation) => getPublicUser(relation.userId))
}

export function getFollowingForUser(userId: string) {
  return readPublicRelations()
    .filter((relation) => relation.userId === userId && relation.isFollowing)
    .map((relation) => getPublicUser(relation.targetUserId))
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

