/**
 * 云函数 - 更新技能
 */
const { ok, fail, db, cloud } = require('./shared')

const ALLOWED_FIELDS = ['name', 'level', 'intro', 'desc', 'tags', 'category', 'visibility']
const ALLOWED_VISIBILITY = ['public', 'private']

function cleanUpdate(event) {
  const source = event.skill && typeof event.skill === 'object' ? event.skill : event
  const data = {}
  ALLOWED_FIELDS.forEach((field) => {
    if (source[field] !== undefined) data[field] = source[field]
  })
  if (data.name !== undefined) data.name = String(data.name).trim()
  if (data.level !== undefined) data.level = Math.min(Math.max(Number(data.level || 1), 1), 5)
  if (data.desc !== undefined && data.intro === undefined) data.intro = data.desc
  if (data.intro !== undefined) data.intro = String(data.intro).trim()
  if (data.tags !== undefined && !Array.isArray(data.tags)) data.tags = []
  if (data.category !== undefined) data.category = String(data.category).trim() || '其他'
  if (data.visibility !== undefined && !ALLOWED_VISIBILITY.includes(data.visibility)) data.visibility = 'public'
  delete data.desc
  return data
}

exports.main = async (event = {}) => {
  try {
    const { OPENID } = cloud.getWXContext()
    const skillId = event.skillId || event.id
    if (!OPENID) return fail('获取用户身份失败', -1)
    if (!skillId) return fail('缺少 skillId', -2)

    const skillRes = await db.collection('skills').doc(skillId).get()
    const skill = skillRes.data
    if (!skill || skill.status === 'deleted') return fail('技能不存在或已删除', -3)
    if (skill.openid !== OPENID) return fail('只可修改自己的技能', -4)

    const data = cleanUpdate(event)
    if (!Object.keys(data).length) return fail('没有可更新的字段', -5)
    data.updatedAt = db.serverDate()

    await db.collection('skills').doc(skillId).update({ data })
    const updated = await db.collection('skills').doc(skillId).get()
    const next = updated.data
    delete next.openid

    return ok({ ...next, id: next._id, desc: next.intro || '' })
  } catch (err) {
    console.error('[updateSkill]', err)
    return fail('更新技能失败', -6)
  }
}
