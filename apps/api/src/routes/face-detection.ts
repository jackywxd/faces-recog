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
    FACE_DETECTOR: DurableObjectNamespace;
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

    // 获取容器实例
    const containerId = c.env.FACE_DETECTOR.idFromName("face-detector");
    const container = c.env.FACE_DETECTOR.get(containerId);

    // 将图像转换为 ArrayBuffer
    const imageBuffer = await image.arrayBuffer();

    // 调用容器服务进行面部检测
    const options = {
      minConfidence,
      maxFaces,
      enableLandmarks,
      enableDescriptors,
    };

    const result = await container.fetch("/detect-faces", {
      method: "POST",
      body: (() => {
        const form = new FormData();
        form.append(
          "image",
          new Blob([imageBuffer], { type: image.type }),
          image.name
        );

        if (options.minConfidence !== undefined) {
          form.append("minConfidence", options.minConfidence.toString());
        }
        if (options.maxFaces !== undefined) {
          form.append("maxFaces", options.maxFaces.toString());
        }
        form.append("enableLandmarks", options.enableLandmarks.toString());
        form.append("enableDescriptors", options.enableDescriptors.toString());

        return form;
      })(),
    });

    if (!result.ok) {
      const errorText = await result.text();
      throw createAppError(
        `Face detection failed: ${errorText}`,
        500,
        "DETECTION_ERROR"
      );
    }

    const detectionResult = await result.json();

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
    const containerId = c.env.FACE_DETECTOR.idFromName("face-detector");
    const container = c.env.FACE_DETECTOR.get(containerId);

    const response = await container.fetch("/health");

    if (!response.ok) {
      throw createAppError(
        "Container health check failed",
        503,
        "CONTAINER_UNHEALTHY"
      );
    }

    const healthData = await response.json();

    return c.json({
      status: "healthy",
      container: healthData,
      timestamp: new Date().toISOString(),
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
