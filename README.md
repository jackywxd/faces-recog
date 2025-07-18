# 📸 人脸识别系统

基于 Cloudflare 全栈技术的现代化 Web 人脸识别系统，采用 Turborepo 单体仓库架构。

## 🏗️ 项目架构

```
photo-face-recognition/
├── apps/                      # 应用程序
│   ├── web/                   # Next.js 15 前端应用
│   ├── api/                   # Hono API 服务器 (Cloudflare Workers)
│   └── face-detector/         # 容器化人脸检测服务
├── packages/                  # 共享包
│   ├── shared/                # 共享类型、工具和服务
│   ├── config/                # 共享配置 (ESLint, TypeScript, Tailwind)
│   └── database/              # 数据库模式和迁移 (Drizzle ORM)
├── tests/                     # 端到端测试
├── turbo.json                 # Turborepo 构建配置
├── pnpm-workspace.yaml        # pnpm 工作区配置
└── package.json               # 根包配置
```

## 🚀 核心功能

- **照片上传**: 支持拖放上传，文件验证和进度跟踪
- **人脸检测**: 使用 @vladmandic/face-api 在容器化服务中检测和提取人脸特征
- **人脸匹配**: 在照片数据库中搜索匹配的人脸（置信度 > 80%）
- **结果展示**: 响应式画廊展示匹配结果，支持全屏查看

## 🛠️ 技术栈

- **单体仓库**: Turborepo + pnpm 工作区
- **前端**: Next.js 15 (App Router) + shadcn/ui + Tailwind CSS
- **后端**: Hono + Cloudflare Workers
- **AI 服务**: @vladmandic/face-api + Cloudflare Containers
- **数据库**: Cloudflare D1 (SQLite) + Drizzle ORM
- **存储**: Cloudflare R2 对象存储
- **测试**: Playwright + Vitest
- **部署**: Cloudflare Pages + Workers + Containers

## ⚡ 快速开始

### 安装依赖
```bash
pnpm install
```

### 开发模式
```bash
# 启动所有服务
pnpm run dev

# 分别启动不同服务
pnpm run dev:web       # Next.js 前端
pnpm run dev:api       # Hono API 服务器
```

### 构建和测试
```bash
pnpm run build         # Turborepo 增量构建
pnpm run test          # 运行端到端测试
pnpm run lint          # 代码检查
pnpm run type-check    # TypeScript 类型检查
```

### 部署
```bash
pnpm run deploy        # 部署到 Cloudflare
```

## 📋 开发进度

项目采用 5 个迭代阶段，预计开发周期 16-26 天：

- [x] **迭代 1**: 基础架构原型 - Turborepo 设置完成 ✨
- [ ] **迭代 2**: 面部检测原型  
- [ ] **迭代 3**: 面部匹配原型
- [ ] **迭代 4**: 性能和体验优化
- [ ] **迭代 5**: 生产就绪

## 📖 文档

- [项目概述](./project-overview.md)
- [设计文档](./design-document.md) 
- [任务清单](./tasks.md)
- [需求文档](./requirements.md)

---

*基于 Turborepo 的现代化 Web 开发最佳实践* 🚀 