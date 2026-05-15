
import { PrismaNeon } from "@prisma/adapter-neon";
import { PrismaClient } from "@prisma/client";

// Get Neon connection string from the environment
const connectionString = process.env.DATABASE_URL;
const adapter = new PrismaNeon({ connectionString });

// Serverless and Vercel-compatible Prisma singleton pattern
const globalForPrisma = globalThis

/**
 * Export a singleton instance of PrismaClient configured with the Neon adapter.
 * - Prevents multiple instances in development/hot reload/serverless environments.
 * - Compatible with Vercel, Neon, and other serverless Node.js runtimes.
 * - Uses @prisma/adapter-neon for HTTP-based connection to Neon.
 */
export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  adapter
});

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