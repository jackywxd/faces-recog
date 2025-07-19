/**
 * 测试数据和 Fixtures
 * 提供统一的测试数据管理
 */

export const testImages = {
  // 有效图片文件
  validJpeg: "./tests/assets/sample-face.jpg",
  validPng: "./tests/assets/sample-face.png",
  validWebP: "./tests/assets/sample-face.webp",

  // 大文件测试
  largeImage: "./tests/assets/large-image.jpg",

  // 无效文件
  invalidFormat: "./tests/assets/invalid-file.txt",
  invalidPdf: "./tests/assets/document.pdf",

  // 面部测试用例
  multipleFaces: "./tests/assets/group-photo.jpg",
  singleFace: "./tests/assets/portrait.jpg",
  noFaces: "./tests/assets/landscape.jpg",

  // 边界情况
  verySmall: "./tests/assets/tiny-image.jpg",
  blurryFace: "./tests/assets/blurry-face.jpg",
  profileFace: "./tests/assets/profile-face.jpg",
} as const;

export const expectedResults = {
  multipleFaces: { minFaces: 3, maxFaces: 5 },
  singleFace: { minFaces: 1, maxFaces: 1 },
  noFaces: { minFaces: 0, maxFaces: 0 },
  blurryFace: { minFaces: 0, maxFaces: 1 }, // 可能检测不到
  profileFace: { minFaces: 1, maxFaces: 1 },
} as const;

export const fileConstraints = {
  maxFileSize: 10 * 1024 * 1024, // 10MB
  supportedFormats: ["jpg", "jpeg", "png", "webp"],
  minImageSize: { width: 100, height: 100 },
  maxImageSize: { width: 4096, height: 4096 },
} as const;

export const testUrls = {
  // 本地开发环境
  local: {
    web: "http://localhost:3000",
    api: "http://localhost:8787",
  },
  // 测试环境
  staging: {
    web: "https://staging.colorsofthewind.club",
    api: "https://api-staging.colorsofthewind.club",
  },
  // 生产环境
  production: {
    web: "https://colorsofthewind.club",
    api: "https://api.colorsofthewind.club",
  },
} as const;

export const testConfig = {
  // 超时配置
  timeouts: {
    upload: 30000, // 上传超时 30s
    detection: 60000, // 检测超时 60s
    matching: 120000, // 匹配超时 2min
    pageLoad: 10000, // 页面加载 10s
    apiRequest: 15000, // API 请求 15s
  },

  // 重试配置
  retries: {
    networkOperation: 3,
    fileUpload: 2,
    detection: 1,
  },

  // 测试环境检测
  environment: (process.env.TEST_ENV || "local") as
    | "local"
    | "staging"
    | "production",
} as const;

/**
 * 生成测试用例数据
 */
export function generateTestData() {
  const timestamp = Date.now();
  const sessionId = process.env.TEST_SESSION_ID || `test-${timestamp}`;

  return {
    sessionId,
    timestamp,
    testUser: {
      id: `test-user-${timestamp}`,
      name: "Playwright Test User",
      email: "test@example.com",
    },
    uploadMetadata: {
      source: "playwright-test",
      version: "1.0.0",
      environment: testConfig.environment,
    },
  };
}

/**
 * 获取当前环境的基础 URL
 */
export function getBaseUrls() {
  const env = testConfig.environment;
  return testUrls[env];
}

/**
 * 验证文件是否存在的 fixture
 */
export async function validateTestAssets() {
  const fs = await import("fs/promises");
  const missingFiles: string[] = [];

  for (const [key, filePath] of Object.entries(testImages)) {
    try {
      await fs.access(filePath);
    } catch (error) {
      missingFiles.push(`${key}: ${filePath}`);
    }
  }

  if (missingFiles.length > 0) {
    console.warn("⚠️ 缺少测试资源文件:");
    missingFiles.forEach((file) => console.warn(`   - ${file}`));
  }

  return missingFiles.length === 0;
}

/**
 * 创建模拟文件数据
 */
export function createMockFileData(size = 1024, type = "image/jpeg") {
  const buffer = Buffer.alloc(size);
  // 填充一些模式数据
  for (let i = 0; i < size; i++) {
    buffer[i] = i % 256;
  }

  return {
    name: `test-image-${Date.now()}.jpg`,
    type,
    size,
    buffer,
  };
}

/**
 * 测试错误场景数据
 */
export const errorScenarios = {
  network: {
    description: "网络连接失败",
    mockResponse: { status: 500, body: { error: "Internal Server Error" } },
  },
  timeout: {
    description: "请求超时",
    delay: 35000, // 超过30s超时限制
  },
  validation: {
    description: "文件验证失败",
    mockResponse: { status: 400, body: { error: "Invalid file format" } },
  },
  storage: {
    description: "存储服务不可用",
    mockResponse: {
      status: 503,
      body: { error: "Storage service unavailable" },
    },
  },
} as const;
