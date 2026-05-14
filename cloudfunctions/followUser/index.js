// 云函数 - 关注用户（使用 follows 集合）
const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()
const _ = db.command

exports.main = async (event = {}) => {
  try {
    const { targetUserId } = event
    const { OPENID } = cloud.getWXContext()

    if (!OPENID) return { code: -1, msg: '获取用户身份失败' }
    if (!targetUserId) return { code: -2, msg: '缺少 targetUserId' }

    // 查当前用户
    const myRes = await db.collection('users').where({ openid: OPENID }).limit(1).get()
    if (!myRes.data.length) return { code: -3, msg: '用户未登录' }
    const myUser = myRes.data[0]
    const myId = myUser._id

    // 不能关注自己
    if (myId === targetUserId) return { code: -4, msg: '不能关注自己' }

    // 查目标用户是否存在
    const targetRes = await db.collection('users').doc(targetUserId).get()
    const target = targetRes.data
    if (!target) return { code: -5, msg: '目标用户不存在' }

    // 查现有关注记录
    const existRes = await db.collection('follows')
      .where({
        followerId: myId,
        followerOpenid: OPENID,
        followingId: targetUserId,
      })
      .limit(1)
      .get()

    if (existRes.data.length) {
      const record = existRes.data[0]
      if (record.status === 'active') {
        return { code: 0, data: { isFollowing: true } }
      }
      // 重新激活已取消的记录
      await db.collection('follows').doc(record._id).update({
        data: { status: 'active', updatedAt: db.serverDate() },
      })
    } else {
      // 新建关注记录
      await db.collection('follows').add({
        data: {
          followerId: myId,
          followerOpenid: OPENID,
          followingId: targetUserId,
          status: 'active',
          isSpecial: false,
          isBlocked: false,
          createdAt: db.serverDate(),
          updatedAt: db.serverDate(),
        },
      })
    }

    // 更新双方计数
    const myFollowingCount = await db.collection('follows')
      .where({ followerId: myId, status: 'active' }).count()
    await db.collection('users').doc(myId).update({
      data: { 'stats.following': myFollowingCount.total },
    }).catch(() => {})

    const targetFollowerCount = await db.collection('follows')
      .where({ followingId: targetUserId, status: 'active' }).count()
    await db.collection('users').doc(targetUserId).update({
      data: { 'stats.followers': targetFollowerCount.total },
    }).catch(() => {})

    // 判断是否互相关注
    const reverseRes = await db.collection('follows')
      .where({
        followerId: targetUserId,
        followingId: myId,
        status: 'active',
      })
      .limit(1).get()
    const isMutual = reverseRes.data.length > 0

    // 创建关注通知
    const isExisting = existRes.data.length > 0 && existRes.data[0].status === 'active'
    if (!isExisting && myId !== targetUserId) {
      const notiData = {
        userId: targetUserId,
        type: 'follows',
        title: '新的关注',
        content: `${myUser.name || '同学'} 关注了你`,
        fromUserId: myId,
        fromUserName: myUser.name || '同学',
        targetType: 'user',
        targetId: myId,
        targetTitle: myUser.name || '',
        read: false,
        createdAt: db.serverDate(),
      }
      await db.collection('notifications').add({ data: notiData }).catch((e) => {
        console.warn('[followUser] create notification failed', e)
      })
    }

    return {
      code: 0,
      data: {
        isFollowing: true,
        isMutual,
        followerCount: targetFollowerCount.total,
        followingCount: myFollowingCount.total,
      },
    }
  } catch (err) {
    console.error('[followUser]', err)
    return { code: -10, msg: '操作失败', error: err.message || err }
  }
}
