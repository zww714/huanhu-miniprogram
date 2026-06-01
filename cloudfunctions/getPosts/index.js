/**
 * 获取帖子列表 (v2)
 * 支持分页、关键词搜索、分类筛选
 */
const { ok, fail, getOpenId, paginate, requireParams, validateLength, db, cloud } = require('./shared')

function includes(value, keyword) {
  return String(value || '').toLowerCase().includes(keyword)
}

async function getAuthor(authorId) {
  if (!authorId) return { id: '', name: '同学', avatar: '', college: '', major: '', grade: '', campus: '', verified: false }
  try {
    const { data } = await db.collection('users').doc(authorId)
      .field({ name: true, avatar: true, college: true, major: true, grade: true, campus: true, verified: true })
      .get()
    return {
      id: authorId, userId: authorId,
      name: data?.name || '同学', avatar: data?.avatar || '',
      college: data?.college || '', major: data?.major || '',
      grade: data?.grade || '', campus: data?.campus || '',
      verified: !!data?.verified,
    }
  } catch { return { id: authorId, userId: authorId, name: '同学', avatar: '', college: '', major: '', grade: '', campus: '', verified: false } }
}

function normalizePost(post, author, canManage = false) {
  const summary = post.summary || post.excerpt || String(post.content || '').slice(0, 80)
  return {
    _id: post._id, id: post._id,
    authorId: post.authorId || post.userId, userId: post.authorId || post.userId,
    title: post.title || '', content: post.content || '', summary, excerpt: summary,
    category: post.category || post.mainCategory || '兴趣',
    mainCategory: post.category || post.mainCategory || '兴趣',
    categoryTag: post.categoryTag || (post.category || post.mainCategory || '兴趣') + ' · 动态',
    tags: Array.isArray(post.tags) ? post.tags : [],
    images: Array.isArray(post.images) ? post.images : [],
    cover: post.cover || (post.images && post.images[0]) || '',
    visibility: post.visibility || 'public', status: post.status || 'normal',
    likeCount: Number(post.likeCount ?? post.likes ?? 0),
    commentCount: Number(post.commentCount ?? post.comments ?? 0),
    favoriteCount: Number(post.favoriteCount ?? post.collectCount ?? 0),
    collectCount: Number(post.favoriteCount ?? post.collectCount ?? 0),
    viewCount: Number(post.viewCount || 0),
    likes: Number(post.likeCount ?? post.likes ?? 0),
    comments: Number(post.commentCount ?? post.comments ?? 0),
    createdAt: post.createdAt, updatedAt: post.updatedAt,
    canManage, author, authorName: author.name,
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
  return [post.title, post.content, post.summary, post.excerpt, post.category, post.mainCategory, ...(post.tags || []), post.author?.name, post.author?.college, post.author?.major, post.author?.grade]
    .some((v) => includes(v, keyword))
}

exports.main = async (event = {}) => {
  try {
    const page = Number(event.page || 0)
    const pageSize = Math.min(Number(event.pageSize || 20), 50)

    // Load posts with optimized query
    const query = {}
    if (event.category && event.category !== '全部') query.category = event.category
    if (event.userId) { query.authorId = event.userId; query.userId = event.userId }

    const result = await db.collection('posts')
      .where({ visibility: 'public', status: 'normal', ...query })
      .orderBy('createdAt', 'desc')
      .limit(200)
      .get()

    const posts = []
    for (const post of result.data || []) {
      const author = await getAuthor(post.authorId || post.userId)
      const normalized = normalizePost(post, author, false)
      if (matchFilters(normalized, event)) posts.push(normalized)
    }

    const start = page * pageSize
    const paged = posts.slice(start, start + pageSize)

    return ok(paged, { total: posts.length, hasMore: start + pageSize < posts.length })
  } catch (err) {
    console.error('[getPosts]', err)
    return fail('获取帖子失败')
  }
}
