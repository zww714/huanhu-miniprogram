/**
 * 云函数 - 添加评论
 */
const { ok, fail, db, cloud } = require('./shared')
const _ = db.command

exports.main = async (event = {}) => {
  try {
    const { postId, content } = event
    const { OPENID } = cloud.getWXContext()

    if (!OPENID) return fail('获取用户身份失败', -1)
    if (!postId) return fail('缺少 postId', -2)
    if (!content || !String(content).trim()) return fail('评论内容不能为空', -3)

    const userRes = await db.collection('users').where({ openid: OPENID }).limit(1).get()
    if (!userRes.data.length) return fail('用户不存在，请先登录', -4)
    const user = userRes.data[0]

    const postRes = await db.collection('posts').doc(postId).get()
    const post = postRes.data
    if (!post || post.status === 'deleted') return fail('帖子不存在或已被删除', -5)

    const postAuthorId = post.authorId || post.userId || ''
    if (post.visibility === 'private' && postAuthorId !== user._id) {
      return fail('该内容不允许操作', -6)
    }

    const cleanContent = String(content).trim()

    // 内容安全审核
    try {
      const checkRes = await cloud.openapi.security.msgSecCheck({
        openid: OPENID,
        scene: 2,
        version: 2,
        content: cleanContent,
      })
      if (checkRes.result && checkRes.result.suggest !== 'pass') {
        return fail('评论含有违规信息，请修改后重试', -7)
      }
    } catch (e) {
      console.warn('[addComment] msgSecCheck failed, allowing comment', e)
    }

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

    await db.collection('posts').doc(postId).update({
      data: { commentCount: _.inc(1), comments: _.inc(1), updatedAt: db.serverDate() },
    }).catch(() => {})

    // 发送评论通知（放在 return 之前）
    if (postAuthorId && postAuthorId !== user._id) {
      await db.collection('notifications').add({
        data: {
          userId: postAuthorId,
          type: 'comments',
          title: '收到新的评论',
          content: `${user.name || '同学'} 评论了你的分享`,
          fromUserId: user._id,
          fromUserName: user.name || '同学',
          targetType: 'post',
          targetId: postId,
          targetTitle: post.title || '',
          read: false,
          createdAt: db.serverDate(),
        },
      }).catch((e) => console.warn('[addComment] create notification failed', e))
    }

    return ok({
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
    })
  } catch (err) {
    console.error('[addComment]', err)
    return fail('评论失败', -10)
  }
}
