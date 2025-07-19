import * as faceapi from "@vladmandic/face-api";
import { Canvas, createCanvas, loadImage } from "canvas";
import { config } from "../config";
import { logger } from "../utils/logger";
import { ProcessedImage } from "./image-processor";

export interface FaceDetectionOptions {
  minConfidence: number;
  maxFaces: number;
  enableLandmarks: boolean;
  enableDescriptors: boolean;
}

export interface DetectedFace {
  boundingBox: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  confidence: number;
  landmarks?: Array<{ x: number; y: number }>;
  descriptor?: number[];
}

export interface DetectionResult {
  faces: DetectedFace[];
  processingTime: number;
  imageInfo: {
    width: number;
    height: number;
  };
}

export class FaceDetectionService {
  private modelsLoaded = false;
  private modelPath: string;

  constructor() {
    this.modelPath = config.faceDetection.modelPath;
  }

  async loadModels(): Promise<void> {
    if (this.modelsLoaded) {
      return;
    }

    try {
      logger.info("Loading face detection models", {
        modelPath: this.modelPath,
      });

      // 加载必要的模型
      await faceapi.nets.tinyFaceDetector.loadFromDisk(this.modelPath);
      await faceapi.nets.faceLandmark68Net.loadFromDisk(this.modelPath);
      await faceapi.nets.faceRecognitionNet.loadFromDisk(this.modelPath);

      this.modelsLoaded = true;
      logger.info("Face detection models loaded successfully");
    } catch (error) {
      logger.error("Failed to load face detection models", {
        error: error instanceof Error ? error.message : error,
      });
      throw new Error("Failed to load face detection models");
    }
  }

  async detectFaces(
    processedImage: ProcessedImage,
    options: FaceDetectionOptions
  ): Promise<DetectionResult> {
    const startTime = Date.now();

    try {
      // 确保模型已加载
      await this.loadModels();

      logger.debug("Starting face detection", {
        imageSize: `${processedImage.width}x${processedImage.height}`,
        options,
      });

      // 创建 Canvas 并加载图像
      const canvas = createCanvas(processedImage.width, processedImage.height);
      const ctx = canvas.getContext("2d");
      const image = await loadImage(processedImage.buffer);
      ctx.drawImage(image, 0, 0);

      // 执行面部检测
      const detections = await faceapi
        .detectAllFaces(canvas, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks()
        .withFaceDescriptors();

      // 过滤和格式化结果
      const faces: DetectedFace[] = detections
        .filter(
          (detection) => detection.detection.score >= options.minConfidence
        )
        .slice(0, options.maxFaces)
        .map((detection) => {
          const face: DetectedFace = {
            boundingBox: {
              x: detection.detection.box.x,
              y: detection.detection.box.y,
              width: detection.detection.box.width,
              height: detection.detection.box.height,
            },
            confidence: detection.detection.score,
          };

          // 添加面部特征点（如果启用）
          if (options.enableLandmarks && detection.landmarks) {
            face.landmarks = detection.landmarks.positions.map((point) => ({
              x: point.x,
              y: point.y,
            }));
          }

          // 添加面部描述符（如果启用）
          if (options.enableDescriptors && detection.descriptor) {
            face.descriptor = Array.from(detection.descriptor);
          }

          return face;
        });

      const processingTime = Date.now() - startTime;

      logger.info("Face detection completed", {
        facesDetected: faces.length,
        processingTime,
        averageConfidence:
          faces.length > 0
            ? faces.reduce((sum, face) => sum + face.confidence, 0) /
              faces.length
            : 0,
      });

      return {
        faces,
        processingTime,
        imageInfo: {
          width: processedImage.width,
          height: processedImage.height,
        },
      };
    } catch (error) {
      const processingTime = Date.now() - startTime;
      logger.error("Face detection failed", {
        error: error instanceof Error ? error.message : error,
        processingTime,
      });
      throw new Error("Face detection processing failed");
    }
  }

  async isModelLoaded(): Promise<boolean> {
    return this.modelsLoaded;
  }
}
