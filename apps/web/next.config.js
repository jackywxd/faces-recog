const {
  config,
  environment,
  getAppInfo,
  getApiBaseUrl,
} = require("./env.config");

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Cloudflare Pages SSR 配置
  // 移除 output: "export" 以支持 SSR
  trailingSlash: true,
  skipTrailingSlashRedirect: true,

  // 图像优化配置
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },

  // 服务器外部包
  serverExternalPackages: [],

  // TypeScript 配置
  typescript: {
    tsconfigPath: "./tsconfig.json",
  },

  // 环境变量注入
  env: {
    // 应用信息
    NEXT_PUBLIC_APP_NAME: config.APP_NAME,
    NEXT_PUBLIC_APP_DESCRIPTION: config.APP_DESCRIPTION,
    NEXT_PUBLIC_APP_VERSION: config.APP_VERSION,
    NEXT_PUBLIC_ENVIRONMENT: environment,

    // API 配置
    NEXT_PUBLIC_API_BASE_URL: config.API_BASE_URL,
    NEXT_PUBLIC_API_TIMEOUT: config.API_TIMEOUT.toString(),

    // 文件上传配置
    NEXT_PUBLIC_MAX_FILE_SIZE: config.MAX_FILE_SIZE.toString(),
    NEXT_PUBLIC_SUPPORTED_FORMATS: config.SUPPORTED_FORMATS.join(","),

    // 功能开关
    NEXT_PUBLIC_ENABLE_DEBUG: config.ENABLE_DEBUG.toString(),
    NEXT_PUBLIC_ENABLE_ANALYTICS: config.ENABLE_ANALYTICS.toString(),
    NEXT_PUBLIC_ENABLE_ERROR_TRACKING: config.ENABLE_ERROR_TRACKING.toString(),

    // UI 配置
    NEXT_PUBLIC_DEFAULT_THEME: config.DEFAULT_THEME,
    NEXT_PUBLIC_ANIMATION_ENABLED: config.ANIMATION_ENABLED.toString(),
  },

  // 编译配置
  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
  },

  // 头部配置
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "origin-when-cross-origin",
          },
        ],
      },
    ];
  },

  // 重定向配置
  async redirects() {
    return [
      {
        source: "/home",
        destination: "/",
        permanent: true,
      },
    ];
  },
};

module.exports = nextConfig;
