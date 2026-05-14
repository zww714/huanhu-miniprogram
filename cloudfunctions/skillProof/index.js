// 云函数 - 技能证明材料管理
const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()
const _ = db.command

exports.main = async (event = {}) => {
  try {
    const { action, ...params } = event
    const { OPENID } = cloud.getWXContext()
    if (!OPENID) return { code: -1, msg: '获取用户身份失败' }

    const userRes = await db.collection('users').where({ openid: OPENID }).limit(1).get()
    if (!userRes.data.length) return { code: -2, msg: '用户未登录' }
    const myId = userRes.data[0]._id

    // --- getBySkill: 获取某个技能的所有证明材料（精简版） ---
    if (action === 'getBySkill') {
      const { skillId, userId } = params
      if (!skillId) return { code: -3, msg: '缺少 skillId' }

      const proofRes = await db.collection('skillProofs')
        .where({ skillId, status: _.neq('deleted') })
        .orderBy('createdAt', 'desc')
        .get()

      return {
        code: 0,
        data: (proofRes.data || []).map((p) => ({
          id: p._id,
          type: p.type,
          title: p.title,
          desc: p.description || p.intro || '',
          url: p.url || '',
          status: p.status,
        })),
      }
    }

    // --- getDetail: 获取单个证明材料的详细信息 ---
    if (action === 'getDetail') {
      const { proofId } = params
      if (!proofId) return { code: -3, msg: '缺少 proofId' }

      const proofRes = await db.collection('skillProofs').doc(proofId).get()
      const proof = proofRes.data
      if (!proof) return { code: -4, msg: '证明材料不存在' }

      // 查提交者信息（取 users 集合）
      const authorRes = await db.collection('users').doc(proof.userId).get().catch(() => ({ data: null }))
      const author = authorRes.data || {}
      const submitterName = (proof.submitterId === myId ? '我' : proof.submitterName) || (proof.fromUserId === myId ? '我' : '') || author.name || '同学'

      // 查技能名称
      let relatedSkill = proof.relatedSkill || ''
      if (!relatedSkill && proof.skillId) {
        const skillRes = await db.collection('skills').doc(proof.skillId).get().catch(() => ({ data: null }))
        if (skillRes.data) relatedSkill = skillRes.data.name || ''
      }

      return {
        code: 0,
        data: {
          _id: proof._id,
          id: proof._id,
          skillId: proof.skillId,
          userId: proof.userId,
          title: proof.title,
          type: proof.type,
          status: proof.status || 'draft',
          description: proof.description || '',
          relatedSkill,
          level: proof.level || 0,
          submitterName,
          submitterAvatar: proof.submitterAvatar || author.avatar || '',
          createdAt: proof.createdAt || '',
          updatedAt: proof.updatedAt || '',
          images: proof.images || [],
          links: proof.links || [],
          tags: proof.tags || [],
          detail: proof.detail || {},
        },
      }
    }

    // --- getProofsForUser: 获取某用户所有技能的证明材料 ---
    if (action === 'getProofsForUser') {
      const { userId } = params
      const targetId = userId || myId
      if (!targetId) return { code: -3, msg: '缺少 userId' }

      const proofRes = await db.collection('skillProofs')
        .where({ userId: targetId, status: _.in(['approved', 'pending']) })
        .orderBy('createdAt', 'desc')
        .limit(50)
        .get()

      return { code: 0, data: proofRes.data || [] }
    }

    // --- add: 添加证明材料 ---
    if (action === 'add') {
      const { skillId, title, type, description, images, links, detail, tags } = params
      if (!skillId) return { code: -3, msg: '缺少 skillId' }
      if (!title) return { code: -3, msg: '缺少 title' }
      if (!type || !['portfolio', 'project', 'certificate', 'link'].includes(type)) return { code: -3, msg: 'type 无效' }

      const now = db.serverDate()
      const doc = {
        skillId,
        userId: myId,
        submitterId: myId,
        submitterName: userRes.data[0].name || '',
        title,
        type,
        status: 'draft',
        description: description || '',
        images: Array.isArray(images) ? images : [],
        links: Array.isArray(links) ? links : [],
        detail: typeof detail === 'object' && detail !== null ? detail : {},
        tags: Array.isArray(tags) ? tags : [],
        createdAt: now,
        updatedAt: now,
      }

      const addRes = await db.collection('skillProofs').add({ data: doc })
      return { code: 0, data: { id: addRes._id, ...doc } }
    }

    // --- getProofCount: 获取某个技能的证明材料数量 ---
    if (action === 'getProofCount') {
      const { skillId } = params
      if (!skillId) return { code: -3, msg: '缺少 skillId' }
      const countRes = await db.collection('skillProofs')
        .where({ skillId, status: _.in(['approved', 'pending']) })
        .count()
      return { code: 0, data: { count: countRes.total || 0 } }
    }

    return { code: -99, msg: `未知 action: ${action}` }
  } catch (err) {
    console.error('[skillProof]', err)
    return { code: -10, msg: '操作失败', error: err.message || err }
  }
}
