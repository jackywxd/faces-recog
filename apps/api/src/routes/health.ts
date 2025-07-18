import { Hono } from "hono";

// 创建健康检查路由实例
export const healthRoutes = new Hono();

// 基础健康检查
healthRoutes.get("/", (c) => {
  return c.json({
    success: true,
    status: "healthy",
    timestamp: new Date().toISOString(),
    uptime: 0, // uptime calculation not available in Workers
    version: "1.0.0",
  });
});

// 详细健康检查
healthRoutes.get("/detailed", async (c) => {
  const startTime = Date.now();

  // 检查各项服务状态
  const checks = {
    api: true,
    storage: false,
    database: false,
    container: false,
  };

  // 检查 R2 存储 (如果绑定存在)
  try {
    if (c.env?.BUCKET) {
      // 尝试列出存储桶 (限制1个对象以减少开销)
      await c.env.BUCKET.list({ limit: 1 });
      checks.storage = true;
    }
  } catch (error) {
    console.warn("Storage health check failed:", error);
  }

  // 检查数据库 (预留给迭代3)
  try {
    if (c.env?.DB) {
      // 简单查询测试连接
      await c.env.DB.prepare("SELECT 1").first();
      checks.database = true;
    }
  } catch (error) {
    console.warn("Database health check failed:", error);
  }

  // 检查容器服务 (预留给迭代2)
  try {
    if (c.env?.FACE_DETECTOR) {
      // 容器健康检查逻辑 (迭代2实现)
      checks.container = true;
    }
  } catch (error) {
    console.warn("Container health check failed:", error);
  }

  const responseTime = Date.now() - startTime;
  const overallHealth = Object.values(checks).every((check) => check);

  return c.json({
    success: true,
    status: overallHealth ? "healthy" : "degraded",
    timestamp: new Date().toISOString(),
    responseTime: `${responseTime}ms`,
    checks,
    environment: c.env?.ENVIRONMENT || "development",
  });
});

// 就绪检查 (用于 Kubernetes 等容器编排)
healthRoutes.get("/ready", (c) => {
  // 检查应用是否准备好接收请求
  const isReady = true; // 基础检查总是准备好的

  if (isReady) {
    return c.json({
      success: true,
      status: "ready",
      timestamp: new Date().toISOString(),
    });
  } else {
    return c.json(
      {
        success: false,
        status: "not ready",
        timestamp: new Date().toISOString(),
      },
      503
    );
  }
});

// 存活检查 (用于 Kubernetes 等容器编排)
healthRoutes.get("/live", (c) => {
  return c.json({
    success: true,
    status: "alive",
    timestamp: new Date().toISOString(),
  });
});
