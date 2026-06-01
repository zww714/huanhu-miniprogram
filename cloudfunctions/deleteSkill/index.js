/**
 * 云函数 - 删除技能
 */
const { ok, fail, db, cloud } = require('./shared')

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
    if (!OPENID) return fail('获取用户身份失败', -1)
    if (!skillId) return fail('缺少 skillId', -2)

    const skillRes = await db.collection('skills').doc(skillId).get()
    const skill = skillRes.data
    if (!skill || skill.status === 'deleted') return fail('技能不存在或已删除', -3)
    if (skill.openid !== OPENID) return fail('只可删除自己的技能', -4)

    await db.collection('skills').doc(skillId).update({
      data: { status: 'deleted', updatedAt: db.serverDate() },
    })
    await refreshSkillCount(skill.userId)

    return ok(null, { msg: '已删除' })
  } catch (err) {
    console.error('[deleteSkill]', err)
    return fail('删除技能失败', -5)
  }
}
