/**
 * 云函数 - 拉黑/取消拉黑用户
 */
const { ok, fail, db, cloud } = require('./shared')

exports.main = async (event = {}) => {
  try {
    const { targetUserId, isBlocked = true } = event
    const { OPENID } = cloud.getWXContext()

    if (!OPENID) return fail('获取用户身份失败', -1)
    if (!targetUserId) return fail('缺少 targetUserId', -2)

    const myRes = await db.collection('users').where({ openid: OPENID }).limit(1).get()
    if (!myRes.data.length) return fail('用户未登录', -3)
    const myId = myRes.data[0]._id

    if (myId === targetUserId) return fail('不能拉黑自己', -4)

    const existRes = await db.collection('follows')
      .where({ followerId: myId, followingId: targetUserId })
      .limit(1).get()

    if (existRes.data.length) {
      const record = existRes.data[0]
      const updateData = { isBlocked, updatedAt: db.serverDate() }
      if (isBlocked) {
        updateData.status = 'canceled'
      }
      await db.collection('follows').doc(record._id).update({ data: updateData })
    } else {
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

    return ok({ isBlocked: true, isFollowing: false })
  } catch (err) {
    console.error('[blockUser]', err)
    return fail('操作失败', -10)
  }
}
