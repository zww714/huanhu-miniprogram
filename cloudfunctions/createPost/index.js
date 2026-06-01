/**
 * 云函数 - 创建帖子
 */
const { ok, fail, db, cloud } = require('./shared')

function cleanPost(event) {
  const title = String(event.title || '').trim()
  const content = String(event.content || '').trim()
  const category = String(event.category || event.mainCategory || '兴趣').trim()
  const tags = Array.isArray(event.tags) ? event.tags.filter(Boolean) : []
  const images = Array.isArray(event.images) ? event.images.filter(Boolean) : event.image ? [event.image] : []
  const visibility = event.visibility === 'private' || event.visibility === '私密' ? 'private' : 'public'
  return {
    title, content,
    summary: String(event.summary || event.excerpt || content.slice(0, 80)).trim(),
    category, mainCategory: category,
    categoryTag: `${category} · 动态`,
    tags: tags.length ? tags : [category],
    images,
    cover: event.cover || images[0] || '',
    visibility, status: 'normal',
    likeCount: 0, commentCount: 0, favoriteCount: 0,
    collectCount: 0, viewCount: 0,
  }
}

async function refreshPostCount(userId) {
  const total = await db.collection('posts').where({ authorId: userId, status: 'normal' }).count()
  await db.collection('users').doc(userId).update({
    data: { postCount: total.total, 'stats.posts': total.total, updatedAt: db.serverDate() },
  })
}

exports.main = async (event = {}) => {
  try {
    const { OPENID } = cloud.getWXContext()
    if (!OPENID) return fail('获取用户身份失败', -1)

    const userRes = await db.collection('users').where({ openid: OPENID }).limit(1).get()
    if (!userRes.data.length) return fail('用户不存在，请先登录', -2)

    const post = cleanPost(event)
    if (!post.title || !post.content) return fail('标题和内容不能为空', -3)

    const user = userRes.data[0]
    const addRes = await db.collection('posts').add({
      data: {
        ...post,
        authorId: user._id, userId: user._id,
        openid: OPENID,
        createdAt: db.serverDate(), updatedAt: db.serverDate(),
      },
    })

    await refreshPostCount(user._id)

    const author = {
      id: user._id, userId: user._id,
      name: user.name || '同学', avatar: user.avatar || '',
      college: user.college || '', major: user.major || '',
      grade: user.grade || '', campus: user.campus || '',
      verified: !!user.verified,
    }

    return ok({
      ...post,
      _id: addRes._id, id: addRes._id,
      authorId: user._id, userId: user._id,
      author, authorName: author.name, canManage: true,
    })
  } catch (err) {
    console.error('[createPost]', err)
    return fail('发帖失败', -4)
  }
}
