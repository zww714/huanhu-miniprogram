const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

const db = cloud.database()
const users = db.collection('users')

const ALLOWED_FIELDS = [
  'name',
  'avatar',
  'gender',
  'school',
  'college',
  'major',
  'grade',
  'campus',
  'intro',
  'bio',
  'interests',
  'canTeach',
  'skills',
  'wantToLearn',
  'learnWants',
]

function normalizeProfilePayload(event) {
  const source = event.profile && typeof event.profile === 'object'
    ? event.profile
    : event.field
      ? { [event.field]: event.value }
      : event

  const data = {}
  ALLOWED_FIELDS.forEach((field) => {
    if (source[field] !== undefined) data[field] = source[field]
  })

  if (data.bio !== undefined && data.intro === undefined) data.intro = data.bio
  if (data.intro !== undefined) data.bio = data.intro
  if (data.skills !== undefined && data.canTeach === undefined) data.canTeach = data.skills
  if (data.canTeach !== undefined) data.skills = data.canTeach
  if (data.learnWants !== undefined && data.wantToLearn === undefined) data.wantToLearn = data.learnWants
  if (data.wantToLearn !== undefined) data.learnWants = data.wantToLearn

  return data
}

function normalizeUser(doc) {
  const stats = doc.stats || {}
  const canTeach = doc.canTeach || doc.skills || doc.can || []
  const wantToLearn = doc.wantToLearn || doc.learnWants || doc.want || []
  const intro = doc.intro || doc.bio || ''

  return {
    _id: doc._id,
    id: doc._id,
    user_id: doc._id,
    name: doc.name || '微信用户',
    avatar: doc.avatar || '',
    gender: doc.gender || 'private',
    school: doc.school || '浙江大学',
    college: doc.college || '',
    major: doc.major || '',
    grade: doc.grade || '',
    campus: doc.campus || '',
    intro,
    bio: intro,
    verified: !!doc.verified,
    canTeach,
    skills: canTeach,
    can: canTeach,
    wantToLearn,
    learnWants: wantToLearn,
    want: wantToLearn,
    interests: doc.interests || [],
    stats: {
      skills: Number(doc.skillCount ?? stats.skills ?? canTeach.length ?? 0),
      posts: Number(doc.postCount ?? stats.posts ?? 0),
      followers: Number(doc.followerCount ?? stats.followers ?? 0),
      following: Number(doc.followingCount ?? stats.following ?? 0),
    },
  }
}

exports.main = async (event = {}) => {
  try {
    const { OPENID } = cloud.getWXContext()
    if (!OPENID) return { code: -1, msg: '获取用户身份失败' }

    const current = await users.where({ openid: OPENID }).limit(1).get()
    if (!current.data.length) return { code: -2, msg: '用户不存在，请先登录' }

    const profile = normalizeProfilePayload(event)
    if (!Object.keys(profile).length) return { code: -3, msg: '没有可更新的资料字段' }

    delete profile._id
    delete profile.id
    delete profile.userId
    delete profile.user_id
    delete profile.openid

    profile.updatedAt = db.serverDate()

    const userId = current.data[0]._id
    await users.doc(userId).update({ data: profile })

    const updated = await users.doc(userId).get()
    return {
      code: 0,
      msg: '保存成功',
      currentUser: normalizeUser(updated.data),
      userData: normalizeUser(updated.data),
    }
  } catch (err) {
    console.error('[updateProfile]', err)
    return { code: -4, msg: '保存资料失败', error: err.message || err }
  }
}
