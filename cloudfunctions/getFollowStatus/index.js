// 云函数 - 获取当前用户与目标用户的关注关系状态
const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

exports.main = async (event = {}) => {
  try {
    const { targetUserId } = event
    const { OPENID } = cloud.getWXContext()

    if (!OPENID) return { code: -1, msg: '获取用户身份失败' }
    if (!targetUserId) return { code: -2, msg: '缺少 targetUserId' }

    const myRes = await db.collection('users').where({ openid: OPENID }).limit(1).get()
    if (!myRes.data.length) return { code: -3, msg: '用户未登录' }
    const myId = myRes.data[0]._id

    // 我关注了对方？
    const folRes = await db.collection('follows')
      .where({ followerId: myId, followingId: targetUserId, status: 'active' })
      .limit(1).get()
    const isFollowing = folRes.data.length > 0

    // 对方关注了我？
    const revRes = await db.collection('follows')
      .where({ followerId: targetUserId, followingId: myId, status: 'active' })
      .limit(1).get()
    const isFollower = revRes.data.length > 0

    // 在 follow 记录中查特别关注
    let isSpecial = false
    let isBlocked = false
    if (folRes.data.length) {
      isSpecial = !!folRes.data[0].isSpecial
    }

    // 查 block 记录（独立记录或 same follow record）
    if (folRes.data.length) {
      isBlocked = !!folRes.data[0].isBlocked
    }
    // 也有可能对方 block 了我 — 查反向的 block
    const blockRes = await db.collection('follows')
      .where({ followerId: targetUserId, followingId: myId, isBlocked: true })
      .limit(1).get()
    const blockedByTarget = blockRes.data.length > 0

    return {
      code: 0,
      data: {
        isFollowing,
        isFollower,
        isMutual: isFollowing && isFollower,
        isSpecial,
        isBlocked: isBlocked || blockedByTarget,
        blockedByTarget,
      },
    }
  } catch (err) {
    console.error('[getFollowStatus]', err)
    return { code: -10, msg: '获取失败', error: err.message || err }
  }
}
