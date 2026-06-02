/**
 * API 基础模块
 * Cloud SDK 初始化、云函数调用、CRUD 辅助、Mock 降级
 */
import { CLOUD_ENV } from '../utils/config'

// ============ Cloud SDK 初始化 ============
let cloudReady: Promise<void> | null = null

export function initCloud() {
  if (cloudReady) return cloudReady
  cloudReady = new Promise((resolve) => {
    if (!wx.cloud) { resolve(); return }
    try { wx.cloud.init({ env: CLOUD_ENV, traceUser: true }) } catch (_) {}
    resolve()
  })
  return cloudReady
}

// ============ 云函数调用包装 ============
export async function callCloudFunction(name: string, data?: any) {
  await initCloud()
  return new Promise<any>((resolve, reject) => {
    wx.cloud.callFunction({
      name, data,
      success: (res) => {
        const result = res.result
        if (result && result.code === 0) resolve(result)
        else reject(new Error(result?.msg || '云函数错误'))
      },
      fail: (err) => reject(err),
    })
  })
}

// ============ 数据库 CRUD 辅助 ============
export async function getCloudCollection(collectionName: string, limit = 20, where?: Record<string, any>) {
  await initCloud()
  return new Promise<any[]>((resolve, reject) => {
    const query = where
      ? wx.cloud.database().collection(collectionName).where(where)
      : wx.cloud.database().collection(collectionName)
    query.limit(limit).get({
      success: (res) => resolve(res.data || []),
      fail: (err) => reject(err),
    })
  })
}

export async function addCloudDocument(collectionName: string, data: Record<string, any>) {
  await initCloud()
  const db = wx.cloud.database()
  return new Promise<any>((resolve, reject) => {
    db.collection(collectionName).add({
      data: { ...data, createdAt: db.serverDate(), updatedAt: db.serverDate() },
      success: resolve, fail: reject,
    })
  })
}

export async function getAllCloudDocuments(collectionName: string, limit = 100) {
  await initCloud()
  return new Promise<any[]>((resolve, reject) => {
    wx.cloud.database().collection(collectionName).limit(limit).get({
      success: (res) => resolve(res.data || []), fail: reject,
    })
  })
}

export async function uploadCloudFile(localPath: string, folder = 'post-images') {
  await initCloud()
  const ext = localPath.includes('.') ? localPath.split('.').pop() : 'jpg'
  const cloudPath = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
  return new Promise<string>((resolve, reject) => {
    wx.cloud.uploadFile({ cloudPath, filePath: localPath, success: (res) => resolve(res.fileID), fail: reject })
  })
}

export async function getCloudDocument(collectionName: string, id: string) {
  await initCloud()
  return new Promise<any>((resolve, reject) => {
    wx.cloud.database().collection(collectionName).doc(id).get({
      success: (res) => resolve(res.data), fail: reject,
    })
  })
}

export async function updateCloudDocument(collectionName: string, id: string, data: Record<string, any>) {
  await initCloud()
  const db = wx.cloud.database()
  return new Promise<any>((resolve, reject) => {
    db.collection(collectionName).doc(id).update({
      data: { ...data, updatedAt: db.serverDate() }, success: resolve, fail: reject,
    })
  })
}

// ============ 工具函数 ============
export function delay(ms = 200) {
  return new Promise(r => setTimeout(r, ms))
}

export function isExpectedCloudFallback(error: any) {
  const message = String(error?.errMsg || error?.message || error || '')
  return [
    'Cannot find module', 'wx-server-sdk', 'collection not exists',
    'Db or Table not exist', 'FUNCTIONS_EXECUTE_FAIL', '云函数错误',
    '获取交互状态失败', '获取用户技能失败', '获取我的技能失败',
    '获取用户详情失败', '获取帖子失败', '获取我的帖子失败',
    '获取评论失败', '操作失败', '该内容暂不可查看',
  ].some((keyword) => message.includes(keyword))
}

export function apiWarn(message: string, error: any) {
  if (isExpectedCloudFallback(error)) return
  console.warn(message, error)
}

export function setCloudMode(enabled: boolean) {
  ;(window as any).__HUANHU_USE_CLOUD = enabled
}

/**
 * 运行时读取云端模式开关
 * 默认 true（使用云函数），setCloudMode(false) 可动态切换至 mock
 * 各 API 模块应使用此函数而非直接引用 setCloudMode
 */
export function getUseCloud(): boolean {
  const v = (window as any).__HUANHU_USE_CLOUD
  return v !== undefined ? v : true
}

// ============ 常量 ============
export const LOGIN_USER_KEY = 'huanhuLoginUser'
export const SMS_CODE_KEY = 'huanhuSmsCode'
export const LOCAL_MESSAGES_KEY = 'huanhuChatMessages'
export const LOCAL_CONVERSATIONS_KEY = 'huanhuLocalConversations'
export const CHAT_USER_KEY = 'huanhuChatCurrentUser'