import { Container } from "@cloudflare/workers-types";

export class FaceDetectorContainer implements Container {
  // 容器配置
  defaultPort = 8080;
  sleepAfter = "10m"; // 10分钟后休眠
  enableInternet = false; // 不需要外部网络访问

  // 容器状态
  private _running = false;
  private isStarting = false;
  private isReady = false;
  private lastUsed = Date.now();

  get running(): boolean {
    return this._running;
  }

  // 健康检查
  async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(
        `http://localhost:${this.defaultPort}/health`
      );
      return response.ok;
    } catch {
      return false;
    }
  }

  // 容器启动时调用
  async onStart(): Promise<void> {
    this.isStarting = true;
    this.isReady = false;

    console.log("Face detector container starting...");

    // 等待服务启动
    let attempts = 0;
    const maxAttempts = 30; // 最多等待30秒

    while (attempts < maxAttempts) {
      try {
        const isHealthy = await this.healthCheck();
        if (isHealthy) {
          this.isReady = true;
          this.isStarting = false;
          console.log("Face detector container ready");
          return;
        }
      } catch (error) {
        console.log(`Health check attempt ${attempts + 1} failed:`, error);
      }

      await new Promise((resolve) => setTimeout(resolve, 1000));
      attempts++;
    }

    this.isStarting = false;
    throw new Error("Face detector container failed to start within timeout");
  }

  // 容器停止时调用
  async onStop(): Promise<void> {
    console.log("Face detector container stopping...");
    this.isReady = false;
    this.isStarting = false;
  }

  // 容器错误时调用
  async onError(error: Error): Promise<void> {
    console.error("Face detector container error:", error);
    this.isReady = false;
    this.isStarting = false;
  }

  // Container 接口必需方法
  start(): void {
    this._running = true;
    this.onStart().catch((error) => {
      console.error("Failed to start container:", error);
      this._running = false;
    });
  }

  async monitor(): Promise<void> {
    while (this._running) {
      try {
        await this.healthCheck();
        await new Promise((resolve) => setTimeout(resolve, 30000)); // 30秒检查一次
      } catch (error) {
        console.error("Container health check failed:", error);
        this._running = false;
        break;
      }
    }
  }

  async destroy(): Promise<void> {
    this._running = false;
    await this.onStop();
  }

  signal(signo: number): void {
    console.log(`Container received signal: ${signo}`);
    if (signo === 15 || signo === 9) {
      // SIGTERM or SIGKILL
      this.destroy();
    }
  }

  getTcpPort(port: number): any {
    // 返回一个 Fetcher 对象，用于与容器通信
    return {
      fetch: async (request: Request) => {
        const url = new URL(request.url);
        url.hostname = "localhost";
        url.port = port.toString();

        return fetch(url.toString(), {
          method: request.method,
          headers: request.headers,
          body: request.body,
        });
      },
    };
  }

  // 检查容器是否就绪
  isContainerReady(): boolean {
    return this.isReady && !this.isStarting;
  }

  // 更新最后使用时间
  updateLastUsed(): void {
    this.lastUsed = Date.now();
  }

  // 获取最后使用时间
  getLastUsed(): number {
    return this.lastUsed;
  }

  // 执行面部检测
  async detectFaces(
    imageBuffer: ArrayBuffer,
    options: {
      minConfidence?: number;
      maxFaces?: number;
      enableLandmarks?: boolean;
      enableDescriptors?: boolean;
    } = {}
  ): Promise<any> {
    if (!this.isContainerReady()) {
      throw new Error("Container is not ready");
    }

    try {
      // 创建 FormData
      const formData = new FormData();
      const blob = new Blob([imageBuffer], { type: "image/jpeg" });
      formData.append("image", blob, "image.jpg");

      // 添加选项参数
      if (options.minConfidence !== undefined) {
        formData.append("minConfidence", options.minConfidence.toString());
      }
      if (options.maxFaces !== undefined) {
        formData.append("maxFaces", options.maxFaces.toString());
      }
      if (options.enableLandmarks !== undefined) {
        formData.append("enableLandmarks", options.enableLandmarks.toString());
      }
      if (options.enableDescriptors !== undefined) {
        formData.append(
          "enableDescriptors",
          options.enableDescriptors.toString()
        );
      }

      // 发送请求到容器服务
      const response = await fetch(
        `http://localhost:${this.defaultPort}/api/detect-faces`,
        {
          method: "POST",
          body: formData,
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Face detection failed: ${response.status} ${errorText}`
        );
      }

      const result = await response.json();
      this.updateLastUsed();

      return result;
    } catch (error) {
      console.error("Face detection request failed:", error);
      throw error;
    }
  }
}
