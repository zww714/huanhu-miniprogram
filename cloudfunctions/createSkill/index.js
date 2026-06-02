/**
 * 云函数 - 创建技能
 */
const { ok, fail, db, cloud } = require('./shared')

const ALLOWED_VISIBILITY = ['public', 'private']

function cleanSkill(event) {
  const name = String(event.name || '').trim()
  return {
    name,
    level: Math.min(Math.max(Number(event.level || 3), 1), 5),
    intro: String(event.intro || event.desc || '').trim(),
    tags: Array.isArray(event.tags) ? event.tags.filter(Boolean) : [],
    category: String(event.category || '其他').trim(),
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
    if (!OPENID) return fail('获取用户身份失败', -1)

    const userRes = await db.collection('users').where({ openid: OPENID }).limit(1).get()
    if (!userRes.data.length) return fail('用户不存在，请先登录', -2)

    const data = cleanSkill(event)
    if (!data.name) return fail('请输入技能名称', -3)

    // 内容安全审核
    try {
      const textToCheck = [data.name, data.intro].filter(Boolean).join('\n')
      if (textToCheck) {
        const checkRes = await cloud.openapi.security.msgSecCheck({
          openid: OPENID,
          scene: 2,
          version: 2,
          content: textToCheck,
        })
        if (checkRes.result && checkRes.result.suggest !== 'pass') {
          return fail('内容含有违规信息，请修改后重试', -5)
        }
      }
    } catch (e) {
      console.warn('[createSkill] msgSecCheck failed, allowing skill', e)
    }

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

    return ok({ ...data, _id: added._id, id: added._id, userId })
  } catch (err) {
    console.error('[createSkill]', err)
    return fail('创建技能失败', -4)
  }
}
