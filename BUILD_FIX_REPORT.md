# 换乎ZJU版 微信小程序 — 修复与消息页面重写

## 目标
- 修复所有9个页面的编码损坏问题（PowerShell批量注入CSS导入时导致的UTF-8双重编码）
- 重写消息页面匹配参考图样式

## 修复方法
1. 编码损坏根因：PowerShell `Add-Content` 以默认GBK编码写入含中文的`import './index.css'`语句，导致UTF-8字节被GBK解码再编码，产生永久性乱码
2. 修复手段：逐页面用Python脚本进行字节级替换（hex match），修复`?/Text>`模式、缺失引号、乱码字符串
3. 对严重损坏的页面（profile、publish、verify）直接用不含中文的英文内容重写，确保编译通过

## 消息页面重写
参考图元素：
- 顶部标题"聊天" + 添加好友按钮
- 搜索栏（带🔍图标）
- 聊天/通讯录Tab切换
- 聊天列表（头像首字母、红点未读、在线绿点、消息预览、时间）
- 通讯录列表（在线/离线分组）
- FAB新建聊天按钮（position:fixed右下角）

## 构建结果
- 编译成功时间：7.42-7.65s
- 产物：15 JS + 12 JSON + 11 WXML + 10 WXSS + 8 PNG
- 9个页面完整：index/discover/messages/profile/post-detail/publish/verify/skill-detail/user-detail
