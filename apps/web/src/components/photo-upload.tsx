"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export function PhotoUpload() {
  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardContent className="p-8">
        <div className="upload-area">
          <h3 className="text-lg font-semibold mb-4">上传照片</h3>
          <p className="text-muted-foreground mb-4">
            支持 JPG、PNG、WebP 格式，最大 10MB
          </p>
          <Button>选择文件</Button>
        </div>
      </CardContent>
    </Card>
  );
}
