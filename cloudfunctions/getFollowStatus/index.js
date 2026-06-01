/**
 * 云函数 - 获取当前用户与目标用户的关注关系状态
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

    const folRes = await db.collection('follows')
      .where({ followerId: myId, followingId: targetUserId, status: 'active' })
      .limit(1).get()
    const isFollowing = folRes.data.length > 0

    const revRes = await db.collection('follows')
      .where({ followerId: targetUserId, followingId: myId, status: 'active' })
      .limit(1).get()
    const isFollower = revRes.data.length > 0

    let isSpecial = false
    let isBlocked = false
    if (folRes.data.length) {
      isSpecial = !!folRes.data[0].isSpecial
      isBlocked = !!folRes.data[0].isBlocked
    }

    const blockRes = await db.collection('follows')
      .where({ followerId: targetUserId, followingId: myId, isBlocked: true })
      .limit(1).get()
    const blockedByTarget = blockRes.data.length > 0

    return ok({
      isFollowing, isFollower,
      isMutual: isFollowing && isFollower,
      isSpecial,
      isBlocked: isBlocked || blockedByTarget,
      blockedByTarget,
    })
  } catch (err) {
    console.error('[getFollowStatus]', err)
    return fail('获取失败', -10)
  }
}
