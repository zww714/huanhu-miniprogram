const { ok, fail, db } = require('./shared')

function toPublicUser(user = {}, follow = {}) {
  const intro = user.intro || user.bio || ''
  return {
    id: user._id || follow.followerId,
    userId: user._id || follow.followerId,
    name: user.name || user.nickname || '同学',
    avatar: user.avatar || '',
    gender: user.gender || 'private',
    school: user.school || '浙江大学',
    college: user.college || '',
    grade: user.grade || '',
    intro,
    bio: intro,
    verified: !!user.verified,
  }
}

exports.main = async (event = {}) => {
  try {
    const userId = event.userId || ''
    const page = Math.max(1, Number(event.page || 1))
    const pageSize = Math.min(50, Math.max(1, Number(event.pageSize || 20)))
    const skip = (page - 1) * pageSize

    if (!userId) return fail('缺少用户ID')

    const query = { followingId: userId, status: 'active' }
    const countResult = await db.collection('follows').where(query).count()

    const { data: follows } = await db.collection('follows')
      .where(query)
      .orderBy('createdAt', 'desc')
      .skip(skip)
      .limit(pageSize)
      .get()

    const users = []
    for (const follow of follows) {
      try {
        const res = await db.collection('users').doc(follow.followerId).get()
        users.push(toPublicUser(res.data, follow))
      } catch (_) {
        users.push(toPublicUser({}, follow))
      }
    }

    return ok(users, {
      total: countResult.total,
      page,
      pageSize,
      hasMore: skip + pageSize < countResult.total,
    })
  } catch (err) {
    console.error('[getFollowers]', err)
    return fail('获取粉丝列表失败')
  }
}
