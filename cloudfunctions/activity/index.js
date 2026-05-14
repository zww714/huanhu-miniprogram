// 云函数 - 活动报名管理
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
    const myName = userRes.data[0].name || '同学'

    // --- register: 报名参加活动 ---
    if (action === 'register') {
      const { activityId, name, phone, note } = params
      if (!activityId) return { code: -3, msg: '缺少 activityId' }

      // 查活动是否存在
      const actRes = await db.collection('activities').doc(activityId).get()
      const activity = actRes.data
      if (!activity) return { code: -4, msg: '活动不存在' }

      // 检查是否已报名
      const existRes = await db.collection('registrations')
        .where({ activityId, userId: myId, status: 'active' })
        .limit(1).get()
      if (existRes.data.length) {
        return { code: 0, data: { registered: true, msg: '已报名过该活动' } }
      }

      // 检查名额
      const activeCount = await db.collection('registrations')
        .where({ activityId, status: 'active' }).count()
      const max = activity.maxParticipants || 999
      if (activeCount.total >= max) {
        return { code: -5, msg: '报名人数已满' }
      }

      // 创建报名记录
      await db.collection('registrations').add({
        data: {
          activityId,
          userId: myId,
          userName: name || myName,
          userOpenid: OPENID,
          phone: phone || '',
          note: note || '',
          status: 'active',
          createdAt: db.serverDate(),
          updatedAt: db.serverDate(),
        },
      })

      // 更新活动 participantCount
      const newCount = activeCount.total + 1
      await db.collection('activities').doc(activityId).update({
        data: { participantCount: newCount, participants: newCount, updatedAt: db.serverDate() },
      }).catch(() => {})

      return { code: 0, data: { registered: true, participantCount: newCount } }
    }

    // --- getMyRegistrations: 获取我的报名列表 ---
    if (action === 'getMyRegistrations') {
      const regRes = await db.collection('registrations')
        .where({ userId: myId, status: 'active' })
        .orderBy('createdAt', 'desc')
        .limit(30)
        .get()

      if (!regRes.data.length) return { code: 0, data: [] }

      // 批量查活动信息
      const activityIds = [...new Set(regRes.data.map((r) => r.activityId))]
      const actRes = await db.collection('activities')
        .where({ _id: _.in(activityIds) })
        .get()
      const actMap = {}
      actRes.data.forEach((a) => { actMap[a._id] = a })

      const result = regRes.data.map((reg) => {
        const act = actMap[reg.activityId] || {}
        return {
          id: reg._id,
          activityId: reg.activityId,
          registration: {
            name: reg.userName,
            note: reg.note,
            createdAt: reg.createdAt,
          },
          activity: {
            id: act._id,
            title: act.title || '',
            time: act.time || '',
            location: act.location || '',
            campus: act.campus || '',
            category: act.category || '',
            organizer: act.organizer || '',
            status: act.status || '',
            participantCount: act.participantCount ?? act.participants ?? 0,
            maxParticipants: act.maxParticipants || 0,
          },
        }
      })

      return { code: 0, data: result }
    }

    // --- cancelRegistration: 取消报名 ---
    if (action === 'cancelRegistration') {
      const { registrationId, activityId } = params

      const whereClause = { userId: myId, status: 'active' }
      if (registrationId) whereClause._id = registrationId
      if (activityId) whereClause.activityId = activityId

      await db.collection('registrations')
        .where(whereClause)
        .update({ data: { status: 'canceled', updatedAt: db.serverDate() } })

      // 更新活动计数
      if (activityId) {
        const remaining = await db.collection('registrations')
          .where({ activityId, status: 'active' }).count()
        await db.collection('activities').doc(activityId).update({
          data: { participantCount: remaining.total, participants: remaining.total },
        }).catch(() => {})
      }

      return { code: 0, data: { canceled: true } }
    }

    // --- getDetail: 获取活动详情 ---
    if (action === 'getDetail') {
      const { activityId } = params
      if (!activityId) return { code: -3, msg: '缺少 activityId' }

      const actRes = await db.collection('activities').doc(activityId).get()
      const act = actRes.data
      if (!act) return { code: -4, msg: '活动不存在' }

      // 查我是否已报名
      const myRegRes = await db.collection('registrations')
        .where({ activityId, userId: myId, status: 'active' })
        .limit(1).get()
      const registered = myRegRes.data.length > 0

      return {
        code: 0,
        data: {
          _id: act._id,
          id: act._id,
          title: act.title,
          time: act.time,
          location: act.location,
          campus: act.campus || '',
          category: act.category || '',
          description: act.description || '',
          cover: act.cover || '',
          organizer: act.organizer || '',
          status: act.status || '报名中',
          tags: act.tags || [],
          participantCount: act.participantCount ?? act.participants ?? 0,
          maxParticipants: act.maxParticipants || 0,
          registered,
        },
      }
    }

    return { code: -99, msg: `未知 action: ${action}` }
  } catch (err) {
    console.error('[activity]', err)
    return { code: -10, msg: '操作失败', error: err.message || err }
  }
}
