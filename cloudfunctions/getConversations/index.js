// 云函数 - 获取对话列表（消息页）
const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

exports.main = async (event, context) => {
  const { OPENID } = cloud.getWXContext()

  try {
    // 找到当前用户
    const userRes = await db.collection('users')
      .where({ openid: OPENID })
      .field({ _id: true })
      .get()

    if (userRes.data.length === 0) {
      return { code: 0, data: [] }
    }

    const myId = userRes.data[0]._id

    // 获取我的对话
    const result = await db.collection('conversations')
      .where({ participants: myId })
      .orderBy('lastMessageTime', 'desc')
      .limit(50)
      .get()

    // 关联对方用户信息
    const conversationsWithUser = await Promise.all(result.data.map(async (conv) => {
      const otherId = conv.participants.find(id => id !== myId)
      let otherUser = { name: '未知用户', avatar: '' }
      if (otherId) {
        try {
          const uRes = await db.collection('users').doc(otherId)
            .field({ name: true, avatar: true, college: true })
            .get()
          otherUser = uRes.data || otherUser
        } catch (e) { /* ignore */ }
      }
      return {
        id: conv._id,
        name: otherUser.name,
        avatar: otherUser.avatar || '',
        lastMessage: conv.lastMessage || '',
        timestamp: formatTime(conv.lastMessageTime),
        unread: conv.unreadCount?.[myId] || 0,
        online: false, // 简易版不实现实时在线
        category: conv.category || '',
      }
    }))

    return { code: 0, data: conversationsWithUser }
  } catch (err) {
    console.error('[getConversations]', err)
    return { code: -1, msg: '获取对话失败', error: err }
  }
}

function formatTime(date) {
  if (!date) return ''
  const d = new Date(date)
  const now = new Date()
  const diffDay = Math.floor((now - d) / 86400000)
  if (diffDay === 0) {
    return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`
  }
  if (diffDay === 1) return '昨天'
  if (diffDay < 7) return `${diffDay}天前`
  return `${d.getMonth() + 1}/${d.getDate()}`
}
