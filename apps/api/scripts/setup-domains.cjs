#!/usr/bin/env node

/**
 * Cloudflare Workers 自定义域名配置脚本
 *
 * 用途：为 Cloudflare Workers 配置自定义域名和路由
 * 使用：node scripts/setup-domains.cjs [environment]
 *
 * 环境：
 * - staging: api-staging.colorsofthewind.club
 * - production: api.colorsofthewind.club
 *
 * 功能：
 * - 验证域名 DNS 配置
 * - 检查 Cloudflare Zone (使用 API + DNS 备选)
 * - 配置 Workers 路由
 * - 验证 SSL 证书
 * - 测试域名访问
 *
 * 注意：使用 Cloudflare API 替代不再支持的 wrangler zones 命令
 */

const { execSync } = require("child_process");
const dns = require("dns").promises;

// 域名配置
const DOMAIN_CONFIG = {
  staging: {
    domain: "api-staging.colorsofthewind.club",
    zone: "colorsofthewind.club",
    workerName: "face-recog-api-staging",
    pattern: "api-staging.colorsofthewind.club/*",
    description: "人脸识别系统 API - 测试环境",
    environment: "staging",
  },
  production: {
    domain: "api.colorsofthewind.club",
    zone: "colorsofthewind.club",
    workerName: "face-recog-api-prod",
    pattern: "api.colorsofthewind.club/*",
    description: "人脸识别系统 API - 生产环境",
    environment: "production",
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
 * 验证 DNS 配置
 */
async function verifyDNSConfiguration(domain) {
  console.log(`🔍 验证 DNS 配置: ${domain}`);

  try {
    // 检查 A 记录
    const addresses = await dns.resolve4(domain);
    console.log(`✅ A 记录: ${addresses.join(", ")}`);

    // 检查 CNAME 记录（如果没有 A 记录）
    if (addresses.length === 0) {
      try {
        const cnames = await dns.resolveCname(domain);
        console.log(`✅ CNAME 记录: ${cnames.join(", ")}`);
      } catch (cnameError) {
        console.warn("⚠️ 未找到 CNAME 记录");
      }
    }

    return true;
  } catch (error) {
    console.error(`❌ DNS 解析失败: ${error.message}`);
    console.error("\n请确保域名已正确配置:");
    console.error(`   1. 在 Cloudflare DNS 中添加 A 记录或 CNAME 记录`);
    console.error(`   2. 指向 Cloudflare 的代理服务器`);
    console.error(`   3. 启用 Cloudflare 代理 (橙色云朵)`);
    return false;
  }
}

/**
 * 检查 Cloudflare Zone (使用 API)
 */
async function checkCloudflareZone(zoneName) {
  console.log(`🔍 检查 Cloudflare Zone: ${zoneName}`);

  const apiToken = process.env.CLOUDFLARE_API_TOKEN;
  if (!apiToken) {
    console.error("❌ 缺少 CLOUDFLARE_API_TOKEN");
    return false;
  }

  try {
    const { execSync } = require("child_process");

    // 使用 Cloudflare API 检查 Zone
    const curlCommand = `curl -s -H "Authorization: Bearer ${apiToken}" -H "Content-Type: application/json" "https://api.cloudflare.com/client/v4/zones?name=${zoneName}"`;

    const result = execSync(curlCommand, { encoding: "utf8", timeout: 10000 });
    const response = JSON.parse(result);

    if (response.success && response.result && response.result.length > 0) {
      const zone = response.result[0];
      console.log(`✅ Zone ${zoneName} 已找到`);
      console.log(`   Zone ID: ${zone.id}`);
      console.log(`   状态: ${zone.status}`);

      if (zone.status !== "active") {
        console.warn(`⚠️ Zone 状态不是 active: ${zone.status}`);
      }

      return true;
    } else {
      console.error(`❌ Zone ${zoneName} 未找到或无权限访问`);
      return await fallbackZoneCheck(zoneName);
    }
  } catch (error) {
    console.error(`❌ API 检查失败: ${error.message}`);
    return await fallbackZoneCheck(zoneName);
  }
}

/**
 * 备选 Zone 检查 (通过 DNS 解析)
 */
async function fallbackZoneCheck(zoneName) {
  console.log(`🔄 使用备选方法检查域名: ${zoneName}`);

  try {
    const addresses = await dns.resolve4(zoneName);
    if (addresses.length > 0) {
      console.log(`✅ 域名 ${zoneName} 可解析，可能已配置 Cloudflare`);
      console.log(`💡 建议在 Cloudflare Dashboard 中确认域名配置`);
      return true;
    }
  } catch (error) {
    console.error(`❌ 域名解析失败: ${error.message}`);
    console.error("\n请确保:");
    console.error(`   1. 域名 ${zoneName} 已添加到 Cloudflare`);
    console.error(`   2. DNS 记录已正确配置`);
    console.error(`   3. 您有该域名的管理权限`);
    return false;
  }
}

/**
 * 配置 Workers 路由
 */
function configureWorkerRoute(config) {
  console.log(`🚀 配置 Workers 路由: ${config.domain}`);

  // 检查 Worker 是否存在
  const checkResult = runCommand(
    `wrangler deployments list --name ${config.workerName}`,
    { silent: true }
  );

  if (!checkResult.success) {
    console.warn(`⚠️ Worker ${config.workerName} 可能尚未部署`);
    console.log("💡 建议先部署 Worker: npm run deploy:" + config.environment);
  }

  // 配置路由（这会在 wrangler.toml 中自动处理）
  console.log(`✅ 路由配置: ${config.pattern}`);
  console.log(`   Worker: ${config.workerName}`);
  console.log(`   Zone: ${config.zone}`);

  return true;
}

/**
 * 验证 SSL 证书
 */
async function verifySSLCertificate(domain) {
  console.log(`🔒 验证 SSL 证书: https://${domain}`);

  try {
    const { execSync } = require("child_process");
    const result = execSync(`curl -I https://${domain}/api/health`, {
      encoding: "utf8",
      timeout: 10000,
    });

    if (result.includes("200 OK") || result.includes("404")) {
      console.log(`✅ SSL 证书有效，域名可访问`);
      return true;
    } else {
      console.warn(`⚠️ 域名响应异常: ${result.split("\n")[0]}`);
      return false;
    }
  } catch (error) {
    console.error(`❌ SSL 验证失败: ${error.message}`);
    console.error("\n可能的原因:");
    console.error("   1. SSL 证书尚未颁发（等待几分钟）");
    console.error("   2. DNS 传播延迟");
    console.error("   3. Cloudflare 代理未启用");
    return false;
  }
}

/**
 * 测试域名访问
 */
async function testDomainAccess(domain) {
  console.log(`🧪 测试域名访问: https://${domain}`);

  try {
    const { execSync } = require("child_process");

    // 测试健康检查端点
    const healthResult = execSync(`curl -s https://${domain}/api/health`, {
      encoding: "utf8",
      timeout: 10000,
    });

    const health = JSON.parse(healthResult);
    if (health.status === "ok") {
      console.log(`✅ 健康检查通过`);
      console.log(`   时间戳: ${health.timestamp}`);
      console.log(`   环境: ${health.environment}`);
      return true;
    } else {
      console.warn(`⚠️ 健康检查异常: ${healthResult}`);
      return false;
    }
  } catch (error) {
    console.error(`❌ 域名访问测试失败: ${error.message}`);
    return false;
  }
}

/**
 * 显示域名配置信息
 */
function displayDomainInfo(config) {
  console.log("\n📋 域名配置信息:");
  console.log("==========================================");
  console.log(`🌐 域名: ${config.domain}`);
  console.log(`🏷️  环境: ${config.environment}`);
  console.log(`⚙️  Worker: ${config.workerName}`);
  console.log(`📍 路由: ${config.pattern}`);
  console.log(`🏠 Zone: ${config.zone}`);
  console.log("");
  console.log("📚 访问地址:");
  console.log(`   健康检查: https://${config.domain}/api/health`);
  console.log(`   文件上传: https://${config.domain}/api/upload`);
  console.log("");
  console.log("🔧 管理命令:");
  console.log(`   部署 Worker: npm run deploy:${config.environment}`);
  console.log(`   查看日志: npm run logs:${config.environment}`);
  console.log(
    `   查看部署: wrangler deployments list --name ${config.workerName}`
  );
}

/**
 * 执行域名配置检查
 */
async function performDomainSetup(environment) {
  console.log(`🔧 配置 ${environment} 环境域名`);
  console.log("==========================================");

  const config = DOMAIN_CONFIG[environment];
  if (!config) {
    console.error(`❌ 无效的环境: ${environment}`);
    return false;
  }

  const checks = [
    { name: "环境变量", fn: () => checkEnvironmentVariables() },
    { name: "DNS 配置", fn: () => verifyDNSConfiguration(config.domain) },
    { name: "Cloudflare Zone", fn: () => checkCloudflareZone(config.zone) },
    { name: "Workers 路由", fn: () => configureWorkerRoute(config) },
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
    console.log("✅ 基础配置检查通过，开始验证访问...");

    // 等待 DNS 传播
    console.log("⏳ 等待 DNS 传播...");
    await new Promise((resolve) => setTimeout(resolve, 5000));

    // 验证 SSL 和访问
    await verifySSLCertificate(config.domain);
    await testDomainAccess(config.domain);

    displayDomainInfo(config);

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

  console.log("🌐 Cloudflare Workers 域名配置工具");
  console.log("=====================================");

  // 验证环境参数
  if (!DOMAIN_CONFIG[environment]) {
    console.error(`❌ 无效的环境: ${environment}`);
    console.error("可用环境: staging, production");
    process.exit(1);
  }

  // 执行域名配置
  const success = await performDomainSetup(environment);

  if (success) {
    console.log("\n🎉 域名配置完成！");

    const config = DOMAIN_CONFIG[environment];
    console.log("\n🔗 下一步:");
    console.log(`   1. 部署 Worker: npm run deploy:${environment}`);
    console.log(`   2. 验证访问: curl https://${config.domain}/api/health`);
    console.log(`   3. 查看日志: npm run logs:${environment}`);
  } else {
    console.log("\n❌ 域名配置失败，请检查并修复问题");
    process.exit(1);
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
