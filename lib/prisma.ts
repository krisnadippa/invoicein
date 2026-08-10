import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

/**
 * Executes a database operation with automatic retry on Neon Serverless cold-starts.
 */
export async function withDbRetry<T>(operation: () => Promise<T>, maxRetries = 2): Promise<T> {
  let lastError: unknown;
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (err: unknown) {
      lastError = err;
      const errMsg = err instanceof Error ? err.message : String(err);
      const isConnectionIssue =
        errMsg.includes("Can't reach database server") ||
        errMsg.includes("Connection terminated") ||
        errMsg.includes("connection closed") ||
        errMsg.includes("timeout");

      if (isConnectionIssue && attempt < maxRetries) {
        console.warn(`[NeonDB] Retrying database query (attempt ${attempt + 1}/${maxRetries}) after cold start wakeup...`);
        await new Promise((resolve) => setTimeout(resolve, 1500));
        continue;
      }
      throw err;
    }
  }
  throw lastError;
}

export default prisma;
