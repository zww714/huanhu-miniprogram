/**
 * 云函数 - 点赞/取消点赞
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

    const existRes = await db.collection('likes')
      .where({ targetType, targetId, userId: user._id })
      .limit(1)
      .get()

    let liked = true
    if (existRes.data.length) {
      const record = existRes.data[0]
      const newStatus = record.status === 'active' ? 'canceled' : 'active'
      liked = newStatus === 'active'
      await db.collection('likes').doc(record._id).update({
        data: { status: newStatus, updatedAt: db.serverDate() },
      })
    } else {
      await db.collection('likes').add({
        data: {
          targetType, targetId, userId: user._id, openid: OPENID,
          status: 'active',
          createdAt: db.serverDate(), updatedAt: db.serverDate(),
        },
      })
    }

    const countRes = await db.collection('likes')
      .where({ targetType, targetId, status: 'active' }).count()
    const likeCount = countRes.total || 0

    await db.collection('posts').doc(targetId).update({
      data: { likeCount, likes: likeCount, updatedAt: db.serverDate() },
    }).catch(() => {})

    // 新点赞时发通知
    if (liked && targetType === 'post') {
      const postInfo = await db.collection('posts').doc(targetId).get().catch(() => ({ data: null }))
      if (postInfo?.data) {
        const authorId = postInfo.data.authorId || postInfo.data.userId || ''
        if (authorId && authorId !== user._id) {
          await db.collection('notifications').add({
            data: {
              userId: authorId,
              type: 'likes',
              title: '收到新的点赞',
              content: `${user.name || '同学'} 点赞了你的分享`,
              fromUserId: user._id,
              fromUserName: user.name || '同学',
              targetType: 'post',
              targetId,
              targetTitle: postInfo.data.title || '',
              read: false,
              createdAt: db.serverDate(),
            },
          }).catch((e) => console.warn('[toggleLike] create notification failed', e))
        }
      }
    }

    return ok({ liked, likeCount })
  } catch (err) {
    console.error('[toggleLike]', err)
    return fail('操作失败', -10)
  }
}
