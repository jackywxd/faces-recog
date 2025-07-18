import { test, expect } from "@playwright/test";

/**
 * 迭代 1: 基础架构测试
 * 对应任务清单中的 5 个测试用例
 */
test.describe("迭代 1: 文件上传功能", () => {
  test.beforeEach(async ({ page }) => {
    // 导航到主页
    await page.goto("/");
    await page.waitForLoadState("networkidle");
  });

  test("1.1: 文件选择和上传流程", async ({ page }) => {
    // 验证上传界面存在
    const uploadArea = page.locator('[data-testid="upload-area"]');
    await expect(uploadArea).toBeVisible();

    // 验证上传区域显示正确提示
    await expect(uploadArea).toContainText("拖拽图片到此处或点击选择");

    // 模拟文件选择
    const fileInput = page.locator('input[type="file"]');
    await expect(fileInput).toBeVisible();

    // 上传测试图片
    await fileInput.setInputFiles("./tests/assets/sample-face.jpg");

    // 验证文件预览显示
    const preview = page.locator('[data-testid="file-preview"]');
    await expect(preview).toBeVisible({ timeout: 5000 });

    // 验证文件信息显示
    const fileName = page.locator('[data-testid="file-name"]');
    await expect(fileName).toContainText("sample-face.jpg");

    // 点击上传按钮
    const uploadButton = page.locator('[data-testid="upload-button"]');
    await expect(uploadButton).toBeEnabled();
    await uploadButton.click();

    // 验证上传成功消息
    const successMessage = page.locator('[data-testid="upload-success"]');
    await expect(successMessage).toBeVisible({ timeout: 15000 });
    await expect(successMessage).toContainText("上传成功");

    // 验证返回作业ID
    const jobId = page.locator('[data-testid="job-id"]');
    await expect(jobId).toBeVisible();
    await expect(jobId).toHaveAttribute("data-job-id", /.+/);
  });

  test("1.2: 上传进度显示验证", async ({ page }) => {
    // 上传较大的文件以观察进度
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles("./tests/assets/large-image.jpg");

    const uploadButton = page.locator('[data-testid="upload-button"]');
    await uploadButton.click();

    // 验证进度条显示
    const progressBar = page.locator('[data-testid="progress-bar"]');
    await expect(progressBar).toBeVisible({ timeout: 3000 });

    // 验证进度百分比更新
    const progressText = page.locator('[data-testid="progress-text"]');
    await expect(progressText).toBeVisible();
    await expect(progressText).toContainText("%");

    // 验证进度从 0% 开始
    await expect(progressText).toContainText("0%");

    // 等待进度更新
    await page.waitForFunction(
      () => {
        const progressElement = document.querySelector(
          '[data-testid="progress-text"]'
        );
        return progressElement && !progressElement.textContent?.includes("0%");
      },
      { timeout: 10000 }
    );

    // 验证最终完成状态
    await expect(progressText).toContainText("100%", { timeout: 30000 });

    // 验证进度条消失或显示完成状态
    const completionStatus = page.locator('[data-testid="upload-complete"]');
    await expect(completionStatus).toBeVisible({ timeout: 5000 });
  });

  test("1.3: 文件格式和大小验证", async ({ page }) => {
    // 测试不支持的文件格式
    const fileInput = page.locator('input[type="file"]');

    // 上传 PDF 文件（不支持的格式）
    await fileInput.setInputFiles("./tests/assets/invalid-file.txt");

    // 验证格式错误提示
    const formatError = page.locator('[data-testid="format-error"]');
    await expect(formatError).toBeVisible({ timeout: 5000 });
    await expect(formatError).toContainText("不支持的文件格式");

    // 验证支持的格式列表显示
    const supportedFormats = page.locator('[data-testid="supported-formats"]');
    await expect(supportedFormats).toBeVisible();
    await expect(supportedFormats).toContainText("JPG, PNG, WebP");

    // 清除错误状态
    const clearButton = page.locator('[data-testid="clear-file"]');
    if (await clearButton.isVisible()) {
      await clearButton.click();
    }

    // 测试文件过大情况
    // 注意：这里假设有一个超过限制的测试文件
    await fileInput.setInputFiles("./tests/assets/large-image.jpg");

    // 如果文件确实过大，验证大小错误
    const sizeError = page.locator('[data-testid="size-error"]');
    if (await sizeError.isVisible({ timeout: 3000 })) {
      await expect(sizeError).toContainText("文件过大");
      await expect(sizeError).toContainText("最大");
    }

    // 测试正常文件格式
    await fileInput.setInputFiles("./tests/assets/sample-face.jpg");

    // 验证没有错误提示
    await expect(formatError).not.toBeVisible();
    const uploadButton = page.locator('[data-testid="upload-button"]');
    await expect(uploadButton).toBeEnabled();
  });

  test("1.4: 错误处理和用户提示", async ({ page }) => {
    // 模拟网络错误 - 拦截上传请求
    await page.route("**/api/upload", (route) => {
      route.abort("failed");
    });

    // 执行上传操作
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles("./tests/assets/sample-face.jpg");

    const uploadButton = page.locator('[data-testid="upload-button"]');
    await uploadButton.click();

    // 验证网络错误提示
    const networkError = page.locator('[data-testid="network-error"]');
    await expect(networkError).toBeVisible({ timeout: 10000 });
    await expect(networkError).toContainText("网络连接失败");

    // 验证重试按钮出现
    const retryButton = page.locator('[data-testid="retry-button"]');
    await expect(retryButton).toBeVisible();
    await expect(retryButton).toBeEnabled();

    // 恢复网络并测试重试
    await page.unroute("**/api/upload");
    await retryButton.click();

    // 验证重试后成功
    const successMessage = page.locator('[data-testid="upload-success"]');
    await expect(successMessage).toBeVisible({ timeout: 15000 });

    // 测试服务器错误
    await page.route("**/api/upload", (route) => {
      route.fulfill({
        status: 500,
        body: JSON.stringify({ error: "服务器内部错误" }),
      });
    });

    // 重新上传触发服务器错误
    await fileInput.setInputFiles("./tests/assets/sample-face.jpg");
    await uploadButton.click();

    // 验证服务器错误提示
    const serverError = page.locator('[data-testid="server-error"]');
    await expect(serverError).toBeVisible({ timeout: 10000 });
    await expect(serverError).toContainText("服务器错误");
  });

  test("1.5: R2 存储验证和 URL 生成", async ({ page }) => {
    // 正常上传流程
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles("./tests/assets/sample-face.jpg");

    const uploadButton = page.locator('[data-testid="upload-button"]');
    await uploadButton.click();

    // 等待上传完成
    const successMessage = page.locator('[data-testid="upload-success"]');
    await expect(successMessage).toBeVisible({ timeout: 30000 });

    // 验证返回的文件 URL
    const fileUrl = page.locator('[data-testid="file-url"]');
    await expect(fileUrl).toBeVisible();

    // 验证 URL 格式正确（Cloudflare R2 或本地存储）
    const urlText = await fileUrl.textContent();
    expect(urlText).toMatch(/^https?:\/\/.+/);

    // 验证 URL 包含预期的域名或路径
    if (process.env.NODE_ENV === "production") {
      expect(urlText).toContain("cloudflare");
    } else {
      expect(urlText).toMatch(/localhost|127\.0\.0\.1/);
    }

    // 验证文件可访问性
    const response = await page.request.get(urlText!);
    expect(response.status()).toBe(200);

    // 验证文件类型正确
    const contentType = response.headers()["content-type"];
    expect(contentType).toMatch(/image\/(jpeg|jpg|png|webp)/);

    // 验证缩略图 URL（如果有）
    const thumbnailUrl = page.locator('[data-testid="thumbnail-url"]');
    if (await thumbnailUrl.isVisible()) {
      const thumbUrlText = await thumbnailUrl.textContent();
      expect(thumbUrlText).toMatch(/^https?:\/\/.+/);

      const thumbResponse = await page.request.get(thumbUrlText!);
      expect(thumbResponse.status()).toBe(200);
    }

    // 验证文件元数据
    const fileMetadata = page.locator('[data-testid="file-metadata"]');
    await expect(fileMetadata).toBeVisible();

    // 验证显示文件大小
    const fileSize = page.locator('[data-testid="file-size"]');
    await expect(fileSize).toBeVisible();
    await expect(fileSize).toContainText("KB");

    // 验证显示文件尺寸
    const fileDimensions = page.locator('[data-testid="file-dimensions"]');
    await expect(fileDimensions).toBeVisible();
    await expect(fileDimensions).toContainText("x"); // 格式如 "1920x1080"
  });

  test.afterEach(async ({ page }) => {
    // 清理：删除测试上传的文件（如果有清理接口）
    const jobId = await page
      .locator('[data-testid="job-id"]')
      .getAttribute("data-job-id");
    if (jobId) {
      // 调用清理 API（如果实现了）
      try {
        await page.request.delete(`/api/cleanup/${jobId}`);
      } catch (error) {
        console.warn("清理失败，可能是接口未实现:", error);
      }
    }
  });
});
