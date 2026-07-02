import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

export const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL is required.");
}

export const pool = new Pool({
  connectionString: databaseUrl,
  max: 10
});

export const db = drizzle(pool, { schema });
