/**
 * 云函数共享工具模块
 * 提供分页、验证、响应格式化
 */
const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

/**
 * 统一成功响应
 */
function ok(data = null, extra = {}) {
  return { code: 0, msg: 'ok', data, ...extra }
}

/**
 * 统一错误响应
 */
function fail(msg = '操作失败', code = -1) {
  return { code, msg }
}

/**
 * 安全获取 openid
 */
function getOpenId() {
  const { OPENID } = cloud.getWXContext()
  if (!OPENID) throw new Error('未获取到用户身份')
  return OPENID
}

/**
 * 分页查询
 */
async function paginate(collectionName, query = {}, options = {}) {
  const page = Math.max(1, parseInt(options.page) || 1)
  const pageSize = Math.min(100, Math.max(1, parseInt(options.pageSize) || 20))
  const orderBy = options.orderBy || '_createTime'
  const orderDir = options.orderDir === 'asc' ? 'asc' : 'desc'
  const skip = (page - 1) * pageSize

  const collection = db.collection(collectionName)
  const countResult = await collection.where(query).count()
  const total = countResult.total

  let queryBuilder = collection.where(query)
    .orderBy(orderBy, orderDir)
    .skip(skip)
    .limit(pageSize)

  if (options.select && options.select.length > 0) {
    queryBuilder = queryBuilder.field(...options.select)
  }

  const { data } = await queryBuilder.get()

  return {
    data, total, page, pageSize,
    totalPages: Math.ceil(total / pageSize),
    hasMore: page * pageSize < total,
  }
}

/**
 * 验证必填字段
 */
function requireParams(params, required) {
  for (const key of required) {
    const value = params[key]
    if (value === undefined || value === null || value === '') {
      throw new Error('缺少必填字段: ' + key)
    }
  }
}

/**
 * 验证字符串长度
 */
function validateLength(value, label, min = 1, max = 5000) {
  const len = String(value || '').length
  if (len < min || len > max) {
    throw new Error(label + '长度需在' + min + '-' + max + '字符之间')
  }
}

module.exports = { ok, fail, getOpenId, paginate, requireParams, validateLength, db, cloud }
