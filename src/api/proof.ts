/**
 * API 证明材料模块
 */
import { callCloudFunction, apiWarn, getUseCloud } from './base'

export async function getSkillProofs(params: { skillId: string; userId?: string }) {
  if (getUseCloud()) {
    try {
      const res = await callCloudFunction('skillProof', { action: 'getBySkill', ...params })
      return res.data || []
    } catch (e) { apiWarn('[API] getSkillProofs failed', e) }
  }
  return []
}

export async function getSkillProofDetail(params: { proofId: string }) {
  if (getUseCloud()) {
    try {
      const res = await callCloudFunction('skillProof', { action: 'getDetail', ...params })
      return res.data || null
    } catch (e) { apiWarn('[API] getSkillProofDetail failed', e) }
  }
  return null
}

export async function getSkillProofCount(params: { skillId: string }) {
  if (getUseCloud()) {
    try {
      const res = await callCloudFunction('skillProof', { action: 'getProofCount', ...params })
      return res.data?.count || 0
    } catch (e) { apiWarn('[API] getSkillProofCount failed', e) }
  }
  return 0
}

export async function addSkillProof(params: {
  skillId: string; title: string; type: string; description?: string;
  images?: string[]; links?: any[]; detail?: any; tags?: string[]
}) {
  if (getUseCloud()) {
    try {
      const res = await callCloudFunction('skillProof', { action: 'add', ...params })
      return res.data || null
    } catch (e) { apiWarn('[API] addSkillProof failed', e) }
  }
  return null
}
