/**
 * 云函数 - 获取技能详情
 */
const { ok, fail, db, cloud } = require('./shared')

function normalizeSkill(doc, isOwner) {
  const publicData = {
    _id: doc._id,
    id: doc._id,
    userId: doc.userId,
    name: doc.name || '',
    level: Number(doc.level || 1),
    levelText: doc.levelText || (Number(doc.level || 1) >= 4 ? '熟练掌握' : '持续学习中'),
    category: doc.category || '其他',
    icon: doc.icon || String(doc.name || '技').slice(0, 1),
    verified: Number(doc.proofCount || 0) > 0,
    intro: doc.intro || doc.desc || '',
    summary: doc.summary || doc.intro || doc.desc || '',
    abilityDescription: doc.abilityDescription || doc.intro || doc.desc || '',
    canHelp: doc.canHelp || [],
    proofs: doc.proofs || [],
    tags: Array.isArray(doc.tags) ? doc.tags : [],
    proofCount: Number(doc.proofCount || 0),
    workCount: Number(doc.workCount || 0),
    visibility: doc.visibility || 'public',
    status: doc.status || 'normal',
    isOwner,
  }

  if (!isOwner) return publicData
  return {
    ...publicData,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  }
}

exports.main = async (event = {}) => {
  try {
    const { skillId } = event
    const { OPENID } = cloud.getWXContext()
    if (!skillId) return fail('缺少 skillId', -1)

    let skillDoc
    try {
      const byId = await db.collection('skills').doc(skillId).get()
      skillDoc = byId.data
    } catch (e) {
      const byLegacyId = await db.collection('skills').where({ id: skillId }).limit(1).get()
      skillDoc = byLegacyId.data[0]
    }

    if (!skillDoc || skillDoc.status === 'deleted') {
      return fail('该技能不存在或已被删除', -2)
    }

    const isOwner = !!OPENID && skillDoc.openid === OPENID
    if (!isOwner && skillDoc.visibility !== 'public') {
      return fail('该技能不存在或已被删除', -3)
    }

    return ok(normalizeSkill(skillDoc, isOwner))
  } catch (err) {
    console.error('[getSkillDetail]', err)
    return fail('获取技能详情失败', -4)
  }
}
