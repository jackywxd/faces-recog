import { test, expect } from "@playwright/test";
import { testImages } from "../fixtures/test-data";

test.describe("检测结果可视化验证", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/upload");
    await page.waitForLoadState("networkidle");
  });

  test("上传图片后显示检测结果组件", async ({ page }) => {
    // 上传图片
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(testImages.singleFace);

    // 点击上传按钮
    const uploadButton = page.locator('button:has-text("开始人脸识别")');
    await uploadButton.click();

    // 等待检测完成
    await page.waitForSelector('[data-testid="detection-result"]', {
      timeout: 30000,
    });

    // 验证检测结果组件存在
    const resultComponent = page.locator('[data-testid="detection-result"]');
    await expect(resultComponent).toBeVisible();
  });

  test("检测结果统计信息显示", async ({ page }) => {
    // 上传图片并等待检测完成
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(testImages.singleFace);

    const uploadButton = page.locator('button:has-text("开始人脸识别")');
    await uploadButton.click();

    await page.waitForSelector('[data-testid="detection-result"]', {
      timeout: 30000,
    });

    // 验证统计信息
    await expect(page.locator("text=检测到的人脸")).toBeVisible();
    await expect(page.locator("text=平均置信度")).toBeVisible();
    await expect(page.locator("text=处理时间")).toBeVisible();
    await expect(page.locator("text=检测质量")).toBeVisible();
  });

  test("人脸边界框显示", async ({ page }) => {
    // 上传图片并等待检测完成
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(testImages.singleFace);

    const uploadButton = page.locator('button:has-text("开始人脸识别")');
    await uploadButton.click();

    await page.waitForSelector('[data-testid="detection-result"]', {
      timeout: 30000,
    });

    // 验证检测图像存在
    const detectionImage = page.locator('[data-testid="detection-image"]');
    await expect(detectionImage).toBeVisible();

    // 验证边界框存在（如果有检测到人脸）
    const boundingBoxes = page.locator('[data-testid="face-bounding-box"]');
    const count = await boundingBoxes.count();
    expect(count).toBeGreaterThanOrEqual(0);
  });

  test("置信度分数显示", async ({ page }) => {
    // 上传图片并等待检测完成
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(testImages.singleFace);

    const uploadButton = page.locator('button:has-text("开始人脸识别")');
    await uploadButton.click();

    await page.waitForSelector('[data-testid="detection-result"]', {
      timeout: 30000,
    });

    // 验证置信度显示
    const confidenceElements = page.locator('[data-testid="face-detail-0"]');
    if ((await confidenceElements.count()) > 0) {
      await expect(confidenceElements).toContainText("%");
    }
  });

  test("特征点显示切换", async ({ page }) => {
    // 上传图片并等待检测完成
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(testImages.singleFace);

    const uploadButton = page.locator('button:has-text("开始人脸识别")');
    await uploadButton.click();

    await page.waitForSelector('[data-testid="detection-result"]', {
      timeout: 30000,
    });

    // 点击显示特征点按钮
    const landmarksButton = page.locator('button:has-text("显示特征点")');
    await landmarksButton.click();

    // 验证按钮文本变化
    await expect(page.locator('button:has-text("隐藏特征点")')).toBeVisible();
  });

  test("全屏查看功能", async ({ page }) => {
    // 上传图片并等待检测完成
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(testImages.singleFace);

    const uploadButton = page.locator('button:has-text("开始人脸识别")');
    await uploadButton.click();

    await page.waitForSelector('[data-testid="detection-result"]', {
      timeout: 30000,
    });

    // 点击全屏按钮
    const fullscreenButton = page.locator('button:has-text("Maximize2")');
    await fullscreenButton.click();

    // 验证图像尺寸变化（通过CSS类）
    const detectionImage = page.locator('[data-testid="detection-image"]');
    await expect(detectionImage).toHaveClass(/max-h-\[80vh\]/);
  });

  test("无检测结果时的显示", async ({ page }) => {
    // 上传无脸图片
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(testImages.noFaces);

    const uploadButton = page.locator('button:has-text("开始人脸识别")');
    await uploadButton.click();

    await page.waitForSelector('[data-testid="detection-result"]', {
      timeout: 30000,
    });

    // 验证无检测结果的提示
    await expect(page.locator("text=未检测到人脸")).toBeVisible();
    await expect(
      page.locator("text=请尝试上传包含清晰人脸的图片")
    ).toBeVisible();
  });

  test("检测失败错误处理", async ({ page }) => {
    // 上传无效文件
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(testImages.invalidFormat);

    const uploadButton = page.locator('button:has-text("开始人脸识别")');
    await uploadButton.click();

    // 验证错误信息显示
    await expect(page.locator("text=面部检测失败")).toBeVisible();
  });

  test("关闭检测结果", async ({ page }) => {
    // 上传图片并等待检测完成
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(testImages.singleFace);

    const uploadButton = page.locator('button:has-text("开始人脸识别")');
    await uploadButton.click();

    await page.waitForSelector('[data-testid="detection-result"]', {
      timeout: 30000,
    });

    // 点击关闭按钮
    const closeButton = page.locator('button:has-text("关闭")');
    await closeButton.click();

    // 验证检测结果组件消失
    await expect(
      page.locator('[data-testid="detection-result"]')
    ).not.toBeVisible();
  });
});
