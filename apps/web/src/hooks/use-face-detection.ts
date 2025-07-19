import { useState, useCallback } from "react";
import type { FaceDetectionResult } from "@face-recog/shared";

interface UseFaceDetectionOptions {
  onSuccess?: (result: FaceDetectionResult) => void;
  onError?: (error: string) => void;
}

interface FaceDetectionState {
  isDetecting: boolean;
  result: FaceDetectionResult | null;
  error: string | null;
}

export function useFaceDetection(options: UseFaceDetectionOptions = {}) {
  const [state, setState] = useState<FaceDetectionState>({
    isDetecting: false,
    result: null,
    error: null,
  });

  const detectFaces = useCallback(
    async (
      imageFile: File,
      detectionOptions?: {
        minConfidence?: number;
        maxFaces?: number;
        enableLandmarks?: boolean;
        enableDescriptors?: boolean;
      }
    ) => {
      setState((prev) => ({
        ...prev,
        isDetecting: true,
        error: null,
      }));

      try {
        const formData = new FormData();
        formData.append("image", imageFile);

        // 添加检测选项
        if (detectionOptions?.minConfidence !== undefined) {
          formData.append(
            "minConfidence",
            detectionOptions.minConfidence.toString()
          );
        }
        if (detectionOptions?.maxFaces !== undefined) {
          formData.append("maxFaces", detectionOptions.maxFaces.toString());
        }
        if (detectionOptions?.enableLandmarks !== undefined) {
          formData.append(
            "enableLandmarks",
            detectionOptions.enableLandmarks.toString()
          );
        }
        if (detectionOptions?.enableDescriptors !== undefined) {
          formData.append(
            "enableDescriptors",
            detectionOptions.enableDescriptors.toString()
          );
        }

        const response = await fetch("/api/detect-faces", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(
            errorData.error || `HTTP ${response.status}: ${response.statusText}`
          );
        }

        const result: FaceDetectionResult = await response.json();

        setState((prev) => ({
          ...prev,
          isDetecting: false,
          result,
          error: null,
        }));

        options?.onSuccess?.(result);
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "面部检测失败";

        setState((prev) => ({
          ...prev,
          isDetecting: false,
          error: errorMessage,
        }));

        options?.onError?.(errorMessage);
      }
    },
    [options.onSuccess, options.onError]
  );

  const reset = useCallback(() => {
    setState({
      isDetecting: false,
      result: null,
      error: null,
    });
  }, []);

  return {
    ...state,
    detectFaces,
    reset,
  };
}
