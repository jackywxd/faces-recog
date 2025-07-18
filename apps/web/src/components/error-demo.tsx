"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { useErrorHandler } from "@/hooks/use-error-handler";
import { useError } from "@/components/error-provider";
import {
  AlertTriangle,
  Wifi,
  Upload,
  AlertCircle,
  Info,
  RefreshCw,
  Trash2,
} from "lucide-react";

export function ErrorDemoSection() {
  const errorHandler = useErrorHandler();
  const globalErrorHandler = useError();
  const [isLoading, setIsLoading] = useState(false);

  // 模拟网络错误
  const simulateNetworkError = async () => {
    setIsLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      throw new Error("网络连接超时");
    } catch (error) {
      errorHandler.handleNetworkError(error);
    } finally {
      setIsLoading(false);
    }
  };

  // 模拟上传错误
  const simulateUploadError = () => {
    const errors = [
      "文件大小超出限制",
      "不支持的文件类型",
      "网络错误导致上传失败",
      "服务器存储空间不足",
    ];
    const randomError = errors[Math.floor(Math.random() * errors.length)];
    errorHandler.handleUploadError(new Error(randomError));
  };

  // 模拟验证错误
  const simulateValidationError = () => {
    const errors = [
      "请选择要上传的文件",
      "照片中未检测到人脸",
      "图片分辨率过低",
      "文件格式不符合要求",
    ];
    const randomError =
      errors[Math.floor(Math.random() * errors.length)] || "验证失败";
    errorHandler.handleValidationError(randomError);
  };

  // 模拟系统错误
  const simulateSystemError = () => {
    errorHandler.handleError(
      new Error("系统内部错误，请联系技术支持"),
      "system"
    );
  };

  // 触发组件错误（用于测试 ErrorBoundary）
  const [shouldThrowError, setShouldThrowError] = useState(false);

  if (shouldThrowError) {
    throw new Error("这是一个组件渲染错误，用于测试 ErrorBoundary");
  }

  return (
    <div className="space-y-6">
      {/* 错误类型演示 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            错误类型演示
          </CardTitle>
          <CardDescription>
            点击下面的按钮模拟不同类型的错误，观察系统如何处理
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button
              variant="outline"
              onClick={simulateNetworkError}
              disabled={isLoading}
              className="flex items-center gap-2"
            >
              <Wifi className="h-4 w-4" />
              {isLoading ? "请求中..." : "网络错误"}
            </Button>

            <Button
              variant="outline"
              onClick={simulateUploadError}
              className="flex items-center gap-2"
            >
              <Upload className="h-4 w-4" />
              上传错误
            </Button>

            <Button
              variant="outline"
              onClick={simulateValidationError}
              className="flex items-center gap-2"
            >
              <Info className="h-4 w-4" />
              验证错误
            </Button>

            <Button
              variant="outline"
              onClick={simulateSystemError}
              className="flex items-center gap-2"
            >
              <AlertCircle className="h-4 w-4" />
              系统错误
            </Button>
          </div>

          <div className="flex gap-2 pt-4 border-t">
            <Button
              variant="destructive"
              onClick={() => setShouldThrowError(true)}
              className="flex items-center gap-2"
            >
              <AlertTriangle className="h-4 w-4" />
              触发错误边界
            </Button>

            <Button
              variant="ghost"
              onClick={errorHandler.clearAllErrors}
              className="flex items-center gap-2"
            >
              <Trash2 className="h-4 w-4" />
              清除所有错误
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 错误状态显示 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              当前错误状态
            </span>
            <Badge variant="outline">{errorHandler.errors.length} 个错误</Badge>
          </CardTitle>
          <CardDescription>显示当前系统中的错误状态和统计信息</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {errorHandler.errors.length === 0 ? (
            <Alert>
              <Info className="h-4 w-4" />
              <AlertTitle>暂无错误</AlertTitle>
              <AlertDescription>
                当前系统运行正常，没有检测到错误
              </AlertDescription>
            </Alert>
          ) : (
            <div className="space-y-2">
              {["network", "upload", "validation", "system"].map((type) => {
                const typeErrors = errorHandler.errors.filter(
                  (e) => e.type === type
                );
                const count = typeErrors.length;

                if (count === 0) return null;

                return (
                  <div
                    key={type}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div className="flex items-center gap-2">
                      {type === "network" && (
                        <Wifi className="h-4 w-4 text-red-500" />
                      )}
                      {type === "upload" && (
                        <Upload className="h-4 w-4 text-red-500" />
                      )}
                      {type === "validation" && (
                        <Info className="h-4 w-4 text-yellow-500" />
                      )}
                      {type === "system" && (
                        <AlertCircle className="h-4 w-4 text-red-500" />
                      )}
                      <span className="font-medium capitalize">
                        {type} 错误
                      </span>
                      <Badge variant="secondary">{count}</Badge>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        errorHandler.clearErrorsByType(type as any)
                      }
                    >
                      清除
                    </Button>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* 全局错误状态 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5" />
            全局错误管理
          </CardTitle>
          <CardDescription>
            通过 ErrorProvider 管理的全局错误状态
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span>全局错误数量:</span>
              <Badge
                variant={
                  globalErrorHandler.errors.length > 0
                    ? "destructive"
                    : "success"
                }
              >
                {globalErrorHandler.errors.length}
              </Badge>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">网络错误:</span>
                <span className="ml-2">
                  {
                    globalErrorHandler.errors.filter(
                      (e) => e.type === "network"
                    ).length
                  }
                </span>
              </div>
              <div>
                <span className="font-medium">上传错误:</span>
                <span className="ml-2">
                  {
                    globalErrorHandler.errors.filter((e) => e.type === "upload")
                      .length
                  }
                </span>
              </div>
              <div>
                <span className="font-medium">验证错误:</span>
                <span className="ml-2">
                  {
                    globalErrorHandler.errors.filter(
                      (e) => e.type === "validation"
                    ).length
                  }
                </span>
              </div>
              <div>
                <span className="font-medium">系统错误:</span>
                <span className="ml-2">
                  {
                    globalErrorHandler.errors.filter((e) => e.type === "system")
                      .length
                  }
                </span>
              </div>
            </div>

            <Button
              variant="outline"
              onClick={globalErrorHandler.clearAllErrors}
              disabled={globalErrorHandler.errors.length === 0}
              className="w-full"
            >
              清除全局错误
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 错误处理功能说明 */}
      <Card>
        <CardHeader>
          <CardTitle>错误处理系统特性</CardTitle>
          <CardDescription>
            系统提供的完整错误处理和用户反馈机制
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h4 className="font-medium">错误类型分类</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• 网络错误 - 连接超时、请求失败</li>
                <li>• 上传错误 - 文件大小、格式、存储</li>
                <li>• 验证错误 - 输入验证、业务规则</li>
                <li>• 系统错误 - 内部异常、服务异常</li>
              </ul>
            </div>

            <div className="space-y-3">
              <h4 className="font-medium">用户反馈机制</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Toast 通知 - 即时错误提示</li>
                <li>• 错误列表 - 详细错误信息</li>
                <li>• 重试机制 - 自动/手动重试</li>
                <li>• 错误边界 - 组件异常捕获</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
