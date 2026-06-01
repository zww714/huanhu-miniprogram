const { ok, fail, db } = require('./shared')

exports.main = async (event = {}) => {
  try {
    const { postId } = event
    if (!postId) return fail('缺少帖子ID')

    // Load root comments
    const { data: rootComments } = await db.collection('comments')
      .where({ postId, parentId: null })
      .orderBy('createdAt', 'desc')
      .limit(50)
      .get()

    // Load all replies for these comments
    const parentIds = (rootComments || []).map((c) => c._id)
    let replies = []
    if (parentIds.length > 0) {
      const replyCount = await db.collection('comments').where({ parentId: db.command.in(parentIds) }).count()
      if (replyCount.total > 0) {
        const { data: replyData } = await db.collection('comments')
          .where({ parentId: db.command.in(parentIds) })
          .orderBy('createdAt', 'asc')
          .limit(100)
          .get()
        replies = replyData || []
      }
    }

    // Attach replies to root comments
    const comments = (rootComments || []).map((comment) => {
      const commentReplies = replies.filter((r) => r.parentId === comment._id)
      return {
        ...comment,
        replies: commentReplies.slice(0, 3),
        replyCount: commentReplies.length,
        topReplies: commentReplies.slice(0, 3),
        time: comment.createdAt,
        author: comment.author || { name: '同学', avatar: '', college: '', grade: '', verified: false },
      }
    })

    return ok(comments)
  } catch (err) {
    console.error('[getComments]', err)
    return fail('获取评论失败')
  }
}
