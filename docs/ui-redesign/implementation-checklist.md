# UI Redesign V2 Implementation Checklist

本清单用于新版 UI 高还原重构。每一阶段必须保持构建通过，避免把视觉重构和数据权限改动混在一起。

## 第 1 阶段：建立 design tokens 和公共组件

- 修改范围：`docs/ui-redesign/*`、`src/styles/tokens.scss`、`src/theme/tokens.ts`、`src/components/common/*`
- 不允许修改：四个主 Tab 页面、云函数、数据库、权限逻辑、tabBar 逻辑
- 验收标准：tokens 文档清晰，基础组件可编译，可被后续页面复用
- 构建要求：`npm run build:weapp`
- Git 提交建议：`chore: add ui redesign tokens and base components`

## 第 2 阶段：首页 UI 高还原

- 修改范围：`src/pages/index/*`，必要时使用公共组件和 mock 展示字段
- 不允许修改：发现页、消息页、我的页、云函数、数据库、权限逻辑
- 验收标准：对齐 `D:\5.11\UI图\1 (1).png`，保留搜索、频道切换、用户跳转、联系TA、发布入口
- 构建要求：`npm run build:weapp`
- Git 提交建议：`feat: redesign home tab ui`

## 第 3 阶段：发现页 UI 高还原

- 修改范围：`src/pages/discover/*`
- 不允许修改：首页、消息页、我的页、云函数、数据库
- 验收标准：对齐 `D:\5.11\UI图\1 (2).png`，保留搜索、分类联动、作者跳转、帖子详情跳转
- 构建要求：`npm run build:weapp`
- Git 提交建议：`feat: redesign discover tab ui`

## 第 4 阶段：消息页 UI 高还原

- 修改范围：消息主页面和必要的消息入口组件
- 不允许修改：通知云函数、通知集合结构、聊天真实逻辑
- 验收标准：对齐 `D:\5.11\UI图\4.png`，保留未读统计、通知列表跳转、聊天入口
- 构建要求：`npm run build:weapp`
- Git 提交建议：`feat: redesign messages tab ui`

## 第 5 阶段：我的页 UI 高还原

- 修改范围：`src/pages/profile/*`
- 不允许修改：他人主页、编辑资料业务逻辑、云函数、数据库
- 验收标准：对齐 `D:\5.11\UI图\3.png`，保留编辑资料、统计跳转、收藏/浏览/活动/设置入口
- 构建要求：`npm run build:weapp`
- Git 提交建议：`feat: redesign profile tab ui`

## 第 6 阶段：统一跳转、红点、安全区和浮动按钮

- 修改范围：公共导航入口、红点刷新工具、浮动按钮引用、安全区样式
- 不允许修改：数据库结构、云函数权限、核心业务模型
- 验收标准：四个主 Tab 视觉一致，浮动按钮不遮挡内容，tabBar 红点正确，底部无异常大空白
- 构建要求：`npm run build:weapp`
- Git 提交建议：`chore: unify tab interactions and safe areas`

## 第 7 阶段：真机预览和回归测试

- 修改范围：只修复真机预览暴露出的视觉和交互问题
- 不允许修改：新增复杂业务、重构数据层、删除 fallback
- 验收标准：首页、发现页、消息页、我的页在模拟器和真机预览中与设计图高度一致，核心跳转不报错
- 构建要求：`npm run build:weapp`，微信开发者工具预览无红色错误
- Git 提交建议：`test: verify ui redesign main tabs`

## 每阶段通用检查

- 页面无乱码
- 页面无大块底部空白
- tabBar 不遮挡最后内容
- 浮动按钮不遮挡主按钮
- 搜索框、Chip、卡片圆角、阴影、字体层级统一
- mock fallback 保留
- 云函数失败不白屏
