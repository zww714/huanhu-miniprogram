// ============ Mock Data for 换乎ZJU版 ============

export interface SkillUser {
  id: number
  name: string
  avatar: string
  college: string
  major: string
  grade: string
  verified: boolean
  match: number
  bio: string
  can: { name: string; level: number }[]
  want: string[]
}

export interface Post {
  id: string
  title: string
  excerpt: string
  cover?: string
  categoryTag: string
  mainCategory: string
  tags: string[]
  author: {
    name: string
    avatar?: string
    college: string
    grade: string
  }
  likes: number
  comments: number
}

export interface Activity {
  id: string
  title: string
  time: string
  location: string
  participants: number
  maxParticipants?: number
  cover?: string
  organizer?: string
  tags: string[]
  category: string
}

export const HOT_ACTIVITIES = [
  { name: '运动健身', icon: '🏃', color: '#F0FDF4', iconColor: '#10B981', count: '12个' },
  { name: '讲座沙龙', icon: '🎤', color: '#FEF2F2', iconColor: '#EF4444', count: '8个' },
  { name: '音乐演出', icon: '🎵', color: '#F5F3FF', iconColor: '#8B5CF6', count: '5个' },
  { name: '户外旅行', icon: '🏔️', color: '#FFF7ED', iconColor: '#F97316', count: '6个' },
  { name: '学术竞赛', icon: '🏆', color: '#EFF6FF', iconColor: '#2563EB', count: '10个' },
  { name: '志愿服务', icon: '❤️', color: '#FFF1F2', iconColor: '#EC4899', count: '9个' },
  { name: '社团活动', icon: '🎨', color: '#ECFEFF', iconColor: '#06B6D4', count: '15个' },
]

export const ACTIVITIES: Activity[] = [
  {
    id: 'a1', title: '周末相约紫金港 · 校园摄影采风',
    time: '5月10日 14:00', location: '紫金港校区 月牙楼',
    participants: 12, maxParticipants: 30, tags: ['摄影', '户外'], category: '兴趣',
    cover: 'linear-gradient(135deg, #06B6D4 0%, #3B82F6 100%)',
    organizer: '摄影协会',
  },
  {
    id: 'a2', title: 'AI工具分享会 · 用AI提升科研效率',
    time: '5月12日 19:00', location: '紫金港校区 北教',
    participants: 28, maxParticipants: 50, tags: ['AI', '科研'], category: '技能交换',
    cover: 'linear-gradient(135deg, #8B5CF6 0%, #6366F1 100%)',
    organizer: 'AI研习社',
  },
  {
    id: 'a3', title: '周末志愿行 · 社区服务公益活动',
    time: '5月14日 08:30', location: '西湖区 翠苑社区',
    participants: 9, maxParticipants: 20, tags: ['志愿', '公益'], category: '志愿',
    cover: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
    organizer: '青年志愿者协会',
  },
  {
    id: 'a4', title: '求职分享 · 大厂面试经验交流',
    time: '5月15日 18:30', location: '玉泉校区 曹光彪楼',
    participants: 45, maxParticipants: 80, tags: ['求职', '面试'], category: '其他',
    cover: 'linear-gradient(135deg, #F59E0B 0%, #EF4444 100%)',
    organizer: '职业发展中心',
  },
  {
    id: 'a5', title: '英语角 · 跨文化交流下午茶',
    time: '5月17日 15:00', location: '紫金港校区 咖啡吧',
    participants: 18, maxParticipants: 25, tags: ['英语', '交流'], category: '兴趣',
    cover: 'linear-gradient(135deg, #EC4899 0%, #F472B6 100%)',
    organizer: '英语协会',
  },
  {
    id: 'a6', title: 'Python技能交换 · 从入门到项目实战',
    time: '5月20日 14:00', location: '紫金港校区 机房',
    participants: 15, maxParticipants: 30, tags: ['编程', 'Python'], category: '技能交换',
    cover: 'linear-gradient(135deg, #2563EB 0%, #06B6D4 100%)',
    organizer: '计算机学院学生会',
  },
]

export interface Activity {
  id: string
  title: string
  time: string
  location: string
  participants: number
  maxParticipants?: number
  cover?: string
  organizer?: string
  tags: string[]
  category: string
}

export interface Conversation {
  id: string
  name: string
  avatar: string
  lastMessage: string
  timestamp: string
  unread: number
  online?: boolean
  category: string
}

export interface Comment {
  id: string
  author: { name: string; avatar?: string }
  content: string
  time: string
  likes: number
  liked?: boolean
  replies?: Comment[]
}

// ========== SKILL USERS ==========
export const SKILL_USERS: SkillUser[] = [
  {
    id: 1, name: '陈同学', avatar: '/assets/avatar.png',
    college: '浙江大学', major: '物理学', grade: '博士在读',
    verified: true, match: 92,
    bio: '擅长用AI和编程工具帮助同学快速上手科研与项目实践。',
    can: [{ name: 'AI工具', level: 5 }, { name: 'Python', level: 4 }, { name: '数据分析', level: 3 }],
    want: ['摄影', '产品设计'],
  },
  {
    id: 2, name: '小熊软糖', avatar: '/assets/avatar.png',
    college: '浙江大学', major: '计算机科学与技术', grade: '博士在读',
    verified: true, match: 89,
    bio: '擅长英语学习方法与翻译技巧，帮助提升语言应用能力。',
    can: [{ name: '英语', level: 5 }, { name: '写作', level: 4 }, { name: '翻译', level: 3 }],
    want: ['Python', '数据分析'],
  },
  {
    id: 3, name: '橘子汽水', avatar: '/assets/avatar.png',
    college: '浙江大学', major: '电子工程', grade: '博士在读',
    verified: true, match: 87,
    bio: '擅长嵌入式开发与硬件调试，喜欢动手解决实际问题。',
    can: [{ name: 'MATLAB', level: 5 }, { name: 'AI工具', level: 3 }, { name: '嵌入式开发', level: 2 }],
    want: ['AI工具', '摄影'],
  },
]

export const FILTER_TAGS = ['全部', '热门', 'AI工具', '语言', '设计工具', '运动']

export const INTEREST_GROUPS = [
  { name: '炒股搭子', icon: 'trending', color: '#EFF6FF', iconColor: '#2563EB', followers: '1.2万' },
  { name: '做饭搭子', icon: 'chef', color: '#F0FDF4', iconColor: '#10B981', followers: '8千' },
  { name: '游戏搭子', icon: 'gamepad', color: '#FEF2F2', iconColor: '#EF4444', followers: '2.1万' },
  { name: '摄影搭子', icon: 'camera', color: '#F0F9FF', iconColor: '#06B6D4', followers: '6千' },
]

// ========== POSTS ==========
export const MOCK_POSTS: Post[] = [
  {
    id: '1', title: '如何用 Python 高效完成数据分析？',
    excerpt: '分享我在科研中常用的几个 Python 库，包括 pandas、numpy 和 matplotlib 的使用技巧...',
    cover: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', categoryTag: '科研·技能交换', mainCategory: '科研',
    tags: ['编程', '数据分析'],
    author: { name: '科研小达人', college: '计算机学院', grade: '研一' },
    likes: 128, comments: 32,
  },
  {
    id: '2', title: '浙大的春天太美了，求摄影搭子',
    excerpt: '最近樱花和郁金香都开了，想找个喜欢摄影的同学一起扫校园~',
    cover: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', categoryTag: '兴趣·搭子', mainCategory: '兴趣',
    tags: ['摄影', '兴趣搭子'],
    author: { name: '光影捕手', college: '艺术学院', grade: '大二' },
    likes: 256, comments: 45,
  },
  {
    id: '3', title: '考研数学复习经验分享',
    excerpt: '从基础到强化，三个月数学一140分的复习路线...',
    cover: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', categoryTag: '升学·经验', mainCategory: '升学',
    tags: ['考研', '数学'],
    author: { name: '上岸锦鲤', college: '数学学院', grade: '研一' },
    likes: 512, comments: 89,
  },
  {
    id: '4', title: '求推荐好用的 AI 写作工具',
    excerpt: '最近在写论文综述，想找一些能辅助文献整理和写作的工具...',
    cover: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)', categoryTag: '科研·求助', mainCategory: '科研',
    tags: ['AI', '论文写作'],
    author: { name: '论文苦手', college: '人文学院', grade: '大三' },
    likes: 67, comments: 23,
  },
]

// ========== USER DETAILS ==========
export const USER_DETAILS: Record<string, any> = {
  '科研小达人': {
    id: 'u1', name: '科研小达人', avatar: '', bgCover: 'linear-gradient(135deg, #00B578 0%, #00A76F 100%)',
    college: '计算机学院', grade: '研一', verified: true,
    bio: '热爱编程和数据分析，擅长Python和机器学习。正在做NLP相关课题，欢迎交流！',
    tags: ['💎 编程', '📊 数据分析', '🐍 Python'],
    stats: { posts: 14, likes: 238, following: 30, followers: 89 },
    recentPosts: [
      { id: 'u1p1', title: 'NLP课程笔记：Transformer原理详解', cover: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', likes: 34, comments: 8, time: '3天前' },
      { id: 'u1p2', title: '推荐几个好用的科研效率工具', cover: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', likes: 56, comments: 12, time: '1周前' },
      { id: 'u1p3', title: '校园数据竞赛经验分享', cover: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', likes: 28, comments: 5, time: '2周前' },
    ]
  },
  '光影捕手': {
    id: 'u2', name: '光影捕手', avatar: '', bgCover: 'linear-gradient(135deg, #0EA5E9 0%, #3B82F6 100%)',
    college: '艺术学院', grade: '大二', verified: false,
    bio: '摄影爱好者，周末喜欢扫街。相机永远随身带，记录校园的每一刻美好瞬间。',
    tags: ['📷 摄影', '🎨 设计', '🎬 后期'],
    stats: { posts: 32, likes: 567, following: 45, followers: 120 },
    recentPosts: [
      { id: 'u2p1', title: '浙大樱花季摄影攻略', cover: 'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)', likes: 128, comments: 32, time: '5天前' },
      { id: 'u2p2', title: '手机摄影调色教程', cover: 'linear-gradient(135deg, #fccb90 0%, #d57eeb 100%)', likes: 89, comments: 18, time: '2周前' },
    ]
  },
  '上岸锦鲤': {
    id: 'u3', name: '上岸锦鲤', avatar: '', bgCover: 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)',
    college: '数学学院', grade: '研一', verified: true,
    bio: '考研数学140+，擅长高等数学和线性代数。乐于分享备考经验，帮助学弟学妹上岸！',
    tags: ['📚 考研', '🧮 数学', '🎯 辅导'],
    stats: { posts: 8, likes: 612, following: 20, followers: 200 },
    recentPosts: [
      { id: 'u3p1', title: '考研数学一140分复习规划', cover: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)', likes: 256, comments: 67, time: '3天前' },
      { id: 'u3p2', title: '高数易错题合集（上）', cover: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)', likes: 189, comments: 45, time: '1周前' },
    ]
  },
  '论文苦手': {
    id: 'u4', name: '论文苦手', avatar: '', bgCover: 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)',
    college: '人文学院', grade: '大三', verified: false,
    bio: '正在为毕业论文发愁中…研究明清文学方向。喜欢阅读和写作，偶尔写写随笔。',
    tags: ['📝 文学', '✍️ 写作', '📄 论文'],
    stats: { posts: 6, likes: 67, following: 35, followers: 23 },
    recentPosts: [
      { id: 'u4p1', title: '论文写作避坑指南', cover: 'linear-gradient(135deg, #a1c4fd 0%, #c2e9fb 100%)', likes: 23, comments: 7, time: '4天前' },
    ]
  },
}
export const CONVERSATIONS: Conversation[] = [
  { id: '1', name: '王同学', avatar: '', lastMessage: '好的，那我们明天下午在图书馆见！', timestamp: '14:32', unread: 3, online: true, category: '技能交换' },
  { id: '2', name: '李学姐', avatar: '', lastMessage: '你的Python项目进展怎么样了？', timestamp: '12:05', unread: 1, category: '技能交换' },
  { id: '3', name: '张三', avatar: '', lastMessage: '周末一起去打球吗？', timestamp: '昨天', unread: 0, category: '兴趣搭子' },
  { id: '4', name: '系统通知', avatar: '', lastMessage: '你的技能「Python编程」已被3位同学收藏', timestamp: '昨天', unread: 0, category: '技能交换' },
  { id: '5', name: '化学协会', avatar: '', lastMessage: '本周五化学实验技能培训开始报名啦~', timestamp: '周三', unread: 0, category: '兴趣搭子' },
]

// ========== POST DETAIL ==========
export const POST_DETAIL = {
  id: '1', title: '如何用 OpenClaw 搞科研？',
  tags: ['科研', 'AI工具', '论文写作', '效率工具'],
  author: { name: '浙大虾哥', avatar: '', verified: true, college: '材料学院', grade: '博一' },
  time: '2026-05-01 14:30',
  body: [
    '最近一直在用 OpenClaw 辅助科研工作，效率提升了不少。分享一下我的使用经验：',
    '1. 文献综述：用 OpenClaw 快速阅读和总结论文要点',
    '2. 数据分析：结合 Python 进行实验数据处理和可视化',
    '3. 论文写作：AI辅助润色和结构优化',
    '4. 代码开发：快速生成实验代码框架',
  ],
  images: [],
  likes: 256, comments: 48, bookmarked: false, liked: false,
}

export const COMMENTS: Comment[] = [
  { id: 'c1', author: { name: '科研小达人' }, content: '非常实用的分享！请问可以推荐一些具体的 workflow 吗？', time: '1小时前', likes: 12 },
  { id: 'c2', author: { name: '代码小白' }, content: '我也在用，确实能节省很多时间', time: '45分钟前', likes: 8 },
  { id: 'c3', author: { name: '材料人' }, content: '有没有专门做材料科学方向的 prompt 推荐？', time: '30分钟前', likes: 5 },
]

// ========== SKILLS (Profile) ==========
export const USER_SKILLS = [
  { name: 'Python 编程', level: 'Lv.5', levelColor: '#FEF3C7', levelTextColor: '#D97706', category: '编程开发', desc: '熟练使用 Python 进行数据分析、机器学习与 Web 开发', tags: ['数据分析', 'Django', 'TensorFlow'] },
  { name: 'UI 设计', level: 'Lv.3', levelColor: '#FEF3C7', levelTextColor: '#D97706', category: '设计创意', desc: '具备 Figma 设计经验，擅长移动端界面设计', tags: ['Figma', 'UI/UX'] },
]

export const USER_POSTS = [
  { id: 'u1', title: 'Python数据分析入门指南', likes: 45, comments: 12 },
  { id: 'u2', title: '研究生必备科研工具推荐', likes: 89, comments: 23 },
]

// ========== PARTNER USERS ==========
export const PARTNER_USERS = [
  { id: 1, name: '陈思思', avatar: '', bio: '喜欢周末去西湖边骑行，找一起骑行的伙伴！', lookingFor: '骑行搭子', match: 90, verified: true, tags: ['运动'] },
  { id: 2, name: '赵子轩', avatar: '', bio: '刚入坑桌游，想找人一起玩狼人杀和阿瓦隆。', lookingFor: '桌游搭子', match: 87, verified: false, tags: ['游戏'] },
  { id: 3, name: '林晓晓', avatar: '', bio: '摄影爱好者，周末喜欢扫街，找摄影小伙伴互拍。', lookingFor: '摄影搭子', match: 83, verified: true, tags: ['摄影'] },
  { id: 4, name: '周明远', avatar: '', bio: '考研党，每天图书馆打卡，找一起学习监督的研友！', lookingFor: '学习搭子', match: 92, verified: true, tags: ['学习'] },
  { id: 5, name: '吴悦然', avatar: '', bio: '民谣吉他爱好者，想组校园乐队，找主唱和鼓手！', lookingFor: '乐队搭子', match: 78, verified: false, tags: ['音乐'] },
  { id: 6, name: '孙浩宇', avatar: '', bio: '周末喜欢爬山露营，已经走过杭州十条徒步路线啦', lookingFor: '旅行搭子', match: 85, verified: true, tags: ['旅行'] },
  { id: 7, name: '郑雅文', avatar: '', bio: '烘焙达人，会做各种蛋糕甜点，想找人一起探店。', lookingFor: '美食搭子', match: 81, verified: false, tags: ['其他'] },
]

// ========== CONTACTS ==========
export const CONTACTS = [
  { id: 1, name: '陈思思', avatar: '', bio: '喜欢周末去西湖边骑行', online: true },
  { id: 2, name: '赵子轩', avatar: '', bio: '刚入坑桌游', online: false },
  { id: 3, name: '林晓晓', avatar: '', bio: '摄影爱好者', online: true },
  { id: 4, name: '周明远', avatar: '', bio: '考研党', online: false },
  { id: 5, name: '吴悦然', avatar: '', bio: '民谣吉他爱好者', online: true },
  { id: 6, name: '孙浩宇', avatar: '', bio: '喜欢爬山露营', online: false },
  { id: 7, name: '郑雅文', avatar: '', bio: '烘焙达人', online: true },
  { id: 8, name: '张老师', avatar: '', bio: '计算机科学系教授', online: true },
  { id: 9, name: '李明', avatar: '', bio: 'Python 编程学习者', online: false },
  { id: 10, name: '小王', avatar: '', bio: '设计专业大三', online: true },
]

// ========== SKILL DETAIL ==========
export const SKILL_DETAIL = {
  id: 1, name: 'Python 编程', level: 'Lv.5', category: '编程开发',
  desc: '熟练使用 Python 进行数据分析、机器学习与 Web 开发',
  stats: { projects: 12, endorsements: 28, views: 1560 },
  tags: ['数据分析', 'Django', 'TensorFlow', 'Flask'],
  proofItems: [
    { type: 'project', name: '校园数据分析平台', desc: '基于 Django + ECharts 的学生数据可视化平台' },
    { type: 'cert', name: '计算机等级考试三级', desc: '数据库技术方向' },
  ],
}


export type SkillProof = {
  type: 'portfolio' | 'project' | 'certificate' | 'link'
  title: string
  desc: string
  url?: string
}

export type SkillDetail = {
  id: string
  userId: string
  name: string
  level: number
  levelText: string
  category: string
  icon: string
  verified: boolean
  summary: string
  abilityDescription: string
  canHelp: string[]
  proofs: SkillProof[]
  tags: string[]
}

export const SKILLS_DETAIL: SkillDetail[] = [
  {
    id: 'ai-tools',
    userId: '10086',
    name: 'AI工具',
    level: 5,
    levelText: '专家级应用',
    category: '效率工具',
    icon: 'AI',
    verified: true,
    summary: '熟练使用各类 AI 工具辅助科研、写作、学习与开发。',
    abilityDescription: '可以根据具体学习和科研场景设计 AI 工作流，帮助同学更高效地完成资料整理、Prompt 优化、代码辅助和论文写作流程。',
    canHelp: ['AI 工具使用入门', 'Prompt 优化', 'AI 辅助科研', 'AI 辅助编程', 'AI 论文写作流程'],
    proofs: [
      { type: 'project', title: '科研文献整理流程', desc: '整理过一套从文献筛选、摘要提取到研究问题生成的 AI 辅助流程。' },
      { type: 'portfolio', title: 'Prompt 模板合集', desc: '沉淀了课程学习、论文写作和代码调试场景的常用 Prompt 模板。' },
    ],
    tags: ['Prompt', '论文写作', '科研效率', '代码辅助'],
  },
  {
    id: 'python',
    userId: '10086',
    name: 'Python 编程',
    level: 4,
    levelText: '熟练掌握',
    category: '编程开发',
    icon: 'Py',
    verified: true,
    summary: '熟练使用 Python 进行数据分析、机器学习与 Web 开发。',
    abilityDescription: '可以独立完成 Python 脚本、数据分析、简单机器学习和 Web 项目开发，也能帮助同学拆解课程作业和项目入门思路。',
    canHelp: ['Python 入门答疑', '数据分析作业辅导', 'Flask / Django 项目入门', '机器学习基础项目交流'],
    proofs: [
      { type: 'project', title: '校园数据分析平台', desc: '基于 Django + ECharts 的学生数据可视化平台。' },
      { type: 'certificate', title: '计算机等级考试三级', desc: '数据库技术方向，具备基础工程能力。' },
      { type: 'link', title: 'GitHub 练习项目', desc: '包含脚本自动化、数据清洗和 Flask 入门项目。', url: 'https://github.com/example/python-demo' },
    ],
    tags: ['数据分析', 'Django', 'Flask', 'TensorFlow', '自动化脚本'],
  },
  {
    id: 'data-analysis',
    userId: '10086',
    name: '数据分析',
    level: 3,
    levelText: '可以独立完成基础任务',
    category: '数据处理',
    icon: 'DA',
    verified: false,
    summary: '具备数据清洗、可视化和基础建模能力。',
    abilityDescription: '可以帮助梳理数据分析思路，完成 Excel / Python 数据清洗、基础统计分析、图表制作和课程作业展示。',
    canHelp: ['Excel / Python 数据清洗', '数据可视化', 'ECharts 图表', '课程作业数据分析思路'],
    proofs: [
      { type: 'project', title: '课程数据可视化作业', desc: '使用 Python 清洗数据，并用 ECharts 输出交互式图表。' },
    ],
    tags: ['Pandas', 'Matplotlib', 'SQL', 'ECharts', '可视化'],
  },
  {
    id: 'english-communication',
    userId: '10086',
    name: '英语交流',
    level: 2,
    levelText: '基础熟悉',
    category: '语言交流',
    icon: 'EN',
    verified: false,
    summary: '具备较流畅的英语口语和写作表达能力。',
    abilityDescription: '可以进行日常英语口语陪练、写作表达修改和基础表达纠错，也可以交流留学申请材料准备经验。',
    canHelp: ['英语口语陪练', '写作表达修改', '日常英语表达纠错', '留学申请交流'],
    proofs: [],
    tags: ['口语', '写作', '表达纠错', '留学'],
  },
]

export const SKILL_ID_BY_NAME: Record<string, string> = {
  'AI工具': 'ai-tools',
  'AI宸ュ叿': 'ai-tools',
  Python: 'python',
  'Python 编程': 'python',
  'Python 缂栫▼': 'python',
  '数据分析': 'data-analysis',
  '鏁版嵁鍒嗘瀽': 'data-analysis',
  '英语交流': 'english-communication',
  '鑻辫浜ゆ祦': 'english-communication',
}

// ========== MY PROFILE DATA ==========
export const MY_PROFILE = {
  name: '张三',
  user_id: '10086',
  avatar: '',
  verified: true,
  school: '浙江大学',
  college: '计算机学院',
  grade: '研一',
  bio: '擅长 Python 和数据分析，想找摄影搭子',
  stats: { skills: 5, posts: 12, followers: 86, following: 42 },
}

// ========== MY SKILLS ==========
export const MY_SKILLS = [
  { name: 'AI工具', level: 5, desc: '熟练使用各种AI工具辅助科研与开发', tags: ['ChatGPT', 'Copilot', 'Midjourney'] },
  { name: 'Python', level: 4, desc: '熟练使用 Python 进行数据分析、机器学习与 Web 开发', tags: ['数据分析', 'Django', 'TensorFlow'] },
  { name: '数据分析', level: 3, desc: '具备数据清洗、可视化和建模能力', tags: ['Pandas', 'Matplotlib', 'SQL'] },
  { name: '英语交流', level: 2, desc: '流利的英语口语和写作能力', tags: ['雅思', '学术写作'] },
  { name: '前端开发', level: 1, desc: '了解React、Vue等前端框架', tags: ['React', 'Vue', '小程序'] },
]

// ========== MY LEARN WANTS ==========
export const MY_LEARN_WANTS = [
  { name: '摄影', target: '想学人像摄影和后期修图' },
  { name: '产品设计', target: '想学产品思维和UI设计' },
  { name: '羽毛球', target: '想找水平相近的球友一起进步' },
]

// ========== MY INTERESTS ==========
export const MY_INTERESTS = ['科研', 'AI', '徒步', '摄影', '桌游']

// ========== MY REVIEWS ==========
export const MY_REVIEWS = [
  {
    id: 'r1', reviewer: '王同学', reviewerAvatar: '',
    rating: 5, tags: ['认真', '准时', '讲得清楚'],
    content: 'Python 讲得很清楚，案例也很实用，帮我解决了数据分析的大问题。',
    skill: 'Python 编程',
    time: '3天前',
  },
  {
    id: 'r2', reviewer: '李学姐', reviewerAvatar: '',
    rating: 5, tags: ['有耐心', '专业'],
    content: 'AI工具的使用心得分享非常详细，学到了很多实用技巧。',
    skill: 'AI工具',
    time: '1周前',
  },
  {
    id: 'r3', reviewer: '材料人', reviewerAvatar: '',
    rating: 4, tags: ['及时'],
    content: '帮我解答了Python数据分析的问题，回复很及时。',
    skill: 'Python 编程',
    time: '2周前',
  },
]

// ========== USER DETAIL (for other users viewing) ==========
export const USER_DETAIL_PROFILE = {
  name: '陈同学',
  user_id: '20001',
  avatar: '',
  verified: true,
  school: '浙江大学',
  college: '物理学院',
  grade: '博士在读',
  bio: '擅长用 AI 和编程工具帮助同学快速上手科研与项目实践',
  stats: { skills: 5, posts: 12, followers: 86, following: 42 },
  is_following: false,
  can_message: true,
  skills: [
    { name: 'AI工具', level: 5, desc: '熟练使用各种AI工具辅助科研与开发', tags: ['ChatGPT', 'Copilot', '科研提效'] },
    { name: 'Python', level: 4, desc: '熟练使用 Python 进行数据分析、机器学习与 Web 开发', tags: ['数据分析', 'TensorFlow', 'Django'] },
    { name: '数据分析', level: 3, desc: '具备数据清洗、可视化和建模能力', tags: ['Pandas', 'Matplotlib', 'SQL'] },
    { name: '英语交流', level: 2, desc: '流利的英语口语和写作能力，通过雅思7.0', tags: ['雅思', '学术写作', '口语'] },
    { name: 'MATLAB', level: 1, desc: '基础的MATLAB编程和仿真能力', tags: ['仿真', '信号处理'] },
  ],
  learn_wants: ['摄影', '产品设计', '羽毛球'],
  interests: ['科研', 'AI', '徒步', '摄影', '桌游'],
  posts: [
    { id: 'up1', title: 'NLP课程笔记：Transformer原理详解', type: '课程笔记', time: '3天前', likes: 34, comments: 8 },
    { id: 'up2', title: '推荐几个好用的科研效率工具', type: '工具推荐', time: '1周前', likes: 62, comments: 15 },
    { id: 'up3', title: '研一新生怎么建立文献阅读体系', type: '经验分享', time: '2周前', likes: 48, comments: 12 },
    { id: 'up4', title: '我常用的Python数据分析模板', type: '经验分享', time: '3周前', likes: 55, comments: 10 },
  ],
  reviews: [
    { id: 'ur1', reviewer: '王同学', reviewerAvatar: '', rating: 5, tags: ['准时', '讲得清楚'], content: '帮我理清了 Python 数据分析的思路', skill: 'Python', time: '3天前' },
    { id: 'ur2', reviewer: '李学姐', reviewerAvatar: '', rating: 5, tags: ['专业', '有耐心'], content: 'AI工具分享非常实用', skill: 'AI工具', time: '1周前' },
  ],
}
