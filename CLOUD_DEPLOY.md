# 换乎ZJU版 - 云开发部署指南

## 前提条件

- [ ] 注册微信小程序账号（https://mp.weixin.qq.com/）
- [ ] 获取有效 appid（当前项目用的是 `wx9fe54c8fa871a2de`，需替换为你自己的）
- [ ] 安装微信开发者工具

---

## 第 1 步：开通云开发

1. 用微信开发者工具打开本项目
2. 点击顶部工具栏「云开发」按钮
3. 点击「开通」
4. 环境名称：`huanhu-prod`
5. 计费方式：**按量计费**（有免费额度，小项目够用）

> ⚠️ 开通后记下**环境 ID**，后面会用到

---

## 第 2 步：创建数据库集合

在云开发控制台 → 数据库 → 新建以下集合：

| 集合名 | 说明 | 需要创建的索引 |
|--------|------|----------------|
| `users` | 用户数据 | `openid` (唯一), `skills.name` |
| `posts` | 帖子/动态 | `userId`, `createdAt` (降序), `mainCategory` |
| `activities` | 社区活动 | `category`, `createdAt` (降序) |
| `conversations` | 对话/消息 | `participants`, `lastMessageTime` (降序) |
| `reviews` | 用户评价 | `targetUserId`, `createdAt` (降序) |

---

## 第 3 步：导入种子数据

### 方式 A（推荐）：通过云函数导入

1. 在云开发控制台 → 云函数 → 新建云函数 `seed`
2. 打开 `scripts/seed_database.js`，全选复制内容
3. 粘贴到云函数 `seed` 的 `index.js`，点击「上传并部署」
4. 在云函数列表中选中 `seed`，点击「测试」→ 传入 `{}` → 运行

### 方式 B：手动导入

在云开发控制台 → 数据库 → 每个集合 → 点击「导入」→ 填写对应 JSON

---

## 第 4 步：上传并部署云函数

在云开发控制台，为以下每个云函数点击「上传并部署」：

1. `login`
2. `getUsers`
3. `getUserDetail`
4. `getPosts`
5. `getActivities`
6. `getConversations`
7. `updateProfile`
8. `followUser`

> 每个云函数的代码在 `cloudfunctions/<函数名>/index.js`
> 上传前，右键 → 「上传并部署：云端安装依赖」

---

## 第 5 步：切换前端到云模式

当前默认即为云模式（`const USE_CLOUD = true`），无需额外操作。

### 运行时动态切换

在开发者工具控制台执行：
```js
setCloudMode(false)  // 切换到 mock 数据（离线调试）
setCloudMode(true)   // 切回云函数模式
```

> ⚠️ 页面刷新后会恢复默认值（true），上线前请确认云环境配置正确。

---

## 第 6 步：构建 & 预览

```bash
npm run build:weapp
```

然后在开发者工具中预览 `dist/` 目录。

---

## 第 7 步：提交审核 & 发布

1. 微信公众平台 → 版本管理 → 提交审核
2. 类目选择「教育 > 教育信息」或「社交 > 社区」
3. 填写审核说明（描述功能和使用场景）
4. 审核通过后 → 点击「发布」

---

## 常见问题

### Q: 云函数调用报错 "env not found"
A: `src/utils/api.ts` 第 21 行的环境 ID 没有换成你自己的。去云开发控制台查看环境 ID。

### Q: 用户登录返回 "获取用户身份失败"
A: 小程序还没有真实 appid，用测试号的话云开发不可用。需要用真实注册的小程序。

### Q: 如何清空测试数据？
A: 调用 seed 云函数，传参 `{ step: 'clear' }`。或直接在数据库面板手动删除。

### Q: 不想用云函数，想用自己的服务器？
A: 只需要改 `src/utils/api.ts`，把每个函数换成 `wx.request()` 调用自己的 API 即可。
