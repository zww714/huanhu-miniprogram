const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

const db = cloud.database()

async function refreshSkillCount(userId) {
  const total = await db.collection('skills').where({ userId, status: 'normal' }).count()
  await db.collection('users').doc(userId).update({
    data: {
      skillCount: total.total,
      'stats.skills': total.total,
      updatedAt: db.serverDate(),
    },
  })
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
    if (skill.openid !== OPENID) return { code: -4, msg: '只能删除自己的技能' }

    await db.collection('skills').doc(skillId).update({
      data: {
        status: 'deleted',
        updatedAt: db.serverDate(),
      },
    })
    await refreshSkillCount(skill.userId)

    return { code: 0, msg: '已删除' }
  } catch (err) {
    console.error('[deleteSkill]', err)
    return { code: -5, msg: '删除技能失败', error: err.message || err }
  }
}
