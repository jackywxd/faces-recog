import { useState, useCallback } from "react";
import { useToast } from "./use-toast";

export interface AppError {
  id: string;
  message: string;
  type: "network" | "validation" | "upload" | "system" | "unknown";
  code?: string;
  details?: unknown;
  timestamp: Date;
  retryable: boolean;
}

export interface ErrorHandlerOptions {
  showToast?: boolean;
  logError?: boolean;
  retryable?: boolean;
}

export function useErrorHandler() {
  const { toast } = useToast();
  const [errors, setErrors] = useState<AppError[]>([]);

  // 添加错误
  const addError = useCallback(
    (
      message: string,
      type: AppError["type"] = "unknown",
      options: ErrorHandlerOptions = {}
    ) => {
      const { showToast = true, logError = true, retryable = false } = options;

      const error: AppError = {
        id: crypto.randomUUID(),
        message,
        type,
        timestamp: new Date(),
        retryable,
      };

      // 添加到错误列表
      setErrors((prev) => [error, ...prev.slice(0, 9)]); // 保留最新10个错误

      // 显示 Toast 通知
      if (showToast) {
        toast({
          title: getErrorTitle(type),
          description: message,
          variant: "destructive",
        });
      }

      // 记录错误日志
      if (logError) {
        console.error(`[${type.toUpperCase()}] ${message}`, error);
      }

      return error.id;
    },
    [toast]
  );

  // 从 Error 对象创建错误
  const handleError = useCallback(
    (
      error: Error | unknown,
      type: AppError["type"] = "unknown",
      options: ErrorHandlerOptions = {}
    ) => {
      const message = error instanceof Error ? error.message : String(error);
      const code = error instanceof Error ? error.name : undefined;

      return addError(message, type, {
        ...options,
        retryable: isRetryableError(error, type),
      });
    },
    [addError]
  );

  // 处理网络错误
  const handleNetworkError = useCallback(
    (error: Error | unknown, options: ErrorHandlerOptions = {}) => {
      let message = "网络连接出现问题，请检查网络后重试";

      if (error instanceof Error) {
        if (error.message.includes("fetch")) {
          message = "网络请求失败，请检查网络连接";
        } else if (error.message.includes("timeout")) {
          message = "请求超时，请稍后重试";
        } else if (error.message.includes("abort")) {
          message = "请求被取消";
        }
      }

      return handleError(error, "network", {
        retryable: true,
        ...options,
      });
    },
    [handleError]
  );

  // 处理上传错误
  const handleUploadError = useCallback(
    (error: Error | unknown, options: ErrorHandlerOptions = {}) => {
      let message = "文件上传失败，请重试";

      if (error instanceof Error) {
        if (error.message.includes("size")) {
          message = "文件大小超出限制";
        } else if (error.message.includes("type")) {
          message = "不支持的文件类型";
        } else if (error.message.includes("network")) {
          message = "网络错误，上传失败";
        }
      }

      return handleError(error, "upload", {
        retryable: true,
        ...options,
      });
    },
    [handleError]
  );

  // 处理验证错误
  const handleValidationError = useCallback(
    (message: string, options: ErrorHandlerOptions = {}) => {
      return addError(message, "validation", {
        retryable: false,
        ...options,
      });
    },
    [addError]
  );

  // 清除特定错误
  const clearError = useCallback((errorId: string) => {
    setErrors((prev) => prev.filter((error) => error.id !== errorId));
  }, []);

  // 清除所有错误
  const clearAllErrors = useCallback(() => {
    setErrors([]);
  }, []);

  // 清除特定类型的错误
  const clearErrorsByType = useCallback((type: AppError["type"]) => {
    setErrors((prev) => prev.filter((error) => error.type !== type));
  }, []);

  // 获取最新错误
  const getLatestError = useCallback(
    (type?: AppError["type"]) => {
      if (type) {
        return errors.find((error) => error.type === type);
      }
      return errors[0];
    },
    [errors]
  );

  // 检查是否有特定类型的错误
  const hasError = useCallback(
    (type?: AppError["type"]) => {
      if (type) {
        return errors.some((error) => error.type === type);
      }
      return errors.length > 0;
    },
    [errors]
  );

  return {
    errors,
    addError,
    handleError,
    handleNetworkError,
    handleUploadError,
    handleValidationError,
    clearError,
    clearAllErrors,
    clearErrorsByType,
    getLatestError,
    hasError,
  };
}

// 辅助函数
function getErrorTitle(type: AppError["type"]): string {
  switch (type) {
    case "network":
      return "网络错误";
    case "validation":
      return "验证错误";
    case "upload":
      return "上传失败";
    case "system":
      return "系统错误";
    default:
      return "发生错误";
  }
}

function isRetryableError(
  error: Error | unknown,
  type: AppError["type"]
): boolean {
  // 网络错误通常可重试
  if (type === "network") return true;

  // 上传错误中的网络问题可重试
  if (type === "upload") {
    if (error instanceof Error) {
      return !error.message.includes("size") && !error.message.includes("type");
    }
    return true;
  }

  // 验证错误通常不可重试
  if (type === "validation") return false;

  // 默认情况
  return false;
}
