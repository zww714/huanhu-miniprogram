/**
 * 云函数 - 获取活动列表
 */
const { ok, fail, paginate } = require('./shared')

exports.main = async (event) => {
  try {
    const { category, page: page0 = 0, pageSize = 20 } = event

    let query = {}
    if (category && category !== '全部' && category !== '综合') {
      query.category = category
    }

    const result = await paginate('activities', query, {
      page: Number(page0) + 1,  // paginate 使用 1-based 页码
      pageSize: Number(pageSize),
      orderBy: 'createdAt',
    })

    const mapped = (result.data || []).map(a => ({ ...a, id: a._id }))

    return ok(mapped, {
      total: result.total,
      hasMore: result.hasMore,
    })
  } catch (err) {
    console.error('[getActivities]', err)
    return fail('获取活动失败')
  }
}
