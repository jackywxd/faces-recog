import { drizzle } from "drizzle-orm/d1";
import * as schema from "../schema";

export function createD1Client(d1Database: D1Database) {
  return drizzle(d1Database, { schema });
}

export type D1Client = ReturnType<typeof createD1Client>;
