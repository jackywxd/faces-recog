import { Hono } from "hono";
import { z } from "zod";
import { createAppError } from "../utils/error-handler";
import { logger } from "../utils/logger";

// 验证请求的 Zod schema
const DetectFacesRequestSchema = z.object({
  image: z.instanceof(File),
  minConfidence: z.number().min(0).max(1).optional(),
  maxFaces: z.number().min(1).max(50).optional(),
  enableLandmarks: z.boolean().optional(),
  enableDescriptors: z.boolean().optional(),
});

// 验证响应的 Zod schema
const DetectFacesResponseSchema = z.object({
  success: z.boolean(),
  faces: z.array(
    z.object({
      boundingBox: z.object({
        x: z.number(),
        y: z.number(),
        width: z.number(),
        height: z.number(),
      }),
      confidence: z.number(),
      landmarks: z
        .array(
          z.object({
            x: z.number(),
            y: z.number(),
          })
        )
        .optional(),
      descriptor: z.array(z.number()).optional(),
    })
  ),
  processingTime: z.number(),
  imageInfo: z.object({
    width: z.number(),
    height: z.number(),
  }),
});

export const faceDetectionRoutes = new Hono<{
  Bindings: {
    // FACE_DETECTOR: DurableObjectNamespace; // 暂时注释掉
  };
}>();

faceDetectionRoutes.post("/detect-faces", async (c) => {
  try {
    // 解析 multipart/form-data
    const formData = await c.req.formData();
    const image = formData.get("image") as File | null;

    if (!image) {
      throw createAppError("No image file provided", 400, "MISSING_FILE");
    }

    // 验证文件类型
    if (!image.type.startsWith("image/")) {
      throw createAppError(
        "Invalid file type. Only images are allowed.",
        400,
        "INVALID_FILE_TYPE"
      );
    }

    // 验证文件大小 (10MB)
    if (image.size > 10 * 1024 * 1024) {
      throw createAppError(
        "File too large. Maximum size is 10MB.",
        400,
        "FILE_TOO_LARGE"
      );
    }

    // 解析选项参数
    const minConfidence = formData.get("minConfidence")
      ? parseFloat(formData.get("minConfidence") as string)
      : undefined;
    const maxFaces = formData.get("maxFaces")
      ? parseInt(formData.get("maxFaces") as string, 10)
      : undefined;
    const enableLandmarks = formData.get("enableLandmarks") === "true";
    const enableDescriptors = formData.get("enableDescriptors") === "true";

    logger.info("Processing face detection request", {
      filename: image.name,
      size: image.size,
      type: image.type,
    });

    // 模拟面部检测结果（用于测试）
    const startTime = Date.now();

    // 模拟处理时间
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const processingTime = Date.now() - startTime;

    // 根据文件名生成模拟检测结果
    let faces: any[] = [];
    if (image.name.includes("single") || image.name.includes("portrait")) {
      faces = [
        {
          boundingBox: { x: 100, y: 100, width: 200, height: 200 },
          confidence: 0.95,
          landmarks: enableLandmarks
            ? Array.from({ length: 68 }, (_, i) => ({ x: 100 + i, y: 100 + i }))
            : undefined,
          descriptor: enableDescriptors
            ? Array.from({ length: 128 }, () => Math.random())
            : undefined,
        },
      ];
    } else if (
      image.name.includes("group") ||
      image.name.includes("multiple")
    ) {
      faces = [
        {
          boundingBox: { x: 50, y: 50, width: 150, height: 150 },
          confidence: 0.92,
        },
        {
          boundingBox: { x: 250, y: 50, width: 150, height: 150 },
          confidence: 0.88,
        },
        {
          boundingBox: { x: 150, y: 200, width: 150, height: 150 },
          confidence: 0.85,
        },
      ];
    } else if (
      image.name.includes("no-face") ||
      image.name.includes("landscape")
    ) {
      faces = [];
    } else {
      // 默认检测一个人脸
      faces = [
        {
          boundingBox: { x: 100, y: 100, width: 200, height: 200 },
          confidence: 0.9,
        },
      ];
    }

    // 应用置信度过滤
    if (minConfidence !== undefined) {
      faces = faces.filter((face) => face.confidence >= minConfidence);
    }

    // 应用最大人脸数限制
    if (maxFaces !== undefined) {
      faces = faces.slice(0, maxFaces);
    }

    const detectionResult = {
      faces,
      processingTime,
      imageInfo: { width: 800, height: 600 }, // 模拟图像信息
    };

    // 验证响应格式
    const validationResult =
      DetectFacesResponseSchema.safeParse(detectionResult);
    if (!validationResult.success) {
      logger.error("Invalid detection response format", {
        errors: validationResult.error.issues,
      });
      throw createAppError(
        "Invalid detection response format",
        500,
        "INVALID_RESPONSE"
      );
    }

    logger.info("Face detection completed", {
      facesDetected: validationResult.data.faces.length,
      processingTime: validationResult.data.processingTime,
    });

    return c.json(validationResult.data);
  } catch (error) {
    logger.error("Face detection API error", {
      error: error instanceof Error ? error.message : error,
    });

    if (error instanceof Error && "statusCode" in error) {
      throw error;
    }

    throw createAppError("Face detection failed", 500, "DETECTION_ERROR");
  }
});

// 健康检查端点
faceDetectionRoutes.get("/health", async (c) => {
  try {
    // 模拟健康检查响应
    return c.json({
      status: "healthy",
      service: "face-detection-api",
      timestamp: new Date().toISOString(),
      version: "1.0.0",
    });
  } catch (error) {
    logger.error("Health check failed", {
      error: error instanceof Error ? error.message : error,
    });

    return c.json(
      {
        status: "unhealthy",
        error: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      },
      503
    );
  }
});
