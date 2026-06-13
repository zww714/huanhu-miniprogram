# 验收测试数据说明

为了既能看到页面展示效果，又不把 mock/fake 数据放回前端，验收数据统一写入微信云数据库真实集合。

## 使用方式

1. 在微信开发者工具中上传并部署 `initData` 云函数。
2. 在云函数测试中调用：

```json
{
  "action": "seedAcceptanceData"
}
```

## 数据原则

- 数据会写入 `users`、`skills`、`posts`、`activities`、`likes`、`favorites`、`comments`、`follows`、`registrations` 等真实集合。
- 每条验收记录都会带上 `seedTag: "huanhu-acceptance-v1"` 和 `isAcceptanceTest: true`。
- 初始化时会同时清理旧版 `huanhu-initial-v1` 演示记录，避免旧模拟贴和新验收数据混在一起。
- 页面上的点赞、收藏、评论、报名、粉丝、关注、技能、发布数量来自这些真实集合的关系记录，不再由前端 mock 或写死数字提供。
- 当前调用云函数的微信用户会绑定到 `accept_user_chen`，用于验收“我的技能 / 我的发布 / 我的收藏 / 我的活动”等个人链路。

## 清理方式

只清理验收数据，不会删除真实用户后续产生的数据：

```json
{
  "action": "clearAcceptanceData"
}
```

## 注意

旧的 `seed` 云函数已停用，避免误写入历史演示数字。
