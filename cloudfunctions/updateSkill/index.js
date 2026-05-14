const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

const db = cloud.database()

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
  if (data.category !== undefined) data.category = String(data.category).trim() || '技能'
  if (data.visibility !== undefined && !ALLOWED_VISIBILITY.includes(data.visibility)) data.visibility = 'public'
  delete data.desc
  return data
}

exports.main = async (event = {}) => {
  try {
    const { OPENID } = cloud.getWXContext()
    const skillId = event.skillId || event.id
    if (!OPENID) return { code: -1, msg: '获取用户身份失败' }
    if (!skillId) return { code: -2, msg: '缺少 skillId' }

    const skillRes = await db.collection('skills').doc(skillId).get()
    const skill = skillRes.data
    if (!skill || skill.status === 'deleted') return { code: -3, msg: '技能不存在或已删除' }
    if (skill.openid !== OPENID) return { code: -4, msg: '只能修改自己的技能' }

    const data = cleanUpdate(event)
    if (!Object.keys(data).length) return { code: -5, msg: '没有可更新的字段' }
    data.updatedAt = db.serverDate()

    await db.collection('skills').doc(skillId).update({ data })
    const updated = await db.collection('skills').doc(skillId).get()
    const next = updated.data
    delete next.openid

    return {
      code: 0,
      msg: '保存成功',
      data: { ...next, id: next._id, desc: next.intro || '' },
    }
  } catch (err) {
    console.error('[updateSkill]', err)
    return { code: -6, msg: '保存技能失败', error: err.message || err }
  }
}
