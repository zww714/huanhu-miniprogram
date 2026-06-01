/**
 * 云函数 - 取消关注用户
 */
const { ok, fail, db, cloud } = require('./shared')

exports.main = async (event = {}) => {
  try {
    const { targetUserId } = event
    const { OPENID } = cloud.getWXContext()

    if (!OPENID) return fail('获取用户身份失败', -1)
    if (!targetUserId) return fail('缺少 targetUserId', -2)

    const myRes = await db.collection('users').where({ openid: OPENID }).limit(1).get()
    if (!myRes.data.length) return fail('用户未登录', -3)
    const myId = myRes.data[0]._id

    const existRes = await db.collection('follows')
      .where({ followerId: myId, followingId: targetUserId, status: 'active' })
      .limit(1)
      .get()

    if (!existRes.data.length) {
      return ok({ isFollowing: false })
    }

    await db.collection('follows').doc(existRes.data[0]._id).update({
      data: { status: 'canceled', updatedAt: db.serverDate() },
    })

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

    return ok({
      isFollowing: false,
      isMutual: false,
      followerCount: targetFollowerCount.total,
      followingCount: myFollowingCount.total,
    })
  } catch (err) {
    console.error('[unfollowUser]', err)
    return fail('取消失败', -10)
  }
}
