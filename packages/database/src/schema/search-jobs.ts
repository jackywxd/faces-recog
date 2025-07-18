import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";
import { createId } from "@paralleldrive/cuid2";

export const searchJobs = sqliteTable("search_jobs", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  status: text("status", {
    enum: ["pending", "processing", "completed", "failed"],
  })
    .notNull()
    .default("pending"),

  // 查询图片信息
  queryPhotoPath: text("query_photo_path").notNull(),
  queryFaceEncoding: text("query_face_encoding", { mode: "json" }),

  // 匹配结果 (JSON 数组存储照片 ID)
  matchedPhotoIds: text("matched_photo_ids", { mode: "json" }),
  confidence: real("confidence"),

  // 错误信息
  error: text("error"),

  // 时间戳
  createdAt: text("created_at")
    .notNull()
    .$defaultFn(() => new Date().toISOString()),
  updatedAt: text("updated_at")
    .notNull()
    .$defaultFn(() => new Date().toISOString()),
  completedAt: text("completed_at"),
});

export type SearchJob = typeof searchJobs.$inferSelect;
export type NewSearchJob = typeof searchJobs.$inferInsert;
