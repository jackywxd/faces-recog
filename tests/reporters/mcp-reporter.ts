import {
  Reporter,
  TestCase,
  TestResult,
  FullResult,
} from "@playwright/test/reporter";
import * as fs from "fs";
import * as path from "path";

/**
 * MCP 自定义报告器
 * 将测试结果格式化并发送到 Cursor 编辑器
 */
class MCPReporter implements Reporter {
  private testResults: TestResult[] = [];
  private startTime: number = 0;
  private outputDir: string;

  constructor(options: { outputDir?: string } = {}) {
    this.outputDir = options.outputDir || "test-results/mcp";
    // 确保输出目录存在
    fs.mkdirSync(this.outputDir, { recursive: true });
  }

  onBegin(config: any, suite: any) {
    this.startTime = Date.now();
    console.log(`🚀 开始运行测试 - MCP 集成模式`);
    console.log(`📊 测试配置: ${config.projects.length} 个项目`);
  }

  onTestEnd(test: TestCase, result: TestResult) {
    this.testResults.push(result);

    const status = this.getStatusEmoji(result.status);
    const duration = `${result.duration}ms`;

    console.log(`${status} ${test.title} (${duration})`);

    // 实时发送测试结果到 MCP
    this.sendResultToMCP(test, result);
  }

  onEnd(result: FullResult) {
    const duration = Date.now() - this.startTime;
    const summary = this.generateSummary(result);

    console.log("\n📋 测试摘要:");
    console.log(`总用时: ${duration}ms`);
    console.log(`状态: ${result.status}`);

    // 生成详细报告
    this.generateMCPReport(summary, duration);

    // 发送完整摘要到 Cursor
    this.sendSummaryToMCP(summary);
  }

  private getStatusEmoji(status: string): string {
    switch (status) {
      case "passed":
        return "✅";
      case "failed":
        return "❌";
      case "skipped":
        return "⏭️";
      case "timedOut":
        return "⏰";
      default:
        return "❓";
    }
  }

  private generateSummary(result: FullResult) {
    const stats = {
      total: this.testResults.length,
      passed: this.testResults.filter((r) => r.status === "passed").length,
      failed: this.testResults.filter((r) => r.status === "failed").length,
      skipped: this.testResults.filter((r) => r.status === "skipped").length,
      flaky: this.testResults.filter((r) => r.status === "flaky").length,
    };

    return {
      status: result.status,
      stats,
      duration: Date.now() - this.startTime,
      timestamp: new Date().toISOString(),
    };
  }

  private async sendResultToMCP(test: TestCase, result: TestResult) {
    const mcpMessage = {
      type: "test_result",
      data: {
        title: test.title,
        file: test.location?.file,
        line: test.location?.line,
        status: result.status,
        duration: result.duration,
        error: result.error?.message,
        retry: result.retry,
        timestamp: new Date().toISOString(),
      },
    };

    // 保存到文件供 MCP 客户端读取
    const filename = `test_${Date.now()}_${Math.random()
      .toString(36)
      .substr(2, 9)}.json`;
    const filepath = path.join(this.outputDir, filename);

    fs.writeFileSync(filepath, JSON.stringify(mcpMessage, null, 2));

    // 发送到 Cursor (如果有 MCP 连接)
    if (process.env.MCP_ENDPOINT) {
      try {
        await this.sendToMCPEndpoint(mcpMessage);
      } catch (error) {
        console.warn("⚠️ 无法发送到 MCP 端点:", error.message);
      }
    }
  }

  private async sendSummaryToMCP(summary: any) {
    const mcpMessage = {
      type: "test_summary",
      data: summary,
    };

    // 保存摘要文件
    const summaryPath = path.join(this.outputDir, "summary.json");
    fs.writeFileSync(summaryPath, JSON.stringify(mcpMessage, null, 2));

    // 生成 Cursor 友好的报告
    const cursorReport = this.generateCursorReport(summary);
    const reportPath = path.join(this.outputDir, "cursor-report.md");
    fs.writeFileSync(reportPath, cursorReport);

    console.log(`📄 报告已生成: ${reportPath}`);
  }

  private generateCursorReport(summary: any): string {
    const { stats, duration, timestamp } = summary;
    const passRate = ((stats.passed / stats.total) * 100).toFixed(1);

    return `# Playwright 测试报告

## 📊 测试摘要
- **总测试数**: ${stats.total}
- **通过**: ${stats.passed} ✅
- **失败**: ${stats.failed} ❌
- **跳过**: ${stats.skipped} ⏭️
- **不稳定**: ${stats.flaky} 🔄
- **通过率**: ${passRate}%
- **总用时**: ${duration}ms
- **时间戳**: ${timestamp}

## 🎯 状态概览
${stats.failed > 0 ? "❌ 有测试失败" : "✅ 所有测试通过"}

## 📋 详细结果
${this.testResults
  .map(
    (result) =>
      `- ${this.getStatusEmoji(result.status)} ${
        result.test?.title || "Unknown"
      } (${result.duration}ms)`
  )
  .join("\n")}

---
*由 Playwright MCP 报告器自动生成*
`;
  }

  private generateMCPReport(summary: any, duration: number) {
    const report = {
      type: "playwright_report",
      version: "1.0.0",
      timestamp: new Date().toISOString(),
      summary,
      duration,
      results: this.testResults.map((result) => ({
        title: result.test?.title,
        status: result.status,
        duration: result.duration,
        error: result.error?.message,
        retry: result.retry,
      })),
    };

    const reportPath = path.join(this.outputDir, "mcp-report.json");
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  }

  private async sendToMCPEndpoint(message: any) {
    const endpoint = process.env.MCP_ENDPOINT;
    if (!endpoint) return;

    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.MCP_TOKEN || ""}`,
      },
      body: JSON.stringify(message),
    });

    if (!response.ok) {
      throw new Error(`MCP endpoint error: ${response.status}`);
    }
  }
}

export default MCPReporter;
