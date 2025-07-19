export const config = {
  // 服务器配置
  port: parseInt(process.env.PORT || "8080", 10),
  nodeEnv: process.env.NODE_ENV || "development",
  environment: process.env.NODE_ENV || "development",
  version: process.env.npm_package_version || "1.0.0",

  // CORS 配置
  corsOrigins: process.env.CORS_ORIGINS?.split(",") || [
    "http://localhost:3000",
    "http://localhost:3001",
  ],
  allowedOrigins: process.env.CORS_ORIGINS?.split(",") || [
    "http://localhost:3000",
    "http://localhost:3001",
  ],

  // 面部检测配置
  faceDetection: {
    minConfidence: parseFloat(
      process.env.FACE_DETECTION_MIN_CONFIDENCE || "0.5"
    ),
    maxFaces: parseInt(process.env.FACE_DETECTION_MAX_FACES || "10", 10),
    modelPath: process.env.FACE_DETECTION_MODEL_PATH || "./models",
    enableLandmarks: process.env.FACE_DETECTION_ENABLE_LANDMARKS === "true",
    enableDescriptors: process.env.FACE_DETECTION_ENABLE_DESCRIPTORS === "true",
  },

  // 图像处理配置
  imageProcessing: {
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE || "10485760", 10), // 10MB
    allowedFormats: ["image/jpeg", "image/png", "image/webp"],
    thumbnailSize: parseInt(process.env.THUMBNAIL_SIZE || "300", 10),
    quality: parseInt(process.env.IMAGE_QUALITY || "80", 10),
  },

  // 日志配置
  logging: {
    level: process.env.LOG_LEVEL || "info",
    format: process.env.LOG_FORMAT || "json",
  },
} as const;

export type Config = typeof config;
