# 资源分享微信小程序

这是一个基于uni-app开发的微信小程序，专注于分享各类资源网盘链接，包括影视剧、动漫、音乐、软件等多种类型。用户可以浏览、搜索、收藏资源，管理员可以管理首页宣传和资源推荐。

## 🛠️ 技术栈

- **前端框架**：uni-app + Vue 3
- **云开发**：uniCloud-aliyun
- **UI组件**：uni-app内置组件 + 自定义组件
- **数据存储**：uniCloud数据库
- **文件存储**：uniCloud云存储

## ✨ 核心功能

### 用户功能
- 📱 **首页推荐**：展示精选资源和轮播图
- 🔍 **资源搜索**：支持关键词搜索各类资源
- 📂 **分类浏览**：按资源类型（电影、电视剧、动漫、音乐等）分类查看
- ⭐ **资源收藏**：一键收藏喜欢的资源
- 📁 **我的收藏**：查看和管理收藏的资源
- 👤 **个人中心**：用户信息和功能入口

### 管理员功能
- 🎨 **轮播图管理**：管理首页轮播图展示
- 📌 **推荐管理**：管理首页推荐资源
- 📤 **资源上传**：上传新的资源链接
- 📊 **资源管理**：编辑和删除现有资源

## 📁 项目结构

```
├── components/            # 自定义组件
│   ├── FavoriteButton.vue      # 收藏按钮组件
│   ├── RecommendResources.vue  # 推荐资源组件
│   └── ResourceCommon.vue      # 资源公共组件
├── pages/                # 页面文件
│   ├── admin/           # 管理员页面
│   ├── category/        # 分类页面
│   ├── favorite/        # 收藏页面
│   ├── index/           # 首页
│   ├── login/           # 登录页面
│   ├── my/              # 个人中心
│   ├── resource/        # 各类型资源页面
│   ├── search/          # 搜索页面
│   └── webview/         # 网页视图
├── static/              # 静态资源
│   ├── category/        # 分类图标
│   └── tabbar/          # 底部导航图标
├── uniCloud-aliyun/     # 云开发相关
│   ├── cloudfunctions/  # 云函数
│   └── database/        # 数据库配置
├── App.vue              # 应用入口
├── main.js              # 入口文件
├── manifest.json        # 应用配置
└── pages.json           # 页面路由配置
```

## 🚀 开发与运行

### 开发环境
- HBuilderX
- 微信开发者工具
- Node.js

### 运行步骤
1. 克隆或下载项目
2. 在HBuilderX中打开项目
3. 配置uniCloud环境
4. 编译运行到微信开发者工具
5. 在微信开发者工具中预览和调试

## 🎯 项目亮点

- **跨平台开发**：基于uni-app框架，可同时支持多个平台
- **云开发架构**：使用uniCloud实现前后端一体化开发
- **组件化设计**：封装通用组件，提高代码复用性
- **响应式布局**：适配不同屏幕尺寸的设备
- **完整的权限管理**：区分用户和管理员权限
- **用户体验优化**：流畅的页面切换和交互效果

## 📝 学习收获

通过开发这个项目，我掌握了以下技能：
- uni-app框架的使用和配置
- Vue 3的Composition API
- 微信小程序的开发规范和最佳实践
- 云开发平台的应用（数据库、云函数）
- 组件化和模块化开发思想
- 前端项目的结构设计和优化

### 页面截图
## 首页
<img width="373" height="791" alt="efbb6b8e3843c9b6b2d2d650a7f15420" src="https://github.com/user-attachments/assets/d26fa069-aa43-45ee-ba3f-a80011dbe38f" />

## 详情页
<img width="368" height="793" alt="582856569b30a296618d663aaade86fa" src="https://github.com/user-attachments/assets/d95a4dc5-fdd9-400f-a14f-1dfc0e03a8a0" />
<img width="369" height="795" alt="74de0c2c82ab71db83455f19a64b79c6" src="https://github.com/user-attachments/assets/f9d49404-ad39-4f56-a99c-1e41403f121a" />

## 后台管理页
<img width="375" height="790" alt="0fcca3b3bd003ea84c91e62b608bfea0" src="https://github.com/user-attachments/assets/15cd4515-fa28-4f8b-85a5-fef21f841f0d" />
<img width="369" height="795" alt="d7835f556857b1ec9e57f9be2d46a10c" src="https://github.com/user-attachments/assets/a4b6b6ea-5621-48f9-b95d-a069f94c9083" />
<img width="369" height="785" alt="43831d8f136bee212dc9f0bde636589d" src="https://github.com/user-attachments/assets/ba2ba587-190a-4c20-a790-02e9e212c984" />
<img width="370" height="790" alt="5aeca477c846b02f729612e4a041b40b" src="https://github.com/user-attachments/assets/83194865-a60a-4af2-95c8-8740b5e9e43f" />
<img width="371" height="794" alt="532c69be8930087a1a1fb54ea9bbd22c" src="https://github.com/user-attachments/assets/dda7b83c-c1a4-425e-883f-e8026232b7c1" />

## 收藏页
<img width="369" height="790" alt="9547836c65f1fa57e742f8cf0a237cd6" src="https://github.com/user-attachments/assets/0f6659e3-ab4b-409c-8197-6182cf53c18d" />



**Note**: 此项目仅用于学习和练习前端开发技能，资源内容请遵守相关法律法规。
