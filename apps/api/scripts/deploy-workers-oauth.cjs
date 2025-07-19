#!/usr/bin/env node

/**
 * Cloudflare Workers 部署脚本 (OAuth 版本)
 *
 * 使用现有的 OAuth 登录进行部署，无需 API Token
 */

const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

// 部署配置
const DEPLOY_CONFIG = {
  staging: {
    environment: "staging",
    workerName: "face-recog-api-staging",
    domain: "api-staging.colorsofthewind.club",
    wranglerEnv: "staging",
    description: "人脸识别系统 API - 测试环境",
    healthUrl: "https://api-staging.colorsofthewind.club/api/health",
    requiredR2Buckets: ["face-recog-photos-staging"],
  },
  production: {
    environment: "production",
    workerName: "face-recog-api-prod",
    domain: "api.colorsofthewind.club",
    wranglerEnv: "production",
    description: "人脸识别系统 API - 生产环境",
    healthUrl: "https://api.colorsofthewind.club/api/health",
    requiredSecrets: ["SENTRY_DSN"],
    requiredR2Buckets: ["face-recog-photos-prod"],
  },
};

/**
 * 执行命令并返回结果
 */
function runCommand(command, options = {}) {
  try {
    console.log(`🔧 执行: ${command}`);
    const result = execSync(command, {
      encoding: "utf8",
      stdio: options.silent ? "pipe" : "inherit",
      cwd: options.cwd || process.cwd(),
      ...options,
    });
    return { success: true, output: result ? result.trim() : "" };
  } catch (error) {
    console.error(`❌ 命令失败: ${error.message}`);
    return { success: false, error: error.message };
  }
}

/**
 * 检查 Wrangler 登录状态
 */
function checkWranglerAuth() {
  console.log("🔍 检查 Wrangler 认证状态...");

  const result = runCommand("wrangler whoami", { silent: true });
  if (!result.success) {
    console.error("❌ Wrangler 未登录");
    console.error("请运行: wrangler login");
    return false;
  }

  console.log("✅ Wrangler 认证检查通过");
  return true;
}

/**
 * 检查项目依赖
 */
function checkProjectDependencies() {
  console.log("📦 检查项目依赖...");

  const packageJsonPath = path.join(process.cwd(), "package.json");
  if (!fs.existsSync(packageJsonPath)) {
    console.error("❌ 未找到 package.json 文件");
    return false;
  }

  const nodeModulesPath = path.join(process.cwd(), "node_modules");
  if (!fs.existsSync(nodeModulesPath)) {
    console.log("⚠️ 未找到 node_modules，正在安装依赖...");
    const installResult = runCommand("npm install");
    if (!installResult.success) {
      console.error("❌ 依赖安装失败");
      return false;
    }
  }

  const wranglerPath = path.join(process.cwd(), "wrangler.toml");
  if (!fs.existsSync(wranglerPath)) {
    console.error("❌ 未找到 wrangler.toml 配置文件");
    return false;
  }

  console.log("✅ 项目依赖检查通过");
  return true;
}

/**
 * 检查 TypeScript
 */
function checkTypeScript() {
  console.log("🔍 执行 TypeScript 类型检查...");

  const typeCheckResult = runCommand("npm run type-check", { silent: true });
  if (!typeCheckResult.success) {
    console.error("❌ TypeScript 类型检查失败");
    return false;
  }

  console.log("✅ TypeScript 类型检查通过");
  return true;
}

/**
 * 检查 R2 存储桶
 */
function checkR2Buckets(config) {
  console.log("🪣 检查 R2 存储桶...");

  for (const bucketName of config.requiredR2Buckets) {
    const result = runCommand(`wrangler r2 bucket list`, { silent: true });
    if (!result.success) {
      console.error("❌ 无法获取 R2 存储桶列表");
      console.error(
        "💡 提示: 如果您是首次使用，可能需要先运行: npm run setup:r2"
      );
      return false;
    }

    if (!result.output.includes(bucketName)) {
      console.error(`❌ R2 存储桶 ${bucketName} 不存在`);
      console.error(`请运行: npm run setup:r2 或手动创建存储桶`);
      return false;
    }
  }

  console.log("✅ R2 存储桶检查通过");
  return true;
}

/**
 * 构建项目
 */
function buildProject() {
  console.log("🔨 构建项目...");

  const buildResult = runCommand("npm run build");
  if (!buildResult.success) {
    console.error("❌ 项目构建失败");
    return false;
  }

  console.log("✅ 项目构建成功");
  return true;
}

/**
 * 部署 Worker
 */
function deployWorker(config, isDryRun = false) {
  console.log(
    `🚀 部署 Worker${isDryRun ? " (预演模式)" : ""}: ${config.workerName}`
  );

  let deployCommand = `wrangler deploy --env ${config.wranglerEnv}`;
  if (isDryRun) {
    deployCommand += " --dry-run";
  }

  const deployResult = runCommand(deployCommand);
  if (!deployResult.success) {
    console.error("❌ Worker 部署失败");
    return false;
  }

  if (!isDryRun) {
    console.log("✅ Worker 部署成功");
    console.log("\n📋 部署信息:");
    console.log(`   Worker: ${config.workerName}`);
    console.log(`   环境: ${config.environment}`);
    console.log(`   域名: ${config.domain}`);
    console.log(`   健康检查: ${config.healthUrl}`);
  } else {
    console.log("✅ 部署预演完成");
  }

  return true;
}

/**
 * 验证部署
 */
async function verifyDeployment(config) {
  console.log("🔍 验证部署...");

  console.log("⏳ 等待部署生效...");
  await new Promise((resolve) => setTimeout(resolve, 10000));

  try {
    console.log(`📡 测试健康检查: ${config.healthUrl}`);
    const result = execSync(`curl -s "${config.healthUrl}"`, {
      encoding: "utf8",
      timeout: 15000,
    });

    const health = JSON.parse(result);
    if (health.status === "ok") {
      console.log("✅ 健康检查通过");
      console.log(`   时间戳: ${health.timestamp}`);
      console.log(`   环境: ${health.environment}`);
      return true;
    } else {
      console.error(`❌ 健康检查异常: ${result}`);
      return false;
    }
  } catch (error) {
    console.error(`❌ 部署验证失败: ${error.message}`);
    console.error("\n💡 可能原因: 部署尚未完全生效，请稍后手动验证");
    return false;
  }
}

/**
 * 执行部署前检查
 */
async function performPreDeploymentChecks(config) {
  console.log(`🔍 执行部署前检查 (${config.environment})`);
  console.log("==========================================");

  const checks = [
    { name: "Wrangler 认证", fn: () => checkWranglerAuth() },
    { name: "项目依赖", fn: () => checkProjectDependencies() },
    { name: "TypeScript", fn: () => checkTypeScript() },
    { name: "R2 存储桶", fn: () => checkR2Buckets(config) },
  ];

  let passedChecks = 0;

  for (const check of checks) {
    console.log(`\n📋 检查: ${check.name}`);
    if (await check.fn()) {
      passedChecks++;
    } else {
      console.error(`❌ ${check.name} 检查失败`);
    }
  }

  console.log(`\n📊 检查结果: ${passedChecks}/${checks.length} 通过`);

  if (passedChecks === checks.length) {
    console.log("✅ 所有检查通过，可以开始部署");
    return true;
  } else {
    console.log("❌ 部分检查失败，请修复后重试");
    return false;
  }
}

/**
 * 主函数
 */
async function main() {
  const args = process.argv.slice(2);
  const environment = args[0] || "staging";
  const isDryRun = args.includes("--dry-run");
  const checkOnly = args.includes("--check-only");

  console.log("🚀 Cloudflare Workers 部署工具 (OAuth 版本)");
  console.log("===============================================");

  // 验证环境参数
  const config = DEPLOY_CONFIG[environment];
  if (!config) {
    console.error(`❌ 无效的环境: ${environment}`);
    console.error("可用环境: staging, production");
    process.exit(1);
  }

  // 执行部署前检查
  const checksPass = await performPreDeploymentChecks(config);
  if (!checksPass) {
    if (checkOnly) {
      console.log("\n💡 提示:");
      console.log("   - 如果缺少 R2 存储桶，运行: npm run setup:r2");
      console.log("   - 检查通过后，运行: npm run deploy:oauth:staging");
    }
    process.exit(1);
  }

  // 如果只是检查，到此结束
  if (checkOnly) {
    console.log("✅ 检查完成，可以进行部署");
    return;
  }

  // 构建项目
  if (!buildProject()) {
    process.exit(1);
  }

  // 部署 Worker
  if (!deployWorker(config, isDryRun)) {
    process.exit(1);
  }

  // 如果是预演模式，跳过验证
  if (isDryRun) {
    console.log("\n✅ 预演模式完成，未实际部署");
    return;
  }

  // 验证部署
  if (!(await verifyDeployment(config))) {
    console.log("\n⚠️ 部署验证失败，但 Worker 可能已成功部署");
    console.log("请手动检查:");
    console.log(`   curl ${config.healthUrl}`);
  }

  console.log("\n🎉 部署完成！");
  console.log("\n📚 访问地址:");
  console.log(`   健康检查: ${config.healthUrl}`);
  console.log(`   文件上传: https://${config.domain}/api/upload`);
}

// 运行主函数
if (require.main === module) {
  main();
}
