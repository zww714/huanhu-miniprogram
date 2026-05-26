const { ok, fail, db } = require('../_shared/index')

exports.main = async (event = {}) => {
  try {
    const userId = event.userId || ''
    const page = Math.max(1, Number(event.page || 1))
    const pageSize = Math.min(50, Math.max(1, Number(event.pageSize || 20)))
    const skip = (page - 1) * pageSize

    if (!userId) return fail('缺少用户ID')

    // Returns users that you follow
    const query = { followerId: userId }
    const countResult = await db.collection('follows').where(query).count()

    const { data } = await db.collection('follows')
      .where(query)
      .orderBy('createdAt', 'desc')
      .skip(skip)
      .limit(pageSize)
      .get()

    return ok(data, {
      total: countResult.total,
      page,
      pageSize,
      hasMore: skip + pageSize < countResult.total,
    })
  } catch (err) {
    console.error('[getFollowing]', err)
    return fail('获取关注列表失败')
  }
}
