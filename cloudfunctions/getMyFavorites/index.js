const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

const db = cloud.database()

async function getAuthorInfo(userId) {
  try {
    const res = await db.collection('users').doc(userId)
      .field({ _id: true, name: true, avatar: true, college: true, major: true, grade: true, verified: true })
      .get()
    const u = res.data || {}
    return {
      _id: u._id || userId,
      name: u.name || '同学',
      avatar: u.avatar || '',
      college: u.college || '',
      major: u.major || '',
      grade: u.grade || '',
      verified: !!u.verified,
    }
  } catch (e) {
    return { _id: userId, name: '同学', avatar: '', college: '', major: '', grade: '', verified: false }
  }
}

exports.main = async (event = {}) => {
  try {
    const { targetType = 'post' } = event
    const { OPENID } = cloud.getWXContext()

    if (!OPENID) return { code: -1, msg: '获取用户身份失败' }

    // Get current user
    const userRes = await db.collection('users').where({ openid: OPENID }).limit(1).get()
    if (!userRes.data.length) return { code: -2, msg: '用户不存在' }
    const user = userRes.data[0]

    // Get active favorites for this user
    const favRes = await db.collection('favorites')
      .where({ targetType, userId: user._id, status: 'active' })
      .orderBy('createdAt', 'desc')
      .get()

    const favData = favRes.data || []

    // Enrich with post data
    const results = []

    for (const fav of favData) {
      try {
        const postRes = await db.collection('posts').doc(fav.targetId).get()
        const post = postRes.data

        if (!post || post.status === 'deleted') continue

        // Private post: only show if user is the author
        const postAuthorId = post.authorId || post.userId || ''
        if (post.visibility === 'private' && postAuthorId !== user._id) continue

        const author = await getAuthorInfo(postAuthorId)

        results.push({
          _id: fav._id,
          id: fav._id,
          postId: fav.targetId,
          targetType: fav.targetType,
          createdAt: fav.createdAt,
          updatedAt: fav.updatedAt,
          post: {
            _id: post._id,
            id: post._id,
            title: post.title || '',
            excerpt: post.summary || post.excerpt || String(post.content || '').slice(0, 80),
            content: post.content || '',
            cover: post.cover || '',
            images: post.images || [],
            tags: post.tags || [],
            category: post.category || post.mainCategory || '兴趣',
            mainCategory: post.mainCategory || post.category || '兴趣',
            visibility: post.visibility || 'public',
            likeCount: Number(post.likeCount ?? post.likes ?? 0),
            commentCount: Number(post.commentCount ?? post.comments ?? 0),
            favoriteCount: Number(post.favoriteCount ?? post.collectCount ?? 0),
            collectCount: Number(post.favoriteCount ?? post.collectCount ?? 0),
            likes: Number(post.likeCount ?? post.likes ?? 0),
            comments: Number(post.commentCount ?? post.comments ?? 0),
            authorId: postAuthorId,
            author,
          },
        })
      } catch (e) {
        console.warn('[getMyFavorites] skip invalid post', fav.targetId, e)
        continue
      }
    }

    return { code: 0, data: results, total: results.length }
  } catch (err) {
    console.error('[getMyFavorites]', err)
    return { code: -10, msg: '获取收藏列表失败', error: err.message || err }
  }
}
