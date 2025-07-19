#!/usr/bin/env node

/**
 * Cloudflare Workers 完整部署脚本
 *
 * 用途：自动化 Cloudflare Workers 的完整部署流程
 * 使用：node scripts/deploy-workers.cjs [environment] [options]
 *
 * 环境：
 * - staging: 测试环境部署到 api-staging.colorsofthewind.club
 * - production: 生产环境部署到 api.colorsofthewind.club
 *
 * 选项：
 * - --dry-run: 执行所有检查但不实际部署
 * - --check-only: 仅执行部署前检查
 * - --skip-checks: 跳过部署前检查（危险）
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
    requiredSecrets: [], // 暂时为空，迭代3会添加数据库密钥
    requiredR2Buckets: ["face-recog-photos-staging"],
  },
  production: {
    environment: "production",
    workerName: "face-recog-api-prod",
    domain: "api.colorsofthewind.club",
    wranglerEnv: "production",
    description: "人脸识别系统 API - 生产环境",
    healthUrl: "https://api.colorsofthewind.club/api/health",
    requiredSecrets: ["SENTRY_DSN"], // 生产环境需要错误监控
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
    // 当 stdio 为 "inherit" 时，result 可能为空字符串或 null
    const output = result ? result.trim() : "";
    return { success: true, output };
  } catch (error) {
    console.error(`❌ 命令失败: ${error.message}`);
    return { success: false, error: error.message };
  }
}

/**
 * 检查环境变量
 */
function checkEnvironmentVariables() {
  console.log("🔍 检查环境变量...");

  const requiredVars = ["CLOUDFLARE_API_TOKEN", "CLOUDFLARE_ACCOUNT_ID"];

  const missing = requiredVars.filter((varName) => !process.env[varName]);

  if (missing.length > 0) {
    console.error("❌ 缺少必需的环境变量:");
    missing.forEach((varName) => {
      console.error(`   - ${varName}`);
    });
    console.error("\n设置环境变量:");
    console.error('export CLOUDFLARE_API_TOKEN="your-api-token"');
    console.error('export CLOUDFLARE_ACCOUNT_ID="your-account-id"');
    return false;
  }

  console.log("✅ 环境变量检查通过");
  return true;
}

/**
 * 检查项目依赖
 */
function checkProjectDependencies() {
  console.log("📦 检查项目依赖...");

  // 检查 package.json
  const packageJsonPath = path.join(process.cwd(), "package.json");
  if (!fs.existsSync(packageJsonPath)) {
    console.error("❌ 未找到 package.json 文件");
    return false;
  }

  // 检查 node_modules
  const nodeModulesPath = path.join(process.cwd(), "node_modules");
  if (!fs.existsSync(nodeModulesPath)) {
    console.log("⚠️ 未找到 node_modules，正在安装依赖...");
    const installResult = runCommand("npm install");
    if (!installResult.success) {
      console.error("❌ 依赖安装失败");
      return false;
    }
  }

  // 检查 wrangler.toml
  const wranglerPath = path.join(process.cwd(), "wrangler.toml");
  if (!fs.existsSync(wranglerPath)) {
    console.error("❌ 未找到 wrangler.toml 配置文件");
    return false;
  }

  console.log("✅ 项目依赖检查通过");
  return true;
}

/**
 * 执行 TypeScript 类型检查
 */
function checkTypeScript() {
  console.log("🔍 执行 TypeScript 类型检查...");

  const typeCheckResult = runCommand("npm run type-check", { silent: true });
  if (!typeCheckResult.success) {
    console.error("❌ TypeScript 类型检查失败");
    console.error("请修复类型错误后重试");
    return false;
  }

  console.log("✅ TypeScript 类型检查通过");
  return true;
}

/**
 * 执行代码质量检查
 */
function checkCodeQuality() {
  console.log("🔍 执行代码质量检查...");

  // ESLint 检查
  const lintResult = runCommand("npm run lint", { silent: true });
  if (!lintResult.success) {
    console.warn("⚠️ ESLint 检查发现问题，但不阻止部署");
    // 不返回 false，因为 lint 问题不应该阻止部署
  } else {
    console.log("✅ ESLint 检查通过");
  }

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
      return false;
    }

    if (!result.output.includes(bucketName)) {
      console.error(`❌ R2 存储桶 ${bucketName} 不存在`);
      console.error(`请运行: npm run setup:r2`);
      return false;
    }
  }

  console.log("✅ R2 存储桶检查通过");
  return true;
}

/**
 * 检查密钥配置
 */
function checkSecrets(config) {
  console.log("🔐 检查密钥配置...");

  if (config.requiredSecrets.length === 0) {
    console.log("ℹ️ 当前环境无需密钥配置");
    return true;
  }

  for (const secretName of config.requiredSecrets) {
    const result = runCommand(
      `wrangler secret list --env ${config.wranglerEnv}`,
      { silent: true }
    );

    if (!result.success) {
      console.error("❌ 无法获取密钥列表");
      return false;
    }

    if (!result.output.includes(secretName)) {
      console.error(`❌ 密钥 ${secretName} 未配置`);
      console.error(`请运行: npm run setup:secrets`);
      return false;
    }
  }

  console.log("✅ 密钥配置检查通过");
  return true;
}

/**
 * 执行构建
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

    // 显示部署信息
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

  // 等待部署生效
  console.log("⏳ 等待部署生效...");
  await new Promise((resolve) => setTimeout(resolve, 10000));

  try {
    // 测试健康检查端点
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
    console.error("\n可能的原因:");
    console.error("   1. 部署尚未完全生效");
    console.error("   2. 域名 DNS 配置问题");
    console.error("   3. Worker 路由配置错误");
    return false;
  }
}

/**
 * 显示部署后信息
 */
function displayPostDeploymentInfo(config) {
  console.log("\n🎉 部署完成！");
  console.log("==========================================");

  console.log("\n📚 访问地址:");
  console.log(`   健康检查: ${config.healthUrl}`);
  console.log(`   文件上传: https://${config.domain}/api/upload`);

  console.log("\n🔧 管理命令:");
  console.log(`   查看日志: npm run logs:${config.environment}`);
  console.log(
    `   查看部署: wrangler deployments list --name ${config.workerName}`
  );
  console.log(`   域名检查: npm run setup:domains:${config.environment}`);

  console.log("\n📊 监控建议:");
  console.log(`   设置 Cloudflare Analytics 监控`);
  console.log(`   配置告警通知`);
  console.log(`   定期查看 Worker 指标`);
}

/**
 * 执行部署前检查
 */
async function performPreDeploymentChecks(config) {
  console.log(`🔍 执行部署前检查 (${config.environment})`);
  console.log("==========================================");

  const checks = [
    { name: "环境变量", fn: () => checkEnvironmentVariables() },
    { name: "项目依赖", fn: () => checkProjectDependencies() },
    { name: "TypeScript", fn: () => checkTypeScript() },
    { name: "代码质量", fn: () => checkCodeQuality() },
    { name: "R2 存储桶", fn: () => checkR2Buckets(config) },
    { name: "密钥配置", fn: () => checkSecrets(config) },
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
  const skipChecks = args.includes("--skip-checks");

  console.log("🚀 Cloudflare Workers 部署工具");
  console.log("=================================");

  // 验证环境参数
  const config = DEPLOY_CONFIG[environment];
  if (!config) {
    console.error(`❌ 无效的环境: ${environment}`);
    console.error("可用环境: staging, production");
    process.exit(1);
  }

  // 执行部署前检查
  if (!skipChecks) {
    const checksPass = await performPreDeploymentChecks(config);
    if (!checksPass) {
      process.exit(1);
    }
  }

  // 如果只是检查，到此结束
  if (checkOnly) {
    console.log("✅ 检查完成");
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

  // 显示部署后信息
  displayPostDeploymentInfo(config);
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
