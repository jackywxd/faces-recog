// Cloudflare Workers 环境绑定类型定义
export interface Env {
  // R2 存储桶
  BUCKET: R2Bucket;

  // D1 数据库 (迭代3会启用)
  DB?: D1Database;

  // 面部检测容器 (迭代2会启用)
  FACE_DETECTOR?: DurableObjectNamespace;

  // 环境变量
  ENVIRONMENT?: string;
}

// API 响应通用类型
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    code: string;
    details?: unknown;
  };
  timestamp?: string;
}

// 文件上传相关类型
export interface FileUploadRequest {
  filename: string;
  contentType: string;
  size: number;
}

export interface FileUploadResponse {
  fileId: string;
  filename: string;
  url: string;
  size: number;
  uploadedAt: string;
}

// 健康检查响应类型
export interface HealthCheckResponse {
  status: "healthy" | "degraded" | "unhealthy";
  timestamp: string;
  uptime?: number;
  version: string;
  responseTime?: string;
  checks?: {
    api: boolean;
    storage: boolean;
    database: boolean;
    container: boolean;
  };
  environment?: string;
}
