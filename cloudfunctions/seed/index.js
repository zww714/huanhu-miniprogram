// 云函数入口文件 - 导入种子数据
const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

// ========== 种子数据 ==========

const SEED_USERS = [
  {
    name: '陈同学',
    avatar: 'https://picsum.photos/seed/user1/200/200',
    verified: true,
    college: '物理学院',
    grade: '博三',
    campus: '紫金港校区',
    intro: '擅长用 AI 和编程工具帮助同学快速上手科研与项目实践',
    canTeach: ['AI工具', 'Python', '数据分析'],
    wantToLearn: ['摄影', '产品设计'],
    interests: ['科研', 'AI', '徒步', '摄影', '桌游'],
    matchRate: 95,
    type: 'skill_exchange',
    createdAt: new Date('2026-03-01'),
    updatedAt: new Date('2026-05-01'),
  },
  {
    name: '小熊软糖',
    avatar: 'https://picsum.photos/seed/user2/200/200',
    verified: true,
    college: '计算机学院',
    grade: '博二',
    campus: '玉泉校区',
    intro: '擅长英语学习方法与翻译技巧，帮助提升语言应用能力',
    canTeach: ['英语交流', '写作', '翻译'],
    wantToLearn: ['Python', '数据分析'],
    interests: ['阅读', '英语', '电影', '旅行'],
    matchRate: 92,
    type: 'skill_exchange',
    createdAt: new Date('2026-03-05'),
    updatedAt: new Date('2026-05-02'),
  },
  {
    name: '橘子汽水',
    avatar: 'https://picsum.photos/seed/user3/200/200',
    verified: true,
    college: '电子学院',
    grade: '博一',
    campus: '紫金港校区',
    intro: '擅长嵌入式开发与硬件调试，喜欢动手解决实际问题',
    canTeach: ['MATLAB', 'AI工具', '嵌入式开发'],
    wantToLearn: ['AI工具', '摄影'],
    interests: ['电子', 'DIY', '摄影', '运动'],
    matchRate: 88,
    type: 'skill_exchange',
    createdAt: new Date('2026-03-10'),
    updatedAt: new Date('2026-05-03'),
  },
  {
    name: '学建筑的猫',
    avatar: 'https://picsum.photos/seed/user4/200/200',
    verified: false,
    college: '建筑学院',
    grade: '硕二',
    campus: '紫金港校区',
    intro: '会画图、会设计，找个一起做竞赛的队友',
    canTeach: ['CAD', 'SketchUp', '设计基础'],
    wantToLearn: ['Python', '摄影'],
    interests: ['设计', '建筑', '猫咪', '画画'],
    matchRate: 85,
    type: 'partner',
    createdAt: new Date('2026-03-15'),
    updatedAt: new Date('2026-05-04'),
  },
  {
    name: '跑步的鱼',
    avatar: 'https://picsum.photos/seed/user5/200/200',
    verified: false,
    college: '管理学院',
    grade: '硕一',
    campus: '紫金港校区',
    intro: '跑过半马，全马进四，找个跑友一起刷圈',
    canTeach: ['跑步训练', '健身'],
    wantToLearn: ['英语交流', '摄影'],
    interests: ['跑步', '健身', '户外', '美食'],
    matchRate: 90,
    type: 'partner',
    createdAt: new Date('2026-03-20'),
    updatedAt: new Date('2026-05-05'),
  },
]

const SEED_POSTS = [
  {
    title: '如何用 Python 高效完成数据分析？',
    content: '分享我在科研中常用的几个 Python 库，包括 Pandas、NumPy、Matplotlib 等。从数据清洗到可视化，一套完整的流程分享给大家。',
    cover: 'https://picsum.photos/seed/post1/400/300',
    images: ['https://picsum.photos/seed/post1a/400/300'],
    tags: ['编程', '数据分析'],
    authorId: 0,
    authorName: '陈同学',
    authorAvatar: 'https://picsum.photos/seed/user1/100/100',
    college: '物理学院',
    grade: '博三',
    likeCount: 128,
    commentCount: 32,
    collectCount: 56,
    createdAt: new Date('2026-04-20'),
    updatedAt: new Date('2026-04-20'),
  },
  {
    title: '浙大的春天太美了，求摄影搭子',
    content: '最近樱花和郁金香都开了，想找个喜欢摄影的同学一起扫校园～我比较擅长人像摄影，可以互拍！',
    cover: 'https://picsum.photos/seed/post2/400/300',
    images: ['https://picsum.photos/seed/post2a/400/300', 'https://picsum.photos/seed/post2b/400/300'],
    tags: ['摄影', '兴趣搭子'],
    authorId: 1,
    authorName: '小熊软糖',
    authorAvatar: 'https://picsum.photos/seed/user2/100/100',
    college: '计算机学院',
    grade: '博二',
    likeCount: 256,
    commentCount: 45,
    collectCount: 89,
    createdAt: new Date('2026-04-22'),
    updatedAt: new Date('2026-04-22'),
  },
  {
    title: '考研数学复习经验分享',
    content: '从基础到强化，三个月数学一 140 分的复习路线。用过的资料、踩过的坑、总结的方法论。',
    cover: 'https://picsum.photos/seed/post3/400/300',
    images: ['https://picsum.photos/seed/post3a/400/300'],
    tags: ['考研', '数学'],
    authorId: 2,
    authorName: '橘子汽水',
    authorAvatar: 'https://picsum.photos/seed/user3/100/100',
    college: '电子学院',
    grade: '博一',
    likeCount: 512,
    commentCount: 89,
    collectCount: 234,
    createdAt: new Date('2026-04-25'),
    updatedAt: new Date('2026-04-25'),
  },
  {
    title: '求推荐好用的 AI 写作工具',
    content: '最近在写论文综述，想找一些能辅助文献整理和写作的工具。目前了解到有 ChatGPT、Claude、Notion AI，还有没有其他推荐？',
    cover: 'https://picsum.photos/seed/post4/400/300',
    images: ['https://picsum.photos/seed/post4a/400/300'],
    tags: ['AI', '论文写作'],
    authorId: 3,
    authorName: '学建筑的猫',
    authorAvatar: 'https://picsum.photos/seed/user4/100/100',
    college: '建筑学院',
    grade: '硕二',
    likeCount: 67,
    commentCount: 23,
    collectCount: 12,
    createdAt: new Date('2026-04-28'),
    updatedAt: new Date('2026-04-28'),
  },
]

const SEED_ACTIVITIES = [
  {
    title: '周末相约紫金港 · 校园摄影采风',
    cover: 'https://picsum.photos/seed/act1/400/200',
    category: '兴趣',
    time: '2026-05-10 14:00',
    location: '紫金港校区 月牙楼前',
    campus: '紫金港校区',
    participantCount: 12,
    status: '进行中',
    buttonText: '立即报名',
    createdAt: new Date('2026-04-15'),
    updatedAt: new Date('2026-04-15'),
  },
  {
    title: 'AI工具分享会 · 用AI提升科研效率',
    cover: 'https://picsum.photos/seed/act2/400/200',
    category: '技能交换',
    time: '2026-05-12 19:00',
    location: '紫金港校区 北教 101',
    campus: '紫金港校区',
    participantCount: 28,
    status: '进行中',
    buttonText: '立即报名',
    createdAt: new Date('2026-04-18'),
    updatedAt: new Date('2026-04-18'),
  },
  {
    title: '周末志愿行 · 社区服务公益活动',
    cover: 'https://picsum.photos/seed/act3/400/200',
    category: '志愿',
    time: '2026-05-14 08:30',
    location: '西湖区 翠苑社区',
    campus: '校外',
    participantCount: 9,
    status: '即将开始',
    buttonText: '立即报名',
    createdAt: new Date('2026-04-20'),
    updatedAt: new Date('2026-04-20'),
  },
  {
    title: '求职分享 · 大厂面试经验交流',
    cover: 'https://picsum.photos/seed/act4/400/200',
    category: '其他',
    time: '2026-05-15 18:30',
    location: '玉泉校区 曹光彪楼',
    campus: '玉泉校区',
    participantCount: 45,
    status: '即将开始',
    buttonText: '立即报名',
    createdAt: new Date('2026-04-22'),
    updatedAt: new Date('2026-04-22'),
  },
]

const SEED_CERTIFICATIONS = [
  {
    userId: 0,
    skillName: 'AI工具',
    level: '高级',
    score: 95,
    worksCount: 12,
    portfolioCount: 8,
    githubStars: 256,
    materials: 15,
    certifiedSkills: ['ChatGPT', 'Copilot', 'Midjourney'],
    topics: ['AI辅助科研', '提示词工程'],
    createdAt: new Date('2026-03-20'),
    updatedAt: new Date('2026-05-01'),
  },
  {
    userId: 1,
    skillName: '英语交流',
    level: '高级',
    score: 92,
    worksCount: 8,
    portfolioCount: 5,
    githubStars: 0,
    materials: 20,
    certifiedSkills: ['雅思', '学术写作'],
    topics: ['英语口语', '学术写作'],
    createdAt: new Date('2026-03-25'),
    updatedAt: new Date('2026-05-02'),
  },
]

// ========== 集合工具函数 ==========

/**
 * 清空指定集合中的所有文档
 * 如果集合不存在则抛异常
 */
async function clearCollection(name) {
  let deleted = 0
  while (true) {
    const { total } = await db.collection(name).count()
    if (total === 0) break
    const { data } = await db.collection(name).limit(100).get()
    if (data.length === 0) break
    for (const doc of data) {
      await db.collection(name).doc(doc._id).remove()
      deleted++
    }
  }
  return deleted
}

/**
 * 写入种子数据到指定集合
 * 如果集合不存在会由 add() 自动创建
 */
async function seedCollection(name, data) {
  let count = 0
  for (const item of data) {
    await db.collection(name).add({ data: item })
    count++
  }
  return count
}

// ========== 主入口 ==========

exports.main = async (event, context) => {
  try {
    // 安全保护：仅管理员可执行
    const { OPENID } = cloud.getWXContext()
    if (!OPENID) return { success: false, message: '无访问权限' }
    // 禁止自动执行，必须传 secret 参数
    if (!event.secret || event.secret !== 'huanhu-admin-seed') {
      return { success: false, message: '需提供正确的 secret 参数' }
    }

    const { reset, step } = event
    // 如果 reset 为 true，先清空所有集合
    if (reset === true) {
      const collections = ['users', 'posts', 'activities', 'certifications']
      for (const col of collections) {
        try {
          await clearCollection(col)
          console.log(`[${col}] 已清空`)
        } catch (clearErr) {
          // 如果集合不存在，提示用户手动创建
          console.error(`[${col}] 清空失败:`, clearErr.message)
        }
      }
    }

    // 如果指定了 step，只导入指定集合
    if (step && step !== 'all') {
      switch (step) {
        case 'users': {
          await clearCollection('users')
          const count = await seedCollection('users', SEED_USERS)
          return { success: true, message: 'users seeded', data: { users: count } }
        }
        case 'posts': {
          await clearCollection('posts')
          const usersRes = await db.collection('users').get()
          const users = usersRes.data
          const enriched = SEED_POSTS.map((p, i) => ({
            ...p,
            authorId: users[i % users.length]._id,
          }))
          const count = await seedCollection('posts', enriched)
          return { success: true, message: 'posts seeded', data: { posts: count } }
        }
        case 'activities': {
          await clearCollection('activities')
          const count = await seedCollection('activities', SEED_ACTIVITIES)
          return { success: true, message: 'activities seeded', data: { activities: count } }
        }
        case 'certifications': {
          await clearCollection('certifications')
          const count = await seedCollection('certifications', SEED_CERTIFICATIONS)
          return { success: true, message: 'certifications seeded', data: { certifications: count } }
        }
        default:
          return { success: false, message: `未知的 step: ${step}` }
      }
    }

    // 默认全部导入
    // posts 需要关联用户 ID，所以先导入 users
    const usersCount = await seedCollection('users', SEED_USERS)

    // 查询刚写入的用户，拿到 _id
    const usersRes = await db.collection('users').get()
    const users = usersRes.data

    const enrichedPosts = SEED_POSTS.map((p, i) => ({
      ...p,
      authorId: users[i % users.length]._id,
    }))
    const postsCount = await seedCollection('posts', enrichedPosts)

    const activitiesCount = await seedCollection('activities', SEED_ACTIVITIES)

    const enrichedCerts = SEED_CERTIFICATIONS.map((c, i) => ({
      ...c,
      userId: users[i % users.length]._id,
    }))
    const certsCount = await seedCollection('certifications', enrichedCerts)

    return {
      success: true,
      message: 'seed completed',
      data: {
        users: usersCount,
        posts: postsCount,
        activities: activitiesCount,
        certifications: certsCount,
      },
    }
  } catch (err) {
    console.error('[seed 失败]', err)
    return {
      success: false,
      message: 'seed 执行失败',
      error: err.message,
    }
  }
}
