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

    // Private post: only author can like
    const postAuthorId = post.authorId || post.userId || ''
    if (post.visibility === 'private' && postAuthorId !== user._id) {
      return { code: -5, msg: '该帖子暂不允许点赞' }
    }

    // Check existing like record
    const existRes = await db.collection('likes')
      .where({
        targetType,
        targetId,
        userId: user._id,
      })
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
      // Create new like record
      await db.collection('likes').add({
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

    // Re-count active likes for this target
    const countRes = await db.collection('likes')
      .where({ targetType, targetId, status: 'active' })
      .count()
    const likeCount = countRes.total || 0

    // Update post likeCount using recount for accuracy
    await db.collection('posts').doc(targetId).update({
      data: { likeCount, updatedAt: db.serverDate() },
    }).catch(() => {})

    // Also update the `likes` field if it exists on the post
    await db.collection('posts').doc(targetId).update({
      data: { likes: likeCount },
    }).catch(() => {})

    // 点赞时创建通知（只在新点赞时，不是取消）
    if (liked && targetType === 'post') {
      // 查帖子作者
      const postRes = await db.collection('posts').doc(targetId).get().catch(() => ({ data: null }))
      if (postRes.data) {
        const postAuthorId = postRes.data.authorId || postRes.data.userId || ''
        if (postAuthorId && postAuthorId !== myId) {
          const notiData = {
            userId: postAuthorId,
            type: 'likes',
            title: '收到新的点赞',
            content: `${userRes2?.data?.[0]?.name || '同学'} 赞了你的发布`,
            fromUserId: myId,
            fromUserName: userRes2?.data?.[0]?.name || '同学',
            targetType: 'post',
            targetId,
            targetTitle: postRes.data.title || '',
            read: false,
            createdAt: db.serverDate(),
          }
          await db.collection('notifications').add({ data: notiData }).catch((e) => {
            console.warn('[toggleLike] create notification failed', e)
          })
        }
      }
    }

    return { code: 0, data: { liked, likeCount } }
  } catch (err) {
    console.error('[toggleLike]', err)
    return { code: -10, msg: '操作失败', error: err.message || err }
  }
}
