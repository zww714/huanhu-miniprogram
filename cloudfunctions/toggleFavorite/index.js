/**
 * 云函数 - 收藏/取消收藏
 */
const { ok, fail, db, cloud } = require('./shared')

exports.main = async (event = {}) => {
  try {
    const { targetType = 'post', targetId } = event
    const { OPENID } = cloud.getWXContext()

    if (!OPENID) return fail('获取用户身份失败', -1)
    if (!targetId) return fail('缺少 targetId', -2)

    const userRes = await db.collection('users').where({ openid: OPENID }).limit(1).get()
    if (!userRes.data.length) return fail('用户不存在，请先登录', -3)
    const user = userRes.data[0]

    const postRes = await db.collection('posts').doc(targetId).get()
    const post = postRes.data
    if (!post || post.status === 'deleted') return fail('帖子不存在或已被删除', -4)

    const postAuthorId = post.authorId || post.userId || ''
    if (post.visibility === 'private' && postAuthorId !== user._id) {
      return fail('该内容不允许操作', -5)
    }

    const existRes = await db.collection('favorites')
      .where({ targetType, targetId, userId: user._id })
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
      await db.collection('favorites').add({
        data: {
          targetType, targetId, userId: user._id, openid: OPENID,
          status: 'active',
          createdAt: db.serverDate(), updatedAt: db.serverDate(),
        },
      })
    }

    const countRes = await db.collection('favorites')
      .where({ targetType, targetId, status: 'active' }).count()
    const favoriteCount = countRes.total || 0

    await db.collection('posts').doc(targetId).update({
      data: { favoriteCount, collectCount: favoriteCount, updatedAt: db.serverDate() },
    }).catch(() => {})

    return ok({ favorited, favoriteCount })
  } catch (err) {
    console.error('[toggleFavorite]', err)
    return fail('操作失败', -10)
  }
}
