const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

const db = cloud.database()

exports.main = async (event = {}) => {
  try {
    const { targetType = 'post', targetId } = event
    const { OPENID } = cloud.getWXContext()

    if (!targetId) return { code: -1, msg: '缺少 targetId' }

    let liked = false
    let favorited = false
    let currentUserId = ''
    let currentUserOpenid = ''

    // Try to identify the current user
    if (OPENID) {
      try {
        const userRes = await db.collection('users').where({ openid: OPENID }).limit(1).get()
        if (userRes.data.length) {
          currentUserId = userRes.data[0]._id
        }
      } catch (e) {
        // Not logged in, return false for both
      }
    }

    // Get like count
    let likeCount = 0
    try {
      const countRes = await db.collection('likes')
        .where({ targetType, targetId, status: 'active' })
        .count()
      likeCount = countRes.total || 0
    } catch (e) {}

    // Get favorite count
    let favoriteCount = 0
    try {
      const countRes = await db.collection('favorites')
        .where({ targetType, targetId, status: 'active' })
        .count()
      favoriteCount = countRes.total || 0
    } catch (e) {}

    // Check current user's like status
    if (currentUserId) {
      const likeRes = await db.collection('likes')
        .where({ targetType, targetId, userId: currentUserId })
        .limit(1)
        .get()
      liked = likeRes.data.length > 0 && likeRes.data[0].status === 'active'

      const favRes = await db.collection('favorites')
        .where({ targetType, targetId, userId: currentUserId })
        .limit(1)
        .get()
      favorited = favRes.data.length > 0 && favRes.data[0].status === 'active'
    }

    return {
      code: 0,
      data: { liked, favorited, likeCount, favoriteCount },
    }
  } catch (err) {
    console.error('[getInteractionStatus]', err)
    return { code: -10, msg: '获取交互状态失败', error: err.message || err }
  }
}
