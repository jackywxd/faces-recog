import { test, expect } from "@playwright/test";
import { testImages } from "../fixtures/test-data";

test.describe("边界框坐标准确性测试", () => {
  test("边界框坐标在合理范围内", async ({ request }) => {
    const response = await request.post("/api/detect-faces", {
      data: {
        image: testImages.singleFace,
      },
    });

    expect(response.ok()).toBeTruthy();

    const result = await response.json();
    expect(result).toHaveProperty("imageInfo");

    const { width, height } = result.imageInfo;

    result.faces.forEach((face: any) => {
      const { x, y, width: faceWidth, height: faceHeight } = face.boundingBox;

      // 验证坐标在图像范围内
      expect(x).toBeGreaterThanOrEqual(0);
      expect(y).toBeGreaterThanOrEqual(0);
      expect(x + faceWidth).toBeLessThanOrEqual(width);
      expect(y + faceHeight).toBeLessThanOrEqual(height);

      // 验证边界框尺寸合理
      expect(faceWidth).toBeGreaterThan(0);
      expect(faceHeight).toBeGreaterThan(0);
      expect(faceWidth).toBeLessThanOrEqual(width);
      expect(faceHeight).toBeLessThanOrEqual(height);
    });
  });

  test("边界框宽高比合理", async ({ request }) => {
    const response = await request.post("/api/detect-faces", {
      data: {
        image: testImages.singleFace,
      },
    });

    expect(response.ok()).toBeTruthy();

    const result = await response.json();

    result.faces.forEach((face: any) => {
      const { width, height } = face.boundingBox;
      const aspectRatio = width / height;

      // 人脸边界框的宽高比应该在合理范围内（0.5 到 2.0）
      expect(aspectRatio).toBeGreaterThan(0.5);
      expect(aspectRatio).toBeLessThan(2.0);
    });
  });

  test("多个人脸的边界框不重叠", async ({ request }) => {
    const response = await request.post("/api/detect-faces", {
      data: {
        image: testImages.multipleFaces,
      },
    });

    expect(response.ok()).toBeTruthy();

    const result = await response.json();

    if (result.faces.length > 1) {
      // 检查任意两个边界框是否重叠
      for (let i = 0; i < result.faces.length; i++) {
        for (let j = i + 1; j < result.faces.length; j++) {
          const box1 = result.faces[i].boundingBox;
          const box2 = result.faces[j].boundingBox;

          // 计算重叠区域
          const overlapX = Math.max(
            0,
            Math.min(box1.x + box1.width, box2.x + box2.width) -
              Math.max(box1.x, box2.x)
          );
          const overlapY = Math.max(
            0,
            Math.min(box1.y + box1.height, box2.y + box2.height) -
              Math.max(box1.y, box2.y)
          );

          const overlapArea = overlapX * overlapY;
          const box1Area = box1.width * box1.height;
          const box2Area = box2.width * box2.height;
          const smallerArea = Math.min(box1Area, box2Area);

          // 重叠面积应该小于较小边界框面积的50%
          const overlapRatio = overlapArea / smallerArea;
          expect(overlapRatio).toBeLessThan(0.5);
        }
      }
    }
  });

  test("边界框坐标精度", async ({ request }) => {
    const response = await request.post("/api/detect-faces", {
      data: {
        image: testImages.singleFace,
      },
    });

    expect(response.ok()).toBeTruthy();

    const result = await response.json();

    result.faces.forEach((face: any) => {
      const { x, y, width, height } = face.boundingBox;

      // 验证坐标是数字类型
      expect(typeof x).toBe("number");
      expect(typeof y).toBe("number");
      expect(typeof width).toBe("number");
      expect(typeof height).toBe("number");

      // 验证坐标是有限数
      expect(Number.isFinite(x)).toBe(true);
      expect(Number.isFinite(y)).toBe(true);
      expect(Number.isFinite(width)).toBe(true);
      expect(Number.isFinite(height)).toBe(true);

      // 验证坐标不是负数
      expect(x).toBeGreaterThanOrEqual(0);
      expect(y).toBeGreaterThanOrEqual(0);
      expect(width).toBeGreaterThan(0);
      expect(height).toBeGreaterThan(0);
    });
  });

  test("边界框在不同图像尺寸下的一致性", async ({ request }) => {
    // 测试不同尺寸的图像
    const imagePaths = [
      testImages.singleFace,
      testImages.validJpeg,
      testImages.validPng,
    ];

    for (const imagePath of imagePaths) {
      const response = await request.post("/api/detect-faces", {
        data: {
          image: imagePath,
        },
      });

      expect(response.ok()).toBeTruthy();

      const result = await response.json();
      expect(result).toHaveProperty("imageInfo");

      const { width, height } = result.imageInfo;

      result.faces.forEach((face: any) => {
        const { x, y, width: faceWidth, height: faceHeight } = face.boundingBox;

        // 验证坐标在图像范围内
        expect(x).toBeGreaterThanOrEqual(0);
        expect(y).toBeGreaterThanOrEqual(0);
        expect(x + faceWidth).toBeLessThanOrEqual(width);
        expect(y + faceHeight).toBeLessThanOrEqual(height);
      });
    }
  });
});
