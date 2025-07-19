"use client";

import { useRef } from "react";
import { Upload, X, FileImage, Check, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { useFileUpload } from "@/hooks/use-file-upload";
import { useFaceDetection } from "@/hooks/use-face-detection";
import { FaceDetectionResultDisplay } from "@/components/face-detection-result";
import { formatFileSize } from "@/lib/utils";
import { cn } from "@/lib/utils";

export function PhotoUpload() {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    files,
    isDragging,
    addFiles,
    removeFile,
    clearFiles,
    uploadFiles,
    dragHandlers,
  } = useFileUpload({
    maxFileSize: 10 * 1024 * 1024, // 10MB
    maxFiles: 1,
    onUploadComplete: (files) => {
      console.log("上传完成:", files);
      // 上传完成后自动进行面部检测
      if (files.length > 0 && files[0]?.file) {
        detectFaces(files[0].file);
      }
    },
    onUploadError: (error) => {
      console.error("上传失败:", error);
    },
  });

  const {
    isDetecting,
    result,
    error: detectionError,
    detectFaces,
    reset: resetDetection,
  } = useFaceDetection({
    onSuccess: (result) => {
      console.log("面部检测完成:", result);
    },
    onError: (error) => {
      console.error("面部检测失败:", error);
    },
  });

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (selectedFiles && selectedFiles.length > 0) {
      addFiles(selectedFiles);
    }
  };

  const handleSelectClick = () => {
    fileInputRef.current?.click();
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "success":
        return <Check className="h-4 w-4 text-green-500" />;
      case "error":
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case "uploading":
        return (
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        );
      default:
        return <FileImage className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "success":
        return <Badge variant="success">已完成</Badge>;
      case "error":
        return <Badge variant="destructive">失败</Badge>;
      case "uploading":
        return <Badge variant="secondary">上传中</Badge>;
      default:
        return <Badge variant="outline">待上传</Badge>;
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          上传人脸照片
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* 拖拽上传区域 */}
        <div
          className={cn(
            "upload-area border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200 cursor-pointer",
            isDragging
              ? "border-primary bg-primary/5 scale-[1.02]"
              : "border-border hover:border-primary/50 hover:bg-accent/50",
            files.length > 0 && "border-primary/30 bg-primary/5"
          )}
          {...dragHandlers}
          onClick={handleSelectClick}
        >
          <div className="flex flex-col items-center gap-4">
            <div
              className={cn(
                "p-4 rounded-full transition-colors",
                isDragging ? "bg-primary/10" : "bg-muted"
              )}
            >
              <Upload
                className={cn(
                  "h-8 w-8 transition-colors",
                  isDragging ? "text-primary" : "text-muted-foreground"
                )}
              />
            </div>

            <div className="space-y-2">
              <h3 className="text-lg font-semibold">
                {isDragging ? "放开文件以上传" : "选择或拖拽照片到此处"}
              </h3>
              <p className="text-sm text-muted-foreground">
                支持 JPG、PNG、WebP 格式，最大 10MB
              </p>
              <p className="text-xs text-muted-foreground">
                系统将检测照片中的人脸并搜索匹配的照片
              </p>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                handleSelectClick();
              }}
            >
              选择文件
            </Button>
          </div>
        </div>

        {/* 隐藏的文件输入 */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={handleFileInputChange}
        />

        {/* 文件列表 */}
        {files.length > 0 && (
          <div className="space-y-4">
            <Separator />

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium">选中的文件</h4>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFiles}
                  className="text-muted-foreground hover:text-foreground"
                >
                  清空
                </Button>
              </div>

              {files.map((file) => (
                <div
                  key={file.id}
                  className="flex items-center gap-3 p-3 border rounded-lg"
                >
                  {/* 预览图片 */}
                  <Avatar className="h-12 w-12 rounded-md">
                    {file.preview && (
                      <AvatarImage
                        src={file.preview}
                        alt={file.file.name}
                        className="object-cover"
                      />
                    )}
                    <AvatarFallback className="rounded-md">
                      <FileImage className="h-6 w-6" />
                    </AvatarFallback>
                  </Avatar>

                  {/* 文件信息 */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      {getStatusIcon(file.status)}
                      <span className="text-sm font-medium truncate">
                        {file.file.name}
                      </span>
                      {getStatusBadge(file.status)}
                    </div>

                    <div className="text-xs text-muted-foreground">
                      {formatFileSize(file.file.size)} • {file.file.type}
                    </div>

                    {/* 进度条 */}
                    {file.status === "uploading" && (
                      <div className="mt-2">
                        <Progress value={file.progress} className="h-1" />
                        <div
                          className="text-xs text-muted-foreground mt-1"
                          data-testid="upload-progress"
                        >
                          {file.progress}%
                        </div>
                      </div>
                    )}

                    {/* 错误信息 */}
                    {file.status === "error" && file.error && (
                      <div className="text-xs text-red-500 mt-1">
                        {file.error}
                      </div>
                    )}
                  </div>

                  {/* 删除按钮 */}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFile(file.id)}
                    className="text-muted-foreground hover:text-red-500"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>

            {/* 上传按钮 */}
            <div className="flex gap-2">
              <Button
                onClick={uploadFiles}
                disabled={
                  files.some((f) => f.status === "uploading") || isDetecting
                }
                className="flex-1"
              >
                {files.some((f) => f.status === "uploading") ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent mr-2" />
                    上传中...
                  </>
                ) : isDetecting ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent mr-2" />
                    检测中...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    开始人脸识别
                  </>
                )}
              </Button>
            </div>
          </div>
        )}

        {/* 面部检测错误 */}
        {detectionError && (
          <div className="p-4 border border-red-200 bg-red-50 rounded-lg">
            <div className="flex items-center gap-2 text-red-700">
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm font-medium">面部检测失败</span>
            </div>
            <p className="text-sm text-red-600 mt-1">{detectionError}</p>
          </div>
        )}

        {/* 面部检测结果 */}
        {result && files.length > 0 && files[0]?.preview && (
          <div className="mt-6">
            <FaceDetectionResultDisplay
              result={result}
              imageUrl={files[0].preview}
              onClose={() => {
                resetDetection();
                clearFiles();
              }}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
