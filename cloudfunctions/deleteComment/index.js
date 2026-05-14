const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

const db = cloud.database()
const _ = db.command

exports.main = async (event = {}) => {
  try {
    const { commentId } = event
    const { OPENID } = cloud.getWXContext()

    if (!OPENID) return { code: -1, msg: '获取用户身份失败' }
    if (!commentId) return { code: -2, msg: '缺少 commentId' }

    // Get current user
    const userRes = await db.collection('users').where({ openid: OPENID }).limit(1).get()
    if (!userRes.data.length) return { code: -3, msg: '用户不存在，请先登录' }
    const user = userRes.data[0]

    // Get the comment
    const commentRes = await db.collection('comments').doc(commentId).get()
    const comment = commentRes.data
    if (!comment || comment.status === 'deleted') return { code: -4, msg: '评论不存在或已被删除' }

    // Get the post to check post author
    const postRes = await db.collection('posts').doc(comment.postId).get()
    const post = postRes.data
    if (!post) return { code: -5, msg: '帖子不存在' }

    const postAuthorId = post.authorId || post.userId || ''

    // Permission check: only comment author or post author can delete
    const isCommentAuthor = comment.authorId === user._id
    const isPostAuthor = postAuthorId === user._id

    if (!isCommentAuthor && !isPostAuthor) {
      return { code: -6, msg: '无权删除此评论' }
    }

    // Soft delete the comment
    await db.collection('comments').doc(commentId).update({
      data: { status: 'deleted', updatedAt: db.serverDate() },
    })

    // Also soft-delete all replies to this comment
    await db.collection('comments').where({
      parentId: commentId,
      status: 'normal',
    }).update({
      data: { status: 'deleted', updatedAt: db.serverDate() },
    }).catch(() => {})

    // Recount the commentCount for this post
    const countRes = await db.collection('comments')
      .where({ postId: comment.postId, status: 'normal' })
      .count()
    const newCount = countRes.total || 0

    await db.collection('posts').doc(comment.postId).update({
      data: { commentCount: newCount, updatedAt: db.serverDate() },
    }).catch(() => {})

    await db.collection('posts').doc(comment.postId).update({
      data: { comments: newCount },
    }).catch(() => {})

    return {
      code: 0,
      msg: '评论已删除',
      data: { commentCount: newCount },
    }
  } catch (err) {
    console.error('[deleteComment]', err)
    return { code: -10, msg: '删除评论失败', error: err.message || err }
  }
}
