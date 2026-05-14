// 云函数 - 获取用户粉丝列表
const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

exports.main = async (event = {}) => {
  try {
    const { userId, page = 0, pageSize = 20 } = event
    const { OPENID } = cloud.getWXContext()

    if (!OPENID) return { code: -1, msg: '获取用户身份失败' }

    const myRes = await db.collection('users').where({ openid: OPENID }).limit(1).get()
    const myId = myRes.data.length ? myRes.data[0]._id : ''

    const targetId = userId || myId
    if (!targetId) return { code: -2, msg: '缺少 userId' }

    // 查粉丝列表
    const folRes = await db.collection('follows')
      .where({ followingId: targetId, status: 'active' })
      .orderBy('createdAt', 'desc')
      .skip(page * pageSize)
      .limit(pageSize)
      .get()

    if (!folRes.data.length) {
      return { code: 0, data: [], total: 0 }
    }

    const followerIds = folRes.data.map((r) => r.followerId)

    // 批量查用户信息
    const usersRes = await db.collection('users')
      .where({ _id: db.command.in(followerIds) })
      .limit(pageSize)
      .get()

    const usersMap = {}
    usersRes.data.forEach((u) => {
      usersMap[u._id] = u
    })

    // 我是否关注了这些粉丝？（用于显示"已关注/互相关注/回关"）
    const myFollowRes = await db.collection('follows')
      .where({ followerId: myId, followingId: db.command.in(followerIds), status: 'active' })
      .get()
    const myFollowSet = new Set(myFollowRes.data.map((r) => r.followingId))

    const followers = folRes.data.map((record) => {
      const user = usersMap[record.followerId] || {}
      const isFollowedByMe = myFollowSet.has(record.followerId)
      return {
        _id: record.followerId,
        id: record.followerId,
        userId: record.followerId,
        name: user.name || '同学',
        avatar: user.avatar || '',
        college: user.college || '',
        grade: user.grade || '',
        campus: user.campus || '',
        intro: user.intro || '',
        isFollower: true,
        isFollowing: isFollowedByMe,
        isMutual: isFollowedByMe,
        isSpecial: false,
        isBlocked: false,
        followedAt: record.createdAt || '',
      }
    })

    // 总粉丝数
    const total = await db.collection('follows')
      .where({ followingId: targetId, status: 'active' }).count()

    return { code: 0, data: followers, total: total.total }
  } catch (err) {
    console.error('[getFollowers]', err)
    return { code: -10, msg: '获取失败', error: err.message || err }
  }
}
