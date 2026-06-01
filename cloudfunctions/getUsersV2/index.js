/**
 * 云函数 - 获取发现页用户列表
 */
const { ok, fail, paginate, db } = require('./shared')

exports.main = async (event) => {
  try {
    const { category, page: page0 = 0, pageSize = 20 } = event

    let query = {}
    if (category && category !== '全部' && category !== '综合') {
      query = { 'skills.name': db.RegExp({ regexp: category, options: 'i' }) }
    }

    const result = await paginate('users', query, {
      page: Number(page0) + 1,
      pageSize: Number(pageSize),
      orderBy: 'stats.skills',
      select: [
        'name', 'avatar', 'gender', 'school', 'college', 'major', 'grade',
        'campus', 'intro', 'verified', 'canTeach', 'skills', 'can',
        'wantToLearn', 'interests', 'skillCount', 'postCount',
        'followerCount', 'followingCount', 'stats', 'createdAt', 'updatedAt',
      ],
    })

    return ok(result.data, {
      total: result.total,
      hasMore: result.hasMore,
    })
  } catch (err) {
    console.error('[getUsers]', err)
    return fail('获取用户列表失败')
  }
}
