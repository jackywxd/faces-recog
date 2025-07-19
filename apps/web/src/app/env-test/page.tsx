"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function EnvTestPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>环境变量测试</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h3 className="font-medium">客户端环境变量:</h3>
            <div className="bg-gray-100 p-4 rounded-md text-sm">
              <div>
                NEXT_PUBLIC_ENV: {process.env.NEXT_PUBLIC_ENV || "undefined"}
              </div>
              <div>
                NEXT_PUBLIC_API_BASE_URL:{" "}
                {process.env.NEXT_PUBLIC_API_BASE_URL || "undefined"}
              </div>
              <div>
                NEXT_PUBLIC_APP_NAME:{" "}
                {process.env.NEXT_PUBLIC_APP_NAME || "undefined"}
              </div>
              <div>NODE_ENV: {process.env.NODE_ENV || "undefined"}</div>
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="font-medium">构建时信息:</h3>
            <div className="bg-gray-100 p-4 rounded-md text-sm">
              <div>构建时间: {new Date().toISOString()}</div>
              <div>页面路径: /env-test</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
