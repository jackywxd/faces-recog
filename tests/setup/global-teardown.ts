import { FullConfig } from "@playwright/test";

/**
 * Playwright 全局清理
 * 在所有测试完成后执行，用于环境清理
 */
async function globalTeardown(config: FullConfig) {
  console.log("🧹 正在清理测试环境...");

  // 清理测试数据
  await cleanupTestData();

  // 清理临时文件
  await cleanupTempFiles();

  // 关闭浏览器实例
  await closeBrowserInstances();

  // 生成测试摘要
  await generateTestSummary();

  console.log("✅ 测试环境清理完成");
}

async function cleanupTestData() {
  try {
    console.log("🗑️ 清理测试数据...");

    // 如果是本地测试，清理本地数据
    if (process.env.TEST_ENV === "local") {
      // 清理本地数据库测试数据
      // 清理本地文件存储
    }

    // 清理临时上传的文件 (staging环境)
    if (process.env.TEST_ENV === "staging") {
      // 调用清理API或直接清理R2存储
      await cleanupStagingData();
    }

    console.log("✅ 测试数据清理完成");
  } catch (error) {
    console.warn("⚠️ 测试数据清理失败:", error.message);
  }
}

async function cleanupStagingData() {
  const apiBaseUrl = process.env.API_BASE_URL;
  if (!apiBaseUrl) return;

  try {
    // 获取测试会话ID
    const sessionId = process.env.TEST_SESSION_ID;
    if (sessionId) {
      // 调用清理API (如果存在)
      const response = await fetch(`${apiBaseUrl}/api/cleanup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Test-Session": sessionId,
        },
        body: JSON.stringify({ sessionId }),
      });

      if (response.ok) {
        console.log("✅ Staging环境数据清理完成");
      } else {
        console.warn("⚠️ Staging环境数据清理失败");
      }
    }
  } catch (error) {
    console.warn("⚠️ 无法连接到清理API:", error.message);
  }
}

async function cleanupTempFiles() {
  const fs = await import("fs/promises");
  const path = await import("path");

  try {
    console.log("📁 清理临时文件...");

    const tempDirs = [
      "test-results/temp",
      "test-results/screenshots",
      "test-results/traces",
      "test-results/videos",
    ];

    for (const dir of tempDirs) {
      try {
        const fullPath = path.resolve(dir);
        const stats = await fs.stat(fullPath);

        if (stats.isDirectory()) {
          // 保留最近的文件，删除旧文件
          const files = await fs.readdir(fullPath);
          const now = Date.now();
          const maxAge = 24 * 60 * 60 * 1000; // 24小时

          for (const file of files) {
            const filePath = path.join(fullPath, file);
            const fileStats = await fs.stat(filePath);

            if (now - fileStats.mtime.getTime() > maxAge) {
              await fs.unlink(filePath);
            }
          }
        }
      } catch (error) {
        // 目录不存在或其他错误，跳过
      }
    }

    console.log("✅ 临时文件清理完成");
  } catch (error) {
    console.warn("⚠️ 临时文件清理失败:", error.message);
  }
}

async function closeBrowserInstances() {
  try {
    console.log("🌐 关闭浏览器实例...");

    // 如果有共享的浏览器实例，在这里关闭
    // 这里可以添加任何需要手动关闭的资源

    console.log("✅ 浏览器实例关闭完成");
  } catch (error) {
    console.warn("⚠️ 浏览器实例关闭失败:", error.message);
  }
}

async function generateTestSummary() {
  const fs = await import("fs/promises");
  const path = await import("path");

  try {
    console.log("📊 生成测试摘要...");

    const summaryPath = path.resolve("test-results/summary.json");
    const summary = {
      timestamp: new Date().toISOString(),
      environment: process.env.TEST_ENV || "local",
      sessionId: process.env.TEST_SESSION_ID,
      playwright: {
        version:
          process.env.npm_package_dependencies__playwright_test || "unknown",
      },
      system: {
        platform: process.platform,
        nodeVersion: process.version,
        ci: !!process.env.CI,
      },
    };

    await fs.mkdir(path.dirname(summaryPath), { recursive: true });
    await fs.writeFile(summaryPath, JSON.stringify(summary, null, 2));

    console.log("✅ 测试摘要生成完成");
  } catch (error) {
    console.warn("⚠️ 测试摘要生成失败:", error.message);
  }
}

export default globalTeardown;
