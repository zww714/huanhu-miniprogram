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
  "read": true,
  "write": "doc._openid == auth.openid"
}
```

### comments（评论）
```json
{
  "read": true,
  "write": "doc._openid == auth.openid"
}
```

### conversations（会话列表）
```json
{
  "read": true,
  "write": true
}
```
说明：当前用布尔规则（CLI 对字符串表达式有 bug，见下方部署限制）。应用层通过云函数做参与者校验。

### messages（聊天消息）
```json
{
  "read": true,
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
  "read": true,
  "write": true
}
```
说明：当前用布尔规则（CLI 对字符串表达式有 bug）。应用层通过云函数做身份校验。

### skills（技能）
```json
{
  "read": true,
  "write": "doc._openid == auth.openid"
}
```

### skillProofs（技能证明材料）
```json
{
  "read": true,
  "write": "doc._openid == auth.openid"
}
```

### likes（点赞）
```json
{
  "read": true,
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
  "read": true,
  "write": "doc._openid == auth.openid"
}
```

### registrations（活动报名）
```json
{
  "read": true,
  "write": "doc._openid == auth.openid"
}
```

---

## 部署方式

```bash
npx tcb permission set collection:<name> --level custom --rule '<json>' -e huanhu-d7gvz7pe18171aad3
```

## 命令参考

```bash
# 查看当前规则
npx tcb permission get collection:<name> -e <envId> --json

# 设置自定义规则（在 cmd.exe 中使用 "" 转义）
echo Y | npx tcb permission set collection:<name> --level custom --rule "{""read"":true,""write"":""doc._openid == auth.openid""}" --json

# 创建索引（通过 nosql execute）
npx tcb db nosql execute --command '[{"CommandType":"COMMAND","TableName":"messages","Command":"{\"createIndexes\":\"messages\",\"indexes\":[{\"key\":{\"conversationId\":1,\"createdAtMs\":1},\"name\":\"conversationId_1_createdAtMs_1\"}]}"}]'
```

## 部署限制（CloudBase CLI v3.3.3）

1. **自定义规则（字符串表达式）无法通过 `permission set` 设置**：`--level custom --rule '{...}'` 对包含字符串值的规则会返回 success 但不实际应用。
2. **Workaround**：先用 `--level readonly` 降级，再用 `--level custom --rule '{"read":true,"write":true}'` 设置布尔规则。字符串规则目前只能通过 `CreateCollection` 的默认模板获得。
3. **安全策略**：云函数承担主要权限校验，数据库安全规则是辅助防线。

## 建议添加的索引

### conversations 集合
- 索引：`participants: 1, updatedAt: -1`（按参与者 + 时间排序）

### messages 集合
- 索引：`conversationId: 1, createdAtMs: 1`（按会话 + 时间排序）
