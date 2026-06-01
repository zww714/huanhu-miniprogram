/**
 * 云函数 - 设置/取消特别关注
 */
const { ok, fail, db, cloud } = require('./shared')

exports.main = async (event = {}) => {
  try {
    const { targetUserId, isSpecial } = event
    const { OPENID } = cloud.getWXContext()

    if (!OPENID) return fail('获取用户身份失败', -1)
    if (!targetUserId) return fail('缺少 targetUserId', -2)
    if (typeof isSpecial !== 'boolean') return fail('isSpecial 必须是布尔值', -3)

    const myRes = await db.collection('users').where({ openid: OPENID }).limit(1).get()
    if (!myRes.data.length) return fail('用户未登录', -4)
    const myId = myRes.data[0]._id

    const existRes = await db.collection('follows')
      .where({ followerId: myId, followingId: targetUserId, status: 'active' })
      .limit(1).get()

    if (!existRes.data.length) return fail('请先关注该用户', -5)

    await db.collection('follows').doc(existRes.data[0]._id).update({
      data: { isSpecial, updatedAt: db.serverDate() },
    })

    return ok({ isSpecial })
  } catch (err) {
    console.error('[setSpecialFollow]', err)
    return fail('操作失败', -10)
  }
}
