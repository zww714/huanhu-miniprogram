const { db, cloud } = require('./shared')

const SEED_TAG = 'huanhu-acceptance-v1'
const SEED_TAGS_TO_CLEAR = [SEED_TAG, 'huanhu-initial-v1']

const users = [
  {
    _id: 'accept_user_chen',
    name: '陈同学',
    avatar: '/assets/avatar.png',
    gender: 'male',
    verified: true,
    school: '浙江大学',
    college: '计算机学院',
    major: '数据科学',
    grade: '大三',
    campus: '紫金港校区',
    bio: '擅长 Python 和数据分析，想找摄影搭子。',
    skills: [
      { name: 'Python', level: 4, desc: '使用 Python 做数据清洗、分析和可视化。', tags: ['Pandas', '数据分析'] },
      { name: '数据分析', level: 3, desc: '熟悉课程项目和科研数据整理。', tags: ['科研', '可视化'] },
    ],
    can: [
      { name: 'Python', level: 4 },
      { name: '数据分析', level: 3 },
    ],
    want: ['摄影', '产品设计'],
    learnWants: ['摄影', '产品设计'],
    interests: ['科研', 'AI', '摄影'],
  },
  {
    _id: 'accept_user_photo',
    name: '光影捕手',
    avatar: '/assets/avatar.png',
    gender: 'private',
    verified: true,
    school: '浙江大学',
    college: '艺术学院',
    major: '设计学',
    grade: '大二',
    campus: '紫金港校区',
    bio: '喜欢校园人像和活动记录，可以一起扫校园。',
    skills: [
      { name: '摄影', level: 4, desc: '擅长校园人像、活动跟拍和基础修图。', tags: ['人像', '修图'] },
      { name: '产品设计', level: 3, desc: '熟悉移动端界面和用户流程梳理。', tags: ['UI', 'Figma'] },
    ],
    can: [
      { name: '摄影', level: 4 },
      { name: '产品设计', level: 3 },
    ],
    want: ['Python', 'AI工具'],
    learnWants: ['Python', 'AI工具'],
    interests: ['摄影', '设计', '展览'],
  },
  {
    _id: 'accept_user_xiong',
    name: '小熊软糖',
    avatar: '/assets/avatar.png',
    gender: 'female',
    verified: false,
    school: '浙江大学',
    college: '外国语学院',
    major: '翻译',
    grade: '研一',
    campus: '玉泉校区',
    bio: '擅长英语表达和论文润色，想学数据分析。',
    skills: [
      { name: '英语交流', level: 5, desc: '可练习口语表达、论文润色和材料翻译。', tags: ['口语', '论文'] },
      { name: '翻译', level: 4, desc: '中英文材料互译和学术表达校对。', tags: ['中英互译'] },
    ],
    can: [
      { name: '英语交流', level: 5 },
      { name: '翻译', level: 4 },
    ],
    want: ['Python', '数据分析'],
    learnWants: ['Python', '数据分析'],
    interests: ['英语', '阅读', '电影'],
  },
]

const posts = [
  {
    _id: 'accept_post_python',
    userId: 'accept_user_chen',
    title: 'Python 数据分析学习路线整理',
    excerpt: '把课程项目里常用的数据清洗、可视化和复盘方法整理成一份入门路线。',
    content: '这篇帖子用真实发布记录验证发现页、搜索、帖子详情和个人主页已发布内容是否一致。',
    cover: 'linear-gradient(135deg, #4F8EF7 0%, #21C6D7 100%)',
    category: '科研',
    mainCategory: '科研',
    categoryTag: '科研 · 技能交换',
    tags: ['Python', '数据分析'],
  },
  {
    _id: 'accept_post_photo',
    userId: 'accept_user_photo',
    title: '周末校园摄影搭子招募',
    excerpt: '想找同学一起在紫金港拍校园人像，也可以互相练习构图和修图。',
    content: '这条记录用于验收帖子卡片、收藏、评论和作者主页跳转。',
    cover: 'linear-gradient(135deg, #F093FB 0%, #F5576C 100%)',
    category: '兴趣',
    mainCategory: '兴趣',
    categoryTag: '兴趣 · 搭子',
    tags: ['摄影', '兴趣搭子'],
  },
  {
    _id: 'accept_post_english',
    userId: 'accept_user_xiong',
    title: '英语口语练习搭子互助',
    excerpt: '每周固定练习一次英文表达，互相记录问题和改进建议。',
    content: '这条记录用于验收多用户帖子列表、搜索和他人主页已发布内容。',
    cover: 'linear-gradient(135deg, #43E97B 0%, #38F9D7 100%)',
    category: '升学',
    mainCategory: '升学',
    categoryTag: '升学 · 经验',
    tags: ['英语交流', '口语'],
  },
]

const activities = [
  {
    _id: 'accept_activity_photo',
    title: '校园摄影实践小组',
    time: '6月20日 14:00',
    location: '紫金港校区 东区草坪',
    campus: '紫金港校区',
    maxParticipants: 20,
    cover: 'linear-gradient(135deg, #06B6D4 0%, #3B82F6 100%)',
    organizer: '换乎验收小组',
    tags: ['摄影', '活动'],
    category: '兴趣',
    description: '用于验收活动列表、报名和我的活动详情链路。',
  },
  {
    _id: 'accept_activity_ai',
    title: 'AI 工具科研效率分享',
    time: '6月22日 19:00',
    location: '紫金港校区 西二教学楼',
    campus: '紫金港校区',
    maxParticipants: 30,
    cover: 'linear-gradient(135deg, #8B5CF6 0%, #6366F1 100%)',
    organizer: '换乎验收小组',
    tags: ['AI', '科研'],
    category: '技能交换',
    description: '用于验收搜索活动和活动详情。',
  },
]

const likes = [
  { _id: 'accept_like_1', userId: 'accept_user_photo', targetType: 'post', targetId: 'accept_post_python', status: 'active' },
  { _id: 'accept_like_2', userId: 'accept_user_xiong', targetType: 'post', targetId: 'accept_post_python', status: 'active' },
  { _id: 'accept_like_3', userId: 'accept_user_chen', targetType: 'post', targetId: 'accept_post_photo', status: 'active' },
]

const favorites = [
  { _id: 'accept_fav_1', userId: 'accept_user_chen', targetType: 'post', targetId: 'accept_post_photo', status: 'active' },
  { _id: 'accept_fav_2', userId: 'accept_user_xiong', targetType: 'post', targetId: 'accept_post_python', status: 'active' },
]

const comments = [
  {
    _id: 'accept_comment_1',
    postId: 'accept_post_python',
    parentId: null,
    userId: 'accept_user_photo',
    author: { id: 'accept_user_photo', name: '光影捕手', avatar: '/assets/avatar.png', college: '艺术学院', grade: '大二', verified: true },
    content: '这个路线很适合从课程项目开始练习。',
    likeCount: 0,
    status: 'normal',
  },
  {
    _id: 'accept_comment_2',
    postId: 'accept_post_photo',
    parentId: null,
    userId: 'accept_user_chen',
    author: { id: 'accept_user_chen', name: '陈同学', avatar: '/assets/avatar.png', college: '计算机学院', grade: '大三', verified: true },
    content: '我想参加，可以一起练习构图。',
    likeCount: 0,
    status: 'normal',
  },
]

const follows = [
  { _id: 'accept_follow_1', followerId: 'accept_user_chen', followingId: 'accept_user_photo', status: 'active', isSpecial: false, isBlocked: false },
  { _id: 'accept_follow_2', followerId: 'accept_user_photo', followingId: 'accept_user_chen', status: 'active', isSpecial: false, isBlocked: false },
  { _id: 'accept_follow_3', followerId: 'accept_user_xiong', followingId: 'accept_user_chen', status: 'active', isSpecial: false, isBlocked: false },
]

const registrations = [
  {
    _id: 'accept_reg_1',
    activityId: 'accept_activity_photo',
    userId: 'accept_user_chen',
    userName: '陈同学',
    phone: '',
    note: '想参加摄影实践。',
    status: 'active',
  },
]

function activeCount(list, predicate) {
  return list.filter((item) => item.status === 'active' && predicate(item)).length
}

function stamp(doc) {
  return {
    ...doc,
    seedTag: SEED_TAG,
    isAcceptanceTest: true,
    createdAt: doc.createdAt || db.serverDate(),
    updatedAt: db.serverDate(),
  }
}

function buildSkills(seedUsers, openid) {
  return seedUsers.flatMap((user) => {
    const source = user.skills || []
    return source.map((skill, index) => ({
      _id: `accept_skill_${user._id}_${index}`,
      userId: user._id,
      openid: user.openid || (user._id === 'accept_user_chen' ? openid : ''),
      name: skill.name,
      level: skill.level || 1,
      intro: skill.desc || '',
      desc: skill.desc || '',
      tags: skill.tags || [],
      category: skill.category || '其他',
      visibility: 'public',
      status: 'normal',
      proofCount: 0,
      workCount: 0,
    }))
  })
}

function normalizeUser(user, openid) {
  const skillCount = user.skills.length
  const postCount = posts.filter((post) => post.userId === user._id).length
  const followerCount = activeCount(follows, (follow) => follow.followingId === user._id)
  const followingCount = activeCount(follows, (follow) => follow.followerId === user._id)

  return {
    ...user,
    openid: user._id === 'accept_user_chen' && openid ? openid : user.openid,
    canTeach: user.skills,
    wantToLearn: user.learnWants || user.want || [],
    skillCount,
    postCount,
    followerCount,
    followingCount,
    stats: {
      skills: skillCount,
      posts: postCount,
      followers: followerCount,
      following: followingCount,
    },
  }
}

function normalizePost(post, openid) {
  const authorId = post.authorId || post.userId
  const likeCount = activeCount(likes, (item) => item.targetId === post._id)
  const favoriteCount = activeCount(favorites, (item) => item.targetId === post._id)
  const commentCount = comments.filter((item) => item.postId === post._id && item.status !== 'deleted').length

  return {
    ...post,
    authorId,
    userId: authorId,
    openid: authorId === 'accept_user_chen' && openid ? openid : post.openid,
    visibility: 'public',
    status: 'normal',
    likeCount,
    likes: likeCount,
    commentCount,
    comments: commentCount,
    favoriteCount,
    collectCount: favoriteCount,
    viewCount: 0,
  }
}

function normalizeActivity(activity) {
  const participantCount = activeCount(registrations, (item) => item.activityId === activity._id)
  return {
    ...activity,
    visibility: 'public',
    status: 'normal',
    participantCount,
    participants: participantCount,
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

  for (const seedTag of SEED_TAGS_TO_CLEAR) {
    while (true) {
      const result = await collection.where({ seedTag }).limit(100).get()
      if (!result.data.length) break

      await Promise.all(result.data.map((doc) => collection.doc(doc._id).remove()))
      removed += result.data.length
    }
  }

  return removed
}

exports.main = async (event = {}) => {
  const { OPENID } = cloud.getWXContext()
  const collections = [
    'registrations',
    'notifications',
    'comments',
    'favorites',
    'likes',
    'follows',
    'skills',
    'conversations',
    'posts',
    'activities',
    'users',
  ]

  try {
    if (event.action === 'clearAcceptanceData') {
      const removed = {}
      for (const name of collections) removed[name] = await clearSeeded(name)
      return { code: 0, msg: '验收数据已清理', seedTag: SEED_TAG, removed }
    }

    const removed = {}
    if (event.reset !== false) {
      for (const name of collections) removed[name] = await clearSeeded(name)
    }

    const seedUsers = users.map((user) => normalizeUser(user, OPENID))
    const seedSkills = buildSkills(seedUsers, OPENID)
    const seedPosts = posts.map((post) => normalizePost(post, OPENID))
    const seedActivities = activities.map(normalizeActivity)

    const written = {
      users: await upsert('users', seedUsers),
      skills: await upsert('skills', seedSkills),
      posts: await upsert('posts', seedPosts),
      activities: await upsert('activities', seedActivities),
      likes: await upsert('likes', likes),
      favorites: await upsert('favorites', favorites),
      comments: await upsert('comments', comments),
      follows: await upsert('follows', follows),
      registrations: await upsert('registrations', registrations.map((item) => ({
        ...item,
        userOpenid: item.userId === 'accept_user_chen' ? OPENID : '',
      }))),
    }

    return {
      code: 0,
      msg: '验收数据写入完成',
      seedTag: SEED_TAG,
      removed,
      written,
      note: '这些记录写入真实云数据库集合，并带有 isAcceptanceTest 与 seedTag 标记。',
    }
  } catch (err) {
    console.error('[initData]', err)
    return {
      code: -1,
      msg: '验收数据写入失败',
      error: err.message || err,
    }
  }
}
