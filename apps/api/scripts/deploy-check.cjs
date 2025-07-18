#!/usr/bin/env node

/**
 * 部署检查脚本
 *
 * 用途：验证部署前的环境配置和依赖
 * 使用：node scripts/deploy-check.js [environment]
 *
 * 检查项目：
 * - Wrangler 配置文件有效性
 * - 环境变量配置
 * - R2 存储桶可用性
 * - 代码构建状态
 * - 依赖包完整性
 */

const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

// 检查配置
const CHECK_CONFIG = {
  dev: {
    name: "development",
    description: "开发环境",
    required: {
      buckets: ["face-recog-photos-dev"],
      vars: ["ENVIRONMENT", "API_VERSION", "DEBUG_MODE"],
    },
  },
  staging: {
    name: "staging",
    description: "测试环境",
    required: {
      buckets: ["face-recog-photos-staging"],
      vars: ["ENVIRONMENT", "API_VERSION"],
      secrets: ["API_SECRET_KEY"],
    },
  },
  production: {
    name: "production",
    description: "生产环境",
    required: {
      buckets: ["face-recog-photos-prod"],
      vars: ["ENVIRONMENT", "API_VERSION", "SENTRY_DSN"],
      secrets: ["API_SECRET_KEY", "SENTRY_DSN", "WEBHOOK_SECRET"],
    },
  },
};

/**
 * 执行命令并返回结果
 */
function runCommand(command, options = {}) {
  try {
    const result = execSync(command, {
      encoding: "utf8",
      stdio: options.silent ? "pipe" : "inherit",
      ...options,
    });
    return { success: true, output: result.trim() };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * 检查结果类
 */
class CheckResult {
  constructor() {
    this.checks = [];
    this.totalScore = 0;
    this.maxScore = 0;
  }

  add(name, status, message, score = 1) {
    this.checks.push({ name, status, message, score });
    this.maxScore += score;
    if (status === "pass") {
      this.totalScore += score;
    }
  }

  getScore() {
    return Math.round((this.totalScore / this.maxScore) * 100);
  }

  hasCriticalFailures() {
    return this.checks.some((check) => check.status === "critical");
  }

  report() {
    console.log("\n📊 部署检查报告");
    console.log("==================");

    this.checks.forEach((check) => {
      const icon = {
        pass: "✅",
        warn: "⚠️ ",
        fail: "❌",
        critical: "🚨",
      }[check.status];

      console.log(`${icon} ${check.name}: ${check.message}`);
    });

    console.log(
      `\n🎯 检查评分: ${this.getScore()}% (${this.totalScore}/${this.maxScore})`
    );

    if (this.hasCriticalFailures()) {
      console.log("🚨 存在关键问题，无法部署");
      return false;
    } else if (this.getScore() >= 80) {
      console.log("✅ 部署检查通过，可以安全部署");
      return true;
    } else {
      console.log("⚠️ 部分检查未通过，建议修复后再部署");
      return false;
    }
  }
}

/**
 * 检查文件存在性
 */
function checkFileExists(filePath, description) {
  if (fs.existsSync(filePath)) {
    return { status: "pass", message: `${description} 存在` };
  } else {
    return {
      status: "critical",
      message: `${description} 不存在: ${filePath}`,
    };
  }
}

/**
 * 检查 wrangler 配置
 */
function checkWranglerConfig() {
  const wranglerPath = path.join(process.cwd(), "wrangler.toml");
  const check = checkFileExists(wranglerPath, "wrangler.toml 配置文件");

  if (check.status === "pass") {
    try {
      const content = fs.readFileSync(wranglerPath, "utf8");
      if (content.includes('name = "face-recog-api"')) {
        return { status: "pass", message: "wrangler.toml 配置正确" };
      } else {
        return { status: "warn", message: "wrangler.toml 配置可能有误" };
      }
    } catch (error) {
      return {
        status: "fail",
        message: `wrangler.toml 读取失败: ${error.message}`,
      };
    }
  }

  return check;
}

/**
 * 检查 Wrangler CLI
 */
function checkWranglerCLI() {
  const result = runCommand("wrangler --version", { silent: true });
  if (result.success) {
    return { status: "pass", message: `Wrangler CLI 可用: ${result.output}` };
  } else {
    return { status: "critical", message: "Wrangler CLI 未安装或不可用" };
  }
}

/**
 * 检查 TypeScript 编译
 */
function checkTypeScript() {
  const result = runCommand("pnpm run type-check", { silent: true });
  if (result.success) {
    return { status: "pass", message: "TypeScript 类型检查通过" };
  } else {
    return {
      status: "fail",
      message: `TypeScript 类型检查失败: ${result.error}`,
    };
  }
}

/**
 * 检查代码质量
 */
function checkCodeQuality() {
  const result = runCommand("pnpm run lint", { silent: true });
  if (result.success) {
    return { status: "pass", message: "ESLint 检查通过" };
  } else {
    return { status: "warn", message: `ESLint 检查有警告: ${result.error}` };
  }
}

/**
 * 检查依赖包
 */
function checkDependencies() {
  const packagePath = path.join(process.cwd(), "package.json");
  const lockPath = path.join(process.cwd(), "../../pnpm-lock.yaml");

  if (!fs.existsSync(packagePath)) {
    return { status: "critical", message: "package.json 不存在" };
  }

  if (!fs.existsSync(lockPath)) {
    return {
      status: "warn",
      message: "pnpm-lock.yaml 不存在，建议运行 pnpm install",
    };
  }

  try {
    const pkg = JSON.parse(fs.readFileSync(packagePath, "utf8"));
    const requiredDeps = ["hono", "zod", "@hono/zod-validator"];
    const missing = requiredDeps.filter((dep) => !pkg.dependencies[dep]);

    if (missing.length === 0) {
      return { status: "pass", message: "所有必需依赖已安装" };
    } else {
      return { status: "fail", message: `缺少依赖: ${missing.join(", ")}` };
    }
  } catch (error) {
    return { status: "fail", message: `依赖检查失败: ${error.message}` };
  }
}

/**
 * 检查 R2 存储桶
 */
function checkR2Buckets(buckets) {
  const result = runCommand("wrangler r2 bucket list", { silent: true });
  if (!result.success) {
    return { status: "critical", message: "R2 存储桶列表获取失败" };
  }

  const existingBuckets = result.output
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
  const missing = buckets.filter((bucket) => !existingBuckets.includes(bucket));

  if (missing.length === 0) {
    return {
      status: "pass",
      message: `所有 R2 存储桶已创建: ${buckets.join(", ")}`,
    };
  } else {
    return { status: "fail", message: `缺少 R2 存储桶: ${missing.join(", ")}` };
  }
}

/**
 * 检查环境变量
 */
function checkEnvironmentVars(vars, environment) {
  // 这里只能检查 wrangler.toml 中的配置
  const wranglerPath = path.join(process.cwd(), "wrangler.toml");
  if (!fs.existsSync(wranglerPath)) {
    return {
      status: "critical",
      message: "wrangler.toml 不存在，无法检查环境变量",
    };
  }

  try {
    const content = fs.readFileSync(wranglerPath, "utf8");
    const missing = vars.filter((varName) => !content.includes(varName));

    if (missing.length === 0) {
      return {
        status: "pass",
        message: `环境变量配置完整: ${vars.join(", ")}`,
      };
    } else {
      return {
        status: "warn",
        message: `缺少环境变量配置: ${missing.join(", ")}`,
      };
    }
  } catch (error) {
    return { status: "fail", message: `环境变量检查失败: ${error.message}` };
  }
}

/**
 * 检查环境密钥
 */
function checkSecrets(secrets, environment) {
  const envFlag =
    environment === "production" ? "--env production" : "--env staging";
  const result = runCommand(`wrangler secret list ${envFlag}`, {
    silent: true,
  });

  if (!result.success) {
    return {
      status: "warn",
      message: "无法获取密钥列表，可能需要先登录 Cloudflare",
    };
  }

  const existingSecrets = result.output
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
  const missing = secrets.filter((secret) => !existingSecrets.includes(secret));

  if (missing.length === 0) {
    return {
      status: "pass",
      message: `所有必需密钥已设置: ${secrets.join(", ")}`,
    };
  } else {
    return { status: "fail", message: `缺少密钥: ${missing.join(", ")}` };
  }
}

/**
 * 检查构建输出
 */
function checkBuildOutput() {
  const result = runCommand("pnpm run build", { silent: true });
  if (result.success) {
    return { status: "pass", message: "代码构建成功" };
  } else {
    return { status: "critical", message: `代码构建失败: ${result.error}` };
  }
}

/**
 * 执行部署检查
 */
function performDeploymentCheck(environment) {
  const config = CHECK_CONFIG[environment];
  if (!config) {
    console.error(`❌ 无效的环境: ${environment}`);
    return false;
  }

  const results = new CheckResult();

  console.log(`🔍 开始检查 ${config.description} 部署环境`);
  console.log("================================================");

  // 基础检查
  console.log("\n📋 基础环境检查...");
  results.add("Wrangler CLI", ...Object.values(checkWranglerCLI()), 2);
  results.add("Wrangler 配置", ...Object.values(checkWranglerConfig()), 2);
  results.add("依赖包", ...Object.values(checkDependencies()), 1);

  // 代码质量检查
  console.log("\n🔧 代码质量检查...");
  results.add("TypeScript 编译", ...Object.values(checkTypeScript()), 3);
  results.add("代码构建", ...Object.values(checkBuildOutput()), 3);
  results.add("代码规范", ...Object.values(checkCodeQuality()), 1);

  // 环境特定检查
  console.log("\n🌐 环境配置检查...");
  if (config.required.buckets) {
    results.add(
      "R2 存储桶",
      ...Object.values(checkR2Buckets(config.required.buckets)),
      2
    );
  }

  if (config.required.vars) {
    results.add(
      "环境变量",
      ...Object.values(checkEnvironmentVars(config.required.vars, environment)),
      1
    );
  }

  if (config.required.secrets) {
    results.add(
      "环境密钥",
      ...Object.values(checkSecrets(config.required.secrets, environment)),
      2
    );
  }

  return results.report();
}

/**
 * 主函数
 */
function main() {
  const args = process.argv.slice(2);
  const environment = args[0] || "dev";

  console.log("🚀 人脸识别系统 - 部署检查工具");
  console.log("=================================");

  if (!CHECK_CONFIG[environment]) {
    console.error(`❌ 无效的环境: ${environment}`);
    console.error("可用环境: dev, staging, production");
    process.exit(1);
  }

  const success = performDeploymentCheck(environment);

  if (!success) {
    console.log("\n📚 修复建议:");
    console.log("1. 运行 pnpm run setup:r2 创建存储桶");
    console.log("2. 运行 pnpm run setup:secrets 设置密钥");
    console.log("3. 运行 pnpm run type-check 修复类型错误");
    console.log("4. 运行 pnpm run lint 修复代码规范问题");

    process.exit(1);
  } else {
    console.log("\n🎉 部署检查完成，环境就绪！");
    console.log("\n📚 部署命令:");
    console.log(`- 预览部署: pnpm run preview:${environment}`);
    console.log(`- 正式部署: pnpm run deploy:${environment}`);
    console.log(`- 查看日志: pnpm run logs:${environment}`);
  }
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
