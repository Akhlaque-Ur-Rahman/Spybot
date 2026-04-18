import { PrismaClient, type Prisma } from '@prisma/client';

declare global {
  var prismaGlobal: PrismaClient | undefined;
}

function prismaLog(): Prisma.LogLevel[] {
  if (process.env.NODE_ENV === 'production') return ['error'];
  if (process.env.PRISMA_LOG_QUERIES === '1') return ['query', 'warn', 'error'];
  return ['warn', 'error'];
}

export const prisma =
  globalThis.prismaGlobal ??
  new PrismaClient({
    log: prismaLog(),
  });

if (process.env.NODE_ENV !== 'production') {
  globalThis.prismaGlobal = prisma;
}
