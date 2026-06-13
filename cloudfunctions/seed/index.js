/**
 * Legacy seed function.
 *
 * This function used to write demo numbers directly into business records.
 * Keep it disabled so acceptance checks cannot accidentally reintroduce fake
 * likes, comments, followers, ratings, or activity counts.
 */
exports.main = async () => ({
  success: false,
  code: -1,
  message: '旧 seed 已停用。请部署并调用 initData 云函数写入带真实关系链路的验收数据。',
  next: {
    functionName: 'initData',
    event: { action: 'seedAcceptanceData' },
  },
})
