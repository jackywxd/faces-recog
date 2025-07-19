import { test, expect } from "@playwright/test";

test.describe("迭代 1: 核心功能验证", () => {
  test("验证前端应用可访问", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/人脸识别/);

    // 验证页面标题存在
    const title = page.locator("h1");
    await expect(title).toContainText("AI 照片人脸识别");
  });

  test("验证API服务可访问", async ({ page }) => {
    // 使用环境变量中的API URL，如果没有则使用默认值
    const apiBaseUrl = process.env.API_BASE_URL || "http://localhost:8787";
    const healthUrl = `${apiBaseUrl}/api/health`;

    console.log(`正在检查API健康状态: ${healthUrl}`);
    console.log(`环境变量 API_BASE_URL: ${process.env.API_BASE_URL}`);
    console.log(`环境变量 TEST_ENV: ${process.env.TEST_ENV}`);

    try {
      const response = await page.request.get(healthUrl);
      expect(response.status()).toBe(200);

      const data = await response.json();
      expect(data.status).toBe("healthy");
    } catch (error) {
      console.error(`API请求失败: ${error.message}`);
      console.error(`请求URL: ${healthUrl}`);
      throw error;
    }
  });

  test("验证文件上传界面", async ({ page }) => {
    await page.goto("/upload");

    // 验证上传区域
    const uploadArea = page.locator(".upload-area");
    await expect(uploadArea).toBeVisible();
    await expect(uploadArea).toContainText("选择或拖拽照片到此处");

    // 验证文件输入存在（但隐藏，这是正常的设计）
    const fileInput = page.locator('input[type="file"]');
    await expect(fileInput).toBeAttached();
  });

  test("验证错误处理组件", async ({ page }) => {
    await page.goto("/error-demo");

    // 验证错误演示页面存在
    const errorDemo = page.locator("h1");
    await expect(errorDemo).toContainText("错误处理演示");
  });
});
