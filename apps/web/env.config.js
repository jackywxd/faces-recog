/**
 * 环境配置管理
 *
 * 根据构建环境设置相应的配置变量
 * 支持开发、测试、生产环境
 */

// 获取当前环境
const getEnvironment = () => {
  // 构建时环境（staging/production）
  if (process.env.NEXT_PUBLIC_ENV) {
    return process.env.NEXT_PUBLIC_ENV;
  }

  // 运行时环境判断
  if (process.env.NODE_ENV === "production") {
    return "production";
  }

  return "development";
};

// 环境配置
const configs = {
  development: {
    // 应用信息
    APP_NAME: "Photo Face Recognition (Dev)",
    APP_DESCRIPTION: "基于 AI 的照片人脸识别系统 - 开发环境",
    APP_VERSION: "1.0.0-dev",

    // API 配置
    API_BASE_URL: "http://localhost:8787",
    API_TIMEOUT: 30000,

    // 文件上传配置
    MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
    SUPPORTED_FORMATS: ["image/jpeg", "image/png", "image/webp"],

    // 功能开关
    ENABLE_DEBUG: true,
    ENABLE_ANALYTICS: false,
    ENABLE_ERROR_TRACKING: false,

    // UI 配置
    DEFAULT_THEME: "light",
    ANIMATION_ENABLED: true,
  },

  staging: {
    // 应用信息
    APP_NAME: "Photo Face Recognition (Staging)",
    APP_DESCRIPTION: "基于 AI 的照片人脸识别系统 - 测试环境",
    APP_VERSION: "1.0.0-staging",

    // API 配置
    API_BASE_URL: "https://face-recog-api-staging.small-tooth-cc10.workers.dev",
    API_TIMEOUT: 30000,

    // 文件上传配置
    MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
    SUPPORTED_FORMATS: ["image/jpeg", "image/png", "image/webp"],

    // 功能开关
    ENABLE_DEBUG: false,
    ENABLE_ANALYTICS: true,
    ENABLE_ERROR_TRACKING: true,

    // UI 配置
    DEFAULT_THEME: "light",
    ANIMATION_ENABLED: true,

    // 监控配置
    SENTRY_DSN: process.env.NEXT_PUBLIC_SENTRY_DSN || "",
    ANALYTICS_ID: process.env.NEXT_PUBLIC_ANALYTICS_ID || "",
  },

  production: {
    // 应用信息
    APP_NAME: "Photo Face Recognition",
    APP_DESCRIPTION: "基于 AI 的照片人脸识别系统",
    APP_VERSION: "1.0.0",

    // API 配置
    API_BASE_URL: "https://api.colorsofthewind.club",
    API_TIMEOUT: 30000,

    // 文件上传配置
    MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
    SUPPORTED_FORMATS: ["image/jpeg", "image/png", "image/webp"],

    // 功能开关
    ENABLE_DEBUG: false,
    ENABLE_ANALYTICS: true,
    ENABLE_ERROR_TRACKING: true,

    // UI 配置
    DEFAULT_THEME: "light",
    ANIMATION_ENABLED: true,

    // 监控配置
    SENTRY_DSN: process.env.NEXT_PUBLIC_SENTRY_DSN || "",
    ANALYTICS_ID: process.env.NEXT_PUBLIC_ANALYTICS_ID || "",

    // 性能配置
    ENABLE_SERVICE_WORKER: true,
    CACHE_STRATEGY: "stale-while-revalidate",
  },
};

// 获取当前环境配置
const environment = getEnvironment();
const config = configs[environment];

if (!config) {
  throw new Error(`Unknown environment: ${environment}`);
}

// 导出配置
module.exports = {
  environment,
  config,

  // 获取环境变量的便捷方法
  getConfig: (key) => config[key],

  // 检查是否为生产环境
  isProduction: () => environment === "production",

  // 检查是否为开发环境
  isDevelopment: () => environment === "development",

  // 检查是否为测试环境
  isStaging: () => environment === "staging",

  // 获取 API 基础 URL
  getApiBaseUrl: () => config.API_BASE_URL,

  // 获取应用信息
  getAppInfo: () => ({
    name: config.APP_NAME,
    description: config.APP_DESCRIPTION,
    version: config.APP_VERSION,
  }),

  // 获取文件上传配置
  getUploadConfig: () => ({
    maxFileSize: config.MAX_FILE_SIZE,
    supportedFormats: config.SUPPORTED_FORMATS,
  }),

  // 功能开关检查
  isFeatureEnabled: (feature) => {
    const featureKey = `ENABLE_${feature.toUpperCase()}`;
    return config[featureKey] || false;
  },
};
