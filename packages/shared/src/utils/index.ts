import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { FileUploadSchema, type FileUpload } from "../types";
import { FILE_UPLOAD, ERROR_CODES } from "../constants";

// Tailwind CSS 类名合并工具
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// 文件验证
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export function validateImageFile(file: File): ValidationResult {
  const errors: string[] = [];

  // 检查文件大小
  if (file.size > FILE_UPLOAD.MAX_SIZE) {
    errors.push(`文件大小不能超过 ${FILE_UPLOAD.MAX_SIZE / 1024 / 1024}MB`);
  }

  // 检查文件类型
  if (!FILE_UPLOAD.ALLOWED_TYPES.includes(file.type as any)) {
    errors.push(`只支持 ${FILE_UPLOAD.ALLOWED_TYPES.join(", ")} 格式`);
  }

  // 检查文件扩展名
  const extension = "." + file.name.split(".").pop()?.toLowerCase();
  if (!FILE_UPLOAD.ALLOWED_EXTENSIONS.includes(extension as any)) {
    errors.push(
      `文件扩展名必须是 ${FILE_UPLOAD.ALLOWED_EXTENSIONS.join(", ")} 之一`
    );
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

// 文件大小格式化
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

// 生成唯一 ID
export function generateId(): string {
  return crypto.randomUUID();
}

// 延迟函数
export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// 防抖函数
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

// 节流函数
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

// 错误消息格式化
export function formatErrorMessage(code: string): string {
  const messages: Record<string, string> = {
    [ERROR_CODES.FILE_TOO_LARGE]: "文件大小超出限制",
    [ERROR_CODES.INVALID_FILE_TYPE]: "不支持的文件格式",
    [ERROR_CODES.NO_FACE_DETECTED]: "未检测到人脸",
    [ERROR_CODES.FACE_DETECTION_FAILED]: "人脸检测失败",
    [ERROR_CODES.SEARCH_FAILED]: "搜索失败",
    [ERROR_CODES.UPLOAD_FAILED]: "上传失败",
  };

  return messages[code] || "未知错误";
}

// 置信度格式化
export function formatConfidence(confidence: number): string {
  return `${(confidence * 100).toFixed(1)}%`;
}

// 时间格式化
export function formatRelativeTime(date: string | Date): string {
  const now = new Date();
  const target = new Date(date);
  const diffInSeconds = Math.floor((now.getTime() - target.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return "刚刚";
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes}分钟前`;
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours}小时前`;
  } else {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days}天前`;
  }
}
