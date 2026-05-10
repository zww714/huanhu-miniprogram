// 云函数 - 更新用户资料（我的页面的编辑功能）
const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

exports.main = async (event, context) => {
  const { OPENID } = cloud.getWXContext()
  const { field, value } = event

  if (!field) {
    return { code: -1, msg: '缺少 field 参数' }
  }

  // 允许前端修改的字段白名单
  const allowedFields = [
    'name', 'avatar', 'bio', 'school', 'college', 'grade',
    'skills', 'learnWants', 'interests',
  ]

  if (!allowedFields.includes(field)) {
    return { code: -2, msg: `不允许修改字段: ${field}` }
  }

  try {
    const result = await db.collection('users')
      .where({ openid: OPENID })
      .update({ data: { [field]: value } })

    if (result.stats.updated === 0) {
      return { code: -3, msg: '用户不存在或未修改' }
    }

    return { code: 0, msg: '更新成功' }
  } catch (err) {
    console.error('[updateProfile]', err)
    return { code: -4, msg: '更新失败', error: err }
  }
}
