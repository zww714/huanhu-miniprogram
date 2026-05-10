// 云函数 - 获取用户详情（个人详情页）
const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

exports.main = async (event, context) => {
  const { userId } = event
  const { OPENID } = cloud.getWXContext()

  if (!userId) {
    return { code: -1, msg: '缺少 userId' }
  }

  try {
    // 获取目标用户
    const userResult = await db.collection('users').doc(userId).get()
    const user = userResult.data

    if (!user) {
      return { code: -2, msg: '用户不存在' }
    }

    // 查询当前登录者是否已关注
    const currentUserResult = await db.collection('users')
      .where({ openid: OPENID })
      .field({ following: true })
      .get()

    const isFollowing = currentUserResult.data.length > 0
      ? (currentUserResult.data[0].following || []).includes(userId)
      : false

    // 获取该用户的帖子
    const postsResult = await db.collection('posts')
      .where({ userId })
      .orderBy('createdAt', 'desc')
      .limit(20)
      .get()

    // 获取该用户的评价
    // 评价存放在 users 文档内部或独立的 reviews 集合
    // 先返回用户数据里的 reviews
    // 完整版应拆为独立 reviews 集合，方便做分页和评分统计

    const { openid, phone, following, followers, ...safe } = user

    return {
      code: 0,
      userData: {
        ...safe,
        is_following: isFollowing,
        posts: postsResult.data || [],
        // 假设 reviews 也在 user 文档里
        reviews: user.reviews || [],
      },
    }
  } catch (err) {
    console.error('[getUserDetail]', err)
    return { code: -3, msg: '获取用户详情失败', error: err }
  }
}
