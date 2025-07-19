# 人脸识别系统 API - Cloudflare Workers 部署指南

本文档描述了如何部署和配置人脸识别系统的 API 服务到 Cloudflare Workers 平台。

## 📋 目录

- [快速开始](#-快速开始)
- [环境配置](#-环境配置)
- [域名配置](#-域名配置)
- [部署流程](#-部署流程)
- [监控和维护](#-监控和维护)
- [故障排除](#-故障排除)

## 🚀 快速开始

### 前置要求

1. **Node.js** ≥ 18.0.0
2. **npm** ≥ 9.0.0
3. **Wrangler CLI** ≥ 3.0.0
4. **Cloudflare 账户** 且已登录
5. **域名** colorsofthewind.club 已添加到 Cloudflare

### 一键部署检查

```bash
# 检查测试环境部署就绪状态
npm run deploy:check:staging

# 检查生产环境部署就绪状态
npm run deploy:check:production
```

## 🌐 环境配置

### 环境列表

| 环境 | 描述 | 域名 | Worker 名称 |
|------|------|------|-------------|
| **Development** | 本地开发 | localhost:8787 | - |
| **Staging** | 测试环境 | api-staging.colorsofthewind.club | face-recog-api-staging |
| **Production** | 生产环境 | api.colorsofthewind.club | face-recog-api-prod |

### 配置文件

- `wrangler.toml` - Workers 配置文件
- `scripts/deploy-workers.cjs` - 自动化部署脚本
- `scripts/setup-domains.cjs` - 域名配置脚本
- `scripts/setup-r2.cjs` - R2 存储桶配置脚本
- `scripts/setup-secrets.cjs` - 密钥管理脚本

### 环境变量

#### 开发环境
```toml
[vars]
ENVIRONMENT = "development"
DEBUG_MODE = "true"
MAX_FILE_SIZE = "10485760"
```

#### 测试环境
```toml
[env.staging.vars]
ENVIRONMENT = "staging"
DEBUG_MODE = "false"
MAX_FILE_SIZE = "10485760"
SUPPORTED_FORMATS = "image/jpeg,image/png,image/webp"
```

#### 生产环境
```toml
[env.production.vars]
ENVIRONMENT = "production"
DEBUG_MODE = "false"
MAX_FILE_SIZE = "10485760"
SUPPORTED_FORMATS = "image/jpeg,image/png,image/webp"
SENTRY_DSN = ""  # 通过密钥设置
```

## 🌐 域名配置

### DNS 配置

在 Cloudflare DNS 中添加以下记录：

```dns
# API 域名 (A 记录或 CNAME)
A    api-staging.colorsofthewind.club    192.0.2.1
A    api.colorsofthewind.club            192.0.2.1

# 或者使用 CNAME 指向 Cloudflare
CNAME api-staging.colorsofthewind.club  face-recog-api-staging.workers.dev
CNAME api.colorsofthewind.club          face-recog-api-prod.workers.dev
```

### Workers 路由配置

路由配置在 `wrangler.toml` 中定义：

```toml
[env.staging]
route = { pattern = "api-staging.colorsofthewind.club/*", zone_name = "colorsofthewind.club" }

[env.production]
route = { pattern = "api.colorsofthewind.club/*", zone_name = "colorsofthewind.club" }
```

### 域名配置验证

```bash
# 检查测试环境域名配置
npm run setup:domains:staging

# 检查生产环境域名配置
npm run setup:domains:production
```

## 🔧 部署流程

### 1. 环境准备

#### 设置 Cloudflare 凭证
```bash
# 设置 API Token
export CLOUDFLARE_API_TOKEN="your-api-token"

# 设置 Account ID
export CLOUDFLARE_ACCOUNT_ID="your-account-id"

# 验证登录状态
wrangler whoami
```

#### 创建 R2 存储桶
```bash
# 自动创建所需的 R2 存储桶
npm run setup:r2

# 手动创建 (如果需要)
wrangler r2 bucket create face-recog-photos-staging
wrangler r2 bucket create face-recog-photos-prod
```

#### 配置密钥
```bash
# 自动配置密钥 (交互式)
npm run setup:secrets

# 手动配置生产环境密钥
wrangler secret put SENTRY_DSN --env production
```

### 2. 部署前检查

```bash
# 完整的部署前检查
npm run deploy:check:staging
npm run deploy:check:production

# 检查包含的项目：
# ✅ 环境变量配置
# ✅ 项目依赖完整性
# ✅ TypeScript 类型检查
# ✅ 代码质量检查 (ESLint)
# ✅ R2 存储桶存在性
# ✅ 密钥配置验证
```

### 3. 构建和部署

#### 测试环境部署
```bash
# 预演部署 (不实际部署)
npm run deploy:dry-run

# 正式部署到测试环境
npm run deploy:staging

# 仅执行检查 (不部署)
npm run deploy:check:staging
```

#### 生产环境部署
```bash
# 部署到生产环境
npm run deploy:production

# 检查生产环境就绪状态
npm run deploy:check:production
```

### 4. 部署验证

```bash
# 查看 Workers 部署列表
wrangler deployments list --name face-recog-api-staging
wrangler deployments list --name face-recog-api-prod

# 测试健康检查端点
curl https://api-staging.colorsofthewind.club/api/health
curl https://api.colorsofthewind.club/api/health

# 测试文件上传端点
curl -X POST -F "file=@test.jpg" https://api-staging.colorsofthewind.club/api/upload
```

## 📊 监控和维护

### 日志查看

```bash
# 查看测试环境日志
npm run logs:staging

# 查看生产环境日志
npm run logs:production

# 实时日志流
wrangler tail --env staging
wrangler tail --env production
```

### 性能监控

#### Cloudflare Analytics
```bash
# 通过 Cloudflare Dashboard 查看
# https://dash.cloudflare.com -> Workers & Pages -> [worker-name] -> Analytics

# 关键指标：
# - 请求数量和成功率
# - 响应时间 (P50, P95, P99)
# - CPU 使用时间
# - 内存使用
# - 错误率
```

#### 健康检查监控
```bash
# 设置外部监控服务定期检查
curl -f https://api.colorsofthewind.club/api/health

# 期望响应：
{
  "status": "ok",
  "timestamp": "2024-12-20T10:30:00.000Z",
  "environment": "production",
  "version": "1.0.0"
}
```

### 部署管理

#### 查看部署历史
```bash
# 列出部署历史
wrangler deployments list --name face-recog-api-prod

# 查看特定部署详情
wrangler deployments get [deployment-id] --name face-recog-api-prod
```

#### 回滚部署
```bash
# 回滚到前一个版本
wrangler rollback --name face-recog-api-prod
```

### 资源管理

#### R2 存储桶管理
```bash
# 查看存储桶列表
wrangler r2 bucket list

# 查看存储桶使用情况
wrangler r2 object list --bucket face-recog-photos-prod

# 清理临时文件 (开发环境)
wrangler r2 object delete --bucket face-recog-photos-dev --prefix temp/
```

#### 密钥管理
```bash
# 查看密钥列表
wrangler secret list --env production

# 更新密钥
wrangler secret put SENTRY_DSN --env production

# 删除密钥
wrangler secret delete OLD_SECRET --env production
```

## 🐛 故障排除

### 常见问题

#### 1. 部署失败

**问题**: Worker 部署时失败
```bash
❌ Worker 部署失败: Build failed
```

**解决方案**:
```bash
# 检查 TypeScript 错误
npm run type-check

# 检查构建
npm run build

# 查看详细错误
wrangler deploy --env staging --verbose
```

#### 2. 域名访问问题

**问题**: 自定义域名无法访问

**排查步骤**:
```bash
# 1. 检查 DNS 解析
nslookup api.colorsofthewind.club

# 2. 检查 Workers 路由
wrangler routes list --zone colorsofthewind.club

# 3. 验证 SSL 证书
curl -I https://api.colorsofthewind.club/api/health

# 4. 检查域名配置
npm run setup:domains:production
```

#### 3. R2 存储桶问题

**问题**: 文件上传到 R2 失败
```bash
❌ R2 存储桶 face-recog-photos-staging 不存在
```

**解决方案**:
```bash
# 检查存储桶是否存在
wrangler r2 bucket list

# 重新创建存储桶
npm run setup:r2

# 检查绑定配置
grep -A 5 "r2_buckets" wrangler.toml
```

#### 4. 密钥配置问题

**问题**: 密钥未配置导致功能异常

**解决方案**:
```bash
# 检查密钥列表
wrangler secret list --env production

# 重新配置密钥
npm run setup:secrets

# 验证密钥是否生效
curl https://api.colorsofthewind.club/api/health
```

#### 5. 性能问题

**问题**: API 响应时间过长

**优化方案**:
```bash
# 1. 查看 Worker 指标
wrangler tail --env production

# 2. 检查 CPU 限制
# 在 wrangler.toml 中调整 limits.cpu_ms

# 3. 优化代码
# - 减少同步操作
# - 使用缓存
# - 优化算法复杂度

# 4. 监控资源使用
# 通过 Cloudflare Dashboard 查看详细指标
```

### 调试技巧

#### 本地调试
```bash
# 启动本地开发服务器
npm run dev

# 模拟生产环境
wrangler dev --env production --local

# 查看实时日志
wrangler tail --env staging
```

#### 远程调试
```bash
# 启用调试模式
wrangler secret put DEBUG_MODE --env staging
# 输入值: true

# 查看详细日志
curl https://api-staging.colorsofthewind.club/api/debug

# 关闭调试模式
wrangler secret put DEBUG_MODE --env staging
# 输入值: false
```

## 🔧 高级配置

### 自定义域名证书

Cloudflare Workers 自动提供 SSL 证书：
- **类型**: Universal SSL (Let's Encrypt)
- **通配符**: 支持子域名
- **自动续期**: 自动管理证书生命周期

### 流量路由

#### 分阶段部署
```bash
# 部署到测试环境验证
npm run deploy:staging

# 测试通过后部署到生产环境
npm run deploy:production
```

#### 蓝绿部署
```bash
# 部署新版本到不同的 Worker
wrangler deploy --name face-recog-api-prod-v2 --env production

# 更新路由指向新版本
wrangler routes update --zone colorsofthewind.club

# 验证无误后删除旧版本
wrangler delete --name face-recog-api-prod
```

### 环境隔离

#### 资源命名规范
```
开发环境:   face-recog-*-dev
测试环境:   face-recog-*-staging  
生产环境:   face-recog-*-prod
```

#### 权限控制
```bash
# 使用不同的 API Token 进行环境隔离
export CLOUDFLARE_API_TOKEN_STAGING="token-for-staging"
export CLOUDFLARE_API_TOKEN_PRODUCTION="token-for-production"
```

## 📚 相关文档

- [Cloudflare Workers 文档](https://developers.cloudflare.com/workers/)
- [Wrangler CLI 文档](https://developers.cloudflare.com/workers/wrangler/)
- [R2 存储文档](https://developers.cloudflare.com/r2/)
- [项目架构文档](../../design-document.md)
- [前端部署文档](../web/PAGES_DEPLOYMENT.md)

## 🆘 支持

如果遇到问题，请按以下顺序进行：

1. **检查部署状态**: `npm run deploy:check:production`
2. **查看 Worker 日志**: `npm run logs:production`
3. **验证域名配置**: `npm run setup:domains:production`
4. **检查资源配置**: 确认 R2 存储桶和密钥配置
5. **联系支持**: 提供错误日志和配置信息

### 常用管理命令总结

```bash
# 环境检查
npm run deploy:check:staging
npm run deploy:check:production

# 部署操作
npm run deploy:staging
npm run deploy:production
npm run deploy:dry-run

# 配置管理
npm run setup:r2
npm run setup:secrets
npm run setup:domains:staging
npm run setup:domains:production

# 监控和维护
npm run logs:staging
npm run logs:production
wrangler deployments list --name face-recog-api-prod
```

---

*最后更新: 2024-12-20*
*版本: 1.0.0* 