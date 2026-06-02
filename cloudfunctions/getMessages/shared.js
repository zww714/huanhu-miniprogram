const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

function ok(data = null, extra = {}) {
  return { code: 0, msg: 'ok', data, ...extra }
}

function fail(msg = '操作失败', code = -1) {
  return { code, msg }
}

module.exports = { ok, fail, db, cloud }
