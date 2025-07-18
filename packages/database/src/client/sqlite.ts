import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import * as schema from "../schema";

export function createSQLiteClient(databasePath: string = ":memory:") {
  const sqlite = new Database(databasePath);
  return drizzle(sqlite, { schema });
}

export type SQLiteClient = ReturnType<typeof createSQLiteClient>;
