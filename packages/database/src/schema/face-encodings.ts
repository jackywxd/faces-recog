import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";
import { createId } from "@paralleldrive/cuid2";
import { photos } from "./photos";

export const faceEncodings = sqliteTable("face_encodings", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  photoId: text("photo_id")
    .notNull()
    .references(() => photos.id, { onDelete: "cascade" }),
  encoding: text("encoding", { mode: "json" }).notNull(), // JSON 数组存储人脸编码

  // 人脸检测信息
  bboxX: real("bbox_x").notNull(),
  bboxY: real("bbox_y").notNull(),
  bboxWidth: real("bbox_width").notNull(),
  bboxHeight: real("bbox_height").notNull(),

  // 关键点信息 (JSON 数组)
  landmarks: text("landmarks", { mode: "json" }).notNull(),

  // 置信度
  confidence: real("confidence").notNull(),

  createdAt: text("created_at")
    .notNull()
    .$defaultFn(() => new Date().toISOString()),
});

export type FaceEncoding = typeof faceEncodings.$inferSelect;
export type NewFaceEncoding = typeof faceEncodings.$inferInsert;
