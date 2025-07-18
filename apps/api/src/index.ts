import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { prettyJSON } from "hono/pretty-json";
import { secureHeaders } from "hono/secure-headers";

import { healthRoutes } from "./routes/health";
import { uploadRoutes } from "./routes/upload";
// 创建 Hono 应用实例
const app = new Hono();

// 配置 CORS 中间件
app.use(
  "*",
  cors({
    origin: [
      "http://localhost:3000",
      "https://*.pages.dev",
      "https://*.cloudflare.com",
    ],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization"],
    exposeHeaders: ["Content-Length"],
    credentials: true,
    maxAge: 86400, // 24小时
  })
);

// 安全头中间件
app.use("*", secureHeaders());

// 日志中间件
app.use("*", logger());

// 美化 JSON 响应
app.use("*", prettyJSON());

// 全局错误处理中间件
app.onError((err, c) => {
  console.error("API Error:", err);

  return c.json(
    {
      success: false,
      error: {
        message: err.message || "Internal Server Error",
        code: "INTERNAL_ERROR",
      },
    },
    500
  );
});

// 404 处理
app.notFound((c) => {
  return c.json(
    {
      success: false,
      error: {
        message: "API endpoint not found",
        code: "NOT_FOUND",
      },
    },
    404
  );
});

// 根路由
app.get("/", (c) => {
  return c.json({
    success: true,
    message: "Face Recognition API",
    version: "1.0.0",
    environment: c.env?.ENVIRONMENT || "development",
  });
});

// 注册路由
app.route("/api/health", healthRoutes);
app.route("/api", uploadRoutes);

// 导出应用实例
export default app;
