# Shared Packages (packages/)

本目录包含跨应用共享的包和配置：

## 📁 目录结构

### packages/shared
- **类型定义**: Zod 模式和 TypeScript 类型
- **工具函数**: 图像处理，验证，格式化
- **状态管理**: Zustand 存储
- **服务抽象**: 存储、数据库适配器接口

### packages/config
- **ESLint 配置**: 代码风格和质量检查
- **TypeScript 配置**: 类型检查和编译选项
- **Tailwind CSS 配置**: 样式和主题定制
- **测试配置**: Vitest 和 Playwright 设置

### packages/database  
- **数据库模式**: Drizzle ORM 表定义
- **迁移脚本**: 数据库版本管理
- **客户端配置**: D1 和 SQLite 连接
- **种子数据**: 开发和测试数据

## 🔧 包管理

使用 pnpm 工作区进行依赖管理：

```bash
# 为特定包添加依赖
pnpm add --filter @face-recog/shared lodash

# 在包之间建立依赖关系
pnpm add --filter web @face-recog/shared
``` 