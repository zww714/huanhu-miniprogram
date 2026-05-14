const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

const db = cloud.database()

const ALLOWED_VISIBILITY = ['public', 'private']

function cleanSkill(event) {
  const name = String(event.name || '').trim()
  return {
    name,
    level: Math.min(Math.max(Number(event.level || 3), 1), 5),
    intro: String(event.intro || event.desc || '').trim(),
    tags: Array.isArray(event.tags) ? event.tags.filter(Boolean) : [],
    category: String(event.category || '技能').trim(),
    proofCount: 0,
    workCount: 0,
    visibility: ALLOWED_VISIBILITY.includes(event.visibility) ? event.visibility : 'public',
    status: 'normal',
  }
}

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
    if (!OPENID) return { code: -1, msg: '获取用户身份失败' }

    const userRes = await db.collection('users').where({ openid: OPENID }).limit(1).get()
    if (!userRes.data.length) return { code: -2, msg: '用户不存在，请先登录' }

    const data = cleanSkill(event)
    if (!data.name) return { code: -3, msg: '请输入技能名称' }

    const userId = userRes.data[0]._id
    const added = await db.collection('skills').add({
      data: {
        ...data,
        userId,
        openid: OPENID,
        createdAt: db.serverDate(),
        updatedAt: db.serverDate(),
      },
    })
    await refreshSkillCount(userId)

    return { code: 0, data: { ...data, _id: added._id, id: added._id, userId } }
  } catch (err) {
    console.error('[createSkill]', err)
    return { code: -4, msg: '新增技能失败', error: err.message || err }
  }
}
