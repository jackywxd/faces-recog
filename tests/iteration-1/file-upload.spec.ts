import { test, expect } from "@playwright/test";
import { testImages } from "../fixtures/test-data";

test.describe("迭代 1: 文件上传功能", () => {
  test.beforeEach(async ({ page }) => {
    // 导航到上传页面而不是首页
    await page.goto("/upload");
    await page.waitForLoadState("networkidle");
  });

  test("1.1: 文件选择和上传流程", async ({ page }) => {
    // 验证上传界面存在 - 使用正确的选择器
    const uploadArea = page.locator(".upload-area");
    await expect(uploadArea).toBeVisible();

    // 验证上传区域显示正确提示
    await expect(uploadArea).toContainText("选择或拖拽照片到此处");

    // 模拟文件选择
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(testImages.validJpeg);

    // 验证文件预览显示
    const filePreview = page.locator(
      ".flex.items-center.gap-3.p-3.border.rounded-lg"
    );
    await expect(filePreview).toBeVisible();

    // 验证文件信息显示
    await expect(page.locator("text=sample-face.jpg")).toBeVisible();

    // 点击上传按钮
    const uploadButton = page.locator('button:has-text("开始人脸识别")');
    await uploadButton.click();

    // 验证上传状态变化
    await expect(page.locator("text=上传中...")).toBeVisible({
      timeout: 10000,
    });
  });

  test("1.2: 上传进度显示验证", async ({ page }) => {
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(testImages.largeImage);

    const uploadButton = page.locator('button:has-text("开始人脸识别")');
    await uploadButton.click();

    // 验证进度条显示
    const progressBar = page.locator(".h-1"); // Progress组件
    await expect(progressBar).toBeVisible();

    // 验证进度百分比更新 - 使用更精确的选择器
    const progressText = page.locator('[data-testid="upload-progress"]');
    await expect(progressText).toBeVisible();
  });

  test("1.3: 文件格式和大小验证", async ({ page }) => {
    // 测试不支持的文件格式
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(testImages.invalidFormat);

    // 验证错误提示显示
    const errorMessage = page.locator("text=不支持的文件格式");
    await expect(errorMessage).toBeVisible();

    // 测试文件过大
    await fileInput.setInputFiles(testImages.largeImage);
    const sizeError = page.locator("text=文件过大");
    await expect(sizeError).toBeVisible();
  });

  test("1.4: 错误处理和用户提示", async ({ page }) => {
    // 模拟网络错误
    await page.route("**/api/upload", (route) => route.abort());

    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(testImages.validJpeg);

    const uploadButton = page.locator('button:has-text("开始人脸识别")');
    await uploadButton.click();

    // 验证错误提示
    const errorMessage = page.locator("text=上传失败");
    await expect(errorMessage).toBeVisible();
  });

  test("1.5: R2 存储验证和 URL 生成", async ({ page }) => {
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(testImages.validJpeg);

    const uploadButton = page.locator('button:has-text("开始人脸识别")');
    await uploadButton.click();

    // 等待上传完成
    const successMessage = page.locator("text=已完成");
    await expect(successMessage).toBeVisible({ timeout: 15000 });

    // 验证返回的文件 URL
    const fileUrl = page.locator("text=/https:\\/\\//");
    await expect(fileUrl).toBeVisible();

    // 验证文件可访问
    const urlText = await fileUrl.textContent();
    if (urlText) {
      const response = await page.request.get(urlText);
      expect(response.status()).toBe(200);
    }
  });

  test.afterEach(async ({ page }) => {
    // 清理：删除测试上传的文件（如果有清理接口）
    try {
      const jobId = await page
        .locator("[data-job-id]")
        .getAttribute("data-job-id");
      if (jobId) {
        // 调用清理 API（如果实现了）
        await page.request.delete(`/api/cleanup/${jobId}`);
      }
    } catch (error) {
      // 清理失败不影响测试结果
      console.log("清理测试数据失败:", error);
    }
  });
});
