# 人脸识别系统 API - 部署指南

本文档描述了如何部署和配置人脸识别系统的 API 服务到 Cloudflare Workers 平台。

## 📋 目录

- [快速开始](#-快速开始)
- [环境配置](#-环境配置)
- [部署流程](#-部署流程)
- [监控和维护](#-监控和维护)
- [故障排除](#-故障排除)

## 🚀 快速开始

### 前置要求

1. **Node.js** ≥ 18.0.0
2. **pnpm** ≥ 8.0.0
3. **Wrangler CLI** ≥ 3.0.0
4. **Cloudflare 账户** 且已登录

### 一键部署检查

```bash
# 检查开发环境
pnpm run check

# 检查测试环境
pnpm run check:staging

# 检查生产环境
pnpm run check:production
```

## 🌐 环境配置

### 环境列表

| 环境 | 描述 | 域名 | Worker 名称 |
|------|------|------|-------------|
| **Development** | 本地开发 | localhost:8787 | face-recog-api |
| **Staging** | 测试环境 | api-staging.face-recog.com | face-recog-api-staging |
| **Production** | 生产环境 | api.face-recog.com | face-recog-api-prod |

### 配置文件

- `wrangler.toml` - Cloudflare Workers 配置
- `src/types.ts` - 环境变量类型定义
- `scripts/` - 自动化部署脚本

### 环境变量

#### 开发环境
```toml
[vars]
ENVIRONMENT = "development"
API_VERSION = "1.0.0"
DEBUG_MODE = "true"
MAX_FILE_SIZE = "10485760"
SUPPORTED_FORMATS = "image/jpeg,image/png,image/webp"
```

#### 生产环境
```toml
[env.production.vars]
ENVIRONMENT = "production"
API_VERSION = "1.0.0"
DEBUG_MODE = "false"
SENTRY_DSN = ""  # 通过 secret 设置
```

### 密钥管理

生产环境必需的密钥：

- `SENTRY_DSN` - 错误监控 DSN
- `API_SECRET_KEY` - API 访问密钥
- `WEBHOOK_SECRET` - Webhook 验证密钥

## 🔧 部署流程

### 1. 环境准备

#### 创建 R2 存储桶
```bash
# 创建开发环境存储桶
pnpm run setup:r2 dev

# 创建所有环境存储桶
pnpm run setup:r2 all
```

#### 设置环境密钥
```bash
# 设置测试环境密钥
pnpm run setup:secrets staging

# 设置生产环境密钥
pnpm run setup:secrets production
```

### 2. 部署前检查

```bash
# 开发环境检查
pnpm run check

# 生产环境检查
pnpm run check:production
```

**检查项目：**
- ✅ Wrangler CLI 可用性
- ✅ TypeScript 类型检查
- ✅ 代码构建成功
- ✅ 依赖包完整性
- ✅ R2 存储桶可用性
- ✅ 环境变量配置
- ✅ 密钥设置完整

### 3. 部署操作

#### 开发环境
```bash
# 启动本地开发服务器
pnpm run dev

# 预览部署
pnpm run preview
```

#### 测试环境
```bash
# 预览部署到测试环境
pnpm run preview:staging

# 正式部署到测试环境
pnpm run deploy:staging
```

#### 生产环境
```bash
# 预览部署到生产环境
pnpm run preview:production

# 正式部署到生产环境
pnpm run deploy:production
```

### 4. 部署验证

```bash
# 查看部署状态
wrangler deployments list

# 测试 API 端点
curl https://api.face-recog.com/api/health

# 查看实时日志
pnpm run logs:production
```

## 📊 监控和维护

### 健康检查

- **基础检查**: `GET /api/health`
- **详细检查**: `GET /api/health/detailed`
- **就绪检查**: `GET /api/health/ready`
- **存活检查**: `GET /api/health/live`

### 性能监控

```bash
# 查看实时日志
pnpm run logs:production

# 检查 Worker 分析
wrangler analytics --env production

# 查看错误率
wrangler analytics --env production --error-rate
```

### 资源使用

#### R2 存储桶状态
```bash
# 列出存储桶
wrangler r2 bucket list

# 查看存储桶内容
wrangler r2 object list face-recog-photos-prod
```

#### Worker 状态
```bash
# 查看 Worker 信息
wrangler list

# 查看部署历史
wrangler deployments list
```

## 🐛 故障排除

### 常见问题

#### 1. 部署检查失败

**问题**: R2 存储桶不存在
```bash
❌ R2 存储桶: 缺少 R2 存储桶: face-recog-photos-prod
```

**解决方案**:
```bash
pnpm run setup:r2 production
```

**问题**: 环境密钥缺失
```bash
❌ 环境密钥: 缺少密钥: SENTRY_DSN, API_SECRET_KEY
```

**解决方案**:
```bash
pnpm run setup:secrets production
```

#### 2. 构建失败

**问题**: TypeScript 类型错误
```bash
❌ TypeScript 编译: TypeScript 类型检查失败
```

**解决方案**:
```bash
# 查看详细错误
pnpm run type-check

# 修复类型错误后重新检查
pnpm run check:production
```

#### 3. 运行时错误

**问题**: R2 存储连接失败

**排查步骤**:
1. 检查存储桶绑定配置
2. 验证存储桶名称正确
3. 确认 R2 权限配置

```bash
# 检查存储桶列表
wrangler r2 bucket list

# 测试存储桶访问
wrangler r2 object list face-recog-photos-prod --limit 1
```

#### 4. 权限问题

**问题**: Wrangler 权限不足

**解决方案**:
```bash
# 重新登录
wrangler logout
wrangler login

# 检查权限
wrangler whoami
```

### 日志调试

#### 查看实时日志
```bash
# 生产环境日志
pnpm run logs:production

# 过滤错误日志
wrangler tail --env production --grep error
```

#### 本地调试
```bash
# 启用调试模式
export DEBUG=true
pnpm run dev

# 查看详细输出
pnpm run dev --verbose
```

### 回滚部署

```bash
# 查看部署历史
wrangler deployments list --env production

# 回滚到指定版本
wrangler rollback [deployment-id] --env production
```

## 🔧 高级配置

### 自定义域名配置

1. 在 Cloudflare DNS 中添加 CNAME 记录
2. 更新 `wrangler.toml` 中的路由配置
3. 重新部署

### 负载均衡

生产环境配置：
- **CPU 限制**: 100秒
- **内存限制**: 256MB
- **并发限制**: 自动扩展

### 安全配置

- **CORS**: 配置允许的源域名
- **API 限流**: 基于 IP 地址限制
- **密钥轮换**: 定期更新 API 密钥

## 📚 相关文档

- [Cloudflare Workers 文档](https://developers.cloudflare.com/workers/)
- [R2 存储文档](https://developers.cloudflare.com/r2/)
- [Wrangler CLI 文档](https://developers.cloudflare.com/workers/wrangler/)
- [项目架构文档](../../design-document.md)

## 🆘 支持

如果遇到问题，请按以下顺序进行：

1. **检查部署状态**: `pnpm run check:production`
2. **查看错误日志**: `pnpm run logs:production`
3. **验证配置**: 检查 `wrangler.toml` 配置
4. **测试连接**: 验证 R2 和其他服务可用性
5. **联系支持**: 提供错误日志和配置信息

---

*最后更新: 2024-12-20*
*版本: 1.0.0* 