/**
 * 云函数 - 获取用户详情
 */
const { ok, fail, db, cloud } = require('./shared')
const _ = db.command

function toPublicUser(doc, relation) {
  const stats = doc.stats || {}
  const canTeach = doc.canTeach || doc.skills || doc.can || []
  const wantToLearn = doc.wantToLearn || doc.learnWants || doc.want || []
  const intro = doc.intro || doc.bio || ''

  return {
    _id: doc._id,
    id: doc._id,
    name: doc.name || '同学',
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
    isFollowing: relation.isFollowing,
    isFollower: relation.isFollower,
    isMutual: relation.isFollowing && relation.isFollower,
    posts: relation.posts || [],
    reviews: doc.reviews || [],
  }
}

exports.main = async (event = {}) => {
  try {
    const { userId } = event
    const { OPENID } = cloud.getWXContext()
    if (!userId) return fail('缺少 userId', -1)

    const target = await db.collection('users').doc(userId).get()
    if (!target.data) return fail('用户不存在', -2)

    let isFollowing = false
    let isFollower = false

    if (OPENID) {
      const current = await db.collection('users')
        .where({ openid: OPENID })
        .field({ _id: true, following: true, followers: true })
        .limit(1)
        .get()

      if (current.data.length) {
        const me = current.data[0]
        const followingRes = await db.collection('follows')
          .where({ followerId: me._id, followingId: userId, status: 'active' })
          .limit(1)
          .get()
        const followerRes = await db.collection('follows')
          .where({ followerId: userId, followingId: me._id, status: 'active' })
          .limit(1)
          .get()
        isFollowing = followingRes.data.length > 0
        isFollower = followerRes.data.length > 0
      }
    }

    const postsRes = await db.collection('posts')
      .where(_.or([
        { authorId: userId, visibility: _.neq('private') },
        { userId, visibility: _.neq('private') },
      ]))
      .orderBy('createdAt', 'desc')
      .limit(20)
      .get()

    const userData = toPublicUser(target.data, {
      isFollowing,
      isFollower,
      posts: postsRes.data || [],
    })

    return ok(userData)
  } catch (err) {
    console.error('[getUserDetail]', err)
    return fail('获取用户详情失败', -3)
  }
}
