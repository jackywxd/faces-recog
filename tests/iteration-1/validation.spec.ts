import { test, expect } from "@playwright/test";

test.describe("迭代 1: 核心功能验证", () => {
  test("验证前端应用可访问", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/人脸识别/);

    // 验证上传组件存在
    const uploadArea = page.locator(".upload-area");
    await expect(uploadArea).toBeVisible();
  });

  test("验证API服务可访问", async ({ page }) => {
    const response = await page.request.get("http://localhost:8787/api/health");
    expect(response.status()).toBe(200);

    const data = await response.json();
    expect(data.status).toBe("healthy");
  });

  test("验证文件上传界面", async ({ page }) => {
    await page.goto("/");

    // 验证上传区域
    const uploadArea = page.locator(".upload-area");
    await expect(uploadArea).toBeVisible();
    await expect(uploadArea).toContainText("选择或拖拽照片到此处");

    // 验证文件输入
    const fileInput = page.locator('input[type="file"]');
    await expect(fileInput).toBeVisible();
  });

  test("验证错误处理组件", async ({ page }) => {
    await page.goto("/error-demo");

    // 验证错误边界组件
    const errorBoundary = page.locator("[data-testid='error-boundary']");
    await expect(errorBoundary).toBeVisible();
  });
});
