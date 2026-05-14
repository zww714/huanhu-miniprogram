const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

const db = cloud.database()
const _ = db.command

exports.main = async (event = {}) => {
  try {
    const { targetType = 'post', targetId } = event
    const { OPENID } = cloud.getWXContext()

    if (!OPENID) return { code: -1, msg: '获取用户身份失败' }
    if (!targetId) return { code: -2, msg: '缺少 targetId' }

    // Get current user
    const userRes = await db.collection('users').where({ openid: OPENID }).limit(1).get()
    if (!userRes.data.length) return { code: -3, msg: '用户不存在，请先登录' }
    const user = userRes.data[0]

    // Verify target post exists and is valid
    const postRes = await db.collection('posts').doc(targetId).get()
    const post = postRes.data
    if (!post || post.status === 'deleted') return { code: -4, msg: '帖子不存在或已被删除' }

    // Private post: only author can favorite
    const postAuthorId = post.authorId || post.userId || ''
    if (post.visibility === 'private' && postAuthorId !== user._id) {
      return { code: -5, msg: '该帖子暂不允许收藏' }
    }

    // Check existing favorite record
    const existRes = await db.collection('favorites')
      .where({
        targetType,
        targetId,
        userId: user._id,
      })
      .limit(1)
      .get()

    let favorited = true

    if (existRes.data.length) {
      const record = existRes.data[0]
      const newStatus = record.status === 'active' ? 'canceled' : 'active'
      favorited = newStatus === 'active'

      await db.collection('favorites').doc(record._id).update({
        data: { status: newStatus, updatedAt: db.serverDate() },
      })
    } else {
      // Create new favorite record
      await db.collection('favorites').add({
        data: {
          targetType,
          targetId,
          userId: user._id,
          openid: OPENID,
          status: 'active',
          createdAt: db.serverDate(),
          updatedAt: db.serverDate(),
        },
      })
    }

    // Re-count active favorites for this target
    const countRes = await db.collection('favorites')
      .where({ targetType, targetId, status: 'active' })
      .count()
    const favoriteCount = countRes.total || 0

    // Update post favoriteCount using recount for accuracy
    await db.collection('posts').doc(targetId).update({
      data: { favoriteCount, updatedAt: db.serverDate() },
    }).catch(() => {})

    // Also update collectCount/favoriteCount fields
    await db.collection('posts').doc(targetId).update({
      data: { collectCount: favoriteCount },
    }).catch(() => {})

    return { code: 0, data: { favorited, favoriteCount } }
  } catch (err) {
    console.error('[toggleFavorite]', err)
    return { code: -10, msg: '操作失败', error: err.message || err }
  }
}
