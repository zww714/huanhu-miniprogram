const { ok, fail, db, cloud } = require('./shared')
const _ = db.command

const SEED_TAG = 'huanhu-initial-v1'

const users = [
  {
    _id: 'user_chen',
    name: '陈同学',
    avatar: '/assets/avatar.png',
    verified: true,
    school: '浙江大学',
    college: '物理学院',
    major: '物理学',
    grade: '博士在读',
    match: 92,
    bio: '擅长用 AI 和编程工具帮助同学快速上手科研与项目实践。',
    stats: { skills: 5, posts: 12, followers: 86, following: 42 },
    skills: [
      { name: 'AI工具', level: 5, desc: '熟练使用 AI 工具辅助科研、写作和项目开发', tags: ['ChatGPT', '提示词', '效率工具'] },
      { name: 'Python', level: 4, desc: '熟练使用 Python 进行数据分析、机器学习与 Web 开发', tags: ['数据分析', 'Django', 'TensorFlow'] },
      { name: '数据分析', level: 3, desc: '具备数据清洗、可视化和建模能力', tags: ['Pandas', 'Matplotlib', 'SQL'] },
      { name: '英语交流', level: 2, desc: '可进行英文口语和学术写作交流', tags: ['口语', '学术写作'] },
      { name: 'MATLAB', level: 1, desc: '具备基础仿真和信号处理经验', tags: ['仿真', '信号处理'] },
    ],
    can: [
      { name: 'AI工具', level: 5 },
      { name: 'Python', level: 4 },
      { name: '数据分析', level: 3 },
    ],
    want: ['摄影', '产品设计'],
    learnWants: ['摄影', '产品设计', '羽毛球'],
    interests: ['科研', 'AI', '徒步', '摄影', '桌游'],
    following: ['user_xiong'],
    followers: ['user_xiong', 'user_orange'],
    reviews: [
      { id: 'review_1', reviewer: '王同学', rating: 5, tags: ['准时', '讲得清楚'], content: '帮我理清了 Python 数据分析的思路。', skill: 'Python', time: '3天前' },
      { id: 'review_2', reviewer: '李学妹', rating: 5, tags: ['专业', '有耐心'], content: 'AI 工具分享非常实用。', skill: 'AI工具', time: '1周前' },
    ],
  },
  {
    _id: 'user_xiong',
    name: '小熊软糖',
    avatar: '/assets/avatar.png',
    verified: true,
    school: '浙江大学',
    college: '计算机学院',
    major: '计算机科学与技术',
    grade: '研二',
    match: 89,
    bio: '擅长英语学习方法与翻译技巧，帮助提升语言应用能力。',
    stats: { skills: 3, posts: 5, followers: 64, following: 38 },
    skills: [
      { name: '英语交流', level: 5, desc: '熟悉英语口语、学术写作和论文润色', tags: ['口语', '学术写作', '翻译'] },
      { name: '写作', level: 4, desc: '擅长学术论文结构梳理与表达优化', tags: ['论文', '润色'] },
      { name: '翻译', level: 3, desc: '有中英互译和材料校对经验', tags: ['中英互译'] },
    ],
    can: [
      { name: '英语交流', level: 5 },
      { name: '写作', level: 4 },
      { name: '翻译', level: 3 },
    ],
    want: ['Python', '数据分析'],
    learnWants: ['Python', '数据分析'],
    interests: ['阅读', '英语', '电影', '旅行'],
    following: ['user_chen'],
    followers: ['user_chen'],
    reviews: [],
  },
  {
    _id: 'user_orange',
    name: '橙子汽水',
    avatar: '/assets/avatar.png',
    verified: true,
    school: '浙江大学',
    college: '电子信息学院',
    major: '电子工程',
    grade: '研一',
    match: 87,
    bio: '擅长嵌入式开发与硬件调试，喜欢动手解决实际问题。',
    stats: { skills: 3, posts: 4, followers: 52, following: 30 },
    skills: [
      { name: 'MATLAB', level: 5, desc: '熟悉 MATLAB 仿真、信号处理和图像处理', tags: ['仿真', '信号处理'] },
      { name: 'AI工具', level: 3, desc: '了解 AI 辅助开发和学习工具', tags: ['AI', '效率'] },
      { name: '嵌入式开发', level: 2, desc: '有 STM32 和 Arduino 项目经验', tags: ['STM32', 'Arduino'] },
    ],
    can: [
      { name: 'MATLAB', level: 5 },
      { name: 'AI工具', level: 3 },
      { name: '嵌入式开发', level: 2 },
    ],
    want: ['AI工具', '摄影'],
    learnWants: ['AI工具', '摄影'],
    interests: ['电子', 'DIY', '摄影', '运动'],
    following: [],
    followers: ['user_chen'],
    reviews: [],
  },
  {
    _id: 'user_photo',
    name: '光影捕手',
    avatar: '/assets/avatar.png',
    verified: false,
    school: '浙江大学',
    college: '艺术与考古学院',
    major: '设计学',
    grade: '大二',
    match: 83,
    bio: '摄影爱好者，周末喜欢扫街和校园人像互拍。',
    stats: { skills: 2, posts: 8, followers: 120, following: 45 },
    skills: [
      { name: '摄影', level: 4, desc: '擅长校园人像和活动记录', tags: ['人像', '修图'] },
      { name: '产品设计', level: 3, desc: '有移动端 UI 设计经验', tags: ['Figma', 'UI'] },
    ],
    can: [
      { name: '摄影', level: 4 },
      { name: '产品设计', level: 3 },
    ],
    want: ['Python', 'AI工具'],
    learnWants: ['Python', 'AI工具'],
    interests: ['摄影', '设计', '展览'],
    following: [],
    followers: [],
    reviews: [],
  },
]

const posts = [
  {
    _id: 'post_python',
    userId: 'user_chen',
    title: '如何用 Python 高效完成数据分析？',
    excerpt: '分享我在科研中常用的几个 Python 库，包括 pandas、numpy 和 matplotlib 的使用技巧。',
    content: '从数据清洗、探索分析到可视化，我整理了一套适合科研新手快速上手的 Python 数据分析流程。',
    cover: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    categoryTag: '科研·技能交换',
    mainCategory: '科研',
    tags: ['编程', '数据分析', 'Python'],
    likes: 128,
    comments: 32,
  },
  {
    _id: 'post_photo',
    userId: 'user_photo',
    title: '浙大的春天太美了，求摄影搭子',
    excerpt: '最近樱花和郁金香都开了，想找喜欢摄影的同学一起扫校园。',
    content: '我比较擅长人像摄影，也可以互拍。周末下午紫金港出发，欢迎一起。',
    cover: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    categoryTag: '兴趣·搭子',
    mainCategory: '兴趣',
    tags: ['摄影', '兴趣搭子'],
    likes: 256,
    comments: 45,
  },
  {
    _id: 'post_math',
    userId: 'user_orange',
    title: '考研数学复习经验分享',
    excerpt: '从基础到强化，三个月数学一 140 分的复习路线。',
    content: '重点聊资料选择、错题整理和冲刺阶段的时间分配，希望能帮到正在备考的同学。',
    cover: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    categoryTag: '升学·经验',
    mainCategory: '升学',
    tags: ['考研', '数学'],
    likes: 512,
    comments: 89,
  },
  {
    _id: 'post_ai',
    userId: 'user_xiong',
    title: '求推荐好用的 AI 写作工具',
    excerpt: '最近在写论文综述，想找一些能辅助文献整理和写作的工具。',
    content: '目前了解 ChatGPT、Claude、Notion AI，想听听大家在学术写作中的真实使用体验。',
    cover: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
    categoryTag: '科研·求助',
    mainCategory: '科研',
    tags: ['AI', '论文写作'],
    likes: 67,
    comments: 23,
  },
]

const activities = [
  {
    _id: 'activity_photo',
    title: '周末相约紫金港·校园摄影采风',
    time: '5月10日 14:00',
    location: '紫金港校区 月牙楼前',
    participants: 12,
    maxParticipants: 30,
    cover: 'linear-gradient(135deg, #06B6D4 0%, #3B82F6 100%)',
    organizer: '摄影协会',
    tags: ['摄影', '户外'],
    category: '兴趣',
  },
  {
    _id: 'activity_ai',
    title: 'AI 工具分享会·用 AI 提升科研效率',
    time: '5月12日 19:00',
    location: '紫金港校区 北教 101',
    participants: 28,
    maxParticipants: 50,
    cover: 'linear-gradient(135deg, #8B5CF6 0%, #6366F1 100%)',
    organizer: 'AI 研习社',
    tags: ['AI', '科研'],
    category: '技能交换',
  },
  {
    _id: 'activity_volunteer',
    title: '周末志愿行·社区服务公益活动',
    time: '5月14日 08:30',
    location: '西湖区 翠苑社区',
    participants: 9,
    maxParticipants: 20,
    cover: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
    organizer: '青年志愿者协会',
    tags: ['志愿', '公益'],
    category: '志愿',
  },
  {
    _id: 'activity_career',
    title: '求职分享·大厂面试经验交流',
    time: '5月15日 18:30',
    location: '玉泉校区 曹光彪楼',
    participants: 45,
    maxParticipants: 80,
    cover: 'linear-gradient(135deg, #F59E0B 0%, #EF4444 100%)',
    organizer: '职业发展中心',
    tags: ['求职', '面试'],
    category: '其他',
  },
]

const conversations = [
  {
    _id: 'conv_chen_xiong',
    participants: ['user_chen', 'user_xiong'],
    lastMessage: '好的，那我们明天下午在图书馆见！',
    lastMessageTime: new Date('2026-05-10T14:32:00+08:00'),
    unreadCount: { user_chen: 3, user_xiong: 0 },
    category: '技能交换',
  },
  {
    _id: 'conv_chen_orange',
    participants: ['user_chen', 'user_orange'],
    lastMessage: '你的 Python 项目进展怎么样了？',
    lastMessageTime: new Date('2026-05-10T12:05:00+08:00'),
    unreadCount: { user_chen: 1, user_orange: 0 },
    category: '技能交换',
  },
  {
    _id: 'conv_chen_photo',
    participants: ['user_chen', 'user_photo'],
    lastMessage: '周末一起去拍照吗？',
    lastMessageTime: new Date('2026-05-09T18:20:00+08:00'),
    unreadCount: { user_chen: 0, user_photo: 0 },
    category: '兴趣搭子',
  },
]

function stamp(doc) {
  return {
    ...doc,
    seedTag: SEED_TAG,
    createdAt: doc.createdAt || db.serverDate(),
    updatedAt: db.serverDate(),
  }
}

async function upsert(collectionName, docs) {
  const collection = db.collection(collectionName)
  let written = 0

  for (const doc of docs) {
    const { _id, ...data } = stamp(doc)
    await collection.doc(_id).set({ data })
    written += 1
  }

  return written
}

async function clearSeeded(collectionName) {
  const collection = db.collection(collectionName)
  let removed = 0

  while (true) {
    const result = await collection.where({ seedTag: SEED_TAG }).limit(100).get()
    if (!result.data.length) break

    await Promise.all(result.data.map(doc => collection.doc(doc._id).remove()))
    removed += result.data.length
  }

  return removed
}

exports.main = async (event = {}) => {
  const collections = ['conversations', 'posts', 'activities', 'users']
  const { OPENID } = cloud.getWXContext()

  try {
    const removed = {}
    if (event.reset !== false) {
      for (const name of collections) {
        removed[name] = await clearSeeded(name)
      }
    }

    const seedUsers = users.map((user) => {
      if (user._id === 'user_chen' && event.bindCurrentUser !== false && OPENID) {
        return { ...user, openid: OPENID }
      }
      return user
    })

    const written = {
      users: await upsert('users', seedUsers),
      posts: await upsert('posts', posts),
      activities: await upsert('activities', activities),
      conversations: await upsert('conversations', conversations),
    }

    return {
      code: 0,
      msg: '初始数据写入完成',
      seedTag: SEED_TAG,
      removed,
      written,
    }
  } catch (err) {
    console.error('[initData]', err)
    return {
      code: -1,
      msg: '初始数据写入失败',
      error: err.message || err,
    }
  }
}
