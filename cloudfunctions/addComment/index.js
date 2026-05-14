const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

const db = cloud.database()
const _ = db.command

exports.main = async (event = {}) => {
  try {
    const { postId, content } = event
    const { OPENID } = cloud.getWXContext()

    if (!OPENID) return { code: -1, msg: '获取用户身份失败' }
    if (!postId) return { code: -2, msg: '缺少 postId' }
    if (!content || !String(content).trim()) return { code: -3, msg: '评论内容不能为空' }

    // Get current user
    const userRes = await db.collection('users').where({ openid: OPENID }).limit(1).get()
    if (!userRes.data.length) return { code: -4, msg: '用户不存在，请先登录' }
    const user = userRes.data[0]

    // Verify post exists
    const postRes = await db.collection('posts').doc(postId).get()
    const post = postRes.data
    if (!post || post.status === 'deleted') return { code: -5, msg: '帖子不存在或已被删除' }

    // Private post: only author can comment
    const postAuthorId = post.authorId || post.userId || ''
    if (post.visibility === 'private' && postAuthorId !== user._id) {
      return { code: -6, msg: '该帖子暂不允许评论' }
    }

    // Clean content
    const cleanContent = String(content).trim()

    // Create comment
    const addRes = await db.collection('comments').add({
      data: {
        postId,
        authorId: user._id,
        openid: OPENID,
        content: cleanContent,
        parentId: null,
        replyToUserId: null,
        rootId: null,
        likeCount: 0,
        status: 'normal',
        createdAt: db.serverDate(),
        updatedAt: db.serverDate(),
      },
    })

    // Increment post commentCount
    await db.collection('posts').doc(postId).update({
      data: { commentCount: _.inc(1), updatedAt: db.serverDate() },
    }).catch(() => {})

    // Also update the post's comments field if it exists
    await db.collection('posts').doc(postId).update({
      data: { comments: _.inc(1) },
    }).catch(() => {})

    return {
      code: 0,
      data: {
        _id: addRes._id,
        id: addRes._id,
        postId,
        content: cleanContent,
        parentId: null,
        replyToUserId: null,
        rootId: null,
        likeCount: 0,
        canDelete: true,
        author: {
          _id: user._id,
          name: user.name || '同学',
          avatar: user.avatar || '',
          college: user.college || '',
          major: user.major || '',
          grade: user.grade || '',
          campus: user.campus || '',
          verified: !!user.verified,
        },
        replyToUser: null,
        replies: [],
        topReplies: [],
        replyCount: 0,
        createdAt: db.serverDate(),
        status: 'normal',
      },
    }
  } catch (err) {
    console.error('[addComment]', err)
    return { code: -10, msg: '评论失败', error: err.message || err }
  }
}
