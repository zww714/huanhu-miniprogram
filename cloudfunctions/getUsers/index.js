const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

const db = cloud.database()
const users = db.collection('users')

function normalizeUser(doc) {
  const stats = doc.stats || {}
  const canTeach = doc.canTeach || doc.skills || doc.can || []
  const wantToLearn = doc.wantToLearn || doc.learnWants || doc.want || []
  const intro = doc.intro || doc.bio || ''

  return {
    _id: doc._id,
    id: doc._id,
    name: doc.name || '同学',
    avatar: doc.avatar || '',
    verified: !!doc.verified,
    school: doc.school || '浙江大学',
    college: doc.college || '',
    major: doc.major || '',
    grade: doc.grade || '',
    campus: doc.campus || '',
    intro,
    bio: intro,
    match: Number(doc.match || doc.matchRate || 80),
    matchRate: Number(doc.matchRate || doc.match || 80),
    canTeach,
    skills: canTeach,
    can: canTeach,
    wantToLearn,
    learnWants: wantToLearn,
    want: wantToLearn,
    interests: doc.interests || [],
    skillCount: Number(doc.skillCount ?? stats.skills ?? canTeach.length ?? 0),
    postCount: Number(doc.postCount ?? stats.posts ?? 0),
    followerCount: Number(doc.followerCount ?? stats.followers ?? 0),
    followingCount: Number(doc.followingCount ?? stats.following ?? 0),
  }
}

function textOf(value) {
  if (Array.isArray(value)) {
    return value.map((item) => typeof item === 'object' ? Object.values(item).join(' ') : String(item)).join(' ')
  }
  if (value && typeof value === 'object') return Object.values(value).join(' ')
  return String(value || '')
}

function matchesKeyword(user, keyword) {
  if (!keyword) return true
  const lower = keyword.toLowerCase()
  const haystack = [
    user.name,
    user.school,
    user.college,
    user.major,
    user.grade,
    user.campus,
    user.intro,
    textOf(user.canTeach),
    textOf(user.wantToLearn),
    textOf(user.interests),
  ].join(' ').toLowerCase()
  return haystack.includes(lower)
}

function matchesFilter(user, event) {
  const simpleChecks = [
    ['grade', event.grade],
    ['college', event.college],
    ['major', event.major],
    ['campus', event.campus],
  ]

  for (const [field, expected] of simpleChecks) {
    if (expected && expected !== '全部' && user[field] !== expected) return false
  }

  if (event.skill && event.skill !== '全部') {
    const skillText = textOf(user.canTeach).toLowerCase()
    if (!skillText.includes(String(event.skill).toLowerCase())) return false
  }

  if (event.interest && event.interest !== '全部') {
    const interestText = textOf(user.interests).toLowerCase()
    if (!interestText.includes(String(event.interest).toLowerCase())) return false
  }

  if (event.category && !['全部', '热门'].includes(event.category)) {
    const categoryText = `${textOf(user.canTeach)} ${textOf(user.wantToLearn)} ${textOf(user.interests)}`.toLowerCase()
    if (!categoryText.includes(String(event.category).toLowerCase())) return false
  }

  return true
}

exports.main = async (event = {}) => {
  try {
    const page = Number(event.page || 0)
    const pageSize = Math.min(Number(event.pageSize || 20), 50)
    const keyword = String(event.keyword || '').trim()

    const result = await users
      .field({
        openid: false,
        phone: false,
        appid: false,
      })
      .orderBy('updatedAt', 'desc')
      .limit(100)
      .get()

    const all = (result.data || [])
      .map(normalizeUser)
      .filter((user) => matchesKeyword(user, keyword) && matchesFilter(user, event))

    const start = page * pageSize
    const data = all.slice(start, start + pageSize)

    return {
      code: 0,
      data,
      total: all.length,
      hasMore: start + pageSize < all.length,
    }
  } catch (err) {
    console.error('[getUsers]', err)
    return { code: -1, msg: '获取用户列表失败', error: err.message || err }
  }
}
