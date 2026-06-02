/**
 * 云函数 - 回复评论
 */
const { ok, fail, db, cloud } = require('./shared')
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

    if (!OPENID) return fail('获取用户身份失败', -1)
    if (!postId) return fail('缺少 postId', -2)
    if (!parentId) return fail('缺少 parentId', -3)
    if (!content || !String(content).trim()) return fail('回复内容不能为空', -4)

    const userRes = await db.collection('users').where({ openid: OPENID }).limit(1).get()
    if (!userRes.data.length) return fail('用户不存在，请先登录', -5)
    const user = userRes.data[0]

    const postRes = await db.collection('posts').doc(postId).get()
    const post = postRes.data
    if (!post || post.status === 'deleted') return fail('帖子不存在或已被删除', -6)

    const postAuthorId = post.authorId || post.userId || ''
    if (post.visibility === 'private' && postAuthorId !== user._id) {
      return fail('该内容不允许操作', -7)
    }

    const parentRes = await db.collection('comments').doc(parentId).get()
    const parentComment = parentRes.data
    if (!parentComment || parentComment.status === 'deleted') {
      return fail('原评论已被删除', -8)
    }

    const rootId = parentComment.rootId || parentId
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
        return fail('回复含有违规信息，请修改后重试', -9)
      }
    } catch (e) {
      console.warn('[replyComment] msgSecCheck failed, allowing reply', e)
    }

    const addRes = await db.collection('comments').add({
      data: {
        postId, authorId: user._id, openid: OPENID,
        content: cleanContent, parentId,
        replyToUserId: replyToUserId || null, rootId,
        likeCount: 0, status: 'normal',
        createdAt: db.serverDate(), updatedAt: db.serverDate(),
      },
    })

    await db.collection('posts').doc(postId).update({
      data: { commentCount: _.inc(1), comments: _.inc(1), updatedAt: db.serverDate() },
    }).catch(() => {})

    let replyToUser = null
    if (replyToUserId) {
      replyToUser = await getUserPublicInfo(replyToUserId)
    }

    return ok({
      _id: addRes._id, id: addRes._id, postId,
      content: cleanContent, parentId,
      replyToUserId: replyToUserId || null, rootId,
      likeCount: 0, canDelete: true,
      author: {
        _id: user._id, name: user.name || '同学', avatar: user.avatar || '',
        college: user.college || '', major: user.major || '',
        grade: user.grade || '', campus: user.campus || '', verified: !!user.verified,
      },
      replyToUser,
      createdAt: db.serverDate(), status: 'normal',
    })
  } catch (err) {
    console.error('[replyComment]', err)
    return fail('回复失败', -10)
  }
}
