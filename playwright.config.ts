import { defineConfig, devices } from "@playwright/test";

/**
 * Playwright 配置 - 人脸识别系统自动化测试
 * 支持 MCP (Model Context Protocol) 集成，可在 Cursor 中直接执行
 */
export default defineConfig({
  // 测试目录
  testDir: "./tests",

  // 并行执行配置
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,

  // 测试超时配置
  timeout: 30000,
  expect: {
    timeout: 5000,
  },

  // 报告配置 - 支持多种格式用于 Cursor 集成
  reporter: [
    ["html", { outputFolder: "playwright-report" }],
    ["json", { outputFile: "test-results/test-results.json" }],
    ["junit", { outputFile: "test-results/junit.xml" }],
    ["line"],
    // 自定义报告器用于 MCP 集成
    ["./tests/reporters/mcp-reporter.ts"],
  ],

  // 全局测试配置
  use: {
    // 基础 URL
    baseURL: process.env.TEST_BASE_URL || "http://localhost:3000",

    // 调试和记录
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "retain-on-failure",

    // 浏览器配置
    headless: process.env.CI ? true : false,

    // 自定义 HTTP 头
    extraHTTPHeaders: {
      "X-Test-Source": "playwright-mcp",
      "X-Test-Session": process.env.TEST_SESSION_ID || "local",
    },
  },

  // 多浏览器测试项目配置
  projects: [
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        // Chrome 特定配置
        launchOptions: {
          args: [
            "--disable-web-security",
            "--disable-features=VizDisplayCompositor",
          ],
        },
      },
    },
    {
      name: "firefox",
      use: { ...devices["Desktop Firefox"] },
    },
    {
      name: "webkit",
      use: { ...devices["Desktop Safari"] },
    },
    {
      name: "mobile-chrome",
      use: { ...devices["Pixel 5"] },
    },
    {
      name: "mobile-safari",
      use: { ...devices["iPhone 12"] },
    },

    // API 测试项目
    {
      name: "api",
      testDir: "./tests/api",
      use: {
        baseURL: process.env.API_BASE_URL || "http://localhost:8787",
      },
    },
  ],

  // Web 服务器配置（用于本地开发）
  // 在CI环境中禁用webServer，由GitHub Actions手动管理
  ...(process.env.CI
    ? {}
    : {
        webServer: [
          {
            command: "pnpm run dev:web",
            port: 3000,
            reuseExistingServer: true,
            timeout: 120000,
          },
          {
            command: "pnpm run dev:api",
            port: 8787,
            reuseExistingServer: true,
            timeout: 120000,
          },
        ],
      }),

  // 全局设置和清理
  globalSetup: "./tests/setup/global-setup.ts",
  globalTeardown: "./tests/setup/global-teardown.ts",
});

// 环境变量配置
declare global {
  namespace NodeJS {
    interface ProcessEnv {
      TEST_BASE_URL?: string;
      API_BASE_URL?: string;
      TEST_SESSION_ID?: string;
      CLOUDFLARE_API_TOKEN?: string;
      CLOUDFLARE_ACCOUNT_ID?: string;
    }
  }
}
