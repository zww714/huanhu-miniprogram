/**
 * 云函数 - 更新帖子
 */
const { ok, fail, db, cloud } = require('./shared')

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
  if (data.visibility !== undefined) {
    data.visibility = data.visibility === 'private' || data.visibility === '私密' ? 'private' : 'public'
  }
  delete data.excerpt
  return data
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
    if (post.openid !== OPENID) return fail('只可修改自己的帖子', -4)

    const data = cleanUpdate(event)
    if (!Object.keys(data).length) return fail('没有可更新的字段', -5)

    // 内容安全审核
    try {
      const textToCheck = [data.title, data.content].filter(Boolean).join('\n')
      if (textToCheck) {
        const checkRes = await cloud.openapi.security.msgSecCheck({
          openid: OPENID,
          scene: 2,
          version: 2,
          content: textToCheck,
        })
        if (checkRes.result && checkRes.result.suggest !== 'pass') {
          return fail('内容含有违规信息，请修改后重试', -7)
        }
      }
    } catch (e) {
      console.warn('[updatePost] msgSecCheck failed, allowing update', e)
    }

    data.updatedAt = db.serverDate()

    await db.collection('posts').doc(postId).update({ data })
    return ok({ msg: '更新成功' })
  } catch (err) {
    console.error('[updatePost]', err)
    return fail('更新帖子失败', -6)
  }
}
