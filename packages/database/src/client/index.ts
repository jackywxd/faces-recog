export * from "./d1";
export * from "./sqlite";

// 环境适配器
export function createDatabaseClient(
  env: "development" | "production" | "test"
) {
  if (env === "production") {
    // 生产环境：返回创建 D1 客户端的工厂函数
    return (d1Database: D1Database) => {
      const { createD1Client } = require("./d1");
      return createD1Client(d1Database);
    };
  } else {
    // 开发和测试环境：返回创建 SQLite 客户端的工厂函数
    return (databasePath?: string) => {
      const { createSQLiteClient } = require("./sqlite");
      return createSQLiteClient(databasePath);
    };
  }
}
