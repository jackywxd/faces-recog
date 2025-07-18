# 人脸识别系统前端 - Cloudflare Pages 部署指南

本文档描述了如何部署和配置人脸识别系统的前端应用到 Cloudflare Pages 平台。

## 📋 目录

- [快速开始](#-快速开始)
- [环境配置](#-环境配置)  
- [部署流程](#-部署流程)
- [域名配置](#-域名配置)
- [监控和维护](#-监控和维护)
- [故障排除](#-故障排除)

## 🚀 快速开始

### 前置要求

1. **Node.js** ≥ 18.0.0
2. **npm** ≥ 9.0.0
3. **Wrangler CLI** ≥ 3.0.0
4. **Cloudflare 账户** 且已登录

### 一键部署检查

```bash
# 检查测试环境部署就绪状态
npm run deploy:check:staging

# 检查生产环境部署就绪状态  
npm run deploy:check:production
```

## 🌐 环境配置

### 环境列表

| 环境 | 描述 | 域名 | 项目名称 |
|------|------|------|----------|
| **Development** | 本地开发 | localhost:3000 | - |
| **Staging** | 测试环境 | pages-staging.face-recog.com | face-recog-staging |
| **Production** | 生产环境 | face-recog.com | face-recog-production |

### 配置文件

- `env.config.js` - 环境变量管理
- `next.config.js` - Next.js 配置
- `pages.config.json` - Cloudflare Pages 配置
- `scripts/deploy-pages.cjs` - 自动化部署脚本

### 环境变量

#### 开发环境
```javascript
{
  APP_NAME: 'Photo Face Recognition (Dev)',
  API_BASE_URL: 'http://localhost:8787',
  ENABLE_DEBUG: true,
  ENABLE_ANALYTICS: false
}
```

#### 测试环境
```javascript
{
  APP_NAME: 'Photo Face Recognition (Staging)',
  API_BASE_URL: 'https://api-staging.face-recog.com',
  ENABLE_DEBUG: false,
  ENABLE_ANALYTICS: true
}
```

#### 生产环境
```javascript
{
  APP_NAME: 'Photo Face Recognition',
  API_BASE_URL: 'https://api.face-recog.com',
  ENABLE_DEBUG: false,
  ENABLE_ANALYTICS: true,
  ENABLE_SERVICE_WORKER: true
}
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

#### 安装依赖
```bash
# 安装项目依赖
npm install

# 检查依赖完整性
npm audit
```

### 2. 部署前检查

```bash
# 测试环境检查
npm run deploy:check:staging

# 生产环境检查
npm run deploy:check:production
```

**检查项目：**
- ✅ 环境变量配置
- ✅ 项目依赖完整性  
- ✅ 构建配置验证
- ✅ 环境配置文件
- ✅ 构建脚本存在性

### 3. 构建和部署

#### 测试环境
```bash
# 预览构建
npm run build:staging

# 预览部署 (不影响生产)
npm run deploy:preview:staging

# 正式部署到测试环境
npm run deploy:staging
```

#### 生产环境
```bash
# 预览构建
npm run build:production

# 预览部署 (不影响生产)
npm run deploy:preview:production

# 正式部署到生产环境
npm run deploy:production
```

### 4. 部署验证

```bash
# 查看 Pages 项目列表
wrangler pages project list

# 查看部署历史
wrangler pages deployment list --project-name=face-recog-production

# 测试访问
curl -I https://face-recog.com
```

## 🌐 域名配置

### 自定义域名设置

#### 1. DNS 配置
在 Cloudflare DNS 中添加记录：

```dns
# 主域名
A    face-recog.com         192.0.2.1
AAAA face-recog.com         2001:db8::1

# WWW 子域名
CNAME www.face-recog.com   face-recog.com

# 测试环境
CNAME pages-staging.face-recog.com  face-recog-staging.pages.dev
```

#### 2. Pages 项目域名配置
```bash
# 添加自定义域名
wrangler pages domain add face-recog.com --project-name=face-recog-production

# 添加 WWW 重定向
wrangler pages domain add www.face-recog.com --project-name=face-recog-production
```

### SSL/TLS 配置

Pages 自动提供免费的 SSL 证书，支持：
- **Let's Encrypt** 通配符证书
- **自动续期**
- **HTTP 到 HTTPS 重定向**

## 📊 监控和维护

### 性能监控

#### Cloudflare Analytics
```bash
# 查看 Pages 分析数据
wrangler pages analytics --project-name=face-recog-production

# 查看访问统计
wrangler pages analytics --project-name=face-recog-production --since=24h
```

#### Core Web Vitals
监控关键性能指标：
- **LCP** (Largest Contentful Paint) < 2.5s
- **FID** (First Input Delay) < 100ms
- **CLS** (Cumulative Layout Shift) < 0.1

### 部署管理

#### 查看部署状态
```bash
# 列出所有部署
wrangler pages deployment list --project-name=face-recog-production

# 查看特定部署详情
wrangler pages deployment get [deployment-id] --project-name=face-recog-production
```

#### 回滚部署
```bash
# 回滚到前一个版本
wrangler pages deployment rollback [deployment-id] --project-name=face-recog-production
```

### 日志查看

```bash
# 查看构建日志 (通过 Cloudflare Dashboard)
# https://dash.cloudflare.com -> Pages -> [project] -> Deployments

# 查看实时访问日志 (需要配置 Logpush)
wrangler logpush list
```

## 🐛 故障排除

### 常见问题

#### 1. 构建失败

**问题**: Next.js 构建错误
```bash
❌ 项目构建失败: Build failed with exit code 1
```

**解决方案**:
```bash
# 检查 TypeScript 错误
npm run type-check

# 检查 ESLint 错误  
npm run lint

# 清理缓存重新构建
rm -rf .next out node_modules
npm install
npm run build:staging
```

#### 2. 环境变量问题

**问题**: API_BASE_URL 未正确设置
```bash
❌ 环境配置文件不存在: env.config.js
```

**解决方案**:
```bash
# 检查环境配置文件
ls -la env.config.js

# 验证环境变量
node -e "console.log(require('./env.config.js').config)"
```

#### 3. 部署权限问题

**问题**: Cloudflare API Token 权限不足
```bash
❌ 缺少必需的环境变量: CLOUDFLARE_API_TOKEN
```

**解决方案**:
```bash
# 重新设置 API Token
export CLOUDFLARE_API_TOKEN="your-new-token"

# 验证权限
wrangler whoami

# 检查 Pages 权限
wrangler pages project list
```

#### 4. 域名访问问题

**问题**: 自定义域名无法访问

**排查步骤**:
1. 检查 DNS 解析
2. 验证 SSL 证书状态
3. 确认域名绑定正确

```bash
# 检查 DNS 解析
nslookup face-recog.com

# 检查 SSL 证书
curl -I https://face-recog.com

# 验证域名配置
wrangler pages domain list --project-name=face-recog-production
```

### 性能优化

#### 1. 图像优化
```javascript
// next.config.js
images: {
  unoptimized: true,  // Pages 不支持 Next.js 图像优化
  formats: ['image/webp', 'image/avif'],
  deviceSizes: [640, 750, 828, 1080, 1200, 1920],
}
```

#### 2. 缓存策略
```javascript
// pages.config.json
"headers": [
  {
    "source": "/_next/static/**/*",
    "headers": [
      {
        "key": "Cache-Control",
        "value": "public, max-age=31536000, immutable"
      }
    ]
  }
]
```

#### 3. 代码分割
```javascript
// 动态导入组件
const PhotoUpload = dynamic(() => import('../components/PhotoUpload'), {
  loading: () => <p>Loading...</p>,
  ssr: false
});
```

## 🔧 高级配置

### 环境变量管理

#### 开发环境
```bash
# .env.local
NEXT_PUBLIC_API_BASE_URL=http://localhost:8787
NEXT_PUBLIC_ENABLE_DEBUG=true
```

#### 生产环境密钥
```bash
# 通过 Cloudflare Dashboard 设置
# Pages -> [project] -> Settings -> Environment variables

NEXT_PUBLIC_SENTRY_DSN=https://...
NEXT_PUBLIC_ANALYTICS_ID=GA_MEASUREMENT_ID
```

### 自定义构建

#### 构建钩子
```json
{
  "build": {
    "command": "npm run build:production && npm run optimize",
    "publish": "out",
    "environment": {
      "NODE_VERSION": "18.17.0"
    }
  }
}
```

#### 预渲染配置
```javascript
// next.config.js
generateStaticParams: {
  // 静态路由预生成
  paths: ['/'],
  fallback: false
}
```

## 📚 相关文档

- [Cloudflare Pages 文档](https://developers.cloudflare.com/pages/)
- [Next.js 静态导出文档](https://nextjs.org/docs/app/building-your-application/deploying/static-exports)
- [Wrangler CLI 文档](https://developers.cloudflare.com/workers/wrangler/)
- [项目架构文档](../../design-document.md)

## 🆘 支持

如果遇到问题，请按以下顺序进行：

1. **检查部署状态**: `npm run deploy:check:production`
2. **查看构建日志**: Cloudflare Dashboard → Pages → Deployments
3. **验证环境配置**: 检查 `env.config.js` 和环境变量
4. **测试本地构建**: `npm run build:production`
5. **联系支持**: 提供构建日志和错误信息

---

*最后更新: 2024-12-20*
*版本: 1.0.0* 