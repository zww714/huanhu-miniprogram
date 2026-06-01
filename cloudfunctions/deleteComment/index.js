/**
 * 云函数 - 删除评论
 */
const { ok, fail, db, cloud } = require('./shared')
const _ = db.command

exports.main = async (event = {}) => {
  try {
    const { commentId } = event
    const { OPENID } = cloud.getWXContext()

    if (!OPENID) return fail('获取用户身份失败', -1)
    if (!commentId) return fail('缺少 commentId', -2)

    const userRes = await db.collection('users').where({ openid: OPENID }).limit(1).get()
    if (!userRes.data.length) return fail('用户不存在，请先登录', -3)
    const user = userRes.data[0]

    const commentRes = await db.collection('comments').doc(commentId).get()
    const comment = commentRes.data
    if (!comment || comment.status === 'deleted') return fail('评论不存在或已被删除', -4)

    const postRes = await db.collection('posts').doc(comment.postId).get()
    const post = postRes.data
    if (!post) return fail('帖子不存在', -5)

    const postAuthorId = post.authorId || post.userId || ''
    const isCommentAuthor = comment.authorId === user._id
    const isPostAuthor = postAuthorId === user._id

    if (!isCommentAuthor && !isPostAuthor) {
      return fail('无权删除该评论', -6)
    }

    await db.collection('comments').doc(commentId).update({
      data: { status: 'deleted', updatedAt: db.serverDate() },
    })

    await db.collection('comments').where({
      parentId: commentId, status: 'normal',
    }).update({
      data: { status: 'deleted', updatedAt: db.serverDate() },
    }).catch(() => {})

    const countRes = await db.collection('comments')
      .where({ postId: comment.postId, status: 'normal' }).count()
    const newCount = countRes.total || 0

    await db.collection('posts').doc(comment.postId).update({
      data: { commentCount: newCount, comments: newCount, updatedAt: db.serverDate() },
    }).catch(() => {})

    return ok({ msg: '评论已删除', commentCount: newCount })
  } catch (err) {
    console.error('[deleteComment]', err)
    return fail('删除评论失败', -10)
  }
}
