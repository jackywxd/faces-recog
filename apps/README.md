# Applications (apps/)

本目录包含项目的主要应用程序：

## 📁 目录结构

### apps/web
- **技术栈**: Next.js 15 (App Router) + TypeScript
- **UI 组件**: shadcn/ui + Tailwind CSS
- **部署平台**: Cloudflare Pages
- **功能**: 用户界面，文件上传，结果展示

### apps/api  
- **技术栈**: Hono + TypeScript
- **部署平台**: Cloudflare Workers
- **功能**: API 服务器，业务逻辑，数据处理

### apps/face-detector
- **技术栈**: Node.js + @vladmandic/face-api
- **部署平台**: Cloudflare Containers
- **功能**: 容器化人脸检测服务，AI 模型推理

## 🔗 应用间通信

```
用户 → apps/web → apps/api → apps/face-detector
                     ↓
              Cloudflare D1 + R2
``` 