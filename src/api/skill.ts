/**
 * API 技能模块 — 技能 CRUD、学习愿望、评价、兴趣搭子
 */
import { callCloudFunction, delay, apiWarn, getUseCloud, getCloudDocument, updateCloudDocument } from './base'
import { MY_SKILLS, MY_LEARN_WANTS, MY_INTERESTS, MY_REVIEWS } from '../utils/mock'

// ============ 技能 CRUD ============
export async function getMySkills() {
  if (getUseCloud()) {
    try {
      const res = await callCloudFunction('getMySkills')
      return res.data || []
    } catch (e) { apiWarn('[API] getMySkills failed', e) }
  }
  const saved = wx.getStorageSync('localMySkills')
  return Array.isArray(saved) ? saved : MY_SKILLS
}

export async function getUserSkills(params: { userId: string }) {
  if (getUseCloud()) {
    try {
      const res = await callCloudFunction('getUserSkills', params)
      return res.data || []
    } catch (e) { apiWarn('[API] getUserSkills failed', e) }
  }
  return []
}

export async function getSkillDetail(params: { skillId: string; userId?: string }) {
  if (getUseCloud()) {
    try {
      const res = await callCloudFunction('getSkillDetail', params)
      return res.data
    } catch (e) { apiWarn('[API] getSkillDetail failed', e) }
  }
  return undefined
}

export async function createSkill(params: Record<string, any>) {
  if (getUseCloud()) {
    try {
      const res = await callCloudFunction('createSkill', params)
      return res.data
    } catch (e) { apiWarn('[API] createSkill failed', e) }
  }
  const saved = wx.getStorageSync('localMySkills')
  const list = Array.isArray(saved) ? saved : MY_SKILLS
  const next = { ...params, id: `local-${Date.now()}`, desc: params.intro || params.desc || '' }
  wx.setStorageSync('localMySkills', [next, ...list])
  return next
}

export async function updateSkill(params: { skillId: string; skill: Record<string, any> }) {
  if (getUseCloud()) {
    try {
      const res = await callCloudFunction('updateSkill', params)
      return res.data
    } catch (e) { apiWarn('[API] updateSkill failed', e) }
  }
  const saved = wx.getStorageSync('localMySkills')
  const list = Array.isArray(saved) ? saved : MY_SKILLS
  const next = list.map((item: any) =>
    (item.id === params.skillId || item._id === params.skillId)
      ? { ...item, ...params.skill, desc: params.skill.intro || params.skill.desc || item.desc }
      : item
  )
  wx.setStorageSync('localMySkills', next)
  return next.find((item: any) => item.id === params.skillId || item._id === params.skillId)
}

export async function deleteSkill(params: { skillId: string }) {
  if (getUseCloud()) {
    try { return await callCloudFunction('deleteSkill', params) }
    catch (e) { apiWarn('[API] deleteSkill failed', e) }
  }
  const saved = wx.getStorageSync('localMySkills')
  const list = Array.isArray(saved) ? saved : MY_SKILLS
  wx.setStorageSync('localMySkills', list.filter((item: any) => item.id !== params.skillId && item._id !== params.skillId))
  return { code: 0, msg: '已删除' }
}

// ============ 发布"我会/我想学" ============
export async function publishSkillNeed(params: { type: 'can' | 'want'; name: string; level?: number; desc?: string }) {
  const userId = 'user_chen'
  const name = params.name.trim()
  const desc = params.desc?.trim() || ''
  if (!name) throw new Error('技能名称不能为空')

  if (getUseCloud()) {
    const user = await getCloudDocument('users', userId)
    const can = Array.isArray(user.can) ? user.can : []
    const skills = Array.isArray(user.skills) ? user.skills : []
    const want = Array.isArray(user.want) ? user.want : []
    const learnWants = Array.isArray(user.learnWants) ? user.learnWants : []

    if (params.type === 'can') {
      const level = Number(params.level || 3)
      const nextSkill = { name, level, ...(desc ? { desc, tags: [name] } : {}) }
      const nextCan = [...can.filter((item: any) => item.name !== name), { name, level }]
      const nextSkills = [...skills.filter((item: any) => item.name !== name), nextSkill]
      await updateCloudDocument('users', userId, { can: nextCan, skills: nextSkills, 'stats.skills': nextCan.length })
      return { code: 0, data: await getCloudDocument('users', userId) }
    }

    const nextWant = [...want.filter((item: string) => item !== name), name]
    const nextLearnWants = [...learnWants.filter((item: string) => item !== name), name]
    await updateCloudDocument('users', userId, { want: nextWant, learnWants: nextLearnWants })
    return { code: 0, data: await getCloudDocument('users', userId) }
  }
  return { code: 0 }
}

// ============ 学习愿望/兴趣 ============
export async function getMyLearnWants() { return MY_LEARN_WANTS }
export async function getMyInterests() { return MY_INTERESTS }
export async function getMyReviews() { return MY_REVIEWS }

// ============ 发布兴趣搭子 ============
export async function publishPartnerProfile(params: { bio: string; interests: string[] }) {
  const userId = 'user_chen'
  const bio = params.bio.trim()
  const interests = params.interests.map((i) => i.trim()).filter(Boolean)
  if (!bio) throw new Error('一句话个人介绍不能为空')
  if (!interests.length) throw new Error('请至少填写一个兴趣爱好')
  const lookingFor = `${interests[0]}搭子`

  if (getUseCloud()) {
    const user = await getCloudDocument('users', userId)
    const oldInterests = Array.isArray(user.interests) ? user.interests : []
    const nextInterests = Array.from(new Set([...oldInterests, ...interests]))
    await updateCloudDocument('users', userId, { bio, interests: nextInterests, lookingFor })
    return { code: 0, data: await getCloudDocument('users', userId) }
  }
  return { code: 0, data: { bio, interests, lookingFor } }
}
