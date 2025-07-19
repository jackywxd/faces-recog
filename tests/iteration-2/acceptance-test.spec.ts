import { test, expect } from "@playwright/test";

test.describe("迭代2验收测试", () => {
  test("API健康检查", async ({ request }) => {
    const response = await request.get("/api/health");
    expect(response.ok()).toBeTruthy();

    const data = await response.json();
    expect(data).toHaveProperty("status", "healthy");
    expect(data).toHaveProperty("service", "face-detection-api");
  });

  test("面部检测API基本功能", async ({ request }) => {
    // 创建一个简单的测试图片数据
    const testImageData = Buffer.from("fake-image-data");
    const formData = new FormData();
    formData.append(
      "image",
      new Blob([testImageData], { type: "image/jpeg" }),
      "test.jpg"
    );

    const response = await request.post("/api/detect-faces", {
      data: formData,
    });

    expect(response.ok()).toBeTruthy();

    const result = await response.json();
    expect(result).toHaveProperty("faces");
    expect(result).toHaveProperty("processingTime");
    expect(result).toHaveProperty("imageInfo");
    expect(Array.isArray(result.faces)).toBeTruthy();
  });

  test("面部检测API错误处理", async ({ request }) => {
    // 测试无效请求
    const response = await request.post("/api/detect-faces", {
      data: {},
    });

    expect(response.status()).toBe(400);
  });

  test("前端组件构建", async ({ page }) => {
    // 验证前端页面可以正常加载
    await page.goto("/");
    await expect(page).toHaveTitle(/Face Recognition/);
  });

  test("上传组件存在", async ({ page }) => {
    await page.goto("/upload");

    // 验证上传组件存在
    const uploadArea = page.locator(".upload-area");
    await expect(uploadArea).toBeVisible();

    // 验证文件输入存在
    const fileInput = page.locator('input[type="file"]');
    await expect(fileInput).toBeAttached();
  });

  test("检测结果组件结构", async ({ page }) => {
    await page.goto("/upload");

    // 验证检测结果相关的UI元素存在（即使还没有显示）
    const uploadButton = page.locator('button:has-text("开始人脸识别")');
    await expect(uploadButton).toBeVisible();
  });
});
