import { defineConfig } from "drizzle-kit";

// Use SQLite for development if no DATABASE_URL is set
const databaseUrl = process.env.DATABASE_URL || "file:./dev.db";

export default defineConfig({
  out: "./migrations",
  schema: databaseUrl.startsWith("file:") ? "./shared/schema-sqlite.ts" : "./shared/schema.ts",
  dialect: databaseUrl.startsWith("file:") ? "sqlite" : "postgresql",
  dbCredentials: databaseUrl.startsWith("file:") 
    ? { url: databaseUrl }
    : { url: databaseUrl },
});
