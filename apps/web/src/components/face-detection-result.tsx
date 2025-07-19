"use client";

import React, { useRef, useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Eye,
  EyeOff,
  Maximize2,
  Download,
  Clock,
  Users,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { DetectedFace, FaceDetectionResult } from "@face-recog/shared";

interface FaceDetectionResultProps {
  result: FaceDetectionResult;
  imageUrl: string;
  onClose?: () => void;
  className?: string;
}

interface BoundingBoxProps {
  face: DetectedFace;
  imageWidth: number;
  imageHeight: number;
  containerWidth: number;
  containerHeight: number;
  showLandmarks?: boolean;
}

const BoundingBox: React.FC<BoundingBoxProps> = ({
  face,
  imageWidth,
  imageHeight,
  containerWidth,
  containerHeight,
  showLandmarks = false,
}) => {
  // 计算缩放比例
  const scaleX = containerWidth / imageWidth;
  const scaleY = containerHeight / imageHeight;

  // 缩放边界框坐标
  const scaledBox = {
    x: face.boundingBox.x * scaleX,
    y: face.boundingBox.y * scaleY,
    width: face.boundingBox.width * scaleX,
    height: face.boundingBox.height * scaleY,
  };

  // 计算置信度颜色
  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.9) return "border-green-500 bg-green-500/20";
    if (confidence >= 0.7) return "border-yellow-500 bg-yellow-500/20";
    return "border-red-500 bg-red-500/20";
  };

  return (
    <div
      className={cn(
        "absolute border-2 rounded-sm transition-all duration-200",
        getConfidenceColor(face.confidence)
      )}
      style={{
        left: scaledBox.x,
        top: scaledBox.y,
        width: scaledBox.width,
        height: scaledBox.height,
      }}
      data-testid="face-bounding-box"
    >
      {/* 置信度标签 */}
      <div className="absolute -top-6 left-0 bg-background/90 backdrop-blur-sm px-1 py-0.5 rounded text-xs font-medium">
        {Math.round(face.confidence * 100)}%
      </div>

      {/* 面部特征点 */}
      {showLandmarks && face.landmarks && (
        <div className="absolute inset-0">
          {face.landmarks.map((point, index) => (
            <div
              key={index}
              className="absolute w-1 h-1 bg-blue-500 rounded-full -translate-x-1/2 -translate-y-1/2"
              style={{
                left: point.x * scaleX,
                top: point.y * scaleY,
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export function FaceDetectionResultDisplay({
  result,
  imageUrl,
  onClose,
  className,
}: FaceDetectionResultProps) {
  const [showLandmarks, setShowLandmarks] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const imageRef = useRef<HTMLImageElement>(null);
  const [imageDimensions, setImageDimensions] = useState({
    width: 0,
    height: 0,
  });

  // 监听图片加载完成
  useEffect(() => {
    const image = imageRef.current;
    if (image) {
      const handleLoad = () => {
        setImageDimensions({
          width: image.naturalWidth,
          height: image.naturalHeight,
        });
      };

      if (image.complete) {
        handleLoad();
        return undefined;
      } else {
        image.addEventListener("load", handleLoad);
        return () => image.removeEventListener("load", handleLoad);
      }
    }
    return undefined;
  }, [imageUrl]);

  // 计算平均置信度
  const averageConfidence =
    result.faces.length > 0
      ? result.faces.reduce((sum, face) => sum + face.confidence, 0) /
        result.faces.length
      : 0;

  // 获取检测质量评级
  const getQualityRating = (confidence: number) => {
    if (confidence >= 0.9)
      return { label: "优秀", color: "text-green-600", icon: CheckCircle2 };
    if (confidence >= 0.7)
      return { label: "良好", color: "text-yellow-600", icon: CheckCircle2 };
    return { label: "一般", color: "text-red-600", icon: AlertCircle };
  };

  const qualityRating = getQualityRating(averageConfidence);

  return (
    <Card className={cn("w-full", className)} data-testid="detection-result">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            面部检测结果
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowLandmarks(!showLandmarks)}
            >
              {showLandmarks ? (
                <>
                  <EyeOff className="h-4 w-4 mr-1" />
                  隐藏特征点
                </>
              ) : (
                <>
                  <Eye className="h-4 w-4 mr-1" />
                  显示特征点
                </>
              )}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsFullscreen(!isFullscreen)}
            >
              <Maximize2 className="h-4 w-4" />
            </Button>
            {onClose && (
              <Button variant="outline" size="sm" onClick={onClose}>
                关闭
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* 检测统计信息 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">
              {result.faces.length}
            </div>
            <div className="text-sm text-muted-foreground">检测到的人脸</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">
              {Math.round(averageConfidence * 100)}%
            </div>
            <div className="text-sm text-muted-foreground">平均置信度</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">
              {Math.round(result.processingTime)}ms
            </div>
            <div className="text-sm text-muted-foreground">处理时间</div>
          </div>
          <div className="text-center">
            <div
              className={cn(
                "text-2xl font-bold flex items-center justify-center gap-1",
                qualityRating.color
              )}
            >
              <qualityRating.icon className="h-5 w-5" />
              {qualityRating.label}
            </div>
            <div className="text-sm text-muted-foreground">检测质量</div>
          </div>
        </div>

        <Separator />

        {/* 图像显示区域 */}
        <div className="relative bg-muted rounded-lg overflow-hidden">
          <div className="relative">
            <img
              ref={imageRef}
              src={imageUrl}
              alt="检测结果"
              className={cn(
                "w-full h-auto transition-all duration-300",
                isFullscreen ? "max-h-[80vh]" : "max-h-96"
              )}
              data-testid="detection-image"
            />

            {/* 边界框覆盖层 */}
            {imageDimensions.width > 0 && imageDimensions.height > 0 && (
              <div className="absolute inset-0">
                {result.faces.map((face, index) => (
                  <BoundingBox
                    key={index}
                    face={face}
                    imageWidth={imageDimensions.width}
                    imageHeight={imageDimensions.height}
                    containerWidth={imageRef.current?.clientWidth || 0}
                    containerHeight={imageRef.current?.clientHeight || 0}
                    showLandmarks={showLandmarks}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* 详细结果列表 */}
        {result.faces.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium">检测详情</h4>
            <div className="grid gap-2">
              {result.faces.map((face, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                  data-testid={`face-detail-${index}`}
                >
                  <div className="flex items-center gap-3">
                    <Badge variant="outline">#{index + 1}</Badge>
                    <div>
                      <div className="text-sm font-medium">
                        位置: ({Math.round(face.boundingBox.x)},{" "}
                        {Math.round(face.boundingBox.y)})
                      </div>
                      <div className="text-xs text-muted-foreground">
                        尺寸: {Math.round(face.boundingBox.width)} ×{" "}
                        {Math.round(face.boundingBox.height)}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-right">
                      <div className="text-sm font-medium">
                        {Math.round(face.confidence * 100)}%
                      </div>
                      <div className="text-xs text-muted-foreground">
                        置信度
                      </div>
                    </div>
                    <Progress
                      value={face.confidence * 100}
                      className="w-16 h-2"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 无检测结果 */}
        {result.faces.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <AlertCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>未检测到人脸</p>
            <p className="text-sm">请尝试上传包含清晰人脸的图片</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
