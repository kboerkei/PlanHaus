import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import { drizzle as drizzleSQLite } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import ws from "ws";
import * as schema from "@shared/schema";
import * as sqliteSchema from "@shared/schema-sqlite";

neonConfig.webSocketConstructor = ws;

let pool: Pool | null = null;
let db: any;

// Use SQLite for development if no DATABASE_URL is set
if (!process.env.DATABASE_URL) {
  console.log("No DATABASE_URL found, using SQLite for development...");
  const sqlite = new Database('dev.db');
  db = drizzleSQLite(sqlite, { schema: sqliteSchema });
  pool = null;
} else {
  console.log("Using PostgreSQL database...");
  pool = new Pool({ connectionString: process.env.DATABASE_URL });
  db = drizzle({ client: pool, schema });
}

export { pool, db };