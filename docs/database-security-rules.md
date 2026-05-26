# 换乎小程序 - 数据库安全规则

## 环境
- envId: cloud1-d3geudxpp50aa1802
- 部署方式：在微信开发者工具 → 云开发 → 数据库 → 安全规则 中逐集合配置

## 集合规则

### users（用户）
```json
{
  "read": "true",
  "write": "doc._openid == auth.openid",
  "validate": "new RegExp('^[\\u4e00-\\u9fa5a-zA-Z0-9_ ]{1,20}$').test(doc.name)"
}
```
说明：任何人可读公开资料，仅本人可写自己的数据。name字段限制1-20个字符。

### posts（帖子）
```json
{
  "read": "true",
  "write": "doc._openid == auth.openid || (doc.status == 'published' && auth.openid != null)",
  "validate": "new RegExp('^.{1,5000}$').test(doc.content)"
}
```
说明：帖子公开可读，仅作者可编辑删除。

### comments（评论）
```json
{
  "read": "true",
  "write": "doc._openid == auth.openid",
  "validate": "new RegExp('^.{1,2000}$').test(doc.content)"
}
```
说明：评论公开可读，仅本人可写。

### messages（聊天消息）
```json
{
  "read": "auth.openid in doc.participants",
  "write": "doc.senderId == auth.openid || auth.openid in doc.participants",
  "validate": "doc.content.length <= 5000"
}
```
说明：仅对话双方可读写，内容限制5000字符。

### activities（活动）
```json
{
  "read": "true",
  "write": "doc._openid == auth.openid"
}
```

### follows（关注关系）
```json
{
  "read": "true",
  "write": "doc.followerId == auth.openid",
  "validate": "doc.followeeId != doc.followerId"
}
```

### notifications（通知）
```json
{
  "read": "doc.targetId == auth.openid",
  "write": "true"
}
```

### likes（点赞）
```json
{
  "read": "true",
  "write": "doc.userId == auth.openid || doc.targetAuthorId == auth.openid"
}
```

### favorites（收藏）
```json
{
  "read": "doc.userId == auth.openid",
  "write": "doc.userId == auth.openid"
}
```

### skillProofs（技能证明材料）
```json
{
  "read": "true",
  "write": "doc.userId == auth.openid"
}
```

---

## 部署步骤

1. 打开微信开发者工具
2. 点击菜单栏「云开发」→ 打开云开发控制台
3. 左侧导航 → 数据库
4. 逐一点击集合 →「安全规则」tab
5. 粘贴对应的 JSON 规则 → 保存
