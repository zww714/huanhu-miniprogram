const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

const db = cloud.database()

async function getUserPublicInfo(userId) {
  try {
    const res = await db.collection('users').doc(userId)
      .field({ _id: true, name: true, avatar: true, college: true, major: true, grade: true, campus: true, verified: true })
      .get()
    const u = res.data || {}
    return {
      _id: u._id || userId,
      name: u.name || '同学',
      avatar: u.avatar || '',
      college: u.college || '',
      major: u.major || '',
      grade: u.grade || '',
      campus: u.campus || '',
      verified: !!u.verified,
    }
  } catch (e) {
    return { _id: userId, name: '同学', avatar: '', college: '', major: '', grade: '', campus: '', verified: false }
  }
}

function sortComments(comments) {
  // Map: root comment _id -> root comment
  const rootMap = new Map()
  const rootList = []

  for (const c of comments) {
    if (!c.parentId) {
      // This is a root-level comment
      const entry = { ...c, replies: [] }
      rootMap.set(c._id, entry)
      rootList.push(entry)
    }
  }

  for (const c of comments) {
    if (c.parentId && c.parentId !== c._id) {
      const parent = rootMap.get(c.parentId)
      if (parent) {
        parent.replies.push({ ...c })
      } else {
        // Orphan reply — find the topmost parent
        // Treat as root with replies
        const entry = { ...c, replies: [] }
        rootMap.set(c._id, entry)
        rootList.push(entry)
      }
    }
  }

  // Sort root comments ascending by createdAt, replies ascending too
  rootList.sort((a, b) => (a.createdAt || '').localeCompare(b.createdAt || ''))
  for (const root of rootList) {
    root.replies.sort((a, b) => (a.createdAt || '').localeCompare(b.createdAt || ''))
    // Limit shown replies to 2 — full list is already in root.replies
    root.topReplies = root.replies.slice(0, 2)
    root.replyCount = root.replies.length
  }

  return rootList
}

exports.main = async (event = {}) => {
  try {
    const { postId } = event
    if (!postId) return { code: -1, msg: '缺少 postId' }

    // Get current user for canDelete check
    const { OPENID } = cloud.getWXContext()
    let currentUserId = ''
    if (OPENID) {
      try {
        const userRes = await db.collection('users').where({ openid: OPENID }).limit(1).get()
        if (userRes.data.length) {
          currentUserId = userRes.data[0]._id
        }
      } catch (e) {
        // Not critical — canDelete will just be false
      }
    }

    // Get the post to check author
    let postAuthorId = ''
    try {
      const postRes = await db.collection('posts').doc(postId).get()
      if (postRes.data) {
        postAuthorId = postRes.data.authorId || postRes.data.userId || ''
      }
    } catch (e) {
      // Post may not exist; return empty
    }

    // Query all normal comments for this post
    let comments = []
    try {
      const res = await db.collection('comments')
        .where({ postId, status: 'normal' })
        .orderBy('createdAt', 'asc')
        .get()
      comments = res.data || []
    } catch (e) {
      // No comments yet
    }

    // Enrich with author info
    const enriched = await Promise.all(comments.map(async (c) => {
      const author = await getUserPublicInfo(c.authorId || '')
      let replyToUser = null
      if (c.replyToUserId) {
        replyToUser = await getUserPublicInfo(c.replyToUserId)
      }

      const isCommentAuthor = !!OPENID && (c.authorId === currentUserId)
      const isPostAuthor = !!OPENID && (currentUserId === postAuthorId)
      const canDelete = isCommentAuthor || isPostAuthor

      return {
        _id: c._id || c.id,
        id: c._id || c.id,
        postId: c.postId,
        content: c.content,
        parentId: c.parentId || null,
        rootId: c.rootId || null,
        replyToUserId: c.replyToUserId || null,
        author,
        replyToUser,
        likeCount: Number(c.likeCount || 0),
        canDelete,
        createdAt: c.createdAt,
        status: c.status,
      }
    }))

    // Remove the createdAt virtualization for the enriched items since they have real createdAt
    // But replies won't sort properly without a string key; derive sortKey
    for (const c of enriched) {
      const sortKey = typeof c.createdAt === 'object' && c.createdAt instanceof Date
        ? c.createdAt.toISOString()
        : String(c.createdAt || '')
      c._sortKey = sortKey
    }
    enriched.sort((a, b) => a._sortKey.localeCompare(b._sortKey))
    for (const c of enriched) {
      delete c._sortKey
    }

    const sorted = sortComments(enriched)

    return {
      code: 0,
      data: sorted,
      total: comments.length,
    }
  } catch (err) {
    console.error('[getComments]', err)
    return { code: -10, msg: '获取评论失败', error: err.message || err }
  }
}
