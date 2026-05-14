const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

const db = cloud.database()

async function getAuthor(userId) {
  try {
    const res = await db.collection('users').doc(userId)
      .field({ name: true, avatar: true, college: true, major: true, grade: true, campus: true, verified: true })
      .get()
    return {
      id: userId,
      userId,
      name: res.data?.name || '同学',
      avatar: res.data?.avatar || '',
      college: res.data?.college || '',
      major: res.data?.major || '',
      grade: res.data?.grade || '',
      campus: res.data?.campus || '',
      verified: !!res.data?.verified,
    }
  } catch (e) {
    return { id: userId, userId, name: '同学', avatar: '', college: '', major: '', grade: '', campus: '', verified: false }
  }
}

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
    canManage: false,
  }
}

exports.main = async (event = {}) => {
  try {
    const { userId } = event
    if (!userId) return { code: -1, msg: '缺少 userId' }
    const author = await getAuthor(userId)
    const res = await db.collection('posts')
      .where({ authorId: userId, visibility: 'public', status: 'normal' })
      .orderBy('createdAt', 'desc')
      .get()
    return { code: 0, data: (res.data || []).map((post) => normalize(post, author)) }
  } catch (err) {
    console.error('[getUserPosts]', err)
    return { code: -2, msg: '获取 TA 的发布失败', error: err.message || err }
  }
}
