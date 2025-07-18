/** @type {import('next').NextConfig} */
const nextConfig = {
  // Cloudflare Pages 配置
  output: "export",
  trailingSlash: true,
  skipTrailingSlashRedirect: true,
  distDir: "out",

  // 图像优化配置 (Cloudflare Pages 不支持 Next.js 图像优化)
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

  // 环境变量
  env: {
    NEXT_PUBLIC_APP_NAME: "Photo Face Recognition",
    NEXT_PUBLIC_APP_DESCRIPTION: "基于 AI 的照片人脸识别系统",
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
