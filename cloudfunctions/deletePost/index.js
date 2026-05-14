const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

const db = cloud.database()

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
    if (!OPENID) return { code: -1, msg: '获取用户身份失败' }
    if (!postId) return { code: -2, msg: '缺少 postId' }

    const postRes = await db.collection('posts').doc(postId).get()
    const post = postRes.data
    if (!post || post.status === 'deleted') return { code: -3, msg: '帖子不存在或已删除' }
    if (post.openid !== OPENID) return { code: -4, msg: '只能删除自己的帖子' }

    await db.collection('posts').doc(postId).update({
      data: {
        status: 'deleted',
        updatedAt: db.serverDate(),
      },
    })
    await refreshPostCount(post.authorId || post.userId)

    return { code: 0, msg: '已删除' }
  } catch (err) {
    console.error('[deletePost]', err)
    return { code: -5, msg: '删除帖子失败', error: err.message || err }
  }
}
