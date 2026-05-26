/**
 * API 层统一入口
 *
 * 使用方式:
 *   import { getUsers, getPosts, login } from '../../api'
 *
 * 按域拆分:
 *   - user:    用户/登录/关注
 *   - post:    帖子 CRUD
 *   - comment: 评论
 *   - interaction: 点赞/收藏
 *   - skill:   技能/学习愿望
 *   - proof:   证明材料
 *   - activity: 活动
 *   - chat:    聊天/消息
 *   - notification: 通知
 */
export * from './user'
export * from './post'
export * from './comment'
export * from './interaction'
export * from './skill'
export * from './proof'
export * from './activity'
export * from './chat'
export * from './notification'
export { setCloudMode } from './base'
