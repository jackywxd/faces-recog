import { useState, useCallback } from "react";
import { useToast } from "./use-toast";
import { isImageFile, isSupportedImageType, formatFileSize } from "@/lib/utils";

export type UploadStatus = "idle" | "uploading" | "success" | "error";

export interface UploadFile {
  file: File;
  id: string;
  preview?: string;
  progress: number;
  status: UploadStatus;
  error?: string;
}

export interface UseFileUploadOptions {
  maxFileSize?: number; // in bytes
  maxFiles?: number;
  acceptedTypes?: string[];
  onUploadComplete?: (files: UploadFile[]) => void;
  onUploadError?: (error: string) => void;
}

export function useFileUpload(options: UseFileUploadOptions = {}) {
  const {
    maxFileSize = 10 * 1024 * 1024, // 10MB
    maxFiles = 1,
    acceptedTypes = ["image/jpeg", "image/png", "image/webp"],
    onUploadComplete,
    onUploadError,
  } = options;

  const { toast } = useToast();
  const [files, setFiles] = useState<UploadFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  // 验证文件
  const validateFile = useCallback(
    (file: File): { isValid: boolean; error?: string } => {
      if (!isImageFile(file)) {
        return { isValid: false, error: "只支持图片文件" };
      }

      if (!isSupportedImageType(file)) {
        return { isValid: false, error: "只支持 JPG、PNG、WebP 格式" };
      }

      if (file.size > maxFileSize) {
        return {
          isValid: false,
          error: `文件大小不能超过 ${formatFileSize(maxFileSize)}`,
        };
      }

      if (files.length >= maxFiles) {
        return {
          isValid: false,
          error: `最多只能上传 ${maxFiles} 个文件`,
        };
      }

      return { isValid: true };
    },
    [files.length, maxFileSize, maxFiles]
  );

  // 添加文件
  const addFiles = useCallback(
    (newFiles: FileList | File[]) => {
      const fileArray = Array.from(newFiles);
      const validFiles: UploadFile[] = [];

      fileArray.forEach((file) => {
        const validation = validateFile(file);

        if (validation.isValid) {
          const uploadFile: UploadFile = {
            file,
            id: crypto.randomUUID(),
            progress: 0,
            status: "idle",
            preview: URL.createObjectURL(file),
          };
          validFiles.push(uploadFile);
        } else {
          toast({
            title: "文件验证失败",
            description: `${file.name}: ${validation.error}`,
            variant: "destructive",
          });
        }
      });

      if (validFiles.length > 0) {
        setFiles((prev) => [...prev, ...validFiles].slice(0, maxFiles));
      }
    },
    [validateFile, maxFiles, toast]
  );

  // 删除文件
  const removeFile = useCallback((fileId: string) => {
    setFiles((prev) => {
      const updated = prev.filter((f) => f.id !== fileId);
      // 清理预览 URL
      const fileToRemove = prev.find((f) => f.id === fileId);
      if (fileToRemove?.preview) {
        URL.revokeObjectURL(fileToRemove.preview);
      }
      return updated;
    });
  }, []);

  // 清空所有文件
  const clearFiles = useCallback(() => {
    // 清理所有预览 URL
    files.forEach((file) => {
      if (file.preview) {
        URL.revokeObjectURL(file.preview);
      }
    });
    setFiles([]);
  }, [files]);

  // 模拟上传过程
  const uploadFiles = useCallback(async () => {
    if (files.length === 0) {
      toast({
        title: "请选择文件",
        description: "请先选择要上传的文件",
        variant: "destructive",
      });
      return;
    }

    // 更新状态为上传中
    setFiles((prev) =>
      prev.map((file) => ({
        ...file,
        status: "uploading" as UploadStatus,
        progress: 0,
      }))
    );

    try {
      // 模拟上传进度
      for (let progress = 0; progress <= 100; progress += 10) {
        await new Promise((resolve) => setTimeout(resolve, 100));
        setFiles((prev) =>
          prev.map((file) => ({
            ...file,
            progress: Math.min(progress, 100),
          }))
        );
      }

      // 模拟上传完成
      setFiles((prev) =>
        prev.map((file) => ({
          ...file,
          status: "success" as UploadStatus,
          progress: 100,
        }))
      );

      toast({
        title: "上传成功",
        description: `成功上传 ${files.length} 个文件`,
      });

      onUploadComplete?.(files);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "上传失败";

      setFiles((prev) =>
        prev.map((file) => ({
          ...file,
          status: "error" as UploadStatus,
          error: errorMessage,
        }))
      );

      toast({
        title: "上传失败",
        description: errorMessage,
        variant: "destructive",
      });

      onUploadError?.(errorMessage);
    }
  }, [files, toast, onUploadComplete, onUploadError]);

  // 拖拽事件处理
  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      const droppedFiles = e.dataTransfer.files;
      if (droppedFiles.length > 0) {
        addFiles(droppedFiles);
      }
    },
    [addFiles]
  );

  return {
    files,
    isDragging,
    addFiles,
    removeFile,
    clearFiles,
    uploadFiles,
    dragHandlers: {
      onDragEnter: handleDragEnter,
      onDragLeave: handleDragLeave,
      onDragOver: handleDragOver,
      onDrop: handleDrop,
    },
  };
}
