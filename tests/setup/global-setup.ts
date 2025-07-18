import { chromium, FullConfig } from "@playwright/test";

/**
 * Playwright 全局设置
 * 在所有测试开始前执行，用于环境初始化
 */
async function globalSetup(config: FullConfig) {
  console.log("🔧 正在初始化测试环境...");

  // 检查测试服务是否可用
  await checkServices();

  // 设置测试数据
  await setupTestData();

  // 初始化浏览器实例（用于共享）
  await initializeBrowser();

  console.log("✅ 测试环境初始化完成");
}

async function checkServices() {
  const services = [
    {
      name: "Web 应用",
      url: process.env.TEST_BASE_URL || "http://localhost:3000",
    },
    {
      name: "API 服务",
      url: process.env.API_BASE_URL || "http://localhost:8787",
    },
  ];

  for (const service of services) {
    try {
      const response = await fetch(service.url);
      if (response.ok) {
        console.log(`✅ ${service.name} 运行正常 (${service.url})`);
      } else {
        console.warn(`⚠️ ${service.name} 响应异常: ${response.status}`);
      }
    } catch (error) {
      console.error(
        `❌ ${service.name} 连接失败 (${service.url}):`,
        error.message
      );
      // 在 CI 环境中，服务连接失败应该导致测试失败
      if (process.env.CI) {
        throw new Error(`测试环境检查失败: ${service.name} 不可用`);
      }
    }
  }
}

async function setupTestData() {
  console.log("📁 设置测试数据...");

  // 创建测试用的图片文件（如果不存在）
  const testAssetsDir = "./tests/assets";
  const fs = await import("fs");
  const path = await import("path");

  if (!fs.existsSync(testAssetsDir)) {
    fs.mkdirSync(testAssetsDir, { recursive: true });
  }

  // 确保测试图片存在
  const testImages = [
    "sample-face.jpg",
    "group-photo.jpg",
    "no-face-landscape.jpg",
    "large-image.jpg",
    "invalid-file.txt",
  ];

  for (const image of testImages) {
    const imagePath = path.join(testAssetsDir, image);
    if (!fs.existsSync(imagePath)) {
      console.log(`⚠️ 测试图片不存在: ${image}`);
      // 在实际项目中，这里应该创建或下载测试图片
    }
  }

  console.log("✅ 测试数据设置完成");
}

async function initializeBrowser() {
  console.log("🌐 初始化浏览器实例...");

  // 预热浏览器（可选）
  const browser = await chromium.launch();
  const page = await browser.newPage();

  // 预加载首页以减少后续测试的冷启动时间
  try {
    await page.goto(process.env.TEST_BASE_URL || "http://localhost:3000", {
      waitUntil: "networkidle",
      timeout: 10000,
    });
    console.log("✅ 浏览器预热完成");
  } catch (error) {
    console.warn("⚠️ 浏览器预热失败:", error.message);
  }

  await browser.close();
}

export default globalSetup;
