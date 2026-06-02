/**
 * 云函数 - 获取聊天消息（按 conversationId 服务端过滤）
 */
const { ok, fail, db, cloud } = require('./shared')

exports.main = async (event = {}) => {
  try {
    const { OPENID } = cloud.getWXContext()
    if (!OPENID) return fail('获取用户身份失败', -1)

    const { conversationId, limit = 50, beforeMs } = event
    if (!conversationId) return fail('缺少 conversationId', -2)

    const userRes = await db.collection('users').where({ openid: OPENID }).limit(1).get()
    if (!userRes.data.length) return fail('用户不存在', -3)
    const myId = userRes.data[0]._id

    let query = db.collection('messages')
      .where({ conversationId, participants: myId })

    if (beforeMs) {
      query = query.where({ conversationId, participants: myId, createdAtMs: db.command.lt(beforeMs) })
    }

    const res = await query
      .orderBy('createdAtMs', 'desc')
      .limit(Math.min(limit, 100))
      .get()

    const messages = (res.data || []).reverse()

    return ok(messages)
  } catch (err) {
    console.error('[getMessages]', err)
    return fail('获取消息失败', -4)
  }
}
