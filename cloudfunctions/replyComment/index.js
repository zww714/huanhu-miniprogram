const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

const db = cloud.database()
const _ = db.command

async function getUserPublicInfo(userId) {
  try {
    const res = await db.collection('users').doc(userId)
      .field({ _id: true, name: true, avatar: true, college: true, major: true, grade: true, campus: true, verified: true })
      .get()
    const u = res.data || {}
    return {
      _id: u._id || userId,
      name: u.name || '同学',
      avatar: u.avatar || '',
      college: u.college || '',
      major: u.major || '',
      grade: u.grade || '',
      campus: u.campus || '',
      verified: !!u.verified,
    }
  } catch (e) {
    return { _id: userId, name: '同学', avatar: '', college: '', major: '', grade: '', campus: '', verified: false }
  }
}

exports.main = async (event = {}) => {
  try {
    const { postId, parentId, replyToUserId, content } = event
    const { OPENID } = cloud.getWXContext()

    if (!OPENID) return { code: -1, msg: '获取用户身份失败' }
    if (!postId) return { code: -2, msg: '缺少 postId' }
    if (!parentId) return { code: -3, msg: '缺少 parentId' }
    if (!content || !String(content).trim()) return { code: -4, msg: '回复内容不能为空' }

    // Get current user
    const userRes = await db.collection('users').where({ openid: OPENID }).limit(1).get()
    if (!userRes.data.length) return { code: -5, msg: '用户不存在，请先登录' }
    const user = userRes.data[0]

    // Verify post exists
    const postRes = await db.collection('posts').doc(postId).get()
    const post = postRes.data
    if (!post || post.status === 'deleted') return { code: -6, msg: '帖子不存在或已被删除' }

    // Private post: only author can comment
    const postAuthorId = post.authorId || post.userId || ''
    if (post.visibility === 'private' && postAuthorId !== user._id) {
      return { code: -7, msg: '该帖子暂不允许评论' }
    }

    // Verify parent comment exists and is normal
    const parentRes = await db.collection('comments').doc(parentId).get()
    const parentComment = parentRes.data
    if (!parentComment || parentComment.status === 'deleted') {
      return { code: -8, msg: '原评论已被删除' }
    }

    // Determine rootId: if parent is root, use parent._id; if parent already has rootId, use that
    const rootId = parentComment.rootId || parentId

    // Clean content
    const cleanContent = String(content).trim()

    // Create reply
    const addRes = await db.collection('comments').add({
      data: {
        postId,
        authorId: user._id,
        openid: OPENID,
        content: cleanContent,
        parentId,
        replyToUserId: replyToUserId || null,
        rootId,
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

    await db.collection('posts').doc(postId).update({
      data: { comments: _.inc(1) },
    }).catch(() => {})

    // Get replyToUser info for frontend
    let replyToUser = null
    if (replyToUserId) {
      replyToUser = await getUserPublicInfo(replyToUserId)
    }

    return {
      code: 0,
      data: {
        _id: addRes._id,
        id: addRes._id,
        postId,
        content: cleanContent,
        parentId,
        replyToUserId: replyToUserId || null,
        rootId,
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
        replyToUser,
        createdAt: db.serverDate(),
        status: 'normal',
      },
    }
  } catch (err) {
    console.error('[replyComment]', err)
    return { code: -10, msg: '回复失败', error: err.message || err }
  }
}
