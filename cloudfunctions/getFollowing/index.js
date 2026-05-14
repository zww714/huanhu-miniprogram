// 云函数 - 获取用户关注列表
const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

exports.main = async (event = {}) => {
  try {
    const { userId, page = 0, pageSize = 20, filter } = event
    const { OPENID } = cloud.getWXContext()

    if (!OPENID) return { code: -1, msg: '获取用户身份失败' }

    const myRes = await db.collection('users').where({ openid: OPENID }).limit(1).get()
    const myId = myRes.data.length ? myRes.data[0]._id : ''

    const targetId = userId || myId
    if (!targetId) return { code: -2, msg: '缺少 userId' }

    // 构建查询条件
    const whereClause = { followerId: targetId, status: 'active' }
    if (filter === 'special') {
      whereClause.isSpecial = true
    }

    const folRes = await db.collection('follows')
      .where(whereClause)
      .orderBy('createdAt', 'desc')
      .skip(page * pageSize)
      .limit(pageSize)
      .get()

    if (!folRes.data.length) {
      return { code: 0, data: [], total: 0 }
    }

    const followingIds = folRes.data.map((r) => r.followingId)

    // 批量查用户信息
    const usersRes = await db.collection('users')
      .where({ _id: db.command.in(followingIds) })
      .limit(pageSize)
      .get()

    const usersMap = {}
    usersRes.data.forEach((u) => {
      usersMap[u._id] = u
    })

    // 这些人是否也关注了我？
    const reverseFollowRes = await db.collection('follows')
      .where({ followerId: db.command.in(followingIds), followingId: myId, status: 'active' })
      .get()
    const reverseFollowSet = new Set(reverseFollowRes.data.map((r) => r.followerId))

    const following = folRes.data.map((record) => {
      const user = usersMap[record.followingId] || {}
      const isMutual = myId === targetId ? reverseFollowSet.has(record.followingId) : false
      return {
        _id: record.followingId,
        id: record.followingId,
        userId: record.followingId,
        name: user.name || '同学',
        avatar: user.avatar || '',
        college: user.college || '',
        grade: user.grade || '',
        campus: user.campus || '',
        intro: user.intro || '',
        isFollowing: true,
        isFollower: isMutual,
        isMutual,
        isSpecial: !!record.isSpecial,
        isBlocked: false,
        followedAt: record.createdAt || '',
      }
    })

    const total = await db.collection('follows')
      .where(whereClause).count()

    return { code: 0, data: following, total: total.total }
  } catch (err) {
    console.error('[getFollowing]', err)
    return { code: -10, msg: '获取失败', error: err.message || err }
  }
}
