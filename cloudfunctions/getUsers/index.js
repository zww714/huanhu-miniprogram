const { ok, fail, getOpenId, db } = require('../_shared/index')

exports.main = async (event = {}) => {
  try {
    const category = event.category || ''
    const page = Number(event.page || 0)
    const pageSize = Math.min(Number(event.pageSize || 20), 50)

    let users
    if (category && category !== '全部' && category !== '热门') {
      users = await db.collection('users').limit(200).get()
      users = (users.data || []).filter((u) =>
        (u.skills || u.can || []).some((s) => String(s.name || '').includes(category))
      )
    } else {
      const result = await db.collection('users').orderBy('stats.skills', 'desc').limit(200).get()
      users = result.data || []
    }

    const start = page * pageSize
    const paged = users.slice(start, start + pageSize)

    return ok(paged, { total: users.length, hasMore: start + pageSize < users.length })
  } catch (err) {
    console.error('[getUsers]', err)
    return fail('获取用户列表失败')
  }
}
