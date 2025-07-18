import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// 文件大小格式化
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

// 时间格式化
export function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return "刚刚";
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} 分钟前`;
  if (diffInSeconds < 86400)
    return `${Math.floor(diffInSeconds / 3600)} 小时前`;
  if (diffInSeconds < 2592000)
    return `${Math.floor(diffInSeconds / 86400)} 天前`;

  return date.toLocaleDateString("zh-CN");
}

// 文件类型验证
export function isImageFile(file: File): boolean {
  return file.type.startsWith("image/");
}

export function isSupportedImageType(file: File): boolean {
  const supportedTypes = ["image/jpeg", "image/png", "image/webp"];
  return supportedTypes.includes(file.type);
}

// 图片处理工具
export function createImagePreview(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// 压缩图片（使用 Canvas）
export function compressImage(
  file: File,
  maxWidth: number = 800,
  quality: number = 0.8
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    if (!ctx) {
      reject(new Error("无法创建 Canvas 上下文"));
      return;
    }

    img.onload = () => {
      // 计算新尺寸
      let { width, height } = img;
      if (width > maxWidth) {
        height = (height * maxWidth) / width;
        width = maxWidth;
      }

      // 设置画布尺寸
      canvas.width = width;
      canvas.height = height;

      // 绘制图片
      ctx.drawImage(img, 0, 0, width, height);

      // 转换为 Blob
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error("图片压缩失败"));
          }
        },
        file.type,
        quality
      );
    };

    img.onerror = () => reject(new Error("图片加载失败"));
    img.src = URL.createObjectURL(file);
  });
}

// 获取图片尺寸
export function getImageDimensions(
  file: File
): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      resolve({ width: img.naturalWidth, height: img.naturalHeight });
    };
    img.onerror = () => reject(new Error("无法读取图片尺寸"));
    img.src = URL.createObjectURL(file);
  });
}

// 验证图片尺寸
export function validateImageDimensions(
  file: File,
  minWidth?: number,
  minHeight?: number,
  maxWidth?: number,
  maxHeight?: number
): Promise<{
  isValid: boolean;
  error?: string;
  dimensions: { width: number; height: number };
}> {
  return getImageDimensions(file).then((dimensions) => {
    const { width, height } = dimensions;

    if (minWidth && width < minWidth) {
      return {
        isValid: false,
        error: `图片宽度不能小于 ${minWidth}px`,
        dimensions,
      };
    }

    if (minHeight && height < minHeight) {
      return {
        isValid: false,
        error: `图片高度不能小于 ${minHeight}px`,
        dimensions,
      };
    }

    if (maxWidth && width > maxWidth) {
      return {
        isValid: false,
        error: `图片宽度不能大于 ${maxWidth}px`,
        dimensions,
      };
    }

    if (maxHeight && height > maxHeight) {
      return {
        isValid: false,
        error: `图片高度不能大于 ${maxHeight}px`,
        dimensions,
      };
    }

    return { isValid: true, dimensions };
  });
}
