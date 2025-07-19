"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ApiService } from "@/lib/api";

export default function ApiTestPage() {
  const [healthStatus, setHealthStatus] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const testHealthCheck = async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await ApiService.healthCheck();
      setHealthStatus(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "未知错误");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>API 连接测试</CardTitle>
          <CardDescription>测试前端与后端API的连接状态</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <Button
              onClick={testHealthCheck}
              disabled={loading}
              className="flex-1"
            >
              {loading ? "测试中..." : "测试健康检查"}
            </Button>

            <div className="text-sm text-muted-foreground">
              API URL: {process.env.NEXT_PUBLIC_API_BASE_URL}
            </div>
          </div>

          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-md">
              <div className="text-red-800 font-medium">错误</div>
              <div className="text-red-600 text-sm">{error}</div>
            </div>
          )}

          {healthStatus && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">状态:</span>
                <Badge
                  variant={healthStatus.success ? "default" : "destructive"}
                >
                  {healthStatus.success ? "成功" : "失败"}
                </Badge>
              </div>

              {healthStatus.success && healthStatus.data && (
                <div className="bg-green-50 border border-green-200 rounded-md p-4">
                  <div className="text-green-800 font-medium mb-2">
                    API 响应
                  </div>
                  <div className="text-sm text-green-700 space-y-1">
                    <div>状态: {healthStatus.data.status}</div>
                    <div>版本: {healthStatus.data.version}</div>
                    <div>时间: {healthStatus.data.timestamp}</div>
                    <div>环境: {healthStatus.data.environment}</div>
                  </div>
                </div>
              )}

              {!healthStatus.success && healthStatus.error && (
                <div className="bg-red-50 border border-red-200 rounded-md p-4">
                  <div className="text-red-800 font-medium mb-2">API 错误</div>
                  <div className="text-sm text-red-700">
                    <div>代码: {healthStatus.error.code}</div>
                    <div>消息: {healthStatus.error.message}</div>
                  </div>
                </div>
              )}

              <details className="mt-4">
                <summary className="cursor-pointer text-sm font-medium text-muted-foreground">
                  查看完整响应
                </summary>
                <pre className="mt-2 p-4 bg-gray-100 rounded-md text-xs overflow-auto">
                  {JSON.stringify(healthStatus, null, 2)}
                </pre>
              </details>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
