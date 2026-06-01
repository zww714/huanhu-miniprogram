/**
 * 云函数 - 获取当前用户
 */
const { ok, fail, db, cloud } = require('./shared')
const users = db.collection('users')

function normalizeUser(doc) {
  const stats = doc.stats || {}
  const canTeach = doc.canTeach || doc.skills || doc.can || []
  const wantToLearn = doc.wantToLearn || doc.learnWants || doc.want || []
  const intro = doc.intro || doc.bio || ''

  return {
    _id: doc._id, id: doc._id, user_id: doc._id,
    name: doc.name || '微信用户',
    avatar: doc.avatar || '',
    gender: doc.gender || 'private',
    school: doc.school || '浙江大学',
    college: doc.college || '',
    major: doc.major || '',
    grade: doc.grade || '',
    campus: doc.campus || '',
    intro, bio: intro,
    verified: !!doc.verified,
    canTeach, skills: canTeach, can: canTeach,
    wantToLearn, learnWants: wantToLearn, want: wantToLearn,
    interests: doc.interests || [],
    skillCount: Number(doc.skillCount ?? stats.skills ?? canTeach.length ?? 0),
    postCount: Number(doc.postCount ?? stats.posts ?? 0),
    followerCount: Number(doc.followerCount ?? stats.followers ?? 0),
    followingCount: Number(doc.followingCount ?? stats.following ?? 0),
    stats: {
      skills: Number(doc.skillCount ?? stats.skills ?? canTeach.length ?? 0),
      posts: Number(doc.postCount ?? stats.posts ?? 0),
      followers: Number(doc.followerCount ?? stats.followers ?? 0),
      following: Number(doc.followingCount ?? stats.following ?? 0),
    },
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  }
}

async function createDefaultUser(openid) {
  const data = {
    openid, name: '微信用户', avatar: '', gender: 'private',
    school: '浙江大学', college: '', major: '', grade: '', campus: '',
    intro: '', verified: false,
    canTeach: [], wantToLearn: [], interests: [],
    skillCount: 0, postCount: 0, followerCount: 0, followingCount: 0,
    createdAt: db.serverDate(), updatedAt: db.serverDate(),
  }
  const added = await users.add({ data })
  return { ...data, _id: added._id }
}

exports.main = async () => {
  try {
    const { OPENID } = cloud.getWXContext()
    if (!OPENID) return fail('获取用户身份失败', -1)

    const result = await users.where({ openid: OPENID }).limit(1).get()
    const doc = result.data[0] || await createDefaultUser(OPENID)
    const u = normalizeUser(doc)

    return ok({ currentUser: u, userData: u })
  } catch (err) {
    console.error('[getCurrentUser]', err)
    return fail('获取当前用户失败', -2)
  }
}
