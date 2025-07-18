import { z } from "zod";

// 文件上传相关类型
export const FileUploadSchema = z.object({
  name: z.string().min(1).max(255),
  size: z
    .number()
    .positive()
    .max(10 * 1024 * 1024), // 10MB 限制
  type: z
    .string()
    .refine(
      (type) => ["image/jpeg", "image/png", "image/webp"].includes(type),
      { message: "只支持 JPEG、PNG 和 WebP 格式" }
    ),
  lastModified: z.number(),
});

export type FileUpload = z.infer<typeof FileUploadSchema>;

// 照片相关类型
export const PhotoSchema = z.object({
  id: z.string().uuid(),
  filename: z.string().min(1).max(255),
  originalName: z.string().min(1).max(255),
  mimeType: z.string(),
  size: z.number().positive(),
  storagePath: z.string().min(1),
  thumbnailPath: z.string().optional(),
  uploadedAt: z.string().datetime(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

export type Photo = z.infer<typeof PhotoSchema>;

// 人脸检测相关类型
export const FaceDetectionSchema = z.object({
  bbox: z.object({
    x: z.number(),
    y: z.number(),
    width: z.number(),
    height: z.number(),
  }),
  landmarks: z.array(
    z.object({
      x: z.number(),
      y: z.number(),
    })
  ),
  confidence: z.number().min(0).max(1),
});

export type FaceDetection = z.infer<typeof FaceDetectionSchema>;

// 人脸编码类型
export const FaceEncodingSchema = z.object({
  id: z.string().uuid(),
  photoId: z.string().uuid(),
  encoding: z.array(z.number()),
  detection: FaceDetectionSchema,
  createdAt: z.string().datetime(),
});

export type FaceEncoding = z.infer<typeof FaceEncodingSchema>;

// 搜索作业类型
export const SearchJobSchema = z.object({
  id: z.string().uuid(),
  status: z.enum(["pending", "processing", "completed", "failed"]),
  queryPhotoPath: z.string(),
  queryFaceEncoding: z.array(z.number()).optional(),
  matchedPhotos: z.array(PhotoSchema).optional(),
  confidence: z.number().min(0).max(1).optional(),
  error: z.string().optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  completedAt: z.string().datetime().optional(),
});

export type SearchJob = z.infer<typeof SearchJobSchema>;

// API 响应类型
export const ApiResponseSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.object({
    success: z.boolean(),
    data: dataSchema.optional(),
    error: z.string().optional(),
    message: z.string().optional(),
  });

export type ApiResponse<T> = {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
};

// 上传进度类型
export const UploadProgressSchema = z.object({
  fileId: z.string(),
  filename: z.string(),
  progress: z.number().min(0).max(100),
  status: z.enum(["pending", "uploading", "completed", "failed"]),
  error: z.string().optional(),
});

export type UploadProgress = z.infer<typeof UploadProgressSchema>;
