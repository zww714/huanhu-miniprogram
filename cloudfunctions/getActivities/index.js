// 云函数 - 获取活动列表
const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

exports.main = async (event, context) => {
  const { category, page = 0, pageSize = 20 } = event

  try {
    let query = {}
    if (category && category !== '全部' && category !== '热门') {
      query.category = category
    }

    const result = await db.collection('activities')
      .where(query)
      .skip(page * pageSize)
      .limit(pageSize)
      .orderBy('createdAt', 'desc')
      .get()

    const total = await db.collection('activities').where(query).count()

    return {
      code: 0,
      data: result.data.map(a => ({ ...a, id: a._id })),
      total: total.total,
      hasMore: (page + 1) * pageSize < total.total,
    }
  } catch (err) {
    console.error('[getActivities]', err)
    return { code: -1, msg: '获取活动失败', error: err }
  }
}
