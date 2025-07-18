import { Metadata } from "next";
import { PhotoUpload } from "@/components/photo-upload";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Upload, Search, Zap, Shield } from "lucide-react";

export const metadata: Metadata = {
  title: "上传照片 - 人脸识别搜索",
  description: "上传包含人脸的照片，AI 将自动搜索所有包含相同人脸的照片",
};

export default function UploadPage() {
  return (
    <>
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* 页面标题 */}
          <div className="text-center space-y-4">
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
              AI 人脸识别搜索
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              上传一张包含人脸的照片，我们的 AI 系统将分析面部特征，
              并在照片库中搜索所有包含相同人脸的照片
            </p>
          </div>

          {/* 功能特点 */}
          <div className="grid md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Zap className="h-4 w-4 text-primary" />
                  </div>
                  <CardTitle className="text-base">高精度识别</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  使用先进的深度学习算法，识别精度超过
                  95%，支持多角度和不同光线条件
                </CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-green-500/10 rounded-lg">
                    <Search className="h-4 w-4 text-green-600" />
                  </div>
                  <CardTitle className="text-base">智能搜索</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  在海量照片中快速定位目标人脸，支持相似度阈值调节和批量处理
                </CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-orange-500/10 rounded-lg">
                    <Shield className="h-4 w-4 text-orange-600" />
                  </div>
                  <CardTitle className="text-base">隐私保护</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  查询照片不会永久存储，所有处理在安全环境中进行，保护您的隐私
                </CardDescription>
              </CardContent>
            </Card>
          </div>

          {/* 上传组件 */}
          <PhotoUpload />

          {/* 使用说明 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                使用说明
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <h4 className="font-medium">支持的文件格式</h4>
                  <div className="flex gap-2">
                    <Badge variant="secondary">JPG</Badge>
                    <Badge variant="secondary">PNG</Badge>
                    <Badge variant="secondary">WebP</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    推荐使用清晰度较高的照片以获得最佳识别效果
                  </p>
                </div>

                <div className="space-y-3">
                  <h4 className="font-medium">文件要求</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• 文件大小不超过 10MB</li>
                    <li>• 包含清晰可见的人脸</li>
                    <li>• 建议图片分辨率不低于 300x300</li>
                    <li>• 避免过度模糊或遮挡的照片</li>
                  </ul>
                </div>
              </div>

              <Separator />

              <div className="space-y-3">
                <h4 className="font-medium">处理流程</h4>
                <div className="grid md:grid-cols-4 gap-4">
                  <div className="text-center space-y-2">
                    <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold mx-auto">
                      1
                    </div>
                    <p className="text-sm">上传照片</p>
                  </div>
                  <div className="text-center space-y-2">
                    <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold mx-auto">
                      2
                    </div>
                    <p className="text-sm">人脸检测</p>
                  </div>
                  <div className="text-center space-y-2">
                    <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold mx-auto">
                      3
                    </div>
                    <p className="text-sm">特征提取</p>
                  </div>
                  <div className="text-center space-y-2">
                    <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold mx-auto">
                      4
                    </div>
                    <p className="text-sm">匹配搜索</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </>
  );
}
