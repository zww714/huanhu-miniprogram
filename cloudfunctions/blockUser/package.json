// 云函数 - 拉黑/取消拉黑用户
const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

exports.main = async (event = {}) => {
  try {
    const { targetUserId, isBlocked = true } = event
    const { OPENID } = cloud.getWXContext()

    if (!OPENID) return { code: -1, msg: '获取用户身份失败' }
    if (!targetUserId) return { code: -2, msg: '缺少 targetUserId' }

    const myRes = await db.collection('users').where({ openid: OPENID }).limit(1).get()
    if (!myRes.data.length) return { code: -3, msg: '用户未登录' }
    const myId = myRes.data[0]._id

    if (myId === targetUserId) return { code: -4, msg: '不能拉黑自己' }

    // 查现有关注/拉黑记录
    const existRes = await db.collection('follows')
      .where({ followerId: myId, followingId: targetUserId })
      .limit(1).get()

    if (existRes.data.length) {
      const record = existRes.data[0]
      const updateData = { isBlocked, updatedAt: db.serverDate() }

      if (isBlocked) {
        // 拉黑时同时取消关注
        updateData.status = 'canceled'
      }

      await db.collection('follows').doc(record._id).update({ data: updateData })
    } else {
      // 新建拉黑记录
      await db.collection('follows').add({
        data: {
          followerId: myId,
          followerOpenid: OPENID,
          followingId: targetUserId,
          status: 'canceled',
          isSpecial: false,
          isBlocked: true,
          createdAt: db.serverDate(),
          updatedAt: db.serverDate(),
        },
      })
    }

    // 更新双方计数（拉黑相当于取消关注）
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

    return { code: 0, data: { isBlocked: true, isFollowing: false } }
  } catch (err) {
    console.error('[blockUser]', err)
    return { code: -10, msg: '操作失败', error: err.message || err }
  }
}
