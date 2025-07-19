import sharp from "sharp";
import { config } from "../config";
import { logger } from "../utils/logger";

export interface ProcessedImage {
  buffer: Buffer;
  width: number;
  height: number;
  format: string;
}

export class ImageProcessor {
  async preprocess(imageBuffer: Buffer): Promise<ProcessedImage> {
    try {
      logger.debug("Starting image preprocessing");

      // 获取图像信息
      const metadata = await sharp(imageBuffer).metadata();

      if (!metadata.width || !metadata.height) {
        throw new Error("Invalid image: missing dimensions");
      }

      // 预处理图像：调整大小、优化格式
      const processedBuffer = await sharp(imageBuffer)
        .resize(1024, 1024, {
          fit: "inside",
          withoutEnlargement: true,
        })
        .jpeg({
          quality: config.imageProcessing.quality,
          progressive: true,
        })
        .toBuffer();

      const result: ProcessedImage = {
        buffer: processedBuffer,
        width: metadata.width,
        height: metadata.height,
        format: "jpeg",
      };

      logger.debug("Image preprocessing completed", {
        originalSize: imageBuffer.length,
        processedSize: processedBuffer.length,
        dimensions: `${result.width}x${result.height}`,
      });

      return result;
    } catch (error) {
      logger.error("Image preprocessing failed", {
        error: error instanceof Error ? error.message : error,
      });
      throw new Error("Failed to process image");
    }
  }

  async createThumbnail(
    imageBuffer: Buffer,
    size: number = 300
  ): Promise<Buffer> {
    try {
      return await sharp(imageBuffer)
        .resize(size, size, {
          fit: "cover",
          position: "center",
        })
        .jpeg({ quality: 80 })
        .toBuffer();
    } catch (error) {
      logger.error("Thumbnail creation failed", {
        error: error instanceof Error ? error.message : error,
      });
      throw new Error("Failed to create thumbnail");
    }
  }

  async validateImage(imageBuffer: Buffer): Promise<boolean> {
    try {
      const metadata = await sharp(imageBuffer).metadata();
      return !!(metadata.width && metadata.height);
    } catch {
      return false;
    }
  }
}
