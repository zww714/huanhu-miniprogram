/**
 * 云函数 - 通知系统（多路复用）
 */
const { ok, fail, db, cloud } = require('./shared')
const _ = db.command

exports.main = async (event = {}) => {
  try {
    const { action, ...params } = event
    const { OPENID } = cloud.getWXContext()
    if (!OPENID) return fail('获取用户身份失败', -1)

    const userRes = await db.collection('users').where({ openid: OPENID }).limit(1).get()
    if (!userRes.data.length) return fail('用户未登录', -2)
    const myId = userRes.data[0]._id

    // --- getUnreadCounts ---
    if (action === 'getUnreadCounts') {
      const [likes, follows, comments, system] = await Promise.all([
        db.collection('notifications').where({ userId: myId, type: 'likes', read: false }).count(),
        db.collection('notifications').where({ userId: myId, type: 'follows', read: false }).count(),
        db.collection('notifications').where({ userId: myId, type: 'comments', read: false }).count(),
        db.collection('notifications').where({ userId: myId, type: 'system', read: false }).count(),
      ])
      return ok({
        likes: likes.total, follows: follows.total,
        comments: comments.total, system: system.total,
      })
    }

    // --- getNotifications ---
    if (action === 'getNotifications') {
      const { type, filter, page = 0, pageSize = 30 } = params
      const whereClause = { userId: myId }
      if (type && ['likes', 'follows', 'comments', 'system'].includes(type)) {
        whereClause.type = type
      }
      if (filter === 'unread') whereClause.read = false
      else if (filter === 'read') whereClause.read = true

      const [totalRes, notiRes] = await Promise.all([
        db.collection('notifications').where(whereClause).count(),
        db.collection('notifications').where(whereClause)
          .orderBy('createdAt', 'desc')
          .skip(page * pageSize)
          .limit(pageSize)
          .get(),
      ])

      const items = (notiRes.data || []).map((n) => ({ id: n._id, ...n }))
      return ok(items, { total: totalRes.total })
    }

    // --- markRead ---
    if (action === 'markRead') {
      const { ids, type, all } = params
      const whereClause = { userId: myId }

      if (all) {
        await db.collection('notifications').where(whereClause).update({ data: { read: true } })
        return ok({ marked: true })
      }

      if (type && ['likes', 'follows', 'comments', 'system'].includes(type)) {
        whereClause.type = type
        if (ids && Array.isArray(ids)) whereClause._id = _.in(ids)
        await db.collection('notifications').where(whereClause).update({ data: { read: true } })
        return ok({ marked: true })
      }

      if (ids && Array.isArray(ids)) {
        whereClause._id = _.in(ids)
        await db.collection('notifications').where(whereClause).update({ data: { read: true } })
        return ok({ marked: true })
      }

      return fail('缺少参数 ids 或 type 或 all', -3)
    }

    // --- deleteNotification ---
    if (action === 'delete') {
      const { id } = params
      if (!id) return fail('缺少 id', -3)
      await db.collection('notifications').doc(id).remove()
      return ok({ deleted: true })
    }

    return fail(`未知 action: ${action}`, -99)
  } catch (err) {
    console.error('[notification]', err)
    return fail('操作失败', -10)
  }
}
