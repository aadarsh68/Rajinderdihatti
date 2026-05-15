import "server-only";
import { Pool, neonConfig } from "@neondatabase/serverless";
import { PrismaNeon } from "@prisma/adapter-neon";
import { PrismaClient } from "@prisma/client";
import ws from "ws";

// Standard configuration for Neon serverless in Node.js environments
if (typeof window === "undefined") {
  neonConfig.webSocketConstructor = ws;
}

// Get Neon connection string from the environment
const connectionString = process.env.DATABASE_URL;
const isNeon = connectionString?.includes("neon.tech");

let prismaClientOptions = {};

if (isNeon) {
  // Standard configuration for Neon serverless in Node.js environments
  neonConfig.webSocketConstructor = ws;
  const pool = new Pool({ connectionString });
  const adapter = new PrismaNeon(pool);
  prismaClientOptions.adapter = adapter;
}

// Serverless and Vercel-compatible Prisma singleton pattern
const globalForPrisma = globalThis;

/**
 * Export a singleton instance of PrismaClient.
 * - Uses Neon adapter for Neon DB.
 * - Uses standard direct connection for local/other DBs.
 */
export const prisma =
  globalForPrisma.prisma ?? new PrismaClient(prismaClientOptions);

// In development, store the instance globally to survive hot reloads
if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

/**
 * Usage:
 * import { prisma } from './db.service';
 * const users = await prisma.user.findMany();
 *
 * Ensure your .env contains:
 * DATABASE_URL="your-neon-connection-string"
 *
 * Docs:
 * https://www.prisma.io/docs/orm/prisma-client/deployment/serverless#neon-serverless-postgresql
 */
