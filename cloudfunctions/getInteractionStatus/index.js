/**
 * 云函数 - 获取交互状态（点赞/收藏）
 */
const { ok, fail, db, cloud } = require('./shared')

exports.main = async (event = {}) => {
  try {
    const { targetType = 'post', targetId } = event
    const { OPENID } = cloud.getWXContext()

    if (!targetId) return fail('缺少 targetId', -1)

    let liked = false
    let favorited = false
    let currentUserId = ''

    if (OPENID) {
      try {
        const userRes = await db.collection('users').where({ openid: OPENID }).limit(1).get()
        if (userRes.data.length) {
          currentUserId = userRes.data[0]._id
        }
      } catch (e) { /* not logged in */ }
    }

    let likeCount = 0
    try {
      const countRes = await db.collection('likes')
        .where({ targetType, targetId, status: 'active' }).count()
      likeCount = countRes.total || 0
    } catch (e) {}

    let favoriteCount = 0
    try {
      const countRes = await db.collection('favorites')
        .where({ targetType, targetId, status: 'active' }).count()
      favoriteCount = countRes.total || 0
    } catch (e) {}

    if (currentUserId) {
      const likeRes = await db.collection('likes')
        .where({ targetType, targetId, userId: currentUserId }).limit(1).get()
      liked = likeRes.data.length > 0 && likeRes.data[0].status === 'active'

      const favRes = await db.collection('favorites')
        .where({ targetType, targetId, userId: currentUserId }).limit(1).get()
      favorited = favRes.data.length > 0 && favRes.data[0].status === 'active'
    }

    return ok({ liked, favorited, likeCount, favoriteCount })
  } catch (err) {
    console.error('[getInteractionStatus]', err)
    return fail('获取交互状态失败', -10)
  }
}
