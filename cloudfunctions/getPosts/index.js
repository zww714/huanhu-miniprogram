const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

const db = cloud.database()

function includes(value, keyword) {
  return String(value || '').toLowerCase().includes(keyword)
}

function normalizePost(post, author, canManage = false) {
  const summary = post.summary || post.excerpt || String(post.content || '').slice(0, 80)
  const safe = {
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
    categoryTag: post.categoryTag || `${post.category || post.mainCategory || '兴趣'} · 动态`,
    tags: Array.isArray(post.tags) ? post.tags : [],
    images: Array.isArray(post.images) ? post.images : [],
    cover: post.cover || (post.images && post.images[0]) || '',
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
    canManage,
    author,
    authorName: author.name,
  }
  return safe
}

async function getAuthor(authorId) {
  if (!authorId) return { id: '', name: '同学', avatar: '', college: '', major: '', grade: '', campus: '', verified: false }
  try {
    const res = await db.collection('users').doc(authorId)
      .field({ name: true, avatar: true, college: true, major: true, grade: true, campus: true, verified: true })
      .get()
    return {
      id: authorId,
      userId: authorId,
      name: res.data?.name || '同学',
      avatar: res.data?.avatar || '',
      college: res.data?.college || '',
      major: res.data?.major || '',
      grade: res.data?.grade || '',
      campus: res.data?.campus || '',
      verified: !!res.data?.verified,
    }
  } catch (e) {
    return { id: authorId, userId: authorId, name: '同学', avatar: '', college: '', major: '', grade: '', campus: '', verified: false }
  }
}

function matchFilters(post, event) {
  const keyword = String(event.keyword || '').trim().toLowerCase()
  const category = event.category || event.mainCategory
  const tag = event.tag

  if ((post.visibility || 'public') !== 'public') return false
  if ((post.status || 'normal') !== 'normal') return false
  if (category && category !== '全部' && category !== post.category && category !== post.mainCategory) return false
  if (tag && tag !== '全部' && !(post.tags || []).includes(tag)) return false
  if (!keyword) return true

  return [
    post.title,
    post.content,
    post.summary,
    post.excerpt,
    post.category,
    post.mainCategory,
    ...(post.tags || []),
    post.author?.name,
    post.author?.college,
    post.author?.major,
    post.author?.grade,
  ].some((value) => includes(value, keyword))
}

exports.main = async (event = {}) => {
  try {
    const page = Number(event.page || 0)
    const pageSize = Math.min(Number(event.pageSize || 20), 50)
    const result = await db.collection('posts')
      .orderBy('createdAt', 'desc')
      .limit(100)
      .get()

    const posts = []
    for (const post of result.data || []) {
      const author = await getAuthor(post.authorId || post.userId)
      const normalized = normalizePost(post, author, false)
      if (matchFilters(normalized, event)) posts.push(normalized)
    }

    const start = page * pageSize
    return {
      code: 0,
      data: posts.slice(start, start + pageSize),
      total: posts.length,
      hasMore: start + pageSize < posts.length,
    }
  } catch (err) {
    console.error('[getPosts]', err)
    return { code: -1, msg: '获取帖子失败', error: err.message || err }
  }
}
