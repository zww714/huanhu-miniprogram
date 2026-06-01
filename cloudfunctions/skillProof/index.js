/**
 * 云函数 - 技能证明材料管理（多路复用）
 */
const { ok, fail, db, cloud } = require('./shared')
const _ = db.command

exports.main = async (event = {}) => {
  try {
    const { action, ...params } = event
    const { OPENID } = cloud.getWXContext()
    if (!OPENID) return fail('获取用户身份失败', -1)

    const userRes = await db.collection('users').where({ openid: OPENID }).limit(1).get()
    if (!userRes.data.length) return fail('用户未登录', -2)
    const myId = userRes.data[0]._id

    // --- getBySkill: 获取某技能的所有证明材料 ---
    if (action === 'getBySkill') {
      const { skillId } = params
      if (!skillId) return fail('缺少 skillId', -3)

      const proofRes = await db.collection('skillProofs')
        .where({ skillId, status: _.neq('deleted') })
        .orderBy('createdAt', 'desc')
        .get()

      return ok((proofRes.data || []).map((p) => ({
        id: p._id, type: p.type,
        title: p.title, desc: p.description || p.intro || '',
        url: p.url || '', status: p.status,
      })))
    }

    // --- getDetail: 获取证明材料详情 ---
    if (action === 'getDetail') {
      const { proofId } = params
      if (!proofId) return fail('缺少 proofId', -3)

      const proofRes = await db.collection('skillProofs').doc(proofId).get()
      const proof = proofRes.data
      if (!proof) return fail('证明材料不存在', -4)

      const authorRes = await db.collection('users').doc(proof.userId).get().catch(() => ({ data: null }))
      const author = authorRes.data || {}
      const submitterName = (proof.submitterId === myId ? '我' : proof.submitterName) ||
        (proof.fromUserId === myId ? '我' : '') || author.name || '同学'

      let relatedSkill = proof.relatedSkill || ''
      if (!relatedSkill && proof.skillId) {
        const skillRes = await db.collection('skills').doc(proof.skillId).get().catch(() => ({ data: null }))
        if (skillRes.data) relatedSkill = skillRes.data.name || ''
      }

      return ok({
        _id: proof._id, id: proof._id,
        skillId: proof.skillId, userId: proof.userId,
        title: proof.title, type: proof.type,
        status: proof.status || 'draft',
        description: proof.description || '',
        relatedSkill, level: proof.level || 0,
        submitterName,
        submitterAvatar: proof.submitterAvatar || author.avatar || '',
        createdAt: proof.createdAt || '', updatedAt: proof.updatedAt || '',
        images: proof.images || [], links: proof.links || [],
        tags: proof.tags || [], detail: proof.detail || {},
      })
    }

    // --- getProofsForUser: 获取某用户的全部技能证明材料 ---
    if (action === 'getProofsForUser') {
      const { userId } = params
      const targetId = userId || myId
      if (!targetId) return fail('缺少 userId', -3)

      const proofRes = await db.collection('skillProofs')
        .where({ userId: targetId, status: _.in(['approved', 'pending']) })
        .orderBy('createdAt', 'desc')
        .limit(50)
        .get()

      return ok(proofRes.data || [])
    }

    // --- add: 添加证明材料 ---
    if (action === 'add') {
      const { skillId, title, type, description, images, links, detail, tags } = params
      if (!skillId) return fail('缺少 skillId', -3)
      if (!title) return fail('缺少 title', -3)
      if (!type || !['portfolio', 'project', 'certificate', 'link'].includes(type)) return fail('type 无效', -3)

      const now = db.serverDate()
      const doc = {
        skillId, userId: myId, submitterId: myId,
        submitterName: userRes.data[0].name || '',
        title, type, status: 'draft',
        description: description || '',
        images: Array.isArray(images) ? images : [],
        links: Array.isArray(links) ? links : [],
        detail: typeof detail === 'object' && detail !== null ? detail : {},
        tags: Array.isArray(tags) ? tags : [],
        createdAt: now, updatedAt: now,
      }

      const addRes = await db.collection('skillProofs').add({ data: doc })
      return ok({ id: addRes._id, ...doc })
    }

    // --- getProofCount: 获取某技能的证明材料数量 ---
    if (action === 'getProofCount') {
      const { skillId } = params
      if (!skillId) return fail('缺少 skillId', -3)
      const countRes = await db.collection('skillProofs')
        .where({ skillId, status: _.in(['approved', 'pending']) }).count()
      return ok({ count: countRes.total || 0 })
    }

    return fail(`未知 action: ${action}`, -99)
  } catch (err) {
    console.error('[skillProof]', err)
    return fail('操作失败', -10)
  }
}
