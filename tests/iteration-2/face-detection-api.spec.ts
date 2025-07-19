import { test, expect } from "@playwright/test";
import { testImages } from "../fixtures/test-data";

test.describe("面部检测API端点功能", () => {
  test("成功检测单个人脸", async ({ request }) => {
    const response = await request.post("/api/detect-faces", {
      data: {
        image: testImages.singleFace,
      },
    });

    expect(response.ok()).toBeTruthy();

    const result = await response.json();
    expect(result).toHaveProperty("faces");
    expect(Array.isArray(result.faces)).toBeTruthy();
    expect(result.faces.length).toBeGreaterThan(0);

    // 验证检测结果结构
    const face = result.faces[0];
    expect(face).toHaveProperty("boundingBox");
    expect(face).toHaveProperty("confidence");
    expect(face.boundingBox).toHaveProperty("x");
    expect(face.boundingBox).toHaveProperty("y");
    expect(face.boundingBox).toHaveProperty("width");
    expect(face.boundingBox).toHaveProperty("height");
    expect(face.confidence).toBeGreaterThan(0.5);
  });

  test("检测多个人脸", async ({ request }) => {
    const response = await request.post("/api/detect-faces", {
      data: {
        image: testImages.multipleFaces,
      },
    });

    expect(response.ok()).toBeTruthy();

    const result = await response.json();
    expect(result.faces.length).toBeGreaterThan(1);

    // 验证所有人脸都有合理的置信度
    result.faces.forEach((face: any) => {
      expect(face.confidence).toBeGreaterThan(0.5);
      expect(face.boundingBox.width).toBeGreaterThan(0);
      expect(face.boundingBox.height).toBeGreaterThan(0);
    });
  });

  test("处理无脸图片", async ({ request }) => {
    const response = await request.post("/api/detect-faces", {
      data: {
        image: testImages.noFaces,
      },
    });

    expect(response.ok()).toBeTruthy();

    const result = await response.json();
    expect(result.faces.length).toBe(0);
  });

  test("处理无效文件格式", async ({ request }) => {
    const response = await request.post("/api/detect-faces", {
      data: {
        image: testImages.invalidFormat,
      },
    });

    expect(response.status()).toBe(400);

    const error = await response.json();
    expect(error).toHaveProperty("error");
  });

  test("处理超大文件", async ({ request }) => {
    const response = await request.post("/api/detect-faces", {
      data: {
        image: testImages.largeImage,
      },
    });

    expect(response.status()).toBe(400);
  });

  test("检测选项参数", async ({ request }) => {
    const response = await request.post("/api/detect-faces", {
      data: {
        image: testImages.singleFace,
        minConfidence: "0.8",
        maxFaces: "1",
        enableLandmarks: "true",
      },
    });

    expect(response.ok()).toBeTruthy();

    const result = await response.json();
    expect(result.faces.length).toBeLessThanOrEqual(1);

    // 验证置信度过滤
    result.faces.forEach((face: any) => {
      expect(face.confidence).toBeGreaterThanOrEqual(0.8);
    });
  });
});
