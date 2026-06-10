/**
 * API 评论模块
 */
import { callCloudFunction, apiWarn, getUseCloud, delay } from './base'
import type { Comment } from '../utils/mock'

// ============ 时间格式化 ============
function formatCloudTime(value: any): string {
  if (!value) return '刚刚'
  if (typeof value === 'string') {
    const d = new Date(value)
    if (Number.isNaN(d.getTime())) return value
    const now = Date.now()
    const diff = now - d.getTime()
    if (diff < 60000) return '刚刚'
    if (diff < 3600000) return `${Math.floor(diff / 60000)}分钟前`
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}小时前`
    if (diff < 604800000) return `${Math.floor(diff / 86400)}天前`
    return `${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
  }
  return '刚刚'
}

function normalizeCloudReply(r: any) {
  const author = r.author || { _id: '', name: '同学', avatar: '', college: '', grade: '', verified: false }
  const replyToUser = r.replyToUser || null
  return {
    id: r.id || r._id || '',
    commentId: r.parentId || '',
    userId: author._id || '', userName: author.name || '同学', userAvatar: author.avatar || '',
    replyToUserId: r.replyToUserId || (replyToUser ? replyToUser._id : '') || '',
    replyToUserName: replyToUser ? replyToUser.name : '',
    content: r.content || '',
    createdAt: r.createdAt ? formatCloudTime(r.createdAt) : '刚刚',
    likes: Number(r.likeCount || 0), liked: false, canDelete: !!r.canDelete,
  } as import('../utils/mock').CommentReply
}

function normalizeCloudComment(cloudComment: any): Comment {
  const author = cloudComment.author || { _id: '', name: '同学', avatar: '', college: '', grade: '', verified: false }
  const replyToUser = cloudComment.replyToUser || null
  const isReply = !!cloudComment.parentId
  const base: any = {
    id: cloudComment.id || cloudComment._id || '',
    _id: cloudComment._id || cloudComment.id || '',
    postId: cloudComment.postId || '', content: cloudComment.content || '',
    userId: author._id || '', userName: author.name || '同学', userAvatar: author.avatar || '',
    author: { name: author.name || '同学', avatar: author.avatar || '' },
    time: cloudComment.createdAt ? formatCloudTime(cloudComment.createdAt) : '刚刚',
    createdAt: cloudComment.createdAt || '',
    likes: Number(cloudComment.likeCount || 0), likeCount: Number(cloudComment.likeCount || 0),
    liked: false, canDelete: !!cloudComment.canDelete,
    replyToUser: replyToUser
      ? { _id: replyToUser._id || '', name: replyToUser.name || '', avatar: replyToUser.avatar || '' }
      : null,
    replyToUserId: cloudComment.replyToUserId || null, parentId: cloudComment.parentId || null,
  }
  if (isReply) return base as import('../utils/mock').CommentReply
  base.replies = (cloudComment.replies || []).map(normalizeCloudReply)
  base.replyCount = cloudComment.replyCount || base.replies.length
  base.topReplies = (cloudComment.topReplies || []).map(normalizeCloudReply)
  return base as Comment
}

// ============ 评论 CRUD ============
export async function getComments(params: { postId: string }): Promise<Comment[]> {
  if (getUseCloud()) {
    try {
      const res = await callCloudFunction('getComments', { postId: params.postId })
      const cloudComments = (res.data || []).map(normalizeCloudComment)
      return cloudComments
    } catch (e) { apiWarn('[API] getComments cloud failed', e) }
  }
  await delay()
  return []
}

export async function addComment(params: { postId: string; content: string }): Promise<any> {
  if (getUseCloud()) {
    try {
      const res = await callCloudFunction('addComment', { postId: params.postId, content: params.content })
      return res.data || res
    } catch (e) { apiWarn('[API] addComment cloud failed', e); throw e }
  }
  throw new Error('本地模式不支持真实评论')
}

export async function replyComment(params: {
  postId: string; parentId: string; replyToUserId: string; content: string
}): Promise<any> {
  if (getUseCloud()) {
    try {
      const res = await callCloudFunction('replyComment', {
        postId: params.postId, parentId: params.parentId,
        replyToUserId: params.replyToUserId, content: params.content,
      })
      return res.data || res
    } catch (e) { apiWarn('[API] replyComment cloud failed', e); throw e }
  }
  throw new Error('本地模式不支持真实回复')
}

export async function deleteComment(params: { commentId: string }): Promise<any> {
  if (getUseCloud()) {
    try { return await callCloudFunction('deleteComment', { commentId: params.commentId }) }
    catch (e) { apiWarn('[API] deleteComment cloud failed', e); throw e }
  }
  throw new Error('本地模式不支持真实删除')
}
