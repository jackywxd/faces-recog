import { test, expect } from "@playwright/test";

test.describe("容器服务健康检查", () => {
  test("容器服务启动和健康检查", async ({ request }) => {
    // 测试健康检查端点
    const healthResponse = await request.get("/api/health");
    expect(healthResponse.ok()).toBeTruthy();

    const healthData = await healthResponse.json();
    expect(healthData).toHaveProperty("status", "healthy");
    expect(healthData).toHaveProperty("timestamp");
    expect(healthData).toHaveProperty("service", "face-detection-api");
  });

  test("容器服务响应时间", async ({ request }) => {
    const startTime = Date.now();
    const response = await request.get("/api/health");
    const endTime = Date.now();

    expect(response.ok()).toBeTruthy();
    expect(endTime - startTime).toBeLessThan(5000); // 5秒内响应
  });

  test("容器服务错误处理", async ({ request }) => {
    // 测试不存在的端点
    const response = await request.get("/api/nonexistent");
    expect(response.status()).toBe(404);
  });
});
