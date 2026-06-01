/**
 * 云函数 - 获取我的技能列表
 */
const { ok, fail, db, cloud } = require('./shared')
const _ = db.command

function normalizeSkill(doc) {
  return {
    _id: doc._id,
    id: doc._id,
    userId: doc.userId,
    name: doc.name || '',
    level: Number(doc.level || 1),
    intro: doc.intro || doc.desc || '',
    desc: doc.intro || doc.desc || '',
    tags: Array.isArray(doc.tags) ? doc.tags : [],
    category: doc.category || '其他',
    proofCount: Number(doc.proofCount || 0),
    workCount: Number(doc.workCount || 0),
    visibility: doc.visibility || 'public',
    status: doc.status || 'normal',
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  }
}

function fromUserCanTeach(user) {
  const canTeach = user.canTeach || user.skills || user.can || []
  return canTeach.map((item, index) => {
    const name = typeof item === 'string' ? item : item.name
    return normalizeSkill({
      _id: item.id || `fallback-${index}-${name}`,
      userId: user._id,
      name,
      level: item.level || 3,
      intro: item.intro || item.desc || '',
      tags: item.tags || [],
      category: item.category || '其他',
      visibility: 'public',
      status: 'normal',
    })
  })
}

exports.main = async () => {
  try {
    const { OPENID } = cloud.getWXContext()
    if (!OPENID) return fail('获取用户身份失败', -1)

    const userRes = await db.collection('users').where({ openid: OPENID }).limit(1).get()
    if (!userRes.data.length) return fail('用户不存在，请先登录', -2)

    const user = userRes.data[0]
    const skillsRes = await db.collection('skills')
      .where({ openid: OPENID, status: _.neq('deleted') })
      .orderBy('updatedAt', 'desc')
      .get()

    const skills = skillsRes.data.length
      ? skillsRes.data.map(normalizeSkill)
      : fromUserCanTeach(user)

    return ok(skills)
  } catch (err) {
    console.error('[getMySkills]', err)
    return fail('获取我的技能失败', -3)
  }
}
