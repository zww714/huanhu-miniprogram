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

exports.main = async () => {
  try {
    const { OPENID } = cloud.getWXContext()
    if (!OPENID) return { code: -1, msg: '获取用户身份失败' }

    const existing = await users.where({ openid: OPENID }).limit(1).get()
    if (existing.data.length) {
      const current = existing.data[0]
      await users.doc(current._id).update({
        data: {
          lastLoginAt: db.serverDate(),
          updatedAt: db.serverDate(),
        },
      })
      return {
        code: 0,
        isNewUser: false,
        currentUser: normalizeUser(current),
        userData: normalizeUser(current),
      }
    }

    const defaultUser = {
      openid: OPENID,
      name: '微信用户',
      avatar: '',
      gender: 'private',
      school: '浙江大学',
      college: '',
      major: '',
      grade: '',
      campus: '',
      intro: '',
      verified: false,
      canTeach: [],
      wantToLearn: [],
      interests: [],
      skillCount: 0,
      postCount: 0,
      followerCount: 0,
      followingCount: 0,
      createdAt: db.serverDate(),
      updatedAt: db.serverDate(),
      lastLoginAt: db.serverDate(),
    }

    const added = await users.add({ data: defaultUser })
    const currentUser = normalizeUser({ ...defaultUser, _id: added._id })

    return {
      code: 0,
      isNewUser: true,
      currentUser,
      userData: currentUser,
    }
  } catch (err) {
    console.error('[login]', err)
    return { code: -2, msg: '登录失败', error: err.message || err }
  }
}
