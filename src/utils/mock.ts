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
  content?: string
  cover?: string
  categoryTag: string
  mainCategory: string
  tags: string[]
  authorId?: string
  userId?: string
  author: {
    id?: string
    userId?: string
    name: string
    avatar?: string
    college: string
    grade: string
  }
  likes: number
  comments: number
  likeCount?: number
  commentCount?: number
  collectCount?: number
  viewCount?: number
  createdAt?: string
  visibility?: 'public' | 'private'
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
  postId?: string
  userId?: string
  userName?: string
  userAvatar?: string
  author: { name: string; avatar?: string }
  content: string
  time: string
  likes: number
  liked?: boolean
  likeCount?: number
  createdAt?: string
  replies?: CommentReply[]
}

export interface CommentReply {
  id: string
  commentId: string
  userId: string
  userName: string
  userAvatar?: string
  replyToUserId: string
  replyToUserName: string
  content: string
  createdAt: string
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
    excerpt: '整理了我在课程作业和科研数据处理中常用的分析流程，适合刚开始接触 pandas 的同学。',
    content: '整理了我在课程作业和科研数据处理中常用的分析流程，适合刚开始接触 pandas 的同学。\n\n主要流程包括：明确问题、清洗数据、建立分析字段、输出可视化结果。常用工具是 pandas、numpy、matplotlib 和 Jupyter Notebook。',
    cover: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', categoryTag: '科研·技能交换', mainCategory: '科研',
    tags: ['Python', '数据分析'],
    authorId: '10086', userId: '10086',
    author: { id: '10086', userId: '10086', name: '张三', avatar: '', college: '计算机学院', grade: '研一' },
    likes: 128, comments: 32, likeCount: 128, commentCount: 32, collectCount: 18, viewCount: 386, createdAt: '2026-05-10T10:00:00+08:00', visibility: 'public',
  },
  {
    id: '2', title: '浙大的春天太美了，求摄影搭子',
    excerpt: '最近樱花和郁金香都开了，想找个喜欢摄影的同学一起扫校园~',
    cover: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', categoryTag: '兴趣·搭子', mainCategory: '兴趣',
    tags: ['摄影', '兴趣搭子'],
    authorId: 'u_photo', userId: 'u_photo',
    author: { id: 'u_photo', userId: 'u_photo', name: '光影捕手', college: '艺术学院', grade: '大二' },
    likes: 256, comments: 45, likeCount: 256, commentCount: 45, collectCount: 36, viewCount: 820, createdAt: '2026-05-09T14:20:00+08:00', visibility: 'public',
  },
  {
    id: '3', title: '考研数学复习经验分享',
    excerpt: '从基础到强化，三个月数学一140分的复习路线...',
    cover: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', categoryTag: '升学·经验', mainCategory: '升学',
    tags: ['考研', '数学'],
    authorId: 'u_math', userId: 'u_math',
    author: { id: 'u_math', userId: 'u_math', name: '上岸锦鲤', college: '数学学院', grade: '研一' },
    likes: 512, comments: 89, likeCount: 512, commentCount: 89, collectCount: 74, viewCount: 1280, createdAt: '2026-05-08T09:30:00+08:00', visibility: 'public',
  },
  {
    id: '4', title: 'AI 工具如何辅助论文写作流程',
    excerpt: '从文献整理、提纲生成到初稿润色，分享一套适合课程论文和组会汇报的 AI 使用方式。',
    content: '从文献整理、提纲生成到初稿润色，分享一套适合课程论文和组会汇报的 AI 使用方式。\n\n我一般会先让 AI 帮忙提炼文献摘要，再按主题整理观点，最后用人工检查事实和引用。这个流程不能代替自己思考，但能明显提升初稿整理效率。',
    cover: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)', categoryTag: '科研·求助', mainCategory: '科研',
    tags: ['AI', '论文写作'],
    authorId: '10086', userId: '10086',
    author: { id: '10086', userId: '10086', name: '张三', avatar: '', college: '计算机学院', grade: '研一' },
    likes: 67, comments: 23, likeCount: 67, commentCount: 23, collectCount: 11, viewCount: 214, createdAt: '2026-05-05T20:10:00+08:00', visibility: 'public',
  },
  {
    id: '5',
    title: '实习简历如何突出科研项目经历？',
    excerpt: '整理了计算机和数据方向简历里项目描述的写法，适合正在投暑期实习的同学参考。',
    content: '核心思路是先写清楚问题背景，再写自己负责的模块，最后用可量化结果收尾。项目经历不一定要很大，但要能说明你的分析、实现和沟通能力。',
    cover: 'linear-gradient(135deg, #2563EB 0%, #0EA5E9 100%)',
    categoryTag: '工作·实习',
    mainCategory: '工作',
    tags: ['简历', '实习'],
    authorId: 'u_career',
    userId: 'u_career',
    author: { id: 'u_career', userId: 'u_career', name: '实习记录员', avatar: '', college: '软件学院', grade: '大三' },
    likes: 142,
    comments: 28,
    likeCount: 142,
    commentCount: 28,
    collectCount: 46,
    viewCount: 540,
    createdAt: '2026-05-12T16:30:00+08:00',
    visibility: 'public',
  },
  {
    id: '6',
    title: '保研面试材料准备清单',
    excerpt: '从个人陈述、科研经历、竞赛材料到常见问答，按时间线整理了一份准备清单。',
    content: '建议把材料分成基础材料、科研证明、项目复盘和面试问答四类。每一类都准备一个 1 分钟版本和 3 分钟版本，面试时会更从容。',
    cover: 'linear-gradient(135deg, #38BDF8 0%, #6366F1 100%)',
    categoryTag: '升学·经验',
    mainCategory: '升学',
    tags: ['保研', '面试'],
    authorId: 'u_offer',
    userId: 'u_offer',
    author: { id: 'u_offer', userId: 'u_offer', name: '上岸笔记', avatar: '', college: '竺可桢学院', grade: '大四' },
    likes: 231,
    comments: 41,
    likeCount: 231,
    commentCount: 41,
    collectCount: 88,
    viewCount: 930,
    createdAt: '2026-05-11T09:20:00+08:00',
    visibility: 'public',
  },
  {
    id: '7',
    title: '周五桌游新手局，缺 2 位同学',
    excerpt: '想开一局轻策略桌游，新手友好，地点暂定紫金港生活区活动室。',
    content: '本次会准备规则讲解和试玩时间，不需要提前会玩。希望找到稳定一起玩的同学，也欢迎摄影、羽毛球搭子一起交流。',
    cover: 'linear-gradient(135deg, #F59E0B 0%, #EF4444 100%)',
    categoryTag: '兴趣·搭子',
    mainCategory: '兴趣',
    tags: ['桌游', '新手局'],
    authorId: 'u_boardgame',
    userId: 'u_boardgame',
    author: { id: 'u_boardgame', userId: 'u_boardgame', name: '桌游召集人', avatar: '', college: '管理学院', grade: '研二' },
    likes: 76,
    comments: 19,
    likeCount: 76,
    commentCount: 19,
    collectCount: 13,
    viewCount: 210,
    createdAt: '2026-05-12T20:00:00+08:00',
    visibility: 'public',
  },
  {
    id: '8',
    title: '前端实习面试复盘：组件题和项目题怎么答',
    excerpt: '记录了一次前端实习面试中的高频问题，包括状态管理、组件拆分和小程序性能优化。',
    content: '面试官更关注你如何解释取舍，而不是背标准答案。建议把项目拆成用户场景、技术方案、难点和复盘四段来讲。',
    cover: 'linear-gradient(135deg, #0F172A 0%, #2563EB 100%)',
    categoryTag: '工作·面试',
    mainCategory: '工作',
    tags: ['前端', '面试'],
    authorId: 'u_frontend',
    userId: 'u_frontend',
    author: { id: 'u_frontend', userId: 'u_frontend', name: '前端小结', avatar: '', college: '计算机学院', grade: '大三' },
    likes: 184,
    comments: 35,
    likeCount: 184,
    commentCount: 35,
    collectCount: 57,
    viewCount: 680,
    createdAt: '2026-05-10T18:45:00+08:00',
    visibility: 'public',
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

export type NotificationType = 'likes' | 'follows' | 'comments' | 'system'

export type AppNotification = {
  id: string
  type: NotificationType
  title: string
  content: string
  fromUserId?: string
  fromUserName?: string
  fromUserAvatar?: string
  targetType?: 'post' | 'user' | 'activity' | 'system'
  targetId?: string
  targetTitle?: string
  read: boolean
  blocked: boolean
  createdAt: string
}

export const NOTIFICATIONS_STORAGE_KEY = 'notifications'
export const BLOCKED_NOTIFICATION_TYPES_KEY = 'blockedNotificationTypes'

export const NOTIFICATIONS: AppNotification[] = [
  { id: 'like-1', type: 'likes', title: '收到新的点赞', content: '科研小达人赞了你的发布', fromUserId: 'u_research', fromUserName: '科研小达人', fromUserAvatar: '', targetType: 'post', targetId: '1', targetTitle: '如何用 Python 高效完成数据分析？', read: false, blocked: false, createdAt: '刚刚' },
  { id: 'like-2', type: 'likes', title: '技能被收藏', content: '光影捕手收藏了你的 AI工具 技能', fromUserId: 'u_photo', fromUserName: '光影捕手', fromUserAvatar: '', targetType: 'user', targetId: 'u_photo', targetTitle: 'AI工具', read: true, blocked: false, createdAt: '12分钟前' },
  { id: 'like-3', type: 'likes', title: '收到新的收藏', content: '上岸锦鲤收藏了你的发布', fromUserId: 'u_math', fromUserName: '上岸锦鲤', fromUserAvatar: '', targetType: 'post', targetId: '4', targetTitle: 'AI 工具如何辅助论文写作流程', read: false, blocked: false, createdAt: '昨天' },
  { id: 'follow-1', type: 'follows', title: '新增关注', content: '林晓晓关注了你', fromUserId: '3', fromUserName: '林晓晓', fromUserAvatar: '', targetType: 'user', targetId: '3', targetTitle: '林晓晓', read: false, blocked: false, createdAt: '刚刚' },
  { id: 'follow-2', type: 'follows', title: '新增关注', content: '周明远关注了你', fromUserId: '4', fromUserName: '周明远', fromUserAvatar: '', targetType: 'user', targetId: '4', targetTitle: '周明远', read: true, blocked: false, createdAt: '2小时前' },
  { id: 'follow-3', type: 'follows', title: '新增关注', content: '吴悦然关注了你', fromUserId: '5', fromUserName: '吴悦然', fromUserAvatar: '', targetType: 'user', targetId: '5', targetTitle: '吴悦然', read: false, blocked: false, createdAt: '昨天' },
  { id: 'comment-1', type: 'comments', title: '新的评论', content: '代码小白评论了你的帖子：我也在用，确实节省很多时间。', fromUserId: 'u_code', fromUserName: '代码小白', fromUserAvatar: '', targetType: 'post', targetId: '4', targetTitle: 'AI 工具如何辅助论文写作流程', read: false, blocked: false, createdAt: '30分钟前' },
  { id: 'comment-2', type: 'comments', title: '@了你', content: '材料人在评论中 @ 了你，想了解材料科学方向 prompt。', fromUserId: 'u_material', fromUserName: '材料人', fromUserAvatar: '', targetType: 'post', targetId: '4', targetTitle: 'AI 工具如何辅助论文写作流程', read: true, blocked: false, createdAt: '1小时前' },
  { id: 'comment-3', type: 'comments', title: '新的回复', content: '研机达人回复了你的评论。', fromUserId: 'u_research', fromUserName: '研机达人', fromUserAvatar: '', targetType: 'post', targetId: '1', targetTitle: '如何用 Python 高效完成数据分析？', read: false, blocked: false, createdAt: '昨天' },
  { id: 'comment-4', type: 'comments', title: '新的评论', content: '光影捕手评论了你的帖子：下次可以一起拍校园活动。', fromUserId: 'u_photo', fromUserName: '光影捕手', fromUserAvatar: '', targetType: 'post', targetId: '2', targetTitle: '浙大的春天太美了，求摄影搭子', read: true, blocked: false, createdAt: '2天前' },
  { id: 'system-1', type: 'system', title: '技能收藏提醒', content: '你的技能「Python编程」已被 3 位同学收藏，可以完善技能说明提升匹配率。', fromUserId: '', fromUserName: '系统通知', fromUserAvatar: '', targetType: 'user', targetId: '10086', targetTitle: '我的技能', read: false, blocked: false, createdAt: '昨天 18:20' },
  { id: 'system-2', type: 'system', title: '活动报名提醒', content: '本周五化学实验技能培训开始报名啦，感兴趣的话可以去活动页查看。', fromUserId: '', fromUserName: '系统通知', fromUserAvatar: '', targetType: 'activity', targetId: 'a1', targetTitle: '化学实验技能培训', read: true, blocked: false, createdAt: '周三 09:15' },
  { id: 'system-3', type: 'system', title: '资料完善建议', content: '补充一句话个人介绍后，同学在发现页和兴趣搭子页能更快了解你。', fromUserId: '', fromUserName: '系统通知', fromUserAvatar: '', targetType: 'user', targetId: '10086', targetTitle: '编辑资料', read: false, blocked: false, createdAt: '周一 12:00' },
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

export const POST_COMMENTS: Comment[] = [
  {
    id: 'c1',
    postId: 'fallback',
    userId: 'u_research',
    userName: '科研小达人',
    userAvatar: '',
    author: { name: '科研小达人', avatar: '' },
    content: '非常实用的分享！请问可以推荐一些具体的 workflow 吗？',
    time: '1小时前',
    createdAt: '1小时前',
    likes: 12,
    likeCount: 12,
    liked: false,
    replies: [
      {
        id: 'r1',
        commentId: 'c1',
        userId: '10086',
        userName: '陈同学',
        userAvatar: '',
        replyToUserId: 'u_research',
        replyToUserName: '科研小达人',
        content: '可以，我后面整理一个模板发出来。',
        createdAt: '30分钟前',
      },
    ],
  },
  {
    id: 'c2',
    postId: 'fallback',
    userId: 'u_code',
    userName: '代码小白',
    userAvatar: '',
    author: { name: '代码小白', avatar: '' },
    content: '我也在用，确实能节省很多时间。',
    time: '45分钟前',
    createdAt: '45分钟前',
    likes: 8,
    likeCount: 8,
    liked: false,
    replies: [],
  },
  {
    id: 'c3',
    postId: 'fallback',
    userId: 'u_material',
    userName: '材料人',
    userAvatar: '',
    author: { name: '材料人', avatar: '' },
    content: '有没有专门做材料科学方向的 prompt 推荐？',
    time: '30分钟前',
    createdAt: '30分钟前',
    likes: 5,
    likeCount: 5,
    liked: false,
    replies: [],
  },
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
  id?: string
  type: 'portfolio' | 'project' | 'certificate' | 'link'
  title: string
  desc: string
  url?: string
}

export type SkillProofDetail = {
  id: string
  skillId: string
  userId: string
  title: string
  type: SkillProof['type']
  status: 'approved' | 'pending' | 'draft'
  description: string
  relatedSkill: string
  level: number
  submitterName: string
  submitterAvatar: string
  createdAt: string
  updatedAt: string
  images: string[]
  links: { title: string; url: string }[]
  tags: string[]
  detail: {
    projectName?: string
    projectIntro?: string
    role?: string
    tools?: string[]
    result?: string
    workName?: string
    workIntro?: string
    scenes?: string[]
    certificateName?: string
    issuer?: string
    certificateNo?: string
    issuedAt?: string
  }
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
      { id: 'proof-ai-research-flow', type: 'project', title: '科研文献整理流程', desc: '整理过一套从文献筛选、摘要提取到研究问题生成的 AI 辅助流程。' },
      { id: 'proof-ai-prompt-templates', type: 'portfolio', title: 'Prompt 模板合集', desc: '沉淀了课程学习、论文写作和代码调试场景的常用 Prompt 模板。' },
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
      { id: 'proof-python-campus-data', type: 'project', title: '校园数据分析平台', desc: '基于 Django + ECharts 的学生数据可视化平台。' },
      { id: 'proof-python-cert', type: 'certificate', title: '计算机等级考试三级', desc: '数据库技术方向，具备基础工程能力。' },
      { id: 'proof-python-github', type: 'link', title: 'GitHub 练习项目', desc: '包含脚本自动化、数据清洗和 Flask 入门项目。', url: 'https://github.com/example/python-demo' },
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
      { id: 'proof-data-coursework', type: 'project', title: '课程数据可视化作业', desc: '使用 Python 清洗数据，并用 ECharts 输出交互式图表。' },
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

export const CURRENT_USER = {
  id: '10086',
  name: '陈同学',
  avatar: '',
}

export const AVATAR_STORAGE_KEY = 'currentUserAvatar'

export type SystemAvatar = {
  id: string
  name: string
  kind: 'text' | 'emoji'
  text: string
  bg: string
  color: string
}

export const SYSTEM_AVATARS: SystemAvatar[] = [
  { id: 'system-blue-text', name: '蓝色文字头像', kind: 'text', text: '张', bg: '#2563EB', color: '#FFFFFF' },
  { id: 'system-green-text', name: '绿色文字头像', kind: 'text', text: '浙', bg: '#10B981', color: '#FFFFFF' },
  { id: 'system-orange-text', name: '橙色文字头像', kind: 'text', text: '学', bg: '#F97316', color: '#FFFFFF' },
  { id: 'system-purple-text', name: '紫色文字头像', kind: 'text', text: '研', bg: '#7C3AED', color: '#FFFFFF' },
  { id: 'system-panda', name: '熊猫头像', kind: 'emoji', text: '🐼', bg: '#F8FAFC', color: '#111827' },
  { id: 'system-cat', name: '猫咪头像', kind: 'emoji', text: '🐱', bg: '#FFF7ED', color: '#111827' },
  { id: 'system-robot', name: '机器人头像', kind: 'emoji', text: '🤖', bg: '#EFF6FF', color: '#111827' },
  { id: 'system-campus', name: '校园风头像', kind: 'emoji', text: '🎓', bg: '#ECFEFF', color: '#111827' },
]

export const SKILL_PROOFS: SkillProofDetail[] = [
  {
    id: 'proof-ai-research-flow',
    skillId: 'ai-tools',
    userId: '10086',
    title: '科研文献整理流程',
    type: 'project',
    status: 'approved',
    description: '这份材料展示了如何使用 AI 完成文献筛选、摘要提取、研究问题归纳和阅读笔记整理，能够证明 TA 具备 AI 辅助科研流程设计能力。',
    relatedSkill: 'AI工具',
    level: 5,
    submitterName: '陈同学',
    submitterAvatar: '',
    createdAt: '2026-05-08',
    updatedAt: '2026-05-10',
    images: [],
    links: [
      { title: '流程说明文档', url: 'https://example.com/ai-research-workflow' },
    ],
    tags: ['科研效率', '论文写作', 'Prompt', '文献整理'],
    detail: {
      projectName: '科研文献整理流程',
      projectIntro: '面向课程论文和研究选题的 AI 辅助文献处理流程，覆盖检索关键词、摘要提取、主题聚类和阅读笔记生成。',
      role: '流程设计与 Prompt 模板整理',
      tools: ['ChatGPT', 'Kimi', 'Zotero', 'Markdown'],
      result: '将一次主题调研的初步整理时间从数小时缩短到约 40 分钟，并沉淀为可复用模板。',
    },
  },
  {
    id: 'proof-ai-prompt-templates',
    skillId: 'ai-tools',
    userId: '10086',
    title: 'Prompt 模板合集',
    type: 'portfolio',
    status: 'pending',
    description: '这份作品集整理了学习、论文写作和代码调试场景中的常用 Prompt，可以证明 TA 有较系统的 AI 工具使用经验。',
    relatedSkill: 'AI工具',
    level: 5,
    submitterName: '陈同学',
    submitterAvatar: '',
    createdAt: '2026-05-06',
    updatedAt: '2026-05-09',
    images: [],
    links: [
      { title: 'Prompt 模板预览', url: 'https://example.com/prompt-templates' },
    ],
    tags: ['Prompt', '代码辅助', '学习效率', '论文写作'],
    detail: {
      workName: 'Prompt 模板合集',
      workIntro: '按使用场景整理的 Prompt 作品集，包括文献综述、论文润色、代码解释、调试定位和学习计划生成。',
      scenes: ['课程学习', '论文写作', '代码调试', '科研资料整理'],
    },
  },
  {
    id: 'proof-python-campus-data',
    skillId: 'python',
    userId: '10086',
    title: '校园数据分析平台',
    type: 'project',
    status: 'approved',
    description: '通过 Django 和 ECharts 完成数据展示平台，证明 TA 具备 Python Web 入门、数据处理和可视化能力。',
    relatedSkill: 'Python 编程',
    level: 4,
    submitterName: '陈同学',
    submitterAvatar: '',
    createdAt: '2026-04-28',
    updatedAt: '2026-05-02',
    images: [],
    links: [
      { title: '项目仓库', url: 'https://github.com/example/campus-data' },
    ],
    tags: ['Python', 'Django', 'ECharts', '数据分析'],
    detail: {
      projectName: '校园数据分析平台',
      projectIntro: '用于展示课程样例数据和学生数据统计的 Web 可视化平台。',
      role: '负责数据清洗、接口整理和图表页面搭建',
      tools: ['Python', 'Django', 'ECharts', 'Pandas'],
      result: '完成基础数据导入、指标统计和图表展示，可用于课程演示。',
    },
  },
  {
    id: 'proof-python-cert',
    skillId: 'python',
    userId: '10086',
    title: '计算机等级考试三级',
    type: 'certificate',
    status: 'draft',
    description: '用于补充说明基础计算机能力和数据库方向学习经历。',
    relatedSkill: 'Python 编程',
    level: 4,
    submitterName: '陈同学',
    submitterAvatar: '',
    createdAt: '2026-04-20',
    updatedAt: '2026-04-20',
    images: [],
    links: [],
    tags: ['证书', '数据库', '基础能力'],
    detail: {
      certificateName: '全国计算机等级考试三级',
      issuer: '教育考试机构',
      certificateNo: 'MOCK-2026-0001',
      issuedAt: '2026-04-20',
    },
  },
  {
    id: 'proof-python-github',
    skillId: 'python',
    userId: '10086',
    title: 'GitHub 练习项目',
    type: 'link',
    status: 'approved',
    description: '整理了脚本自动化、数据清洗和 Flask 入门练习项目，方便别人快速了解 TA 的 Python 实践基础。',
    relatedSkill: 'Python 编程',
    level: 4,
    submitterName: '陈同学',
    submitterAvatar: '',
    createdAt: '2026-04-18',
    updatedAt: '2026-05-01',
    images: [],
    links: [
      { title: 'GitHub 练习项目', url: 'https://github.com/example/python-demo' },
    ],
    tags: ['Python', 'Flask', '自动化脚本', '数据清洗'],
    detail: {
      workName: 'GitHub 练习项目',
      workIntro: '包含若干个 Python 练习项目，用于展示基础脚本、数据处理和轻量 Web 开发能力。',
      scenes: ['课程练习', '项目入门', '代码示例'],
    },
  },
  {
    id: 'proof-data-coursework',
    skillId: 'data-analysis',
    userId: '10086',
    title: '课程数据可视化作业',
    type: 'project',
    status: 'pending',
    description: '使用 Python 清洗课程样例数据，并用 ECharts 输出交互式图表，展示基础数据分析思路。',
    relatedSkill: '数据分析',
    level: 3,
    submitterName: '陈同学',
    submitterAvatar: '',
    createdAt: '2026-04-12',
    updatedAt: '2026-04-25',
    images: [],
    links: [],
    tags: ['Pandas', 'ECharts', '可视化', '课程作业'],
    detail: {
      projectName: '课程数据可视化作业',
      projectIntro: '围绕课程样例数据完成清洗、统计和可视化展示。',
      role: '负责数据清洗、指标梳理和图表实现',
      tools: ['Python', 'Pandas', 'ECharts'],
      result: '完成基础统计图表和可视化说明，可作为课程作业演示材料。',
    },
  },
  {
    id: 'proof-ai-other-workflow',
    skillId: 'ai-tools',
    userId: '20001',
    title: '科研选题 AI 工作流',
    type: 'project',
    status: 'approved',
    description: '用于测试非本人视角的证明材料：当前用户只能查看和联系 TA，不能编辑证明材料。',
    relatedSkill: 'AI工具',
    level: 5,
    submitterName: '陈同学',
    submitterAvatar: '',
    createdAt: '2026-05-03',
    updatedAt: '2026-05-09',
    images: [],
    links: [],
    tags: ['科研选题', 'AI工作流', 'Prompt'],
    detail: {
      projectName: '科研选题 AI 工作流',
      projectIntro: '帮助同学从兴趣关键词出发，快速整理研究问题、资料方向和初步阅读清单。',
      role: '流程设计与场景演示',
      tools: ['ChatGPT', 'Kimi', 'Markdown'],
      result: '形成可复用的选题讨论模板，用于前期科研交流。',
    },
  },
]

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

export const MY_POSTS = [
  {
    id: '1',
    title: '如何用 Python 高效完成数据分析？',
    excerpt: '整理了我在课程作业和科研数据处理中常用的分析流程，适合刚开始接触 pandas 的同学。',
    tags: ['Python', '数据分析'],
    likes: 128,
    comments: 32,
    authorId: '10086',
    visibility: 'public',
    time: '2天前',
  },
  {
    id: '4',
    title: 'AI 工具如何辅助论文写作流程',
    excerpt: '从文献整理、提纲生成到初稿润色，分享一套适合课程论文和组会汇报的 AI 使用方式。',
    tags: ['AI', '论文写作'],
    likes: 67,
    comments: 23,
    authorId: '10086',
    visibility: 'public',
    time: '1周前',
  },
]

export const INTEREST_DETAILS: Record<string, {
  name: string
  intro: string
  partners: { id: string; name: string; desc: string; tags: string[] }[]
  posts: { id: string; title: string; excerpt: string; tags: string[]; likes: number; comments: number }[]
  activities: { id: string; title: string; time: string; location: string; tags: string[] }[]
}> = {
  科研: {
    name: '科研',
    intro: '找到正在做科研训练、文献阅读和论文写作的同学，一起交流方法和工具。',
    partners: [
      { id: 'research-1', name: '研机达人', desc: '擅长文献管理和科研效率工具。', tags: ['文献整理', '论文写作'] },
      { id: 'research-2', name: '材料人', desc: '想找同学一起讨论材料方向选题。', tags: ['组会', '选题'] },
    ],
    posts: [
      { id: '4', title: 'AI 工具如何辅助论文写作流程', excerpt: '从文献整理到初稿润色的一套流程。', tags: ['AI', '论文写作'], likes: 67, comments: 23 },
    ],
    activities: [
      { id: 'interest-research-a1', title: '文献阅读方法交流', time: '周五 19:00', location: '紫金港图书馆', tags: ['科研', '文献'] },
    ],
  },
  AI: {
    name: 'AI',
    intro: '一起探索 AI 工具、Prompt、辅助科研和辅助编程的高效用法。',
    partners: [
      { id: 'ai-1', name: 'Prompt 练习生', desc: '正在整理课程学习和论文写作 Prompt。', tags: ['Prompt', '效率工具'] },
    ],
    posts: [
      { id: '4', title: 'AI 工具如何辅助论文写作流程', excerpt: '适合课程论文和组会汇报的 AI 使用方式。', tags: ['AI', '论文写作'], likes: 67, comments: 23 },
    ],
    activities: [
      { id: 'interest-ai-a1', title: 'AI 工具分享会', time: '周三 19:00', location: '北教 203', tags: ['AI', '科研效率'] },
    ],
  },
  徒步: {
    name: '徒步',
    intro: '找到喜欢徒步和户外的同学，周末一起走走杭州的山和校园路线。',
    partners: [
      { id: 'hike-1', name: '周末路线控', desc: '喜欢轻徒步，常走北高峰和九溪路线。', tags: ['周末', '轻徒步'] },
    ],
    posts: [],
    activities: [
      { id: 'interest-hike-a1', title: '周末九溪轻徒步', time: '周六 09:00', location: '九溪入口集合', tags: ['徒步', '户外'] },
    ],
  },
  摄影: {
    name: '摄影',
    intro: '找到喜欢摄影的同学，一起拍照、修图、交流器材。',
    partners: [
      { id: 'photo-1', name: '光影捕手', desc: '喜欢校园人像和街拍，想找同频搭子。', tags: ['人像', '修图'] },
      { id: 'photo-2', name: '胶片同学', desc: '正在学习胶片和色彩风格。', tags: ['胶片', '扫街'] },
    ],
    posts: [
      { id: '2', title: '浙大的春天太美了，求摄影搭子', excerpt: '想找喜欢摄影的同学一起扫校园。', tags: ['摄影', '搭子'], likes: 256, comments: 45 },
    ],
    activities: [
      { id: 'interest-photo-a1', title: '紫金港校园摄影采风', time: '周日 15:00', location: '月牙楼集合', tags: ['摄影', '校园'] },
    ],
  },
  桌游: {
    name: '桌游',
    intro: '找到喜欢桌游、剧本和轻社交的同学，一起组局放松一下。',
    partners: [
      { id: 'board-1', name: '桌游局长', desc: '偏好轻策略和合作类桌游。', tags: ['策略', '组局'] },
    ],
    posts: [],
    activities: [
      { id: 'interest-board-a1', title: '周五桌游小局', time: '周五 20:00', location: '学生活动中心', tags: ['桌游', '社交'] },
    ],
  },
}

// ========== MY REVIEWS ==========
export type UserReview = {
  id: string
  reviewerId: string
  reviewerName: string
  reviewerAvatar: string
  rating: number
  tags: string[]
  content: string
  relatedType: 'skill' | 'activity' | 'partner'
  relatedId: string
  relatedTitle: string
  createdAt: string
}

export const MY_REVIEWS: UserReview[] = [
  {
    id: 'r1',
    reviewerId: 'u_review_1',
    reviewerName: '王同学',
    reviewerAvatar: '',
    rating: 5, tags: ['认真', '准时', '讲得清楚'],
    content: 'Python 讲得很清楚，案例也很实用，帮我解决了数据分析的大问题。',
    relatedType: 'skill',
    relatedId: 'skill_python',
    relatedTitle: 'Python 编程',
    createdAt: '3天前',
  },
  {
    id: 'r2',
    reviewerId: 'u_review_2',
    reviewerName: '李学姐',
    reviewerAvatar: '',
    rating: 5, tags: ['有耐心', '专业'],
    content: 'AI工具的使用心得分享非常详细，学到了很多实用技巧。',
    relatedType: 'skill',
    relatedId: 'skill_ai',
    relatedTitle: 'AI工具',
    createdAt: '1周前',
  },
  {
    id: 'r3',
    reviewerId: 'u_review_3',
    reviewerName: '材料人',
    reviewerAvatar: '',
    rating: 4.5, tags: ['及时', '沟通顺畅'],
    content: '一起整理课程项目数据时很靠谱，能把步骤说明清楚，也会提醒容易出错的地方。',
    relatedType: 'partner',
    relatedId: 'partner_data_1',
    relatedTitle: '数据分析学习互助',
    createdAt: '2周前',
  },
  {
    id: 'r4',
    reviewerId: 'u_review_4',
    reviewerName: '羽毛球搭子',
    reviewerAvatar: '',
    rating: 4.8,
    tags: ['准时', '友好'],
    content: '活动组织得很顺利，时间地点沟通清楚，体验很好。',
    relatedType: 'activity',
    relatedId: 'activity_badminton_1',
    relatedTitle: '周末羽毛球活动',
    createdAt: '1个月前',
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
