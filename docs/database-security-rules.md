# 换乎小程序 - 数据库安全规则

## 环境
- envId: huanhu-d7gvz7pe18171aad3
- 部署方式：cloudbase CLI permission set 命令

## 集合规则（共 13 个集合）

### users（用户）
```json
{
  "read": "doc._openid == auth.openid",
  "write": "doc._openid == auth.openid"
}
```

### posts（帖子）
```json
{
  "read": "true",
  "write": "doc._openid == auth.openid"
}
```

### comments（评论）
```json
{
  "read": "true",
  "write": "doc._openid == auth.openid"
}
```

### conversations（会话列表）
```json
{
  "read": "doc.participants.contains(auth.openid)",
  "write": "doc.participants.contains(auth.openid)"
}
```
说明：仅会话参与者可读写。

### messages（聊天消息）
```json
{
  "read": "true",
  "write": "doc._openid == auth.openid"
}
```
说明：read=true 是因为前端通过云函数过滤，不直接读集合。

### notifications（通知）
```json
{
  "read": "doc.userId == auth.openid",
  "write": "doc.userId == auth.openid"
}
```

### activities（活动）
```json
{
  "read": "true",
  "write": "auth.openid != null"
}
```
说明：任何已登录用户可发布活动。

### skills（技能）
```json
{
  "read": "true",
  "write": "doc._openid == auth.openid"
}
```

### skillProofs（技能证明材料）
```json
{
  "read": "true",
  "write": "doc._openid == auth.openid"
}
```

### likes（点赞）
```json
{
  "read": "true",
  "write": "doc._openid == auth.openid"
}
```

### favorites（收藏）
```json
{
  "read": "doc.userId == auth.openid",
  "write": "doc._openid == auth.openid"
}
```

### follows（关注关系）
```json
{
  "read": "true",
  "write": "doc._openid == auth.openid"
}
```

### registrations（活动报名）
```json
{
  "read": "true",
  "write": "doc._openid == auth.openid"
}
```

---

## 部署方式

使用 CloudBase CLI：

```bash
cloudbase permission set collection:<name> --level custom --rule '<json>' -e huanhu-d7gvz7pe18171aad3
```

注意：如果从 adminonly 升级 custom 不生效，需先设为 readonly 再设为 custom。

## 建议添加的索引

### conversations 集合
- 索引：`participants: 1, updatedAt: -1`（按参与者 + 时间排序）

### messages 集合
- 索引：`conversationId: 1, createdAtMs: 1`（按会话 + 时间排序）
