# 换乎小程序

这是微信小程序项目源码。当前主验收分支为 `feature/ui-redesign-v2`。

## 下载后打开

1. 安装依赖：

```powershell
npm install
```

2. 构建微信小程序产物：

```powershell
npm run build:weapp
```

3. 用微信开发者工具打开项目根目录。

项目配置中的小程序目录是 `dist/`，因此每次拉取最新代码后，都需要先执行一次构建。

## 云开发环境

当前代码连接的云开发环境 ID：

```text
huanhu-d7gvz7pe18171aad3
```

`initData` 云函数已用于写入真实验收数据，数据写在微信云数据库中，不会随 GitHub 仓库一起下载。需要重新初始化验收数据时，调用：

```json
{
  "action": "seedAcceptanceData"
}
```

旧的 `seed` 云函数已停用，避免误写入历史演示数字。

## 验证

```powershell
npm run build:weapp
```

构建通过后，可以在微信开发者工具中预览和上传体验版。
