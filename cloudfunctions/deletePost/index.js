/**
 * 云函数 - 删除帖子
 */
const { ok, fail, db, cloud } = require('./shared')

async function refreshPostCount(userId) {
  const total = await db.collection('posts').where({ authorId: userId, status: 'normal' }).count()
  await db.collection('users').doc(userId).update({
    data: {
      postCount: total.total,
      'stats.posts': total.total,
      updatedAt: db.serverDate(),
    },
  })
}

exports.main = async (event = {}) => {
  try {
    const { OPENID } = cloud.getWXContext()
    const postId = event.postId || event.id
    if (!OPENID) return fail('获取用户身份失败', -1)
    if (!postId) return fail('缺少 postId', -2)

    const postRes = await db.collection('posts').doc(postId).get()
    const post = postRes.data
    if (!post || post.status === 'deleted') return fail('帖子不存在或已删除', -3)
    if (post.openid !== OPENID) return fail('只可删除自己的帖子', -4)

    await db.collection('posts').doc(postId).update({
      data: { status: 'deleted', updatedAt: db.serverDate() },
    })
    await refreshPostCount(post.authorId || post.userId)

    return ok(null, { msg: '已删除' })
  } catch (err) {
    console.error('[deletePost]', err)
    return fail('删除帖子失败', -5)
  }
}
