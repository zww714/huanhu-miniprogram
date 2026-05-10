/**
 * 数据库种子脚本
 * 
 * 使用方式：
 * 1. 微信开发者工具 → 云开发控制台 → 数据库
 * 2. 依次创建以下集合：
 *    - users
 *    - skills
 *    - posts
 *    - activities
 *    - conversations
 *    - reviews
 * 3. 需要给每个集合创建索引
 * 4. 打开云开发控制台 → 云函数 → 新建 Node.js 云函数 "seed"
 * 5. 把本文件内容粘贴到 index.js，右键「上传并部署」
 * 6. 在云开发控制台调用该函数
 * 
 * 或者直接在云开发控制台的「数据库」面板手动导入下面的 JSON 数据。
 */

const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

// ============ 种子数据 ============

const SEED_USERS = [
  {
    name: '陈同学',
    avatar: '',
    verified: true,
    school: '浙江大学',
    college: '物理学院',
    grade: '博士在读',
    bio: '擅长用 AI 和编程工具帮助同学快速上手科研与项目实践',
    stats: { skills: 3, posts: 3, followers: 86, following: 42 },
    skills: [
      { name: 'AI工具', level: 5, desc: '熟练使用各种AI工具辅助科研与开发', tags: ['ChatGPT', 'Copilot', 'Midjourney'] },
      { name: 'Python', level: 4, desc: '熟练使用 Python 进行数据分析、机器学习与 Web 开发', tags: ['数据分析', 'Django', 'TensorFlow'] },
      { name: '数据分析', level: 3, desc: '具备数据清洗、可视化和建模能力', tags: ['Pandas', 'Matplotlib', 'SQL'] },
    ],
    learnWants: ['摄影', '产品设计'],
    interests: ['科研', 'AI', '徒步', '摄影', '桌游'],
    following: [],
    followers: [],
    createdAt: new Date('2026-03-01'),
    lastLogin: new Date(),
  },
  {
    name: '小熊软糖',
    avatar: '',
    verified: true,
    school: '浙江大学',
    college: '计算机学院',
    grade: '博士在读',
    bio: '擅长英语学习方法与翻译技巧，帮助提升语言应用能力',
    stats: { skills: 3, posts: 5, followers: 64, following: 38 },
    skills: [
      { name: '英语交流', level: 5, desc: '流利的英语口语和写作能力，雅思7.5', tags: ['雅思', '学术写作', '口语'] },
      { name: '写作', level: 4, desc: '擅长学术论文写作和润色', tags: ['论文', '润色'] },
      { name: '翻译', level: 3, desc: '中英互译经验丰富', tags: ['翻译', '学术翻译'] },
    ],
    learnWants: ['Python', '数据分析'],
    interests: ['阅读', '英语', '电影', '旅行'],
    following: [],
    followers: [],
    createdAt: new Date('2026-03-05'),
    lastLogin: new Date(),
  },
  {
    name: '橘子汽水',
    avatar: '',
    verified: true,
    school: '浙江大学',
    college: '电子学院',
    grade: '博士在读',
    bio: '擅长嵌入式开发与硬件调试，喜欢动手解决实际问题',
    stats: { skills: 3, posts: 4, followers: 52, following: 30 },
    skills: [
      { name: 'MATLAB', level: 5, desc: '精通 MATLAB 仿真与信号处理', tags: ['仿真', '信号处理', '图像处理'] },
      { name: 'AI工具', level: 3, desc: '了解 AI 辅助开发工具', tags: ['AI', '提效'] },
      { name: '嵌入式开发', level: 2, desc: 'STM32/Arduino 开发经验', tags: ['嵌入式', '硬件'] },
    ],
    learnWants: ['AI工具', '摄影'],
    interests: ['电子', 'DIY', '摄影', '运动'],
    following: [],
    followers: [],
    createdAt: new Date('2026-03-10'),
    lastLogin: new Date(),
  },
]

const SEED_POSTS = [
  {
    userId: '', // 需要在导入后关联用户ID
    title: '如何用 Python 高效完成数据分析？',
    excerpt: '分享我在科研中常用的几个 Python 库，包括 pandas、numpy 和 matplotlib 的使用技巧...',
    categoryTag: '科研·技能交换',
    mainCategory: '科研',
    tags: ['编程', '数据分析'],
    likes: 128, comments: 32,
    createdAt: new Date('2026-04-20'),
  },
  {
    userId: '',
    title: '浙大的春天太美了，求摄影搭子',
    excerpt: '最近樱花和郁金香都开了，想找个喜欢摄影的同学一起扫校园~',
    categoryTag: '兴趣·搭子',
    mainCategory: '兴趣',
    tags: ['摄影', '兴趣搭子'],
    likes: 256, comments: 45,
    createdAt: new Date('2026-04-22'),
  },
  {
    userId: '',
    title: '考研数学复习经验分享',
    excerpt: '从基础到强化，三个月数学一140分的复习路线...',
    categoryTag: '升学·经验',
    mainCategory: '升学',
    tags: ['考研', '数学'],
    likes: 512, comments: 89,
    createdAt: new Date('2026-04-25'),
  },
  {
    userId: '',
    title: '求推荐好用的 AI 写作工具',
    excerpt: '最近在写论文综述，想找一些能辅助文献整理和写作的工具...',
    categoryTag: '科研·求助',
    mainCategory: '科研',
    tags: ['AI', '论文写作'],
    likes: 67, comments: 23,
    createdAt: new Date('2026-04-28'),
  },
]

const SEED_ACTIVITIES = [
  {
    title: '周末相约紫金港 · 校园摄影采风',
    time: '5月10日 14:00',
    location: '紫金港校区 月牙楼',
    participants: 12, maxParticipants: 30,
    tags: ['摄影', '户外'],
    category: '兴趣',
    cover: '', organizer: '摄影协会',
    createdAt: new Date('2026-04-15'),
  },
  {
    title: 'AI工具分享会 · 用AI提升科研效率',
    time: '5月12日 19:00',
    location: '紫金港校区 北教',
    participants: 28, maxParticipants: 50,
    tags: ['AI', '科研'],
    category: '技能交换',
    cover: '', organizer: 'AI研习社',
    createdAt: new Date('2026-04-18'),
  },
  {
    title: '周末志愿行 · 社区服务公益活动',
    time: '5月14日 08:30',
    location: '西湖区 翠苑社区',
    participants: 9, maxParticipants: 20,
    tags: ['志愿', '公益'],
    category: '志愿',
    cover: '', organizer: '青年志愿者协会',
    createdAt: new Date('2026-04-20'),
  },
  {
    title: '求职分享 · 大厂面试经验交流',
    time: '5月15日 18:30',
    location: '玉泉校区 曹光彪楼',
    participants: 45, maxParticipants: 80,
    tags: ['求职', '面试'],
    category: '其他',
    cover: '', organizer: '职业发展中心',
    createdAt: new Date('2026-04-22'),
  },
  {
    title: '英语角 · 跨文化交流下午茶',
    time: '5月17日 15:00',
    location: '紫金港校区 咖啡吧',
    participants: 18, maxParticipants: 25,
    tags: ['英语', '交流'],
    category: '兴趣',
    cover: '', organizer: '英语协会',
    createdAt: new Date('2026-04-25'),
  },
  {
    title: 'Python技能交换 · 从入门到项目实战',
    time: '5月20日 14:00',
    location: '紫金港校区 机房',
    participants: 15, maxParticipants: 30,
    tags: ['编程', 'Python'],
    category: '技能交换',
    cover: '', organizer: '计算机学院学生会',
    createdAt: new Date('2026-04-28'),
  },
]

exports.main = async (event, context) => {
  const step = event.step || 'all'

  try {
    // Step 1: 清空旧数据（首次导入用）
    if (step === 'all' || step === 'clear') {
      await db.collection('users').where({}).remove()
      await db.collection('posts').where({}).remove()
      await db.collection('activities').where({}).remove()
      console.log('✅ 旧数据已清空')
      if (step === 'clear') return { code: 0, msg: '已清空所有旧数据' }
    }

    // Step 2: 导入用户
    if (step === 'all' || step === 'users') {
      for (const u of SEED_USERS) {
        const r = await db.collection('users').add({ data: u })
        console.log(`  ✅ 已创建用户: ${u.name} (${r._id})`)
      }
    }

    // Step 3: 导入帖子（需要先关联用户 ID）
    if (step === 'all' || step === 'posts') {
      const users = await db.collection('users').get()
      for (let i = 0; i < SEED_POSTS.length; i++) {
        const post = { ...SEED_POSTS[i] }
        // 轮流关联到不同的用户
        post.userId = users.data[i % users.data.length]._id
        const r = await db.collection('posts').add({ data: post })
        console.log(`  ✅ 已创建帖子: ${post.title} (${r._id})`)
      }
    }

    // Step 4: 导入活动
    if (step === 'all' || step === 'activities') {
      for (const a of SEED_ACTIVITIES) {
        const r = await db.collection('activities').add({ data: a })
        console.log(`  ✅ 已创建活动: ${a.title} (${r._id})`)
      }
    }

    return {
      code: 0,
      msg: '种子数据导入完成',
      stats: {
        users: SEED_USERS.length,
        posts: SEED_POSTS.length,
        activities: SEED_ACTIVITIES.length,
      },
    }
  } catch (err) {
    console.error('[seed]', err)
    return { code: -1, msg: '导入失败', error: err }
  }
}
