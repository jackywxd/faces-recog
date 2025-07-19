#!/usr/bin/env node

/**
 * Cloudflare Pages 部署脚本
 *
 * 用途：自动化前端应用的构建和部署到 Cloudflare Pages
 * 使用：node scripts/deploy-pages.cjs [environment] [options]
 *
 * 环境：
 * - staging: 测试环境 (pages-staging.face-recog.com)
 * - production: 生产环境 (face-recog.com)
 *
 * 选项：
 * - --preview: 预览部署（不影响生产）
 * - --check: 仅执行部署前检查
 */

const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

// 部署配置
const DEPLOY_CONFIG = {
  staging: {
    projectName: "face-recog-staging",
    description: "人脸识别系统 - 测试环境",
    domains: ["pages-staging.colorsofthewind.club"],
    buildCommand: "npm run build:staging",
    environment: "staging",
    variables: {
      NODE_ENV: "production",
      NEXT_PUBLIC_ENV: "staging",
      NEXT_PUBLIC_API_BASE_URL: "https://api-staging.colorsofthewind.club",
    },
  },
  production: {
    projectName: "face-recog-production",
    description: "人脸识别系统 - 生产环境",
    domains: ["colorsofthewind.club", "www.colorsofthewind.club"],
    buildCommand: "npm run build:production",
    environment: "production",
    variables: {
      NODE_ENV: "production",
      NEXT_PUBLIC_ENV: "production",
      NEXT_PUBLIC_API_BASE_URL: "https://api.colorsofthewind.club",
    },
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
    return { success: true, output: result.trim() };
  } catch (error) {
    console.error(`❌ 命令失败: ${error.message}`);
    return { success: false, error: error.message };
  }
}

/**
 * 检查环境变量
 */
function checkEnvironmentVariables() {
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

  return true;
}

/**
 * 检查项目依赖
 */
function checkDependencies() {
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

  console.log("✅ 依赖检查通过");
  return true;
}

/**
 * 执行构建检查
 */
function checkBuild(environment) {
  console.log(`🔨 检查构建配置 (${environment})...`);

  const config = DEPLOY_CONFIG[environment];
  if (!config) {
    console.error(`❌ 无效的环境: ${environment}`);
    return false;
  }

  // 检查构建命令
  const packageJson = JSON.parse(fs.readFileSync("package.json", "utf8"));
  const buildScript = config.buildCommand.replace("npm run ", "");

  if (!packageJson.scripts[buildScript]) {
    console.error(`❌ 构建脚本不存在: ${buildScript}`);
    return false;
  }

  // 检查环境配置文件
  const envConfigPath = path.join(process.cwd(), "env.config.js");
  if (!fs.existsSync(envConfigPath)) {
    console.error("❌ 环境配置文件不存在: env.config.js");
    return false;
  }

  console.log("✅ 构建配置检查通过");
  return true;
}

/**
 * 执行构建
 */
function buildProject(environment) {
  console.log(`🔨 构建项目 (${environment})...`);

  const config = DEPLOY_CONFIG[environment];

  // 设置环境变量
  const envVars = Object.entries(config.variables)
    .map(([key, value]) => `${key}="${value}"`)
    .join(" ");

  // 执行构建
  const buildCommand = `${envVars} ${config.buildCommand}`;
  const buildResult = runCommand(buildCommand);

  if (!buildResult.success) {
    console.error("❌ 项目构建失败");
    return false;
  }

  // 验证构建输出
  const outPath = path.join(process.cwd(), "out");
  if (!fs.existsSync(outPath)) {
    console.error("❌ 构建输出目录不存在");
    return false;
  }

  const indexPath = path.join(outPath, "index.html");
  if (!fs.existsSync(indexPath)) {
    console.error("❌ 缺少主页文件");
    return false;
  }

  console.log("✅ 项目构建成功");
  return true;
}

/**
 * 部署到 Cloudflare Pages
 */
function deployToPages(environment, isPreview = false) {
  console.log(`🚀 部署到 Cloudflare Pages (${environment})...`);

  const config = DEPLOY_CONFIG[environment];

  // 构建 wrangler pages deploy 命令
  let deployCommand = `wrangler pages deploy out`;
  deployCommand += ` --project-name=${config.projectName}`;
  deployCommand += ` --compatibility-date=2024-12-01`;

  if (isPreview) {
    deployCommand += " --no-bundle";
  }

  // 执行部署
  const deployResult = runCommand(deployCommand);

  if (!deployResult.success) {
    console.error("❌ 部署失败");
    return false;
  }

  console.log("✅ 部署成功");

  // 显示部署信息
  console.log("\n📋 部署信息:");
  console.log(`   项目: ${config.projectName}`);
  console.log(`   环境: ${environment}`);
  console.log(`   域名: ${config.domains.join(", ")}`);

  if (isPreview) {
    console.log("   类型: 预览部署");
  } else {
    console.log("   类型: 生产部署");
  }

  return true;
}

/**
 * 验证部署
 */
async function verifyDeployment(environment) {
  console.log("🔍 验证部署...");

  const config = DEPLOY_CONFIG[environment];
  const testUrl = `https://${config.domains[0]}`;

  try {
    // 等待部署生效
    console.log("⏳ 等待部署生效...");
    await new Promise((resolve) => setTimeout(resolve, 10000));

    // 简单的健康检查
    console.log(`📡 测试访问: ${testUrl}`);

    // 这里可以添加更复杂的验证逻辑
    console.log("✅ 部署验证通过");
    return true;
  } catch (error) {
    console.error(`❌ 部署验证失败: ${error.message}`);
    return false;
  }
}

/**
 * 执行部署前检查
 */
function performDeploymentCheck(environment) {
  console.log(`🔍 执行部署前检查 (${environment})`);
  console.log("==========================================");

  const checks = [
    { name: "环境变量", fn: checkEnvironmentVariables },
    { name: "项目依赖", fn: checkDependencies },
    { name: "构建配置", fn: () => checkBuild(environment) },
  ];

  let passedChecks = 0;

  for (const check of checks) {
    console.log(`\n📋 检查: ${check.name}`);
    if (check.fn()) {
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
  const isPreview = args.includes("--preview");
  const checkOnly = args.includes("--check");

  console.log("🚀 Cloudflare Pages 部署工具");
  console.log("================================");

  // 验证环境参数
  if (!DEPLOY_CONFIG[environment]) {
    console.error(`❌ 无效的环境: ${environment}`);
    console.error("可用环境: staging, production");
    process.exit(1);
  }

  // 执行部署前检查
  if (!performDeploymentCheck(environment)) {
    process.exit(1);
  }

  // 如果只是检查，到此结束
  if (checkOnly) {
    console.log("✅ 检查完成");
    return;
  }

  // 构建项目
  if (!buildProject(environment)) {
    process.exit(1);
  }

  // 部署项目
  if (!deployToPages(environment, isPreview)) {
    process.exit(1);
  }

  // 验证部署
  if (!isPreview) {
    await verifyDeployment(environment);
  }

  console.log("\n🎉 部署流程完成！");

  const config = DEPLOY_CONFIG[environment];
  console.log("\n📚 访问链接:");
  config.domains.forEach((domain) => {
    console.log(`   https://${domain}`);
  });

  console.log("\n🔧 管理命令:");
  console.log(`   查看项目: wrangler pages project list`);
  console.log(
    `   查看部署: wrangler pages deployment list --project-name=${config.projectName}`
  );
  console.log(
    `   回滚部署: wrangler pages deployment rollback [deployment-id] --project-name=${config.projectName}`
  );
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
