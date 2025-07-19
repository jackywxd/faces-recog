import { test, expect } from "@playwright/test";
import { testImages } from "../fixtures/test-data";

test.describe("检测失败场景处理", () => {
  test("处理网络错误", async ({ page }) => {
    // 模拟网络错误
    await page.route("/api/detect-faces", (route) => {
      route.abort("failed");
    });

    await page.goto("/upload");
    await page.waitForLoadState("networkidle");

    // 上传图片
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(testImages.singleFace);

    const uploadButton = page.locator('button:has-text("开始人脸识别")');
    await uploadButton.click();

    // 验证错误信息显示
    await expect(page.locator("text=面部检测失败")).toBeVisible();
  });

  test("处理服务器错误", async ({ page }) => {
    // 模拟服务器错误
    await page.route("/api/detect-faces", (route) => {
      route.fulfill({
        status: 500,
        contentType: "application/json",
        body: JSON.stringify({ error: "Internal Server Error" }),
      });
    });

    await page.goto("/upload");
    await page.waitForLoadState("networkidle");

    // 上传图片
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(testImages.singleFace);

    const uploadButton = page.locator('button:has-text("开始人脸识别")');
    await uploadButton.click();

    // 验证错误信息显示
    await expect(page.locator("text=面部检测失败")).toBeVisible();
  });

  test("处理超时错误", async ({ page }) => {
    // 模拟超时
    await page.route("/api/detect-faces", (route) => {
      // 延迟超过30秒
      setTimeout(() => {
        route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({ faces: [] }),
        });
      }, 35000);
    });

    await page.goto("/upload");
    await page.waitForLoadState("networkidle");

    // 上传图片
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(testImages.singleFace);

    const uploadButton = page.locator('button:has-text("开始人脸识别")');
    await uploadButton.click();

    // 等待超时
    await page.waitForTimeout(35000);

    // 验证错误信息显示
    await expect(page.locator("text=面部检测失败")).toBeVisible();
  });

  test("处理无效文件格式", async ({ page }) => {
    await page.goto("/upload");
    await page.waitForLoadState("networkidle");

    // 上传无效文件
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(testImages.invalidFormat);

    const uploadButton = page.locator('button:has-text("开始人脸识别")');
    await uploadButton.click();

    // 验证错误信息显示
    await expect(page.locator("text=面部检测失败")).toBeVisible();
  });

  test("处理超大文件", async ({ page }) => {
    await page.goto("/upload");
    await page.waitForLoadState("networkidle");

    // 上传超大文件
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(testImages.largeImage);

    const uploadButton = page.locator('button:has-text("开始人脸识别")');
    await uploadButton.click();

    // 验证错误信息显示
    await expect(page.locator("text=面部检测失败")).toBeVisible();
  });

  test("错误状态下的UI状态", async ({ page }) => {
    // 模拟服务器错误
    await page.route("/api/detect-faces", (route) => {
      route.fulfill({
        status: 500,
        contentType: "application/json",
        body: JSON.stringify({ error: "Internal Server Error" }),
      });
    });

    await page.goto("/upload");
    await page.waitForLoadState("networkidle");

    // 上传图片
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(testImages.singleFace);

    const uploadButton = page.locator('button:has-text("开始人脸识别")');
    await uploadButton.click();

    // 验证错误状态下的UI
    await expect(page.locator("text=面部检测失败")).toBeVisible();

    // 验证上传按钮重新可用
    await expect(uploadButton).toBeEnabled();
    await expect(uploadButton).toContainText("开始人脸识别");
  });

  test("错误恢复功能", async ({ page }) => {
    // 第一次请求失败
    let requestCount = 0;
    await page.route("/api/detect-faces", (route) => {
      requestCount++;
      if (requestCount === 1) {
        route.fulfill({
          status: 500,
          contentType: "application/json",
          body: JSON.stringify({ error: "Internal Server Error" }),
        });
      } else {
        route.continue();
      }
    });

    await page.goto("/upload");
    await page.waitForLoadState("networkidle");

    // 第一次上传（失败）
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(testImages.singleFace);

    const uploadButton = page.locator('button:has-text("开始人脸识别")');
    await uploadButton.click();

    // 等待错误显示
    await expect(page.locator("text=面部检测失败")).toBeVisible();

    // 再次上传（成功）
    await uploadButton.click();

    // 等待成功结果
    await page.waitForSelector('[data-testid="detection-result"]', {
      timeout: 30000,
    });
    await expect(
      page.locator('[data-testid="detection-result"]')
    ).toBeVisible();
  });

  test("并发错误处理", async ({ page }) => {
    // 模拟并发请求
    await page.goto("/upload");
    await page.waitForLoadState("networkidle");

    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(testImages.singleFace);

    const uploadButton = page.locator('button:has-text("开始人脸识别")');

    // 快速点击多次
    await uploadButton.click();
    await uploadButton.click();
    await uploadButton.click();

    // 验证只有一个请求被处理
    await page.waitForTimeout(5000);

    // 应该只有一个检测结果或错误信息
    const resultCount = await page
      .locator('[data-testid="detection-result"]')
      .count();
    const errorCount = await page.locator("text=面部检测失败").count();

    expect(resultCount + errorCount).toBeLessThanOrEqual(1);
  });
});
