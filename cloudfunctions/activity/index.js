/**
 * 云函数 - 活动系统（多路复用）
 */
const { ok, fail, db, cloud } = require('./shared')
const _ = db.command

exports.main = async (event = {}) => {
  try {
    const { action, ...params } = event
    const { OPENID } = cloud.getWXContext()
    if (!OPENID) return fail('获取用户身份失败', -1)

    const userRes = await db.collection('users').where({ openid: OPENID }).limit(1).get()
    if (!userRes.data.length) return fail('用户未登录', -2)
    const myId = userRes.data[0]._id
    const myName = userRes.data[0].name || '同学'

    // --- register: 报名参加活动 ---
    if (action === 'register') {
      const { activityId, name, phone, note } = params
      if (!activityId) return fail('缺少 activityId', -3)

      const actRes = await db.collection('activities').doc(activityId).get()
      const activity = actRes.data
      if (!activity) return fail('活动不存在', -4)

      const existRes = await db.collection('registrations')
        .where({ activityId, userId: myId, status: 'active' })
        .limit(1).get()
      if (existRes.data.length) {
        return ok({ registered: true, msg: '已报名该活动' })
      }

      const activeCount = await db.collection('registrations')
        .where({ activityId, status: 'active' }).count()
      const max = activity.maxParticipants || 999
      if (activeCount.total >= max) return fail('报名人数已满', -5)

      await db.collection('registrations').add({
        data: {
          activityId, userId: myId, userName: name || myName,
          userOpenid: OPENID, phone: phone || '', note: note || '',
          status: 'active',
          createdAt: db.serverDate(), updatedAt: db.serverDate(),
        },
      })

      const newCount = activeCount.total + 1
      await db.collection('activities').doc(activityId).update({
        data: { participantCount: newCount, participants: newCount, updatedAt: db.serverDate() },
      }).catch(() => {})

      return ok({ registered: true, participantCount: newCount })
    }

    // --- getMyRegistrations: 获取我的报名列表 ---
    if (action === 'getMyRegistrations') {
      const regRes = await db.collection('registrations')
        .where({ userId: myId, status: 'active' })
        .orderBy('createdAt', 'desc')
        .limit(30)
        .get()

      if (!regRes.data.length) return ok([])

      const activityIds = [...new Set(regRes.data.map((r) => r.activityId))]
      const actRes = await db.collection('activities')
        .where({ _id: _.in(activityIds) })
        .get()
      const actMap = {}
      actRes.data.forEach((a) => { actMap[a._id] = a })

      const result = regRes.data.map((reg) => {
        const act = actMap[reg.activityId] || {}
        return {
          id: reg._id, activityId: reg.activityId,
          registration: { name: reg.userName, note: reg.note, createdAt: reg.createdAt },
          activity: {
            id: act._id, title: act.title || '', time: act.time || '',
            location: act.location || '', campus: act.campus || '',
            category: act.category || '', organizer: act.organizer || '',
            status: act.status || '',
            participantCount: act.participantCount ?? act.participants ?? 0,
            maxParticipants: act.maxParticipants || 0,
          },
        }
      })
      return ok(result)
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

      if (activityId) {
        const remaining = await db.collection('registrations')
          .where({ activityId, status: 'active' }).count()
        await db.collection('activities').doc(activityId).update({
          data: { participantCount: remaining.total, participants: remaining.total },
        }).catch(() => {})
      }

      return ok({ canceled: true })
    }

    // --- getDetail: 获取活动详情 ---
    if (action === 'getDetail') {
      const { activityId } = params
      if (!activityId) return fail('缺少 activityId', -3)

      const actRes = await db.collection('activities').doc(activityId).get()
      const act = actRes.data
      if (!act) return fail('活动不存在', -4)

      const myRegRes = await db.collection('registrations')
        .where({ activityId, userId: myId, status: 'active' })
        .limit(1).get()
      const registered = myRegRes.data.length > 0

      return ok({
        _id: act._id, id: act._id,
        title: act.title, time: act.time,
        location: act.location, campus: act.campus || '',
        category: act.category || '',
        description: act.description || '',
        cover: act.cover || '',
        organizer: act.organizer || '',
        status: act.status || '进行中',
        tags: act.tags || [],
        participantCount: act.participantCount ?? act.participants ?? 0,
        maxParticipants: act.maxParticipants || 0,
        registered,
      })
    }

    return fail(`未知 action: ${action}`, -99)
  } catch (err) {
    console.error('[activity]', err)
    return fail('操作失败', -10)
  }
}
