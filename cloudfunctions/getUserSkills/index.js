/**
 * 云函数 - 获取用户技能列表
 */
const { ok, fail, db } = require('./shared')

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

exports.main = async (event = {}) => {
  try {
    const { userId } = event
    if (!userId) return fail('缺少 userId', -1)

    const skillsRes = await db.collection('skills')
      .where({ userId, visibility: 'public', status: 'normal' })
      .orderBy('updatedAt', 'desc')
      .get()

    if (skillsRes.data.length) {
      return ok(skillsRes.data.map(normalizeSkill))
    }

    const userRes = await db.collection('users').doc(userId).get()
    return ok(userRes.data ? fromUserCanTeach(userRes.data) : [])
  } catch (err) {
    console.error('[getUserSkills]', err)
    return fail('获取用户技能失败', -2)
  }
}
