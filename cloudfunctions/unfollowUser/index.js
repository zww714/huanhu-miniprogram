// 云函数 - 取消关注用户
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

    // 查关注记录
    const existRes = await db.collection('follows')
      .where({ followerId: myId, followingId: targetUserId, status: 'active' })
      .limit(1)
      .get()

    if (!existRes.data.length) {
      return { code: 0, data: { isFollowing: false } }
    }

    // 设为 canceled
    await db.collection('follows').doc(existRes.data[0]._id).update({
      data: { status: 'canceled', updatedAt: db.serverDate() },
    })

    // 更新计数
    const myFollowingCount = await db.collection('follows')
      .where({ followerId: myId, status: 'active' }).count()
    await db.collection('users').doc(myId).update({
      data: { 'stats.following': myFollowingCount.total },
    }).catch(() => {})

    const targetFollowerCount = await db.collection('follows')
      .where({ followingId: targetUserId, status: 'active' }).count()
    await db.collection('users').doc(targetUserId).update({
      data: { 'stats.followers': targetFollowerCount.total },
    }).catch(() => {})

    return {
      code: 0,
      data: {
        isFollowing: false,
        isMutual: false,
        followerCount: targetFollowerCount.total,
        followingCount: myFollowingCount.total,
      },
    }
  } catch (err) {
    console.error('[unfollowUser]', err)
    return { code: -10, msg: '操作失败', error: err.message || err }
  }
}
