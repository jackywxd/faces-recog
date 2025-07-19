import { Page, expect, Locator } from "@playwright/test";
import { testConfig, generateTestData } from "../fixtures/test-data";

/**
 * 测试辅助工具函数
 * 提供常用的测试操作和验证
 */

/**
 * 等待元素出现并可见
 */
export async function waitForElement(
  page: Page,
  selector: string,
  timeout = testConfig.timeouts.pageLoad
): Promise<Locator> {
  const element = page.locator(selector);
  await expect(element).toBeVisible({ timeout });
  return element;
}

/**
 * 安全点击元素（先等待可见和可用）
 */
export async function safeClick(
  page: Page,
  selector: string,
  timeout = testConfig.timeouts.pageLoad
): Promise<void> {
  const element = page.locator(selector);
  await expect(element).toBeVisible({ timeout });
  await expect(element).toBeEnabled({ timeout });
  await element.click();
}

/**
 * 上传文件并等待处理完成
 */
export async function uploadFile(
  page: Page,
  filePath: string,
  waitForSuccess = true
): Promise<string | null> {
  // 选择文件
  const fileInput = page.locator('input[type="file"]');
  await fileInput.setInputFiles(filePath);

  // 等待预览显示
  await waitForElement(page, '[data-testid="file-preview"]');

  // 点击上传按钮
  await safeClick(page, '[data-testid="upload-button"]');

  if (waitForSuccess) {
    // 等待上传成功
    await waitForElement(page, '[data-testid="upload-success"]', 30000);

    // 获取作业ID
    const jobIdElement = page.locator('[data-testid="job-id"]');
    if (await jobIdElement.isVisible()) {
      return await jobIdElement.getAttribute("data-job-id");
    }
  }

  return null;
}

/**
 * 验证错误消息显示
 */
export async function expectError(
  page: Page,
  errorType: string,
  expectedMessage?: string
): Promise<void> {
  const errorElement = page.locator(`[data-testid="${errorType}-error"]`);
  await expect(errorElement).toBeVisible();

  if (expectedMessage) {
    await expect(errorElement).toContainText(expectedMessage);
  }
}

/**
 * 清除上传状态
 */
export async function clearUploadState(page: Page): Promise<void> {
  const clearButton = page.locator('[data-testid="clear-file"]');
  if (await clearButton.isVisible()) {
    await clearButton.click();
  }

  // 等待状态清除
  await expect(page.locator('[data-testid="file-preview"]')).not.toBeVisible();
}

/**
 * 模拟网络延迟
 */
export async function simulateNetworkDelay(
  page: Page,
  pattern: string,
  delay: number
): Promise<void> {
  await page.route(pattern, async (route) => {
    await new Promise((resolve) => setTimeout(resolve, delay));
    await route.continue();
  });
}

/**
 * 模拟网络错误
 */
export async function simulateNetworkError(
  page: Page,
  pattern: string,
  status: number,
  body?: any
): Promise<void> {
  await page.route(pattern, async (route) => {
    await route.fulfill({
      status,
      contentType: "application/json",
      body: JSON.stringify(body || { error: `HTTP ${status}` }),
    });
  });
}

/**
 * 截取页面截图（用于调试）
 */
export async function captureDebugScreenshot(
  page: Page,
  testName: string,
  step?: string
): Promise<string> {
  const timestamp = Date.now();
  const filename = `debug-${testName}${
    step ? `-${step}` : ""
  }-${timestamp}.png`;
  const path = `test-results/screenshots/${filename}`;

  await page.screenshot({ path, fullPage: true });
  console.log(`📸 Debug screenshot saved: ${path}`);

  return path;
}

/**
 * 等待API响应并验证
 */
export async function waitForApiResponse(
  page: Page,
  url: string,
  timeout = testConfig.timeouts.apiRequest
): Promise<any> {
  const responsePromise = page.waitForResponse(
    (response) => response.url().includes(url) && response.status() === 200,
    { timeout }
  );

  const response = await responsePromise;
  const data = await response.json();

  return data;
}

/**
 * 验证元素文本内容
 */
export async function expectText(
  page: Page,
  selector: string,
  expectedText: string,
  exact = false
): Promise<void> {
  const element = page.locator(selector);
  await expect(element).toBeVisible();

  if (exact) {
    await expect(element).toHaveText(expectedText);
  } else {
    await expect(element).toContainText(expectedText);
  }
}

/**
 * 验证元素属性
 */
export async function expectAttribute(
  page: Page,
  selector: string,
  attribute: string,
  expectedValue: string | RegExp
): Promise<void> {
  const element = page.locator(selector);
  await expect(element).toHaveAttribute(attribute, expectedValue);
}

/**
 * 等待进度条完成
 */
export async function waitForProgressComplete(
  page: Page,
  timeout = testConfig.timeouts.upload
): Promise<void> {
  // 等待进度条出现
  await waitForElement(page, '[data-testid="progress-bar"]');

  // 等待进度达到100%
  await page.waitForFunction(
    () => {
      const progressText = document.querySelector(
        '[data-testid="progress-text"]'
      );
      return progressText?.textContent?.includes("100%");
    },
    { timeout }
  );

  // 验证完成状态
  await waitForElement(page, '[data-testid="upload-complete"]');
}

/**
 * 创建测试会话
 */
export function createTestSession() {
  const testData = generateTestData();

  return {
    ...testData,
    // 添加会话特定的工具方法
    log: (message: string) => {
      console.log(`[${testData.sessionId}] ${message}`);
    },
    error: (message: string) => {
      console.error(`[${testData.sessionId}] ❌ ${message}`);
    },
    success: (message: string) => {
      console.log(`[${testData.sessionId}] ✅ ${message}`);
    },
  };
}

/**
 * 检查浏览器控制台错误
 */
export async function checkConsoleErrors(page: Page): Promise<string[]> {
  const errors: string[] = [];

  page.on("console", (msg) => {
    if (msg.type() === "error") {
      errors.push(msg.text());
    }
  });

  // 检查页面是否有未捕获的JavaScript错误
  const jsErrors = await page.evaluate(() => {
    return (window as any).__playwrightErrors || [];
  });

  return [...errors, ...jsErrors];
}

/**
 * 验证页面性能指标
 */
export async function checkPagePerformance(page: Page): Promise<{
  loadTime: number;
  domContentLoaded: number;
  firstContentfulPaint: number;
}> {
  const metrics = await page.evaluate(() => {
    const timing = performance.timing;
    const paintEntries = performance.getEntriesByType("paint");

    return {
      loadTime: timing.loadEventEnd - timing.navigationStart,
      domContentLoaded:
        timing.domContentLoadedEventEnd - timing.navigationStart,
      firstContentfulPaint:
        paintEntries.find((entry) => entry.name === "first-contentful-paint")
          ?.startTime || 0,
    };
  });

  return metrics;
}

/**
 * 模拟移动设备
 */
export async function simulateMobile(page: Page): Promise<void> {
  await page.setViewportSize({ width: 375, height: 667 });
  await page.emulateMedia({ media: "screen" });
}

/**
 * 等待加载状态
 */
export async function waitForLoadState(
  page: Page,
  state: "load" | "domcontentloaded" | "networkidle" = "networkidle"
): Promise<void> {
  await page.waitForLoadState(state);
}
