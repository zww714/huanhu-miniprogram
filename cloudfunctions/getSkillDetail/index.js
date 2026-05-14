const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

const db = cloud.database()

function normalizeSkill(doc, isOwner) {
  const publicData = {
    _id: doc._id,
    id: doc._id,
    userId: doc.userId,
    name: doc.name || '',
    level: Number(doc.level || 1),
    levelText: doc.levelText || (Number(doc.level || 1) >= 4 ? '熟练掌握' : '持续提升中'),
    category: doc.category || '技能',
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
    if (!skillId) return { code: -1, msg: '缺少 skillId' }

    let skillDoc
    try {
      const byId = await db.collection('skills').doc(skillId).get()
      skillDoc = byId.data
    } catch (e) {
      const byLegacyId = await db.collection('skills').where({ id: skillId }).limit(1).get()
      skillDoc = byLegacyId.data[0]
    }

    if (!skillDoc || skillDoc.status === 'deleted') {
      return { code: -2, msg: '该技能不存在或已被删除' }
    }

    const isOwner = !!OPENID && skillDoc.openid === OPENID
    if (!isOwner && skillDoc.visibility !== 'public') {
      return { code: -3, msg: '该技能不存在或已被删除' }
    }

    return { code: 0, data: normalizeSkill(skillDoc, isOwner) }
  } catch (err) {
    console.error('[getSkillDetail]', err)
    return { code: -4, msg: '获取技能详情失败', error: err.message || err }
  }
}
