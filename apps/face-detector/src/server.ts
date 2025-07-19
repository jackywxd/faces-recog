import express, { Application } from "express";
import cors from "cors";
import helmet from "helmet";
import { config } from "./config";
import { logger } from "./utils/logger";
import { errorHandler } from "./middleware/error-handler";
import { healthRoutes } from "./routes/health";
import { faceDetectionRoutes } from "./routes/face-detection";

const app: Application = express();

// 安全中间件
app.use(helmet());

// CORS 配置
app.use(
  cors({
    origin: config.corsOrigins,
    credentials: true,
  })
);

// 请求日志中间件
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`, {
    ip: req.ip,
    userAgent: req.get("User-Agent"),
  });
  next();
});

// 解析 JSON 和 URL 编码数据
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// 路由
app.use("/health", healthRoutes);
app.use("/api", faceDetectionRoutes);

// 404 处理
app.use("*", (req, res) => {
  res.status(404).json({
    error: true,
    message: "Endpoint not found",
    path: req.originalUrl,
  });
});

// 错误处理中间件
app.use(errorHandler);

// 启动服务器
const PORT = config.port || 8080;

app.listen(PORT, () => {
  logger.info(`Face detection service started on port ${PORT}`);
  logger.info(`Environment: ${config.nodeEnv}`);
  logger.info(`Health check: http://localhost:${PORT}/health`);
});

// 优雅关闭
process.on("SIGTERM", () => {
  logger.info("SIGTERM received, shutting down gracefully");
  process.exit(0);
});

process.on("SIGINT", () => {
  logger.info("SIGINT received, shutting down gracefully");
  process.exit(0);
});

export default app;
