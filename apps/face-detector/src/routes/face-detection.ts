import { Router, Request, Response } from "express";
import multer from "multer";
import { z } from "zod";
import { config } from "../config";
import { logger } from "../utils/logger";
import { createAppError } from "../middleware/error-handler";
import { FaceDetectionService } from "../services/face-detection";
import { ImageProcessor } from "../services/image-processor";

const router: Router = Router();

// 配置 multer 用于文件上传
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: config.imageProcessing.maxFileSize,
    files: 1,
  },
  fileFilter: (req, file, cb) => {
    if (config.imageProcessing.allowedFormats.includes(file.mimetype as any)) {
      cb(null, true);
    } else {
      cb(new Error("Unsupported file format"));
    }
  },
});

// 验证请求的 Zod schema
const DetectFacesRequestSchema = z.object({
  minConfidence: z.number().min(0).max(1).optional(),
  maxFaces: z.number().min(1).max(50).optional(),
  enableLandmarks: z.boolean().optional(),
  enableDescriptors: z.boolean().optional(),
});

// 面部检测服务实例
const faceDetectionService = new FaceDetectionService();
const imageProcessor = new ImageProcessor();

router.post(
  "/detect-faces",
  upload.single("image"),
  async (req: Request, res: Response) => {
    try {
      // 验证文件上传
      if (!req.file) {
        throw createAppError("No image file provided", 400, "MISSING_FILE");
      }

      // 验证请求参数
      const validationResult = DetectFacesRequestSchema.safeParse(req.body);
      if (!validationResult.success) {
        throw createAppError(
          "Invalid request parameters",
          400,
          "INVALID_PARAMS"
        );
      }

      const { minConfidence, maxFaces, enableLandmarks, enableDescriptors } =
        validationResult.data;

      logger.info("Processing face detection request", {
        filename: req.file.originalname,
        size: req.file.size,
        mimetype: req.file.mimetype,
      });

      // 预处理图像
      const processedImage = await imageProcessor.preprocess(req.file.buffer);

      // 执行面部检测
      const detectionOptions = {
        minConfidence: minConfidence ?? config.faceDetection.minConfidence,
        maxFaces: maxFaces ?? config.faceDetection.maxFaces,
        enableLandmarks:
          enableLandmarks ?? config.faceDetection.enableLandmarks,
        enableDescriptors:
          enableDescriptors ?? config.faceDetection.enableDescriptors,
      };

      const results = await faceDetectionService.detectFaces(
        processedImage,
        detectionOptions
      );

      logger.info("Face detection completed", {
        facesDetected: results.faces.length,
        processingTime: results.processingTime,
      });

      res.json({
        success: true,
        faces: results.faces,
        processingTime: results.processingTime,
        imageInfo: {
          width: results.imageInfo.width,
          height: results.imageInfo.height,
        },
      });
    } catch (error) {
      logger.error("Face detection error", {
        error: error instanceof Error ? error.message : error,
      });

      if (error instanceof Error && "statusCode" in error) {
        throw error;
      }

      throw createAppError("Face detection failed", 500, "DETECTION_ERROR");
    }
  }
);

export const faceDetectionRoutes = router;
