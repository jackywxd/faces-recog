import { Request, Response, NextFunction } from "express";
import { logger } from "../utils/logger";

export interface AppError extends Error {
  statusCode?: number;
  code?: string;
  isOperational?: boolean;
}

export const errorHandler = (
  error: AppError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const statusCode = error.statusCode || 500;
  const message = error.message || "Internal Server Error";
  const code = error.code || "INTERNAL_ERROR";

  // 记录错误日志
  logger.error("Request error", {
    method: req.method,
    url: req.url,
    statusCode,
    message: error.message,
    stack: error.stack,
    userAgent: req.get("User-Agent"),
    ip: req.ip,
  });

  // 生产环境不暴露错误堆栈
  const response: any = {
    error: true,
    code,
    message,
    timestamp: new Date().toISOString(),
  };

  if (process.env.NODE_ENV === "development") {
    response.stack = error.stack;
  }

  res.status(statusCode).json(response);
};

export const createAppError = (
  message: string,
  statusCode: number = 500,
  code: string = "INTERNAL_ERROR"
): AppError => {
  const error = new Error(message) as AppError;
  error.statusCode = statusCode;
  error.code = code;
  error.isOperational = true;
  return error;
};
