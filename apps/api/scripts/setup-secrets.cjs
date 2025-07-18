#!/usr/bin/env node

/**
 * 设置环境密钥脚本
 *
 * 用途：管理开发、测试、生产环境的敏感配置
 * 使用：node scripts/setup-secrets.js [environment]
 *
 * 功能：
 * - 设置生产环境的 API 密钥
 * - 配置监控和错误追踪
 * - 管理数据库连接密钥
 * - 设置自定义域名配置
 */

const { execSync } = require("child_process");
const readline = require("readline");

// 环境配置
const ENVIRONMENTS = {
  staging: {
    name: "staging",
    description: "测试环境",
    secrets: [
      {
        key: "SENTRY_DSN",
        description: "Sentry 错误监控 DSN (可选)",
        required: false,
      },
      { key: "API_SECRET_KEY", description: "API 安全密钥", required: true },
      {
        key: "WEBHOOK_SECRET",
        description: "Webhook 验证密钥 (可选)",
        required: false,
      },
    ],
  },
  production: {
    name: "production",
    description: "生产环境",
    secrets: [
      { key: "SENTRY_DSN", description: "Sentry 错误监控 DSN", required: true },
      { key: "API_SECRET_KEY", description: "API 安全密钥", required: true },
      {
        key: "WEBHOOK_SECRET",
        description: "Webhook 验证密钥",
        required: true,
      },
      {
        key: "ANALYTICS_TOKEN",
        description: "分析服务令牌 (可选)",
        required: false,
      },
      {
        key: "NOTIFICATION_KEY",
        description: "通知服务密钥 (可选)",
        required: false,
      },
    ],
  },
};

/**
 * 创建 readline 接口
 */
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

/**
 * 提示用户输入
 */
function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer.trim());
    });
  });
}

/**
 * 提示用户输入密钥（隐藏输入）
 */
function askSecret(question) {
  return new Promise((resolve) => {
    // 简单的密钥输入，在生产环境中可以考虑使用更安全的方式
    process.stdout.write(question);
    process.stdin.setRawMode(true);
    process.stdin.resume();
    process.stdin.setEncoding("utf8");

    let secret = "";
    process.stdin.on("data", function (char) {
      char = char + "";

      switch (char) {
        case "\n":
        case "\r":
        case "\u0004":
          process.stdin.setRawMode(false);
          process.stdin.pause();
          process.stdout.write("\n");
          resolve(secret);
          break;
        case "\u0003":
          process.exit(1);
          break;
        case "\u007f":
        case "\b":
          if (secret.length > 0) {
            secret = secret.slice(0, -1);
            process.stdout.write("\b \b");
          }
          break;
        default:
          secret += char;
          process.stdout.write("*");
          break;
      }
    });
  });
}

/**
 * 执行命令
 */
function runCommand(command, options = {}) {
  try {
    console.log(`执行命令: ${command.replace(/--value\s+\S+/, "--value ***")}`);
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
 * 检查密钥是否已存在
 */
function checkSecretExists(key, environment) {
  const command =
    environment === "production"
      ? `wrangler secret list --env production`
      : `wrangler secret list --env staging`;

  const result = runCommand(command, { silent: true });
  if (result.success) {
    return result.output.includes(key);
  }
  return false;
}

/**
 * 设置密钥
 */
async function setSecret(key, value, environment) {
  const envFlag =
    environment === "production" ? "--env production" : "--env staging";
  const command = `echo "${value}" | wrangler secret put ${key} ${envFlag}`;

  const result = runCommand(command);
  return result.success;
}

/**
 * 生成随机密钥
 */
function generateRandomKey(length = 32) {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * 设置环境密钥
 */
async function setupEnvironmentSecrets(environment) {
  const config = ENVIRONMENTS[environment];
  if (!config) {
    console.error(`❌ 无效的环境: ${environment}`);
    return false;
  }

  console.log(`\n🔐 设置 ${config.description} 密钥`);
  console.log("===============================");

  for (const secret of config.secrets) {
    console.log(`\n📝 配置密钥: ${secret.key}`);
    console.log(`📋 描述: ${secret.description}`);
    console.log(`🔒 必需: ${secret.required ? "是" : "否"}`);

    // 检查密钥是否已存在
    const exists = checkSecretExists(secret.key, environment);
    if (exists) {
      console.log(`✅ 密钥 ${secret.key} 已存在`);

      const updateAnswer = await askQuestion("是否要更新此密钥？ (y/N): ");
      if (
        updateAnswer.toLowerCase() !== "y" &&
        updateAnswer.toLowerCase() !== "yes"
      ) {
        continue;
      }
    }

    // 获取密钥值
    let value = "";

    if (secret.key === "API_SECRET_KEY") {
      // API 密钥可以自动生成
      const generateAnswer = await askQuestion(
        "是否自动生成 API 密钥？ (Y/n): "
      );
      if (
        generateAnswer.toLowerCase() !== "n" &&
        generateAnswer.toLowerCase() !== "no"
      ) {
        value = generateRandomKey(64);
        console.log("✅ 已生成随机 API 密钥");
      }
    }

    if (!value) {
      if (!secret.required) {
        const skipAnswer = await askQuestion(
          "此密钥为可选，是否跳过？ (Y/n): "
        );
        if (
          skipAnswer.toLowerCase() !== "n" &&
          skipAnswer.toLowerCase() !== "no"
        ) {
          console.log("⏭️ 跳过可选密钥");
          continue;
        }
      }

      value = await askSecret(`请输入 ${secret.key} 的值: `);
    }

    if (!value && secret.required) {
      console.error(`❌ ${secret.key} 是必需的密钥，不能为空`);
      return false;
    }

    if (value) {
      // 设置密钥
      const success = await setSecret(secret.key, value, environment);
      if (success) {
        console.log(`✅ ${secret.key} 设置成功`);
      } else {
        console.error(`❌ ${secret.key} 设置失败`);
        return false;
      }
    }
  }

  return true;
}

/**
 * 显示环境状态
 */
function showEnvironmentStatus(environment) {
  console.log(`\n📊 ${ENVIRONMENTS[environment].description} 状态:`);
  console.log("=====================");

  const envFlag =
    environment === "production" ? "--env production" : "--env staging";
  const result = runCommand(`wrangler secret list ${envFlag}`, {
    silent: true,
  });

  if (result.success) {
    console.log("✅ 已配置的密钥:");
    const secrets = result.output.split("\n").filter((line) => line.trim());
    if (secrets.length === 0) {
      console.log("   (无)");
    } else {
      secrets.forEach((secret) => {
        console.log(`   - ${secret}`);
      });
    }
  } else {
    console.log("❌ 无法获取密钥列表");
  }
}

/**
 * 主函数
 */
async function main() {
  const args = process.argv.slice(2);
  const environment = args[0];

  console.log("🔐 人脸识别系统 - 环境密钥设置");
  console.log("=================================");

  // 检查 wrangler 是否安装
  const wranglerCheck = runCommand("wrangler --version", { silent: true });
  if (!wranglerCheck.success) {
    console.error("❌ Wrangler CLI 未安装或不可用");
    console.error("请运行: npm install -g wrangler");
    process.exit(1);
  }

  console.log(`✅ Wrangler 版本: ${wranglerCheck.output.trim()}`);

  if (!environment) {
    console.log("\n📋 可用环境:");
    for (const [env, config] of Object.entries(ENVIRONMENTS)) {
      console.log(`  - ${env}: ${config.description}`);
    }

    const selectedEnv = await askQuestion(
      "\n请选择环境 (staging/production): "
    );
    if (!ENVIRONMENTS[selectedEnv]) {
      console.error("❌ 无效的环境选择");
      process.exit(1);
    }

    const success = await setupEnvironmentSecrets(selectedEnv);
    if (!success) {
      console.error("❌ 密钥设置失败");
      process.exit(1);
    }

    showEnvironmentStatus(selectedEnv);
  } else if (ENVIRONMENTS[environment]) {
    const success = await setupEnvironmentSecrets(environment);
    if (!success) {
      console.error("❌ 密钥设置失败");
      process.exit(1);
    }

    showEnvironmentStatus(environment);
  } else {
    console.error(`❌ 无效的环境: ${environment}`);
    console.error("可用环境: staging, production");
    process.exit(1);
  }

  console.log("\n🎉 环境密钥设置完成！");
  console.log("\n📚 下一步:");
  console.log("1. 运行 pnpm run deploy:staging 部署到测试环境");
  console.log("2. 运行 pnpm run deploy:production 部署到生产环境");
  console.log("3. 运行 pnpm run logs:production 查看生产日志");

  rl.close();
}

// 错误处理
process.on("uncaughtException", (error) => {
  console.error("❌ 未捕获的异常:", error.message);
  rl.close();
  process.exit(1);
});

process.on("unhandledRejection", (reason, promise) => {
  console.error("❌ 未处理的 Promise 拒绝:", reason);
  rl.close();
  process.exit(1);
});

// 运行主函数
if (require.main === module) {
  main();
}
