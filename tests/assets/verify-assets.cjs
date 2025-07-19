#!/usr/bin/env node

/**
 * 验证测试资源文件脚本
 * 检查所有Playwright测试所需的资源文件是否正确创建
 */

const fs = require("fs");
const path = require("path");

console.log("🔍 验证测试资源文件...");

// 期望的文件列表
const expectedFiles = {
  // 有效图片文件
  "sample-face.jpg": { minSize: 1000, type: "JPEG" },
  "sample-face.png": { minSize: 1000, type: "PNG" },
  "sample-face.webp": { minSize: 50, type: "WebP" },
  "portrait.jpg": { minSize: 1000, type: "JPEG" },
  "landscape.jpg": { minSize: 1000, type: "JPEG" },
  "group-photo.jpg": { minSize: 1000, type: "JPEG" },
  "tiny-image.jpg": { minSize: 500, type: "JPEG" },
  "blurry-face.jpg": { minSize: 1000, type: "JPEG" },
  "profile-face.jpg": { minSize: 1000, type: "JPEG" },

  // 大文件测试
  "large-image.jpg": { minSize: 30000, type: "JPEG" },

  // 无效格式文件
  "invalid-file.txt": { minSize: 50, type: "text" },
  "document.pdf": { minSize: 200, type: "PDF" },
};

// 验证函数
let verified = 0;
let errors = 0;

console.log("\n📋 文件验证结果:");

Object.entries(expectedFiles).forEach(([filename, requirements]) => {
  const filePath = path.join(__dirname, filename);

  try {
    // 检查文件是否存在
    if (!fs.existsSync(filePath)) {
      console.log(`❌ ${filename} - 文件不存在`);
      errors++;
      return;
    }

    // 检查文件大小
    const stats = fs.statSync(filePath);
    if (stats.size < requirements.minSize) {
      console.log(
        `⚠️  ${filename} - 文件过小 (${stats.size} bytes < ${requirements.minSize} bytes)`
      );
      errors++;
      return;
    }

    // 简单的文件类型检查（基于文件头）
    const buffer = fs.readFileSync(filePath, { encoding: null });
    let validType = false;

    switch (requirements.type) {
      case "JPEG":
        validType = buffer[0] === 0xff && buffer[1] === 0xd8;
        break;
      case "PNG":
        validType =
          buffer[0] === 0x89 &&
          buffer[1] === 0x50 &&
          buffer[2] === 0x4e &&
          buffer[3] === 0x47;
        break;
      case "WebP":
        validType =
          buffer.toString("ascii", 0, 4) === "RIFF" &&
          buffer.toString("ascii", 8, 12) === "WEBP";
        break;
      case "PDF":
        validType = buffer.toString("ascii", 0, 4) === "%PDF";
        break;
      case "text":
        validType = true; // 文本文件不需要特殊验证
        break;
      default:
        validType = true;
    }

    if (!validType) {
      console.log(`❌ ${filename} - 文件格式无效 (期望 ${requirements.type})`);
      errors++;
      return;
    }

    console.log(`✅ ${filename} - ${requirements.type}, ${stats.size} bytes`);
    verified++;
  } catch (error) {
    console.log(`❌ ${filename} - 验证失败: ${error.message}`);
    errors++;
  }
});

console.log(`\n📊 验证摘要:`);
console.log(`✅ 验证通过: ${verified} 个文件`);
console.log(`❌ 验证失败: ${errors} 个文件`);
console.log(`📁 总计: ${Object.keys(expectedFiles).length} 个文件`);

if (verified === Object.keys(expectedFiles).length) {
  console.log(`\n🎉 所有测试资源文件验证通过！`);
  console.log(`🧪 可以运行测试: npm run test:iteration1`);
  process.exit(0);
} else {
  console.log(`\n⚠️  部分文件验证失败，请检查上述错误`);
  process.exit(1);
}
