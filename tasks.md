# 人脸识别系统 - 任务跟踪清单

## 概览

基于快速原型开发计划的任务分解，共5个迭代阶段，预计开发周期 16-26 天。

### 进度统计
- **总任务数**: 72
- **已完成**: 13
- **进行中**: 0  
- **待开始**: 59
- **自动化测试覆盖**: 5个迭代，35个测试用例

---

## 🚀 迭代 1: 基础架构原型 (3-5天)

**目标**: 建立文件上传和存储功能，验证 Turborepo + Cloudflare 技术栈

### 基础设施搭建

- [x] **TASK-1.1** 初始化 Turborepo 单体仓库 ✅
  - 创建根目录结构 (`apps/`, `packages/`)
  - 配置 `turbo.json` 构建管道
  - 设置 `pnpm-workspace.yaml`
  - **估时**: 2小时
  - **完成时间**: 2024-12-30

- [x] **TASK-1.2** 创建共享包结构 ✅
  - 创建 `packages/shared` (类型定义和工具)
  - 创建 `packages/config` (ESLint, TypeScript, Tailwind配置)
  - 创建 `packages/database` (数据库schema和客户端)
  - **估时**: 3小时
  - **完成时间**: 2024-12-30

- [x] **TASK-1.3** 配置 TypeScript 工作区 ✅
  - 设置根 `tsconfig.json` 和引用配置
  - 配置包间类型共享
  - 设置构建输出目录
  - **估时**: 1小时
  - **完成时间**: 2024-12-30

### 前端应用 (apps/web)

- [x] **TASK-1.4** 初始化 Next.js 15 应用 ✅
  - 创建 App Router 结构
  - 配置 `next.config.js` 支持 Cloudflare Pages
  - 设置基础布局和页面
  - **估时**: 2小时
  - **完成时间**: 2024-12-30

- [x] **TASK-1.5** 集成 shadcn/ui 组件库 ✅
  - 安装和配置 shadcn/ui
  - 设置 Tailwind CSS
  - 创建基础 UI 组件
  - **估时**: 2小时
  - **完成时间**: 2024-12-30

- [x] **TASK-1.6** 实现文件上传界面 ✅
  - 创建照片上传组件 (`PhotoUpload.tsx`)
  - 实现文件选择和拖拽上传
  - 添加文件格式和大小验证
  - 显示上传进度条
  - **估时**: 4小时
  - **完成时间**: 2024-12-20

- [x] **TASK-1.7** 实现错误处理和用户反馈 ✅
  - 创建错误提示组件
  - 实现上传状态管理
  - 添加成功/失败通知
  - **估时**: 2小时
  - **完成时间**: 2024-12-20

### 后端 API (apps/api)

- [x] **TASK-1.8** 创建 Hono API 服务 ✅
  - 初始化 Hono 应用结构
  - 配置 CORS 和基础中间件
  - 设置路由架构
  - **估时**: 2小时
  - **完成时间**: 2024-12-20

- [x] **TASK-1.9** 实现文件上传 API ✅
  - 创建 `POST /api/upload` 端点
  - 实现文件验证逻辑 (类型、大小、格式)
  - 添加 multipart/form-data 处理
  - **估时**: 3小时
  - **完成时间**: 2024-12-20

- [x] **TASK-1.10** 集成 Cloudflare R2 存储 ✅
  - 配置 R2 存储桶绑定
  - 实现文件上传到 R2
  - 生成安全的文件访问 URL
  - **估时**: 3小时
  - **完成时间**: 2024-12-20

- [x] **TASK-1.11** 配置 wrangler 和部署 ✅
  - 设置 `wrangler.toml` 配置
  - 配置环境变量和绑定
  - 设置本地开发环境
  - **估时**: 2小时
  - **完成时间**: 2024-12-20

### 部署和验证

- [x] **TASK-1.12** 配置 Cloudflare Pages 部署 ✅
  - 设置前端构建和部署流程
  - 配置域名和环境变量
  - **估时**: 1小时
  - **完成时间**: 2024-12-20

- [x] **TASK-1.13** 配置 Cloudflare Workers 部署 ✅
  - 部署 API 服务到 Workers
  - 配置自定义域名路由
  - **估时**: 1小时
  - **完成时间**: 2024-12-30

- [ ] **TASK-1.14** 配置 Playwright 测试环境
  - 安装和配置 Playwright 测试框架
  - 设置测试环境和浏览器配置
  - 创建基础测试工具和 fixtures
  - 配置 CI/CD 测试管道
  - **估时**: 2小时

- [ ] **TASK-1.15** 编写迭代 1 自动化测试用例
  - 测试用例 1.1: 文件选择和上传流程
  - 测试用例 1.2: 上传进度显示验证
  - 测试用例 1.3: 文件格式和大小验证
  - 测试用例 1.4: 错误处理和用户提示
  - 测试用例 1.5: R2 存储验证和 URL 生成
  - **估时**: 4小时

- [ ] **TASK-1.16** 执行迭代 1 验收测试
  - 运行完整 Playwright 测试套件
  - 验证所有测试用例通过 (通过率 100%)
  - 生成测试报告和覆盖率统计
  - 确认部署环境可访问性
  - **估时**: 1小时

---

## 🧠 迭代 2: 面部检测原型 (3-5天)

**目标**: 集成容器化面部检测服务，实现基础人脸识别能力

### 容器服务搭建 (apps/face-detector)

- [ ] **TASK-2.1** 创建容器服务结构
  - 创建 `apps/face-detector` 目录
  - 设置 Express.js 服务器
  - 配置 TypeScript 和构建流程
  - **估时**: 2小时

- [ ] **TASK-2.2** 集成 @vladmandic/face-api
  - 安装 face-api.js 和依赖
  - 配置 Canvas 环境支持
  - 下载和配置 AI 模型文件
  - **估时**: 4小时

- [ ] **TASK-2.3** 实现面部检测服务
  - 创建 `FaceDetectionService` 类
  - 实现模型加载和缓存
  - 添加面部检测算法
  - **估时**: 4小时

- [ ] **TASK-2.4** 创建 Dockerfile 配置
  - 配置 Node.js Alpine 基础镜像
  - 安装系统依赖 (Cairo, Canvas等)
  - 优化镜像大小和构建时间
  - **估时**: 3小时

### Cloudflare Containers 集成

- [ ] **TASK-2.5** 实现 Container 类
  - 创建 `FaceDetectorContainer` 继承 `Container`
  - 配置容器生命周期管理
  - 实现 `onStart`, `onStop`, `onError` 钩子
  - **估时**: 3小时

- [ ] **TASK-2.6** 配置 Worker 到 Container 通信
  - 更新 `wrangler.jsonc` 容器配置
  - 实现 Durable Object 绑定
  - 配置容器路由和负载均衡
  - **估时**: 3小时

- [ ] **TASK-2.7** 实现面部检测 API 端点
  - 创建 `POST /api/detect-faces` 端点
  - 实现图像接收和处理
  - 返回检测结果 (边界框、置信度)
  - **估时**: 3小时

### 前端检测结果展示

- [ ] **TASK-2.8** 创建检测结果可视化组件
  - 实现 `FaceDetectionResult` 组件
  - 绘制人脸边界框标注
  - 显示置信度分数
  - **估时**: 4小时

- [ ] **TASK-2.9** 集成检测流程到上传界面
  - 上传后自动触发面部检测
  - 显示检测进度和状态
  - 处理检测失败情况
  - **估时**: 3小时

- [ ] **TASK-2.10** 编写迭代 2 自动化测试用例
  - 测试用例 2.1: 容器服务启动和健康检查
  - 测试用例 2.2: 面部检测 API 端点功能
  - 测试用例 2.3: 检测结果可视化验证
  - 测试用例 2.4: 边界框坐标准确性测试
  - 测试用例 2.5: 置信度分数显示测试
  - 测试用例 2.6: 检测失败场景处理
  - **估时**: 4小时

- [ ] **TASK-2.11** 执行迭代 2 验收测试
  - 运行面部检测测试套件
  - 验证检测准确率 >90% (使用测试图片集)
  - 验证容器服务稳定性 (连续运行测试)
  - 验证所有测试用例通过 (通过率 100%)
  - 生成检测性能基准报告
  - **估时**: 2小时

---

## 🔍 迭代 3: 面部匹配原型 (4-6天)

**目标**: 实现核心人脸匹配功能，用户可以找到相似人脸照片

### 数据库设计和实现

- [ ] **TASK-3.1** 设计 D1 数据库 Schema
  - 创建 `photos` 表结构
  - 创建 `face_encodings` 表结构  
  - 创建 `search_jobs` 表结构
  - 设计索引策略
  - **估时**: 2小时

- [ ] **TASK-3.2** 实现 Drizzle ORM 集成
  - 配置 Drizzle 与 D1 连接
  - 创建类型安全的查询方法
  - 实现数据库迁移脚本
  - **估时**: 3小时

- [ ] **TASK-3.3** 创建 Zod 验证 Schema
  - 定义 `Photo`, `FaceEncoding`, `SearchJob` schema
  - 实现运行时类型验证
  - 确保端到端类型安全
  - **估时**: 2小时

### 面部特征提取和匹配

- [ ] **TASK-3.4** 实现面部特征编码提取
  - 扩展容器服务支持特征提取
  - 生成 128 维面部编码向量
  - 实现编码数据存储
  - **估时**: 4小时

- [ ] **TASK-3.5** 实现相似度匹配算法
  - 实现欧几里得距离计算
  - 创建批量相似度搜索
  - 优化大规模匹配性能
  - **估时**: 5小时

- [ ] **TASK-3.6** 实现搜索作业管理
  - 创建异步搜索作业系统
  - 实现作业状态跟踪
  - 支持并发搜索处理
  - **估时**: 4小时

### 搜索 API 和状态管理

- [ ] **TASK-3.7** 实现搜索 API 端点
  - 创建 `POST /api/search` 端点
  - 实现 `GET /api/search/:jobId/status` 端点
  - 创建 `GET /api/search/:jobId/results` 端点
  - **估时**: 4小时

- [ ] **TASK-3.8** 实现搜索状态实时更新
  - 配置 WebSocket 或 Server-Sent Events
  - 实现搜索进度实时推送
  - 处理长时间运行的搜索任务
  - **估时**: 3小时

### 前端结果展示

- [ ] **TASK-3.9** 创建匹配结果画廊组件
  - 实现 `ResultsGallery` 组件
  - 支持网格布局和列表视图
  - 实现图片懒加载
  - **估时**: 4小时

- [ ] **TASK-3.10** 实现相似度显示和过滤
  - 显示相似度分数和排序
  - 实现阈值过滤控制
  - 支持结果分页浏览
  - **估时**: 3小时

- [ ] **TASK-3.11** 实现搜索状态界面
  - 创建搜索进度指示器
  - 显示实时状态更新
  - 处理搜索错误状态
  - **估时**: 2小时

- [ ] **TASK-3.12** 编写迭代 3 自动化测试用例
  - 测试用例 3.1: 面部特征编码提取验证
  - 测试用例 3.2: 相似度匹配算法准确性
  - 测试用例 3.3: 搜索 API 端点功能测试
  - 测试用例 3.4: 搜索状态实时更新测试
  - 测试用例 3.5: 匹配结果排序和分页
  - 测试用例 3.6: 阈值过滤功能测试
  - 测试用例 3.7: 大数据集性能测试
  - **估时**: 5小时

- [ ] **TASK-3.13** 执行迭代 3 验收测试
  - 运行完整匹配功能测试套件
  - 验证匹配查询响应时间 <5秒
  - 验证匹配准确性 (使用已知数据集)
  - 验证所有测试用例通过 (通过率 100%)
  - 生成匹配性能和准确性报告
  - **估时**: 2小时

---

## ⚡ 迭代 4: 性能和体验优化 (3-5天)

**目标**: 优化系统性能，提升用户体验，增加实用功能

### 图像处理优化

- [ ] **TASK-4.1** 实现图像格式优化
  - 集成 Sharp 图像处理库
  - 实现 WebP 格式自动转换
  - 配置智能压缩算法
  - **估时**: 3小时

- [ ] **TASK-4.2** 实现缩略图生成
  - 自动生成多尺寸缩略图
  - 配置响应式图像策略
  - 优化存储和传输效率
  - **估时**: 3小时

- [ ] **TASK-4.3** 实现图像缓存策略
  - 配置 CDN 缓存规则
  - 实现浏览器缓存优化
  - 添加缓存失效机制
  - **估时**: 2小时

### 性能优化

- [ ] **TASK-4.4** 实现搜索结果缓存
  - 缓存常见搜索结果
  - 实现智能缓存策略
  - 配置缓存过期和更新
  - **估时**: 3小时

- [ ] **TASK-4.5** 优化数据库查询
  - 添加查询索引优化
  - 实现查询结果分页
  - 优化复杂查询性能
  - **估时**: 3小时

- [ ] **TASK-4.6** 实现懒加载和虚拟滚动
  - 在结果画廊中实现懒加载
  - 配置虚拟滚动优化
  - 减少内存占用
  - **估时**: 4小时

### 用户体验改进

- [ ] **TASK-4.7** 实现拖拽上传功能
  - 支持拖拽文件到上传区域
  - 实现多文件选择和预览
  - 添加上传队列管理
  - **估时**: 3小时

- [ ] **TASK-4.8** 改进进度反馈机制
  - 实现详细的上传进度
  - 显示处理阶段状态
  - 添加预估完成时间
  - **估时**: 2小时

- [ ] **TASK-4.9** 实现错误恢复机制
  - 自动重试失败的操作
  - 提供手动重试选项
  - 改进错误消息显示
  - **估时**: 3小时

- [ ] **TASK-4.10** 响应式设计优化
  - 优化移动端界面布局
  - 实现触控友好的交互
  - 确保跨设备兼容性
  - **估时**: 4小时

### 批量处理功能

- [ ] **TASK-4.11** 实现批量文件上传
  - 支持多文件同时上传
  - 实现上传队列管理
  - 显示批量处理进度
  - **估时**: 4小时

- [ ] **TASK-4.12** 实现搜索历史功能
  - 存储用户搜索记录
  - 提供历史记录浏览
  - 支持快速重新搜索
  - **估时**: 3小时

- [ ] **TASK-4.13** 实现结果导出功能
  - 支持搜索结果导出
  - 提供多种导出格式
  - 实现批量下载功能
  - **估时**: 3小时

- [ ] **TASK-4.14** 编写迭代 4 自动化测试用例
  - 测试用例 4.1: 图像优化和压缩验证
  - 测试用例 4.2: 缩略图生成质量测试
  - 测试用例 4.3: 缓存策略有效性测试
  - 测试用例 4.4: 懒加载和虚拟滚动测试
  - 测试用例 4.5: 拖拽上传功能测试
  - 测试用例 4.6: 批量文件处理测试
  - 测试用例 4.7: 响应式设计兼容性测试
  - 测试用例 4.8: 性能基准测试 (响应时间、上传速度)
  - **估时**: 5小时

- [ ] **TASK-4.15** 执行迭代 4 验收测试
  - 运行性能和体验测试套件
  - 验证界面响应时间 <200ms
  - 验证上传速度提升 50%
  - 验证移动端兼容性 (多设备测试)
  - 验证所有测试用例通过 (通过率 100%)
  - 生成性能优化效果报告
  - **估时**: 2小时

---

## 🚀 迭代 5: 生产就绪 (3-5天)

**目标**: 使系统达到生产环境标准，包括监控、安全、扩展性

### 生产环境配置

- [ ] **TASK-5.1** 配置生产环境部署
  - 设置生产域名和 SSL 证书
  - 配置环境变量和密钥管理
  - 优化构建和部署流程
  - **估时**: 3小时

- [ ] **TASK-5.2** 实现 CI/CD 管道优化
  - 配置自动化测试流程
  - 实现分阶段部署策略
  - 添加部署回滚机制
  - **估时**: 4小时

- [ ] **TASK-5.3** 配置容器生产优化
  - 优化容器镜像大小
  - 配置生产环境资源限制
  - 实现容器健康检查
  - **估时**: 3小时

### 监控和日志系统

- [ ] **TASK-5.4** 实现应用性能监控
  - 集成 Cloudflare Analytics
  - 配置关键指标监控
  - 设置性能阈值告警
  - **估时**: 3小时

- [ ] **TASK-5.5** 实现错误追踪和日志
  - 配置结构化日志输出
  - 实现错误自动报告
  - 设置日志聚合和分析
  - **估时**: 3小时

- [ ] **TASK-5.6** 创建监控仪表板
  - 构建实时性能仪表板
  - 显示关键业务指标
  - 实现告警通知系统
  - **估时**: 4小时

### 安全强化

- [ ] **TASK-5.7** 实现安全审计
  - 执行安全漏洞扫描
  - 实现输入验证强化
  - 配置安全头和策略
  - **估时**: 3小时

- [ ] **TASK-5.8** 实现访问控制和限流
  - 配置 API 速率限制
  - 实现基础访问控制
  - 添加反爬虫保护
  - **估时**: 3小时

- [ ] **TASK-5.9** 实现数据保护机制
  - 配置数据加密存储
  - 实现敏感数据脱敏
  - 设置数据保留策略
  - **估时**: 3小时

### 可靠性和扩展性

- [ ] **TASK-5.10** 实现健康检查系统
  - 创建多层次健康检查
  - 实现服务可用性监控
  - 配置自动故障恢复
  - **估时**: 3小时

- [ ] **TASK-5.11** 配置数据备份策略
  - 实现自动数据备份
  - 配置备份验证机制
  - 创建灾难恢复计划
  - **估时**: 4小时

- [ ] **TASK-5.12** 执行负载和压力测试
  - 使用 Playwright 执行负载测试
  - 验证 1000+ 并发用户支持
  - 测试系统可用性 99.9%
  - **估时**: 4小时

### 文档和交付

- [ ] **TASK-5.13** 完善 API 文档
  - 生成 OpenAPI 规范文档
  - 创建 API 使用示例
  - 实现交互式 API 测试
  - **估时**: 3小时

- [ ] **TASK-5.14** 创建运维操作手册
  - 编写部署操作指南
  - 创建故障排除手册
  - 文档化监控和维护流程
  - **估时**: 4小时

- [ ] **TASK-5.15** 编写用户使用指南
  - 创建用户操作教程
  - 制作功能演示视频
  - 编写常见问题解答
  - **估时**: 3小时

- [ ] **TASK-5.16** 编写迭代 5 自动化测试用例
  - 测试用例 5.1: 生产环境部署验证
  - 测试用例 5.2: 监控和告警功能测试
  - 测试用例 5.3: 安全防护机制测试
  - 测试用例 5.4: 访问控制和限流测试
  - 测试用例 5.5: 健康检查系统测试
  - 测试用例 5.6: 数据备份和恢复测试
  - 测试用例 5.7: 负载压力测试 (1000+ 并发)
  - 测试用例 5.8: 可用性测试 (99.9% SLA)
  - **估时**: 6小时

- [ ] **TASK-5.17** 执行迭代 5 验收测试
  - 运行完整生产就绪测试套件
  - 验证系统可处理 1000+ 并发用户
  - 确认 99.9% 可用性达标
  - 验证安全扫描无高危漏洞
  - 验证监控和告警系统正常
  - 验证所有测试用例通过 (通过率 100%)
  - 生成生产就绪评估报告
  - **估时**: 3小时

---

## 📊 进度跟踪

### 迭代完成状态

| 迭代 | 任务数 | 已完成 | 进行中 | 待开始 | 完成率 | 测试用例数 |
|------|--------|--------|--------|--------|--------|------------|
| 迭代 1 | 16 | 13 | 0 | 3 | 81% | 5 个测试用例 |
| 迭代 2 | 11 | 0 | 0 | 11 | 0% | 6 个测试用例 |
| 迭代 3 | 13 | 0 | 0 | 13 | 0% | 7 个测试用例 |
| 迭代 4 | 15 | 0 | 0 | 15 | 0% | 8 个测试用例 |
| 迭代 5 | 17 | 0 | 0 | 17 | 0% | 8 个测试用例 |
| **总计** | **72** | **13** | **0** | **59** | **18%** | **34 个测试用例** |

### 关键里程碑

- [ ] **里程碑 1**: 基础架构完成 - 文件上传功能可用
- [ ] **里程碑 2**: 面部检测完成 - AI 容器服务可用  
- [ ] **里程碑 3**: 面部匹配完成 - 核心功能可用
- [ ] **里程碑 4**: 性能优化完成 - 用户体验优秀
- [ ] **里程碑 5**: 生产就绪完成 - 系统可上线运营

### 风险和依赖

**高风险任务**:
- TASK-2.2: @vladmandic/face-api 集成 (技术复杂度高)
- TASK-3.5: 相似度匹配算法 (性能要求高)
- TASK-5.12: 负载测试 (可能发现性能瓶颈)

**关键依赖**:
- Cloudflare Containers 公测可用性
- AI 模型文件下载和配置
- 大规模数据集测试环境

---

## 使用说明

### 任务状态标记
- `[ ]` 待开始
- `[🔄]` 进行中  
- `[✅]` 已完成
- `[❌]` 已取消
- `[⚠️]` 有问题需要注意

### 更新进度
完成任务时请：
1. 将 `[ ]` 改为 `[✅]`
2. 更新上方的进度统计表
3. 记录实际耗时用于估时改进
4. 注明遇到的问题和解决方案

### 任务优先级
- **P0**: 阻塞性任务，必须立即完成
- **P1**: 高优先级，当前迭代必须完成
- **P2**: 中优先级，可适当调整
- **P3**: 低优先级，可推迟到后续迭代

---

## 🧪 Playwright 自动化测试策略

### 测试验收标准

**每个迭代必须通过 100% 的 Playwright 自动化测试才能被认为完成。**

### 测试环境配置

```typescript
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['html'],
    ['json', { outputFile: 'test-results.json' }],
    ['junit', { outputFile: 'test-results.xml' }]
  ],
  use: {
    baseURL: process.env.TEST_BASE_URL || 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure'
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] }
    },
    {
      name: 'firefox', 
      use: { ...devices['Desktop Firefox'] }
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] }
    },
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] }
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] }
    }
  ]
});
```

### 测试用例规范

#### 迭代 1: 基础架构测试
```typescript
// tests/iteration-1/file-upload.spec.ts
import { test, expect } from '@playwright/test';

test.describe('迭代 1: 文件上传功能', () => {
  test('1.1: 文件选择和上传流程', async ({ page }) => {
    await page.goto('/');
    
    // 验证上传界面存在
    const uploadArea = page.locator('[data-testid="upload-area"]');
    await expect(uploadArea).toBeVisible();
    
    // 模拟文件选择
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles('./test-assets/sample-image.jpg');
    
    // 验证文件预览显示
    const preview = page.locator('[data-testid="file-preview"]');
    await expect(preview).toBeVisible();
    
    // 点击上传按钮
    const uploadButton = page.locator('[data-testid="upload-button"]');
    await uploadButton.click();
    
    // 验证上传成功
    const successMessage = page.locator('[data-testid="upload-success"]');
    await expect(successMessage).toBeVisible({ timeout: 10000 });
  });

  test('1.2: 上传进度显示验证', async ({ page }) => {
    await page.goto('/');
    
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles('./test-assets/large-image.jpg');
    
    const uploadButton = page.locator('[data-testid="upload-button"]');
    await uploadButton.click();
    
    // 验证进度条显示
    const progressBar = page.locator('[data-testid="progress-bar"]');
    await expect(progressBar).toBeVisible();
    
    // 验证进度百分比更新
    const progressText = page.locator('[data-testid="progress-text"]');
    await expect(progressText).toContainText('%');
  });

  test('1.3: 文件格式和大小验证', async ({ page }) => {
    await page.goto('/');
    
    // 测试不支持的文件格式
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles('./test-assets/document.pdf');
    
    const errorMessage = page.locator('[data-testid="format-error"]');
    await expect(errorMessage).toBeVisible();
    await expect(errorMessage).toContainText('不支持的文件格式');
    
    // 测试文件过大
    await fileInput.setInputFiles('./test-assets/large-file.jpg');
    const sizeError = page.locator('[data-testid="size-error"]');
    await expect(sizeError).toBeVisible();
    await expect(sizeError).toContainText('文件过大');
  });

  test('1.4: 错误处理和用户提示', async ({ page }) => {
    // 模拟网络错误
    await page.route('**/api/upload', route => route.abort());
    
    await page.goto('/');
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles('./test-assets/sample-image.jpg');
    
    const uploadButton = page.locator('[data-testid="upload-button"]');
    await uploadButton.click();
    
    // 验证错误提示
    const errorMessage = page.locator('[data-testid="upload-error"]');
    await expect(errorMessage).toBeVisible();
    await expect(errorMessage).toContainText('上传失败');
  });

  test('1.5: R2 存储验证和 URL 生成', async ({ page }) => {
    await page.goto('/');
    
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles('./test-assets/sample-image.jpg');
    
    const uploadButton = page.locator('[data-testid="upload-button"]');
    await uploadButton.click();
    
    // 等待上传完成
    const successMessage = page.locator('[data-testid="upload-success"]');
    await expect(successMessage).toBeVisible({ timeout: 15000 });
    
    // 验证返回的文件 URL
    const fileUrl = page.locator('[data-testid="file-url"]');
    await expect(fileUrl).toBeVisible();
    await expect(fileUrl).toContainText('https://');
    
    // 验证文件可访问
    const urlText = await fileUrl.textContent();
    const response = await page.request.get(urlText);
    expect(response.status()).toBe(200);
  });
});
```

#### 迭代 2: 面部检测测试
```typescript
// tests/iteration-2/face-detection.spec.ts
test.describe('迭代 2: 面部检测功能', () => {
  test('2.1: 容器服务启动和健康检查', async ({ page }) => {
    // 检查容器健康状态
    const response = await page.request.get('/api/health');
    expect(response.status()).toBe(200);
    
    const health = await response.json();
    expect(health.status).toBe('healthy');
  });

  test('2.2: 面部检测 API 端点功能', async ({ page }) => {
    // 直接测试 API 端点
    const formData = new FormData();
    formData.append('image', fs.readFileSync('./test-assets/face-photo.jpg'));
    
    const response = await page.request.post('/api/detect-faces', {
      data: formData
    });
    
    expect(response.status()).toBe(200);
    const result = await response.json();
    expect(result.success).toBe(true);
    expect(result.faces).toBeDefined();
    expect(result.faces.length).toBeGreaterThan(0);
  });

  test('2.3: 检测结果可视化验证', async ({ page }) => {
    await page.goto('/');
    
    // 上传包含人脸的图片
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles('./test-assets/face-photo.jpg');
    
    const uploadButton = page.locator('[data-testid="upload-button"]');
    await uploadButton.click();
    
    // 等待检测结果显示
    const detectionResult = page.locator('[data-testid="detection-result"]');
    await expect(detectionResult).toBeVisible({ timeout: 30000 });
    
    // 验证边界框显示
    const boundingBoxes = page.locator('[data-testid="face-bounding-box"]');
    await expect(boundingBoxes.first()).toBeVisible();
  });
});
```

### 性能测试要求

```typescript
// tests/performance/load-test.spec.ts
test.describe('性能和负载测试', () => {
  test('并发上传测试', async ({ browser }) => {
    const contexts = await Promise.all(
      Array.from({ length: 10 }, () => browser.newContext())
    );
    
    const pages = await Promise.all(
      contexts.map(context => context.newPage())
    );
    
    // 并发执行上传操作
    const uploadPromises = pages.map(async (page, index) => {
      await page.goto('/');
      const fileInput = page.locator('input[type="file"]');
      await fileInput.setInputFiles(`./test-assets/test-image-${index}.jpg`);
      
      const uploadButton = page.locator('[data-testid="upload-button"]');
      const start = Date.now();
      await uploadButton.click();
      
      const successMessage = page.locator('[data-testid="upload-success"]');
      await expect(successMessage).toBeVisible({ timeout: 30000 });
      
      return Date.now() - start;
    });
    
    const uploadTimes = await Promise.all(uploadPromises);
    
    // 验证性能要求
    const avgTime = uploadTimes.reduce((a, b) => a + b, 0) / uploadTimes.length;
    expect(avgTime).toBeLessThan(10000); // 平均上传时间 < 10秒
    
    // 清理
    await Promise.all(contexts.map(context => context.close()));
  });
});
```

### CI/CD 集成

```yaml
# .github/workflows/test.yml
name: Playwright Tests

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    timeout-minutes: 60
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v4
    - uses: actions/setup-node@v4
      with:
        node-version: '18'
    - name: Install dependencies
      run: pnpm install
    - name: Install Playwright Browsers
      run: npx playwright install --with-deps
    - name: Build applications
      run: pnpm run build
    - name: Start test servers
      run: |
        pnpm run dev &
        npx wait-on http://localhost:3000
    - name: Run Playwright tests
      run: npx playwright test
    - uses: actions/upload-artifact@v4
      if: always()
      with:
        name: playwright-report
        path: playwright-report/
        retention-days: 30
```

### 测试数据管理

```typescript
// tests/fixtures/test-data.ts
export const testImages = {
  validJpeg: './test-assets/sample.jpg',
  validPng: './test-assets/sample.png',
  invalidFormat: './test-assets/document.pdf',
  tooLarge: './test-assets/large-file.jpg',
  multipleFaces: './test-assets/group-photo.jpg',
  singleFace: './test-assets/portrait.jpg',
  noFaces: './test-assets/landscape.jpg'
};

export const expectedResults = {
  multipleFaces: { minFaces: 3, maxFaces: 5 },
  singleFace: { minFaces: 1, maxFaces: 1 },
  noFaces: { minFaces: 0, maxFaces: 0 }
};
```

### 验收标准
- ✅ **测试通过率**: 每个迭代 100% 测试通过
- ✅ **浏览器兼容**: Chrome, Firefox, Safari, Mobile 全部通过
- ✅ **性能要求**: 响应时间、吞吐量符合目标
- ✅ **功能覆盖**: 核心功能路径 100% 覆盖
- ✅ **错误场景**: 异常情况正确处理

只有当所有 Playwright 测试通过时，该迭代才被认为完成，可以进入下一迭代开发。 