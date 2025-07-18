import type { R2Bucket, R2Object } from "@cloudflare/workers-types";
import { generateFileUrl, isValidStorageKey } from "../utils/file-storage";

// R2 存储服务配置
export const R2_CONFIG = {
  // 文件访问的默认过期时间 (7天)
  DEFAULT_PRESIGNED_URL_EXPIRES: 7 * 24 * 60 * 60, // 7 days in seconds

  // 公共文件访问的过期时间 (1年)
  PUBLIC_URL_EXPIRES: 365 * 24 * 60 * 60, // 1 year in seconds

  // 上传操作的最大重试次数
  MAX_UPLOAD_RETRIES: 3,

  // 支持的content-type
  SUPPORTED_CONTENT_TYPES: ["image/jpeg", "image/png", "image/webp"],
} as const;

// R2 操作结果接口
export interface R2UploadResult {
  success: boolean;
  storageKey?: string;
  url?: string;
  size?: number;
  etag?: string;
  error?: string;
}

export interface R2FileInfo {
  exists: boolean;
  size?: number;
  etag?: string;
  lastModified?: Date;
  contentType?: string | undefined;
  metadata?: Record<string, string> | undefined;
}

// R2 存储服务类
export class R2StorageService {
  private bucket: R2Bucket;

  constructor(bucket: R2Bucket) {
    this.bucket = bucket;
  }

  /**
   * 上传文件到 R2
   */
  async uploadFile(
    storageKey: string,
    fileBuffer: ArrayBuffer,
    contentType: string,
    metadata?: Record<string, string>
  ): Promise<R2UploadResult> {
    try {
      // 验证存储键格式
      if (!isValidStorageKey(storageKey)) {
        return {
          success: false,
          error: "Invalid storage key format",
        };
      }

      // 验证文件内容类型
      if (!R2_CONFIG.SUPPORTED_CONTENT_TYPES.includes(contentType as any)) {
        return {
          success: false,
          error: `Unsupported content type: ${contentType}`,
        };
      }

      // 验证文件大小
      if (fileBuffer.byteLength === 0) {
        return {
          success: false,
          error: "File buffer is empty",
        };
      }

      // 准备上传选项
      const uploadOptions: R2PutOptions = {
        httpMetadata: {
          contentType,
          cacheControl: "public, max-age=31536000", // 1 year cache
        },
        customMetadata: {
          uploadedAt: new Date().toISOString(),
          originalContentType: contentType,
          ...metadata,
        },
      };

      // 执行上传操作 (带重试)
      let lastError: Error | null = null;

      for (
        let attempt = 1;
        attempt <= R2_CONFIG.MAX_UPLOAD_RETRIES;
        attempt++
      ) {
        try {
          console.log(
            `Uploading to R2 (attempt ${attempt}/${R2_CONFIG.MAX_UPLOAD_RETRIES}): ${storageKey}`
          );

          const result = await this.bucket.put(
            storageKey,
            fileBuffer,
            uploadOptions
          );

          if (result) {
            // 生成文件访问 URL
            const fileUrl = await this.generateFileUrl(storageKey);

            console.log(
              `Successfully uploaded to R2: ${storageKey} (${fileBuffer.byteLength} bytes)`
            );

            return {
              success: true,
              storageKey,
              url: fileUrl,
              size: fileBuffer.byteLength,
              etag: result.etag,
            };
          } else {
            throw new Error("R2 put operation returned null");
          }
        } catch (error) {
          lastError = error instanceof Error ? error : new Error(String(error));
          console.warn(`Upload attempt ${attempt} failed:`, lastError.message);

          // 如果不是最后一次尝试，等待一下再重试
          if (attempt < R2_CONFIG.MAX_UPLOAD_RETRIES) {
            await new Promise((resolve) => setTimeout(resolve, 1000 * attempt));
          }
        }
      }

      // 所有重试都失败了
      return {
        success: false,
        error: `Failed to upload after ${
          R2_CONFIG.MAX_UPLOAD_RETRIES
        } attempts: ${lastError?.message || "Unknown error"}`,
      };
    } catch (error) {
      console.error("R2 upload error:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown upload error",
      };
    }
  }

  /**
   * 获取文件信息
   */
  async getFileInfo(storageKey: string): Promise<R2FileInfo> {
    try {
      if (!isValidStorageKey(storageKey)) {
        return { exists: false };
      }

      const object = await this.bucket.head(storageKey);

      if (!object) {
        return { exists: false };
      }

      return {
        exists: true,
        size: object.size,
        etag: object.etag,
        lastModified: object.uploaded,
        contentType: object.httpMetadata?.contentType,
        metadata: object.customMetadata,
      };
    } catch (error) {
      console.error("Failed to get file info from R2:", error);
      return { exists: false };
    }
  }

  /**
   * 删除文件
   */
  async deleteFile(storageKey: string): Promise<boolean> {
    try {
      if (!isValidStorageKey(storageKey)) {
        return false;
      }

      await this.bucket.delete(storageKey);
      console.log(`Successfully deleted from R2: ${storageKey}`);
      return true;
    } catch (error) {
      console.error("Failed to delete file from R2:", error);
      return false;
    }
  }

  /**
   * 生成文件访问 URL
   */
  async generateFileUrl(
    storageKey: string,
    expiresIn?: number
  ): Promise<string> {
    try {
      if (!isValidStorageKey(storageKey)) {
        throw new Error("Invalid storage key");
      }

      // 检查文件是否存在
      const fileInfo = await this.getFileInfo(storageKey);
      if (!fileInfo.exists) {
        throw new Error("File does not exist");
      }

      const expires = expiresIn || R2_CONFIG.PUBLIC_URL_EXPIRES;

      // TODO: R2 预签名 URL 功能暂时不可用，使用公共 URL
      // 在生产环境中，需要配置自定义域名来提供公共访问
      // const presignedUrl = await this.bucket.createPresignedUrl(storageKey, 'GET', {
      //   expiresIn: expires
      // });

      // 暂时使用模拟 URL，在生产环境中需要配置自定义域名
      return generateFileUrl(storageKey, "https://your-custom-domain.com");
    } catch (error) {
      console.error("Failed to generate file URL:", error);

      // 回退到本地模拟 URL (用于开发环境)
      return generateFileUrl(storageKey);
    }
  }

  /**
   * 列出文件 (用于清理和管理)
   */
  async listFiles(prefix?: string, limit: number = 100): Promise<R2Object[]> {
    try {
      const options: R2ListOptions = {
        limit,
        ...(prefix && { prefix }),
      };

      const result = await this.bucket.list(options);
      return result.objects;
    } catch (error) {
      console.error("Failed to list files from R2:", error);
      return [];
    }
  }

  /**
   * 检查存储桶连接
   */
  async checkConnection(): Promise<boolean> {
    try {
      // 尝试列出一个对象来测试连接
      await this.bucket.list({ limit: 1 });
      return true;
    } catch (error) {
      console.error("R2 connection check failed:", error);
      return false;
    }
  }

  /**
   * 获取存储桶统计信息
   */
  async getStats(prefix?: string): Promise<{
    totalFiles: number;
    totalSize: number;
    lastChecked: Date;
  }> {
    try {
      const objects = await this.listFiles(prefix, 1000); // 限制为前1000个文件

      const totalFiles = objects.length;
      const totalSize = objects.reduce((sum, obj) => sum + obj.size, 0);

      return {
        totalFiles,
        totalSize,
        lastChecked: new Date(),
      };
    } catch (error) {
      console.error("Failed to get R2 stats:", error);
      return {
        totalFiles: 0,
        totalSize: 0,
        lastChecked: new Date(),
      };
    }
  }
}

// 工厂函数：创建 R2 存储服务实例
export function createR2StorageService(bucket: R2Bucket): R2StorageService {
  return new R2StorageService(bucket);
}

// 类型定义 (补充 @cloudflare/workers-types 中可能缺少的类型)
interface R2PutOptions {
  httpMetadata?: {
    contentType?: string;
    contentLanguage?: string;
    contentDisposition?: string;
    contentEncoding?: string;
    cacheControl?: string;
    expires?: Date;
  };
  customMetadata?: Record<string, string>;
}

interface R2ListOptions {
  limit?: number;
  prefix?: string;
  cursor?: string;
  delimiter?: string;
}
