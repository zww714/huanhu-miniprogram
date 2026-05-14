// 云函数 - 设置/取消特别关注
const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

exports.main = async (event = {}) => {
  try {
    const { targetUserId, isSpecial } = event
    const { OPENID } = cloud.getWXContext()

    if (!OPENID) return { code: -1, msg: '获取用户身份失败' }
    if (!targetUserId) return { code: -2, msg: '缺少 targetUserId' }
    if (typeof isSpecial !== 'boolean') return { code: -3, msg: 'isSpecial 必须是布尔值' }

    const myRes = await db.collection('users').where({ openid: OPENID }).limit(1).get()
    if (!myRes.data.length) return { code: -4, msg: '用户未登录' }
    const myId = myRes.data[0]._id

    // 查关注记录
    const existRes = await db.collection('follows')
      .where({ followerId: myId, followingId: targetUserId, status: 'active' })
      .limit(1).get()

    if (!existRes.data.length) {
      return { code: -5, msg: '请先关注该用户' }
    }

    await db.collection('follows').doc(existRes.data[0]._id).update({
      data: { isSpecial, updatedAt: db.serverDate() },
    })

    return { code: 0, data: { isSpecial } }
  } catch (err) {
    console.error('[setSpecialFollow]', err)
    return { code: -10, msg: '操作失败', error: err.message || err }
  }
}
