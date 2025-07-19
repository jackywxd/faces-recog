/**
 * API 服务层
 *
 * 提供与后端API通信的统一接口
 */

// 获取API基础URL
const getApiBaseUrl = (): string => {
  // 在客户端运行时使用环境变量
  if (typeof window !== "undefined") {
    return process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8787";
  }

  // 在服务器端运行时使用默认值
  return process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8787";
};

// API响应类型
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    code: string;
  };
}

// 健康检查响应
export interface HealthResponse {
  status: string;
  timestamp: string;
  version: string;
  environment: string;
}

// 文件上传响应
export interface UploadResponse {
  fileId: string;
  filename: string;
  size: number;
  url: string;
  uploadedAt: string;
}

// 通用API客户端
class ApiClient {
  private baseUrl: string;
  private timeout: number;

  constructor() {
    this.baseUrl = getApiBaseUrl();
    this.timeout = parseInt(process.env.NEXT_PUBLIC_API_TIMEOUT || "30000");
  }

  // 通用请求方法
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`;

    const defaultOptions: RequestInit = {
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, {
        ...defaultOptions,
        ...options,
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("API request failed:", error);
      return {
        success: false,
        error: {
          message: error instanceof Error ? error.message : "网络请求失败",
          code: "NETWORK_ERROR",
        },
      };
    }
  }

  // GET 请求
  async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: "GET" });
  }

  // POST 请求
  async post<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: "POST",
      body: data ? JSON.stringify(data) : null,
    });
  }

  // 文件上传
  async uploadFile(
    file: File,
    onProgress?: (progress: number) => void
  ): Promise<ApiResponse<UploadResponse>> {
    const url = `${this.baseUrl}/api/upload`;
    const formData = new FormData();
    formData.append("file", file);

    try {
      const xhr = new XMLHttpRequest();

      return new Promise((resolve) => {
        xhr.upload.addEventListener("progress", (event) => {
          if (event.lengthComputable && onProgress) {
            const progress = (event.loaded / event.total) * 100;
            onProgress(progress);
          }
        });

        xhr.addEventListener("load", () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              const data = JSON.parse(xhr.responseText);
              resolve(data);
            } catch (error) {
              resolve({
                success: false,
                error: {
                  message: "响应解析失败",
                  code: "PARSE_ERROR",
                },
              });
            }
          } else {
            resolve({
              success: false,
              error: {
                message: `上传失败: ${xhr.status}`,
                code: "UPLOAD_ERROR",
              },
            });
          }
        });

        xhr.addEventListener("error", () => {
          resolve({
            success: false,
            error: {
              message: "网络错误",
              code: "NETWORK_ERROR",
            },
          });
        });

        xhr.addEventListener("timeout", () => {
          resolve({
            success: false,
            error: {
              message: "请求超时",
              code: "TIMEOUT_ERROR",
            },
          });
        });

        xhr.open("POST", url);
        xhr.timeout = this.timeout;
        xhr.send(formData);
      });
    } catch (error) {
      return {
        success: false,
        error: {
          message: error instanceof Error ? error.message : "上传失败",
          code: "UPLOAD_ERROR",
        },
      };
    }
  }
}

// 创建API客户端实例
export const apiClient = new ApiClient();

// API服务类
export class ApiService {
  // 健康检查
  static async healthCheck(): Promise<ApiResponse<HealthResponse>> {
    return apiClient.get<HealthResponse>("/api/health");
  }

  // 文件上传
  static async uploadFile(
    file: File,
    onProgress?: (progress: number) => void
  ): Promise<ApiResponse<UploadResponse>> {
    return apiClient.uploadFile(file, onProgress);
  }

  // 批量文件上传
  static async uploadFiles(
    files: File[],
    onProgress?: (progress: number) => void
  ): Promise<ApiResponse<UploadResponse[]>> {
    const results: UploadResponse[] = [];
    let totalProgress = 0;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!file) continue;

      const result = await apiClient.uploadFile(file, (progress) => {
        // 计算总体进度
        const fileWeight = 1 / files.length;
        const currentFileProgress = progress * fileWeight;
        const previousFilesProgress = (i / files.length) * 100;
        totalProgress = previousFilesProgress + currentFileProgress;

        if (onProgress) {
          onProgress(totalProgress);
        }
      });

      if (result.success && result.data) {
        results.push(result.data);
      } else {
        return {
          success: false,
          error: {
            message: `文件 ${file.name} 上传失败: ${result.error?.message}`,
            code: "BATCH_UPLOAD_ERROR",
          },
        };
      }
    }

    return {
      success: true,
      data: results,
    };
  }
}

// 导出默认API服务实例
export default ApiService;
