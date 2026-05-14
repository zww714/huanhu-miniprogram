const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

const db = cloud.database()
const _ = db.command

function normalize(post, author) {
  const summary = post.summary || post.excerpt || String(post.content || '').slice(0, 80)
  return {
    _id: post._id,
    id: post._id,
    authorId: post.authorId || post.userId,
    userId: post.authorId || post.userId,
    title: post.title || '',
    content: post.content || '',
    summary,
    excerpt: summary,
    category: post.category || post.mainCategory || '兴趣',
    mainCategory: post.category || post.mainCategory || '兴趣',
    tags: post.tags || [],
    images: post.images || [],
    cover: post.cover || post.images?.[0] || '',
    visibility: post.visibility || 'public',
    status: post.status || 'normal',
    likeCount: Number(post.likeCount ?? post.likes ?? 0),
    commentCount: Number(post.commentCount ?? post.comments ?? 0),
    favoriteCount: Number(post.favoriteCount ?? post.collectCount ?? 0),
    collectCount: Number(post.favoriteCount ?? post.collectCount ?? 0),
    viewCount: Number(post.viewCount || 0),
    likes: Number(post.likeCount ?? post.likes ?? 0),
    comments: Number(post.commentCount ?? post.comments ?? 0),
    createdAt: post.createdAt,
    updatedAt: post.updatedAt,
    author,
    authorName: author.name,
    canManage: true,
  }
}

exports.main = async () => {
  try {
    const { OPENID } = cloud.getWXContext()
    if (!OPENID) return { code: -1, msg: '获取用户身份失败' }

    const userRes = await db.collection('users').where({ openid: OPENID }).limit(1).get()
    if (!userRes.data.length) return { code: -2, msg: '用户不存在，请先登录' }

    const user = userRes.data[0]
    const author = {
      id: user._id,
      userId: user._id,
      name: user.name || '同学',
      avatar: user.avatar || '',
      college: user.college || '',
      major: user.major || '',
      grade: user.grade || '',
      campus: user.campus || '',
      verified: !!user.verified,
    }

    const res = await db.collection('posts')
      .where({ openid: OPENID, status: _.neq('deleted') })
      .orderBy('createdAt', 'desc')
      .get()

    return { code: 0, data: (res.data || []).map((post) => normalize(post, author)) }
  } catch (err) {
    console.error('[getMyPosts]', err)
    return { code: -3, msg: '获取我的发布失败', error: err.message || err }
  }
}
