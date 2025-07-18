import { z } from "zod";

// 支持的图片格式
export const SUPPORTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
] as const;

// 文件大小限制 (10MB)
export const MAX_FILE_SIZE = 10 * 1024 * 1024;

// 文件验证结果接口
export interface FileValidationResult {
  isValid: boolean;
  errors: string[];
  file?: {
    name: string;
    type: string;
    size: number;
    buffer: ArrayBuffer;
  };
}

// 验证文件类型
export function isValidImageType(contentType: string): boolean {
  return SUPPORTED_IMAGE_TYPES.includes(contentType as any);
}

// 验证文件大小
export function isValidFileSize(size: number): boolean {
  return size > 0 && size <= MAX_FILE_SIZE;
}

// 验证文件名
export function isValidFilename(filename: string): boolean {
  if (!filename || filename.length === 0) return false;
  if (filename.length > 255) return false;

  // 检查危险字符
  const dangerousChars = /[<>:"/\\|?*\x00-\x1f]/;
  if (dangerousChars.test(filename)) return false;

  // 检查文件扩展名
  const allowedExtensions = /\.(jpg|jpeg|png|webp)$/i;
  return allowedExtensions.test(filename);
}

// 从 content-type 推断文件扩展名
export function getFileExtensionFromMimeType(mimeType: string): string {
  switch (mimeType) {
    case "image/jpeg":
    case "image/jpg":
      return ".jpg";
    case "image/png":
      return ".png";
    case "image/webp":
      return ".webp";
    default:
      return ".jpg"; // 默认扩展名
  }
}

// 生成安全的文件名
export function generateSafeFilename(
  originalName: string,
  mimeType: string
): string {
  // 清理原始文件名
  const baseName = originalName
    .replace(/[<>:"/\\|?*\x00-\x1f]/g, "_")
    .replace(/\s+/g, "_")
    .toLowerCase();

  // 移除原扩展名
  const nameWithoutExt = baseName.replace(/\.[^/.]+$/, "");

  // 添加正确的扩展名
  const extension = getFileExtensionFromMimeType(mimeType);

  return `${nameWithoutExt}${extension}`;
}

// 主文件验证函数
export async function validateUploadedFile(
  file: File
): Promise<FileValidationResult> {
  const errors: string[] = [];

  // 验证文件名
  if (!isValidFilename(file.name)) {
    errors.push(
      "Invalid filename. Only letters, numbers, and safe characters are allowed."
    );
  }

  // 验证文件类型
  if (!isValidImageType(file.type)) {
    errors.push(
      `Unsupported file type: ${
        file.type
      }. Supported types: ${SUPPORTED_IMAGE_TYPES.join(", ")}`
    );
  }

  // 验证文件大小
  if (!isValidFileSize(file.size)) {
    if (file.size === 0) {
      errors.push("File is empty");
    } else {
      errors.push(
        `File size exceeds limit. Maximum size: ${
          MAX_FILE_SIZE / 1024 / 1024
        }MB`
      );
    }
  }

  // 如果有验证错误，直接返回
  if (errors.length > 0) {
    return {
      isValid: false,
      errors,
    };
  }

  try {
    // 读取文件内容
    const buffer = await file.arrayBuffer();

    // 验证文件内容不为空
    if (buffer.byteLength === 0) {
      errors.push("File content is empty");
      return {
        isValid: false,
        errors,
      };
    }

    // 简单的图片文件头验证
    const isValidImageContent = validateImageFileContent(buffer, file.type);
    if (!isValidImageContent) {
      errors.push("File content does not match the declared type");
      return {
        isValid: false,
        errors,
      };
    }

    return {
      isValid: true,
      errors: [],
      file: {
        name: file.name,
        type: file.type,
        size: file.size,
        buffer,
      },
    };
  } catch (error) {
    errors.push(
      `Failed to read file: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
    return {
      isValid: false,
      errors,
    };
  }
}

// 验证图片文件内容 (简单的文件头检查)
function validateImageFileContent(
  buffer: ArrayBuffer,
  mimeType: string
): boolean {
  const uint8Array = new Uint8Array(buffer);

  // 至少需要4个字节来检查文件头
  if (uint8Array.length < 4) return false;

  switch (mimeType) {
    case "image/jpeg":
    case "image/jpg":
      // JPEG 文件头: FF D8 FF
      return (
        uint8Array[0] === 0xff &&
        uint8Array[1] === 0xd8 &&
        uint8Array[2] === 0xff
      );

    case "image/png":
      // PNG 文件头: 89 50 4E 47
      return (
        uint8Array[0] === 0x89 &&
        uint8Array[1] === 0x50 &&
        uint8Array[2] === 0x4e &&
        uint8Array[3] === 0x47
      );

    case "image/webp":
      // WebP 文件头: 52 49 46 46 (RIFF)，位置8-11为 57 45 42 50 (WEBP)
      if (uint8Array.length < 12) return false;
      return (
        uint8Array[0] === 0x52 &&
        uint8Array[1] === 0x49 &&
        uint8Array[2] === 0x46 &&
        uint8Array[3] === 0x46 &&
        uint8Array[8] === 0x57 &&
        uint8Array[9] === 0x45 &&
        uint8Array[10] === 0x42 &&
        uint8Array[11] === 0x50
      );

    default:
      return false;
  }
}
