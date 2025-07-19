import { test, expect } from "@playwright/test";
import { testImages } from "../fixtures/test-data";

test.describe("置信度分数显示测试", () => {
  test("置信度分数在合理范围内", async ({ request }) => {
    const response = await request.post("/api/detect-faces", {
      data: {
        image: testImages.singleFace,
      },
    });

    expect(response.ok()).toBeTruthy();

    const result = await response.json();

    result.faces.forEach((face: any) => {
      expect(face).toHaveProperty("confidence");
      expect(typeof face.confidence).toBe("number");
      expect(face.confidence).toBeGreaterThanOrEqual(0);
      expect(face.confidence).toBeLessThanOrEqual(1);
    });
  });

  test("置信度分数精度", async ({ request }) => {
    const response = await request.post("/api/detect-faces", {
      data: {
        image: testImages.singleFace,
      },
    });

    expect(response.ok()).toBeTruthy();

    const result = await response.json();

    result.faces.forEach((face: any) => {
      const confidence = face.confidence;

      // 验证置信度是有限数
      expect(Number.isFinite(confidence)).toBe(true);

      // 验证置信度不是NaN
      expect(Number.isNaN(confidence)).toBe(false);
    });
  });

  test("置信度分数一致性", async ({ request }) => {
    // 对同一张图片进行多次检测，验证置信度的一致性
    const responses: any[] = [];

    for (let i = 0; i < 3; i++) {
      const response = await request.post("/api/detect-faces", {
        data: {
          image: testImages.singleFace,
        },
      });

      expect(response.ok()).toBeTruthy();
      responses.push(await response.json());
    }

    // 验证所有检测结果中的人脸数量一致
    const faceCounts = responses.map((result: any) => result.faces.length);
    const firstCount = faceCounts[0];

    faceCounts.forEach((count) => {
      expect(count).toBe(firstCount);
    });

    // 验证置信度分数在合理范围内波动（允许10%的误差）
    if (responses[0].faces.length > 0) {
      const firstConfidence = responses[0].faces[0].confidence;

      responses.slice(1).forEach((result: any) => {
        if (result.faces.length > 0) {
          const confidence = result.faces[0].confidence;
          const difference = Math.abs(confidence - firstConfidence);
          const tolerance = firstConfidence * 0.1; // 10% 容差

          expect(difference).toBeLessThanOrEqual(tolerance);
        }
      });
    }
  });

  test("置信度分数排序", async ({ request }) => {
    const response = await request.post("/api/detect-faces", {
      data: {
        image: testImages.multipleFaces,
      },
    });

    expect(response.ok()).toBeTruthy();

    const result = await response.json();

    if (result.faces.length > 1) {
      // 验证置信度分数按降序排列
      for (let i = 0; i < result.faces.length - 1; i++) {
        expect(result.faces[i].confidence).toBeGreaterThanOrEqual(
          result.faces[i + 1].confidence
        );
      }
    }
  });

  test("置信度阈值过滤", async ({ request }) => {
    // 测试不同的置信度阈值
    const thresholds = [0.5, 0.7, 0.9];

    for (const threshold of thresholds) {
      const response = await request.post("/api/detect-faces", {
        data: {
          image: testImages.singleFace,
          minConfidence: threshold.toString(),
        },
      });

      expect(response.ok()).toBeTruthy();

      const result = await response.json();

      result.faces.forEach((face: any) => {
        expect(face.confidence).toBeGreaterThanOrEqual(threshold);
      });
    }
  });

  test("置信度分数与边界框质量的关系", async ({ request }) => {
    const response = await request.post("/api/detect-faces", {
      data: {
        image: testImages.singleFace,
      },
    });

    expect(response.ok()).toBeTruthy();

    const result = await response.json();

    result.faces.forEach((face: any) => {
      const { confidence, boundingBox } = face;
      const { width, height } = boundingBox;
      const area = width * height;

      // 高置信度的人脸应该有合理的边界框尺寸
      if (confidence > 0.8) {
        expect(area).toBeGreaterThan(100); // 最小面积
        expect(width).toBeGreaterThan(10); // 最小宽度
        expect(height).toBeGreaterThan(10); // 最小高度
      }
    });
  });

  test("置信度分数显示格式", async ({ page }) => {
    await page.goto("/upload");
    await page.waitForLoadState("networkidle");

    // 上传图片并等待检测完成
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(testImages.singleFace);

    const uploadButton = page.locator('button:has-text("开始人脸识别")');
    await uploadButton.click();

    await page.waitForSelector('[data-testid="detection-result"]', {
      timeout: 30000,
    });

    // 验证置信度显示格式
    const confidenceElements = page.locator('[data-testid="face-detail-0"]');
    if ((await confidenceElements.count()) > 0) {
      const confidenceText = await confidenceElements.textContent();
      expect(confidenceText).toMatch(/\d+%/); // 应该包含百分比格式
    }
  });

  test("平均置信度计算", async ({ page }) => {
    await page.goto("/upload");
    await page.waitForLoadState("networkidle");

    // 上传多人脸图片
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(testImages.multipleFaces);

    const uploadButton = page.locator('button:has-text("开始人脸识别")');
    await uploadButton.click();

    await page.waitForSelector('[data-testid="detection-result"]', {
      timeout: 30000,
    });

    // 验证平均置信度显示
    const avgConfidenceElement = page
      .locator("text=平均置信度")
      .locator("..")
      .locator(".text-2xl");
    await expect(avgConfidenceElement).toBeVisible();

    const avgConfidenceText = await avgConfidenceElement.textContent();
    expect(avgConfidenceText).toMatch(/\d+/); // 应该包含数字
  });
});
