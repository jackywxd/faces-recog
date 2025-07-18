#!/usr/bin/env node

/**
 * 设置 R2 存储桶脚本
 *
 * 用途：自动创建开发、测试、生产环境的 R2 存储桶
 * 使用：node scripts/setup-r2.js [environment]
 *
 * 环境：
 * - dev: 开发环境
 * - staging: 测试环境
 * - production: 生产环境
 * - all: 创建所有环境的存储桶
 */

const { execSync } = require("child_process");
const path = require("path");

// 存储桶配置
const BUCKETS = {
  dev: "face-recog-photos-dev",
  staging: "face-recog-photos-staging",
  production: "face-recog-photos-prod",
};

// CORS 配置 (允许前端访问)
const CORS_CONFIG = {
  rules: [
    {
      allowedOrigins: ["*"],
      allowedMethods: ["GET", "POST", "PUT", "DELETE"],
      allowedHeaders: ["Content-Type", "Authorization"],
      maxAgeSeconds: 3600,
    },
  ],
};

/**
 * 执行命令并返回结果
 */
function runCommand(command, options = {}) {
  try {
    console.log(`执行命令: ${command}`);
    const result = execSync(command, {
      encoding: "utf8",
      stdio: options.silent ? "pipe" : "inherit",
      ...options,
    });
    return { success: true, output: result };
  } catch (error) {
    console.error(`命令执行失败: ${error.message}`);
    return { success: false, error: error.message };
  }
}

/**
 * 检查存储桶是否存在
 */
function checkBucketExists(bucketName) {
  const result = runCommand(`wrangler r2 bucket list`, { silent: true });
  if (result.success) {
    return result.output.includes(bucketName);
  }
  return false;
}

/**
 * 创建 R2 存储桶
 */
function createBucket(bucketName) {
  console.log(`\n🪣 创建存储桶: ${bucketName}`);

  // 检查存储桶是否已存在
  if (checkBucketExists(bucketName)) {
    console.log(`✅ 存储桶 ${bucketName} 已存在`);
    return true;
  }

  // 创建存储桶
  const createResult = runCommand(`wrangler r2 bucket create ${bucketName}`);
  if (!createResult.success) {
    console.error(`❌ 创建存储桶失败: ${createResult.error}`);
    return false;
  }

  console.log(`✅ 存储桶 ${bucketName} 创建成功`);

  // 设置 CORS 配置 (允许前端访问)
  console.log(`🔧 配置 CORS 规则...`);
  const corsConfigFile = path.join(__dirname, "temp-cors.json");

  try {
    require("fs").writeFileSync(
      corsConfigFile,
      JSON.stringify(CORS_CONFIG, null, 2)
    );

    const corsResult = runCommand(
      `wrangler r2 bucket cors put ${bucketName} --file ${corsConfigFile}`
    );
    if (corsResult.success) {
      console.log(`✅ CORS 配置成功`);
    } else {
      console.warn(`⚠️ CORS 配置失败，可能需要手动设置`);
    }

    // 清理临时文件
    require("fs").unlinkSync(corsConfigFile);
  } catch (error) {
    console.warn(`⚠️ CORS 配置过程中出现错误: ${error.message}`);
  }

  return true;
}

/**
 * 显示存储桶信息
 */
function showBucketInfo(bucketName) {
  console.log(`\n📊 存储桶信息: ${bucketName}`);

  const infoResult = runCommand(`wrangler r2 bucket list`, { silent: true });
  if (infoResult.success && infoResult.output.includes(bucketName)) {
    console.log(`✅ 状态: 已创建`);
    console.log(`🌐 访问: 通过 Workers 绑定`);
    console.log(`🔗 绑定名称: BUCKET`);
  } else {
    console.log(`❌ 状态: 不存在`);
  }
}

/**
 * 主函数
 */
function main() {
  const args = process.argv.slice(2);
  const environment = args[0] || "dev";

  console.log("🚀 人脸识别系统 - R2 存储桶设置");
  console.log("=====================================");

  // 检查 wrangler 是否安装
  const wranglerCheck = runCommand("wrangler --version", { silent: true });
  if (!wranglerCheck.success) {
    console.error("❌ Wrangler CLI 未安装或不可用");
    console.error("请运行: npm install -g wrangler");
    process.exit(1);
  }

  console.log(`✅ Wrangler 版本: ${wranglerCheck.output.trim()}`);

  if (environment === "all") {
    // 创建所有环境的存储桶
    console.log("\n📦 创建所有环境的存储桶...");

    for (const [env, bucketName] of Object.entries(BUCKETS)) {
      if (!createBucket(bucketName)) {
        console.error(`❌ 创建 ${env} 环境存储桶失败`);
        process.exit(1);
      }
    }
  } else if (BUCKETS[environment]) {
    // 创建指定环境的存储桶
    console.log(`\n📦 创建 ${environment} 环境存储桶...`);

    if (!createBucket(BUCKETS[environment])) {
      console.error(`❌ 创建 ${environment} 环境存储桶失败`);
      process.exit(1);
    }
  } else {
    console.error(`❌ 无效的环境: ${environment}`);
    console.error("可用环境: dev, staging, production, all");
    process.exit(1);
  }

  // 显示所有存储桶信息
  console.log("\n📋 存储桶状态摘要:");
  console.log("=====================");

  for (const [env, bucketName] of Object.entries(BUCKETS)) {
    showBucketInfo(bucketName);
  }

  console.log("\n🎉 R2 存储桶设置完成！");
  console.log("\n📚 下一步:");
  console.log("1. 运行 pnpm run setup:secrets 设置环境密钥");
  console.log("2. 运行 pnpm run deploy:staging 部署到测试环境");
  console.log("3. 运行 pnpm run deploy:production 部署到生产环境");
}

// 错误处理
process.on("uncaughtException", (error) => {
  console.error("❌ 未捕获的异常:", error.message);
  process.exit(1);
});

process.on("unhandledRejection", (reason, promise) => {
  console.error("❌ 未处理的 Promise 拒绝:", reason);
  process.exit(1);
});

// 运行主函数
if (require.main === module) {
  main();
}
