import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";

// 创建上传路由实例
export const uploadRoutes = new Hono();

// 上传请求验证 schema (预留给 TASK-1.9)
const uploadSchema = z.object({
  filename: z.string().min(1).max(255),
  contentType: z.string().regex(/^image\/(jpeg|jpg|png|webp)$/),
  size: z
    .number()
    .min(1)
    .max(10 * 1024 * 1024), // 最大 10MB
});

// 上传响应类型
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

// 文件上传端点 (TASK-1.9 将实现具体逻辑)
uploadRoutes.post("/upload", zValidator("json", uploadSchema), async (c) => {
  // TODO: TASK-1.9 将实现文件上传逻辑
  // 1. 接收 multipart/form-data
  // 2. 验证文件类型和大小
  // 3. 上传到 Cloudflare R2
  // 4. 返回文件访问 URL

  return c.json(
    {
      success: false,
      error: {
        message: "Upload functionality not implemented yet",
        code: "NOT_IMPLEMENTED",
      },
    },
    501
  );
});

// 文件信息查询端点
uploadRoutes.get("/upload/:fileId", async (c) => {
  const fileId = c.req.param("fileId");

  // TODO: TASK-1.9 将实现文件信息查询
  return c.json(
    {
      success: false,
      error: {
        message: "File info endpoint not implemented yet",
        code: "NOT_IMPLEMENTED",
      },
    },
    501
  );
});

// 文件删除端点 (可选功能)
uploadRoutes.delete("/upload/:fileId", async (c) => {
  const fileId = c.req.param("fileId");

  // TODO: 后续迭代可能实现文件删除功能
  return c.json(
    {
      success: false,
      error: {
        message: "File deletion not implemented yet",
        code: "NOT_IMPLEMENTED",
      },
    },
    501
  );
});
