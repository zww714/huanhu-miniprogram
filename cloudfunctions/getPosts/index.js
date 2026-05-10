// 云函数 - 获取帖子列表（发现页、首页）
const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

exports.main = async (event, context) => {
  const { category, page = 0, pageSize = 10, userId } = event

  try {
    let query = {}
    if (userId) {
      query.userId = userId
    }
    if (category && category !== '全部') {
      query.mainCategory = category
    }

    const result = await db.collection('posts')
      .where(query)
      .skip(page * pageSize)
      .limit(pageSize)
      .orderBy('createdAt', 'desc')
      .get()

    const total = await db.collection('posts').where(query).count()

    // 关联查询作者信息
    const postsWithAuthor = await Promise.all(result.data.map(async (post) => {
      let author = { name: '未知用户', college: '', grade: '' }
      if (post.userId) {
        try {
          const userRes = await db.collection('users').doc(post.userId)
            .field({ name: true, college: true, grade: true, avatar: true, verified: true })
            .get()
          author = userRes.data || author
        } catch (e) { /* ignore */ }
      }
      return {
        ...post,
        id: post._id,
        author,
      }
    }))

    return {
      code: 0,
      data: postsWithAuthor,
      total: total.total,
      hasMore: (page + 1) * pageSize < total.total,
    }
  } catch (err) {
    console.error('[getPosts]', err)
    return { code: -1, msg: '获取帖子失败', error: err }
  }
}
