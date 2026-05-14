// 云函数 - 通知管理（获取/标记/列表）
const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()
const _ = db.command

exports.main = async (event = {}) => {
  try {
    const { action, ...params } = event
    const { OPENID } = cloud.getWXContext()
    if (!OPENID) return { code: -1, msg: '获取用户身份失败' }

    // 查当前用户
    const userRes = await db.collection('users').where({ openid: OPENID }).limit(1).get()
    if (!userRes.data.length) return { code: -2, msg: '用户未登录' }
    const myId = userRes.data[0]._id

    // --- getUnreadCounts ---
    if (action === 'getUnreadCounts') {
      const likes = await db.collection('notifications')
        .where({ userId: myId, type: 'likes', read: false }).count()
      const follows = await db.collection('notifications')
        .where({ userId: myId, type: 'follows', read: false }).count()
      const comments = await db.collection('notifications')
        .where({ userId: myId, type: 'comments', read: false }).count()
      const system = await db.collection('notifications')
        .where({ userId: myId, type: 'system', read: false }).count()

      return {
        code: 0,
        data: {
          likes: likes.total,
          follows: follows.total,
          comments: comments.total,
          system: system.total,
        },
      }
    }

    // --- getNotifications ---
    if (action === 'getNotifications') {
      const { type, filter, page = 0, pageSize = 30 } = params
      const whereClause = { userId: myId }
      if (type && ['likes', 'follows', 'comments', 'system'].includes(type)) {
        whereClause.type = type
      }
      // filter: unread / read
      if (filter === 'unread') whereClause.read = false
      else if (filter === 'read') whereClause.read = true

      const totalRes = await db.collection('notifications').where(whereClause).count()

      const notiRes = await db.collection('notifications')
        .where(whereClause)
        .orderBy('createdAt', 'desc')
        .skip(page * pageSize)
        .limit(pageSize)
        .get()

      // 格式化
      const items = (notiRes.data || []).map((n) => ({ id: n._id, ...n }))

      return { code: 0, data: items, total: totalRes.total }
    }

    // --- markRead ---
    if (action === 'markRead') {
      const { ids, type, all } = params
      const whereClause = { userId: myId }

      if (all) {
        // 全部标记已读
        await db.collection('notifications')
          .where(whereClause)
          .update({ data: { read: true } })
        return { code: 0, data: { marked: true } }
      }

      if (type && ['likes', 'follows', 'comments', 'system'].includes(type)) {
        whereClause.type = type
        if (ids && Array.isArray(ids)) whereClause._id = _.in(ids)
        await db.collection('notifications')
          .where(whereClause)
          .update({ data: { read: true } })
        return { code: 0, data: { marked: true } }
      }

      if (ids && Array.isArray(ids)) {
        whereClause._id = _.in(ids)
        await db.collection('notifications')
          .where(whereClause)
          .update({ data: { read: true } })
        return { code: 0, data: { marked: true } }
      }

      return { code: -3, msg: '缺少参数：ids 或 type 或 all' }
    }

    // --- deleteNotification ---
    if (action === 'delete') {
      const { id } = params
      if (!id) return { code: -3, msg: '缺少 id' }
      await db.collection('notifications').doc(id).remove()
      return { code: 0, data: { deleted: true } }
    }

    return { code: -4, msg: `未知 action: ${action}` }
  } catch (err) {
    console.error('[notification]', err)
    return { code: -10, msg: '操作失败', error: err.message || err }
  }
}
