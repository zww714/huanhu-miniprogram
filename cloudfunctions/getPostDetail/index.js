/**
 * 云函数 - 获取帖子详情
 */
const { ok, fail, db, cloud } = require('./shared')

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

function normalize(post, author, canManage) {
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
    categoryTag: post.categoryTag || `${post.category || post.mainCategory || '兴趣'} · 动态`,
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
    canManage,
  }
}

exports.main = async (event = {}) => {
  try {
    const { postId } = event
    const { OPENID } = cloud.getWXContext()
    if (!postId) return fail('缺少 postId', -1)

    const postRes = await db.collection('posts').doc(postId).get()
    const post = postRes.data
    if (!post || post.status === 'deleted') return fail('该帖子不存在或已被删除', -2)

    const canManage = !!OPENID && post.openid === OPENID
    if (!canManage && post.visibility !== 'public') return fail('该内容不可查看', -3)

    await db.collection('posts').doc(postId).update({
      data: { viewCount: db.command.inc(1) },
    }).catch(() => {})

    const author = await getAuthor(post.authorId || post.userId)
    return ok(normalize({ ...post, viewCount: Number(post.viewCount || 0) + 1 }, author, canManage))
  } catch (err) {
    console.error('[getPostDetail]', err)
    return fail('获取帖子详情失败', -4)
  }
}
