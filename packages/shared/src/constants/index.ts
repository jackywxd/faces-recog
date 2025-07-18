// 文件上传限制
export const FILE_UPLOAD = {
  MAX_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_TYPES: ["image/jpeg", "image/png", "image/webp"] as const,
  ALLOWED_EXTENSIONS: [".jpg", ".jpeg", ".png", ".webp"] as const,
} as const;

// 人脸检测配置
export const FACE_DETECTION = {
  MIN_CONFIDENCE: 0.8,
  MIN_FACE_SIZE: 100,
  MAX_FACES_PER_IMAGE: 10,
} as const;

// API 端点
export const API_ENDPOINTS = {
  UPLOAD: "/api/upload",
  SEARCH: "/api/search",
  JOBS: "/api/jobs",
  PHOTOS: "/api/photos",
} as const;

// 缓存键
export const CACHE_KEYS = {
  FACE_ENCODINGS: "face_encodings",
  SEARCH_RESULTS: "search_results",
  UPLOAD_PROGRESS: "upload_progress",
} as const;

// 错误代码
export const ERROR_CODES = {
  FILE_TOO_LARGE: "FILE_TOO_LARGE",
  INVALID_FILE_TYPE: "INVALID_FILE_TYPE",
  NO_FACE_DETECTED: "NO_FACE_DETECTED",
  FACE_DETECTION_FAILED: "FACE_DETECTION_FAILED",
  SEARCH_FAILED: "SEARCH_FAILED",
  UPLOAD_FAILED: "UPLOAD_FAILED",
} as const;

// 状态枚举
export const STATUS = {
  PENDING: "pending",
  PROCESSING: "processing",
  COMPLETED: "completed",
  FAILED: "failed",
} as const;
