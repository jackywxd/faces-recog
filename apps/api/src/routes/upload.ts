import { Hono } from "hono";
import { z } from "zod";
import { validateUploadedFile } from "../utils/file-validation";
import { createFileStorageInfo } from "../utils/file-storage";
import { createR2StorageService } from "../services/r2-storage";
import type { ApiResponse, FileUploadResponse } from "../types";

// 创建上传路由实例
export const uploadRoutes = new Hono();

// 上传响应 schema
const uploadResponseSchema = z.object({
  success: z.boolean(),
  data: z
    .object({
      fileId: z.string().uuid(),
      filename: z.string(),
      url: z.string().url(),
      size: z.number(),
      uploadedAt: z.string().datetime(),
    })
    .optional(),
  error: z
    .object({
      message: z.string(),
      code: z.string(),
    })
    .optional(),
});

// 文件上传端点
uploadRoutes.post("/upload", async (c) => {
  try {
    // 检查 Content-Type 是否为 multipart/form-data
    const contentType = c.req.header("content-type");
    if (!contentType || !contentType.includes("multipart/form-data")) {
      return c.json<ApiResponse<never>>(
        {
          success: false,
          error: {
            message: "Content-Type must be multipart/form-data",
            code: "INVALID_CONTENT_TYPE",
          },
        },
        400
      );
    }

    // 解析 multipart/form-data
    const formData = await c.req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return c.json<ApiResponse<never>>(
        {
          success: false,
          error: {
            message:
              "No file provided. Please include a file in the 'file' field.",
            code: "MISSING_FILE",
          },
        },
        400
      );
    }

    // 验证文件
    const validationResult = await validateUploadedFile(file);

    if (!validationResult.isValid) {
      return c.json<ApiResponse<never>>(
        {
          success: false,
          error: {
            message: `File validation failed: ${validationResult.errors.join(
              ", "
            )}`,
            code: "VALIDATION_FAILED",
          },
        },
        400
      );
    }

    // 创建文件存储信息
    const storageInfo = createFileStorageInfo({
      name: file.name,
      type: file.type,
      size: file.size,
    });

    // 检查 R2 存储桶是否可用
    if (!c.env?.BUCKET) {
      return c.json<ApiResponse<never>>(
        {
          success: false,
          error: {
            message: "Storage service not available",
            code: "STORAGE_UNAVAILABLE",
          },
        },
        500
      );
    }

    // 创建 R2 存储服务实例
    const r2Service = createR2StorageService(c.env.BUCKET as any);

    // 上传文件到 R2
    const uploadResult = await r2Service.uploadFile(
      storageInfo.storageKey,
      validationResult.file!.buffer,
      file.type,
      {
        originalFilename: file.name,
        fileSize: file.size.toString(),
        uploadedBy: "user", // 可以在后续迭代中添加用户认证
        clientInfo: c.req.header("user-agent") || "unknown",
      }
    );

    // 检查上传结果
    if (!uploadResult.success) {
      console.error("R2 upload failed:", uploadResult.error);
      return c.json<ApiResponse<never>>(
        {
          success: false,
          error: {
            message: `File upload failed: ${uploadResult.error}`,
            code: "UPLOAD_FAILED",
          },
        },
        500
      );
    }

    console.log(
      `Successfully uploaded to R2: ${file.name} (${file.size} bytes)`
    );
    console.log(`Storage key: ${storageInfo.storageKey}`);
    console.log(`File URL: ${uploadResult.url}`);

    // 返回成功响应
    const response: ApiResponse<FileUploadResponse> = {
      success: true,
      data: {
        fileId: storageInfo.fileId,
        filename: storageInfo.originalName,
        url: uploadResult.url!,
        size: storageInfo.size,
        uploadedAt: storageInfo.uploadedAt,
      },
      timestamp: new Date().toISOString(),
    };

    return c.json(response, 200);
  } catch (error) {
    console.error("Upload error:", error);

    return c.json<ApiResponse<never>>(
      {
        success: false,
        error: {
          message: "Internal server error during file upload",
          code: "UPLOAD_ERROR",
          details: error instanceof Error ? error.message : "Unknown error",
        },
        timestamp: new Date().toISOString(),
      },
      500
    );
  }
});

// 文件信息查询端点
uploadRoutes.get("/upload/:fileId", async (c) => {
  try {
    const fileId = c.req.param("fileId");

    // 验证 fileId 格式 (UUID)
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(fileId)) {
      return c.json<ApiResponse<never>>(
        {
          success: false,
          error: {
            message: "Invalid file ID format",
            code: "INVALID_FILE_ID",
          },
        },
        400
      );
    }

    // 检查 R2 存储桶是否可用
    if (!c.env?.BUCKET) {
      return c.json<ApiResponse<never>>(
        {
          success: false,
          error: {
            message: "Storage service not available",
            code: "STORAGE_UNAVAILABLE",
          },
        },
        500
      );
    }

    // 创建 R2 存储服务实例
    const r2Service = createR2StorageService(c.env.BUCKET as any);

    // TODO: 这里需要从数据库查询 fileId 对应的 storageKey
    // 当前暂时返回 not implemented，因为需要在迭代3中实现数据库存储
    console.log(`File info requested for ID: ${fileId}`);

    return c.json<ApiResponse<never>>(
      {
        success: false,
        error: {
          message:
            "File info lookup requires database integration. Will be implemented in iteration 3.",
          code: "DATABASE_REQUIRED",
        },
      },
      501
    );
  } catch (error) {
    console.error("File info query error:", error);

    return c.json<ApiResponse<never>>(
      {
        success: false,
        error: {
          message: "Internal server error during file info query",
          code: "QUERY_ERROR",
          details: error instanceof Error ? error.message : "Unknown error",
        },
        timestamp: new Date().toISOString(),
      },
      500
    );
  }
});

// 文件删除端点 (预留功能)
uploadRoutes.delete("/upload/:fileId", async (c) => {
  try {
    const fileId = c.req.param("fileId");

    // 验证 fileId 格式 (UUID)
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(fileId)) {
      return c.json<ApiResponse<never>>(
        {
          success: false,
          error: {
            message: "Invalid file ID format",
            code: "INVALID_FILE_ID",
          },
        },
        400
      );
    }

    // TODO: 后续迭代会实现文件删除功能
    console.log(`File deletion requested for ID: ${fileId}`);

    return c.json<ApiResponse<never>>(
      {
        success: false,
        error: {
          message: "File deletion feature not implemented yet.",
          code: "NOT_IMPLEMENTED",
        },
      },
      501
    );
  } catch (error) {
    console.error("File deletion error:", error);

    return c.json<ApiResponse<never>>(
      {
        success: false,
        error: {
          message: "Internal server error during file deletion",
          code: "DELETION_ERROR",
          details: error instanceof Error ? error.message : "Unknown error",
        },
        timestamp: new Date().toISOString(),
      },
      500
    );
  }
});
