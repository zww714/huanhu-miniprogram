// 云函数 - 获取所有用户（首页技能交换列表）
const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()
const usersCollection = db.collection('users')

exports.main = async (event, context) => {
  const { category, page = 0, pageSize = 20 } = event

  try {
    let query = {}
    // 如果有分类筛选，按技能名称匹配
    if (category && category !== '全部' && category !== '热门') {
      query = { 'skills.name': db.RegExp({ regexp: category, options: 'i' }) }
    }

    const result = await usersCollection
      .where(query)
      .field({
        openid: false, phone: false, following: false, followers: false,
      })
      .skip(page * pageSize)
      .limit(pageSize)
      .orderBy('stats.skills', 'desc')
      .get()

    const total = await usersCollection.where(query).count()

    return {
      code: 0,
      data: result.data,
      total: total.total,
      hasMore: (page + 1) * pageSize < total.total,
    }
  } catch (err) {
    console.error('[getUsers]', err)
    return { code: -1, msg: '获取用户列表失败', error: err }
  }
}
