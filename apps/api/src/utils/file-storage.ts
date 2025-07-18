import { v4 as uuidv4 } from "uuid";
import {
  generateSafeFilename,
  getFileExtensionFromMimeType,
} from "./file-validation";

// 存储相关配置
export const STORAGE_CONFIG = {
  // 存储路径前缀
  UPLOADS_PREFIX: "uploads",
  TEMP_PREFIX: "temp",

  // 文件名长度限制
  MAX_FILENAME_LENGTH: 100,

  // 存储桶配置
  BUCKET_NAME: "face-recog-photos",
} as const;

// 文件存储信息接口
export interface FileStorageInfo {
  fileId: string;
  originalName: string;
  safeFilename: string;
  storageKey: string;
  contentType: string;
  size: number;
  uploadedAt: string;
}

// 生成唯一文件ID
export function generateFileId(): string {
  return uuidv4();
}

// 生成存储键 (S3/R2 对象键)
export function generateStorageKey(
  fileId: string,
  originalName: string,
  mimeType: string
): string {
  // 生成安全的文件名
  const safeFilename = generateSafeFilename(originalName, mimeType);

  // 截断文件名防止过长
  const truncatedName = truncateFilename(
    safeFilename,
    STORAGE_CONFIG.MAX_FILENAME_LENGTH
  );

  // 构建存储路径: uploads/YYYY/MM/DD/fileId_filename.ext
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");

  return `${STORAGE_CONFIG.UPLOADS_PREFIX}/${year}/${month}/${day}/${fileId}_${truncatedName}`;
}

// 生成临时存储键 (用于处理过程中的文件)
export function generateTempStorageKey(
  fileId: string,
  originalName: string,
  mimeType: string
): string {
  const safeFilename = generateSafeFilename(originalName, mimeType);
  const truncatedName = truncateFilename(
    safeFilename,
    STORAGE_CONFIG.MAX_FILENAME_LENGTH
  );

  return `${STORAGE_CONFIG.TEMP_PREFIX}/${fileId}_${truncatedName}`;
}

// 截断文件名
function truncateFilename(filename: string, maxLength: number): string {
  if (filename.length <= maxLength) {
    return filename;
  }

  // 保留扩展名
  const extension = filename.substring(filename.lastIndexOf("."));
  const nameWithoutExt = filename.substring(0, filename.lastIndexOf("."));

  // 计算可用的名称长度
  const availableLength = maxLength - extension.length;

  if (availableLength <= 0) {
    // 如果扩展名太长，只保留扩展名
    return extension;
  }

  return nameWithoutExt.substring(0, availableLength) + extension;
}

// 从存储键提取文件信息
export function parseStorageKey(storageKey: string): {
  prefix: string;
  year?: string;
  month?: string;
  day?: string;
  fileId?: string;
  filename?: string;
} {
  const parts = storageKey.split("/");

  if (parts.length === 5 && parts[0] === STORAGE_CONFIG.UPLOADS_PREFIX) {
    // 格式: uploads/YYYY/MM/DD/fileId_filename.ext
    const prefix = parts[0]!;
    const year = parts[1]!;
    const month = parts[2]!;
    const day = parts[3]!;
    const fileWithId = parts[4];

    if (fileWithId) {
      const underscoreIndex = fileWithId.indexOf("_");

      if (underscoreIndex > 0) {
        const fileId = fileWithId.substring(0, underscoreIndex);
        const filename = fileWithId.substring(underscoreIndex + 1);

        return { prefix, year, month, day, fileId, filename };
      }
    }
  } else if (parts.length === 2 && parts[0] === STORAGE_CONFIG.TEMP_PREFIX) {
    // 格式: temp/fileId_filename.ext
    const prefix = parts[0]!;
    const fileWithId = parts[1];

    if (fileWithId) {
      const underscoreIndex = fileWithId.indexOf("_");

      if (underscoreIndex > 0) {
        const fileId = fileWithId.substring(0, underscoreIndex);
        const filename = fileWithId.substring(underscoreIndex + 1);

        return { prefix, fileId, filename };
      }
    }
  }

  // 无法解析的格式
  return { prefix: parts[0] || "" };
}

// 生成文件存储信息
export function createFileStorageInfo(
  file: {
    name: string;
    type: string;
    size: number;
  },
  fileId?: string
): FileStorageInfo {
  const id = fileId || generateFileId();
  const safeFilename = generateSafeFilename(file.name, file.type);
  const storageKey = generateStorageKey(id, file.name, file.type);
  const uploadedAt = new Date().toISOString();

  return {
    fileId: id,
    originalName: file.name,
    safeFilename,
    storageKey,
    contentType: file.type,
    size: file.size,
    uploadedAt,
  };
}

// 生成文件访问 URL (暂时返回占位符，TASK-1.10 会实现真实的 R2 URL)
export function generateFileUrl(storageKey: string, baseUrl?: string): string {
  // 在本地开发环境使用模拟URL
  if (!baseUrl) {
    return `http://localhost:8787/files/${encodeURIComponent(storageKey)}`;
  }

  // 生产环境使用实际的 R2 URL (TASK-1.10 会实现)
  return `${baseUrl}/${encodeURIComponent(storageKey)}`;
}

// 验证存储键格式
export function isValidStorageKey(storageKey: string): boolean {
  if (!storageKey || typeof storageKey !== "string") {
    return false;
  }

  // 检查长度
  if (storageKey.length === 0 || storageKey.length > 1024) {
    return false;
  }

  // 检查是否包含危险字符
  const dangerousChars = /[<>:"|?*\x00-\x1f]/;
  if (dangerousChars.test(storageKey)) {
    return false;
  }

  // 检查路径格式
  const validPrefixes = [
    STORAGE_CONFIG.UPLOADS_PREFIX,
    STORAGE_CONFIG.TEMP_PREFIX,
  ];
  const hasValidPrefix = validPrefixes.some((prefix) =>
    storageKey.startsWith(prefix + "/")
  );

  return hasValidPrefix;
}

// 清理临时文件键 (用于批处理删除)
export function generateTempFileCleanupPattern(
  olderThanHours: number = 24
): string {
  const cutoffTime = new Date(Date.now() - olderThanHours * 60 * 60 * 1000);
  const timestamp = cutoffTime.toISOString().replace(/[:.]/g, "-");

  return `${STORAGE_CONFIG.TEMP_PREFIX}/*_before_${timestamp}*`;
}
