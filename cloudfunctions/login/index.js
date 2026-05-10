// 云函数入口文件 - 用户登录/自动注册
const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()
const usersCollection = db.collection('users')

/**
 * login 云函数
 * 传入: 无（cloud.getWXContext 自动获取 openid）
 * 返回: { openid, isNewUser, userData }
 *
 * 流程:
 * 1. 微信自动鉴权，获取 openid
 * 2. 查询数据库是否有该用户
 * 3. 如果是新用户 → 自动创建用户档案，返回默认数据
 * 4. 如果是老用户 → 返回已有用户数据
 */
exports.main = async (event, context) => {
  const { OPENID, APPID } = cloud.getWXContext()

  if (!OPENID) {
    return { code: -1, msg: '获取用户身份失败' }
  }

  try {
    // 查找是否已注册
    const result = await usersCollection.where({ openid: OPENID }).get()

    if (result.data.length > 0) {
      // 已有用户 → 更新最后登录时间
      const user = result.data[0]
      await usersCollection.doc(user._id).update({
        data: { lastLogin: db.serverDate() }
      })
      return {
        code: 0,
        isNewUser: false,
        userData: sanitizeUser(user),
      }
    }

    // 新用户 → 创建默认档案
    const defaultUser = {
      openid: OPENID,
      appid: APPID,
      name: '',
      avatar: '',
      verified: false,
      school: '',
      college: '',
      grade: '',
      bio: '',
      phone: '',
      stats: { skills: 0, posts: 0, followers: 0, following: 0 },
      skills: [],
      learnWants: [],
      interests: [],
      following: [],
      followers: [],
      createdAt: db.serverDate(),
      lastLogin: db.serverDate(),
    }

    const addResult = await usersCollection.add({ data: defaultUser })
    defaultUser._id = addResult._id
    defaultUser.openid = OPENID

    return {
      code: 0,
      isNewUser: true,
      userData: sanitizeUser(defaultUser),
    }
  } catch (err) {
    console.error('[login]', err)
    return { code: -2, msg: '登录失败', error: err }
  }
}

// 去掉敏感字段，返回给前端
function sanitizeUser(user) {
  const { openid, phone, ...safe } = user
  return safe
}
