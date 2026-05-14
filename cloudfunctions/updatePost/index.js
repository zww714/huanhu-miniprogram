const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

const db = cloud.database()

const ALLOWED_FIELDS = ['title', 'content', 'summary', 'excerpt', 'category', 'mainCategory', 'tags', 'images', 'cover', 'visibility']

function cleanUpdate(event) {
  const source = event.post && typeof event.post === 'object' ? event.post : event
  const data = {}
  ALLOWED_FIELDS.forEach((field) => {
    if (source[field] !== undefined) data[field] = source[field]
  })
  if (data.title !== undefined) data.title = String(data.title).trim()
  if (data.content !== undefined) data.content = String(data.content).trim()
  if (data.excerpt !== undefined && data.summary === undefined) data.summary = data.excerpt
  if (data.summary !== undefined) data.summary = String(data.summary).trim()
  if (data.mainCategory !== undefined && data.category === undefined) data.category = data.mainCategory
  if (data.category !== undefined) {
    data.category = String(data.category).trim() || '兴趣'
    data.mainCategory = data.category
    data.categoryTag = `${data.category} · 动态`
  }
  if (data.tags !== undefined && !Array.isArray(data.tags)) data.tags = []
  if (data.images !== undefined && !Array.isArray(data.images)) data.images = []
  if (data.visibility !== undefined) data.visibility = data.visibility === 'private' || data.visibility === '私密' ? 'private' : 'public'
  delete data.excerpt
  return data
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
    if (post.openid !== OPENID) return { code: -4, msg: '只能修改自己的帖子' }

    const data = cleanUpdate(event)
    if (!Object.keys(data).length) return { code: -5, msg: '没有可更新的字段' }
    data.updatedAt = db.serverDate()

    await db.collection('posts').doc(postId).update({ data })
    return { code: 0, msg: '保存成功' }
  } catch (err) {
    console.error('[updatePost]', err)
    return { code: -6, msg: '保存帖子失败', error: err.message || err }
  }
}
