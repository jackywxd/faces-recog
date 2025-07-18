// 导出所有表模式
export * from "./photos";
export * from "./face-encodings";
export * from "./search-jobs";

// 导出关系定义
import { photos } from "./photos";
import { faceEncodings } from "./face-encodings";
import { searchJobs } from "./search-jobs";
import { relations } from "drizzle-orm";

// 定义表关系
export const photosRelations = relations(photos, ({ many }) => ({
  faceEncodings: many(faceEncodings),
}));

export const faceEncodingsRelations = relations(faceEncodings, ({ one }) => ({
  photo: one(photos, {
    fields: [faceEncodings.photoId],
    references: [photos.id],
  }),
}));
