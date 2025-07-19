# 使用 Node.js 18 Alpine 作为基础镜像
FROM node:18-alpine

# 设置工作目录
WORKDIR /app

# 安装系统依赖（Canvas 和 Sharp 需要）
RUN apk add --no-cache \
    cairo-dev \
    jpeg-dev \
    pango-dev \
    musl-dev \
    giflib-dev \
    pixman-dev \
    pangomm-dev \
    libjpeg-turbo-dev \
    freetype-dev \
    && rm -rf /var/cache/apk/*

# 复制 package.json 和 pnpm-lock.yaml
COPY package*.json ./
COPY pnpm-lock.yaml ./

# 安装 pnpm
RUN npm install -g pnpm

# 安装依赖
RUN pnpm install --frozen-lockfile

# 复制源代码
COPY src/ ./src/
COPY tsconfig.json ./

# 构建应用
RUN pnpm run build

# 创建模型目录
RUN mkdir -p models

# 下载 face-api.js 模型文件
RUN wget -O models/tiny_face_detector_model-weights_manifest.json \
    https://raw.githubusercontent.com/vladmandic/face-api/master/model/tiny_face_detector_model-weights_manifest.json
RUN wget -O models/tiny_face_detector_model-shard1 \
    https://raw.githubusercontent.com/vladmandic/face-api/master/model/tiny_face_detector_model-shard1
RUN wget -O models/face_landmark_68_model-weights_manifest.json \
    https://raw.githubusercontent.com/vladmandic/face-api/master/model/face_landmark_68_model-weights_manifest.json
RUN wget -O models/face_landmark_68_model-shard1 \
    https://raw.githubusercontent.com/vladmandic/face-api/master/model/face_landmark_68_model-shard1
RUN wget -O models/face_recognition_model-weights_manifest.json \
    https://raw.githubusercontent.com/vladmandic/face-api/master/model/face_recognition_model-weights_manifest.json
RUN wget -O models/face_recognition_model-shard1 \
    https://raw.githubusercontent.com/vladmandic/face-api/master/model/face_recognition_model-shard1

# 创建非 root 用户
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001

# 更改文件所有权
RUN chown -R nodejs:nodejs /app
USER nodejs

# 暴露端口
EXPOSE 8080

# 健康检查
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:8080/health || exit 1

# 启动应用
CMD ["node", "dist/server.js"] 