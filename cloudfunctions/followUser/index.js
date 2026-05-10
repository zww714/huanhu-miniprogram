// 云函数 - 关注/取消关注用户
const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

exports.main = async (event, context) => {
  const { OPENID } = cloud.getWXContext()
  const { targetUserId, action } = event // action: 'follow' | 'unfollow'

  if (!targetUserId) {
    return { code: -1, msg: '缺少 targetUserId' }
  }

  if (!['follow', 'unfollow'].includes(action)) {
    return { code: -2, msg: 'action 必须是 follow 或 unfollow' }
  }

  try {
    // 找到当前用户
    const userRes = await db.collection('users')
      .where({ openid: OPENID })
      .field({ _id: true, following: true })
      .get()

    if (userRes.data.length === 0) {
      return { code: -3, msg: '用户未登录' }
    }

    const myUser = userRes.data[0]
    const myId = myUser._id

    if (action === 'follow') {
      // 不能关注自己
      if (myId === targetUserId) {
        return { code: -4, msg: '不能关注自己' }
      }

      // 关注
      await db.collection('users').doc(myId).update({
        data: {
          following: db.command.addToSet(targetUserId),
          'stats.following': db.command.inc(1),
        }
      })

      // 被关注者的粉丝数 +1
      await db.collection('users').doc(targetUserId).update({
        data: {
          followers: db.command.addToSet(myId),
          'stats.followers': db.command.inc(1),
        }
      })

      return { code: 0, msg: '关注成功', isFollowing: true }
    } else {
      // 取消关注
      await db.collection('users').doc(myId).update({
        data: {
          following: db.command.pull(targetUserId),
          'stats.following': db.command.inc(-1),
        }
      })

      await db.collection('users').doc(targetUserId).update({
        data: {
          followers: db.command.pull(myId),
          'stats.followers': db.command.inc(-1),
        }
      })

      return { code: 0, msg: '已取消关注', isFollowing: false }
    }
  } catch (err) {
    console.error('[followUser]', err)
    return { code: -5, msg: '操作失败', error: err }
  }
}
