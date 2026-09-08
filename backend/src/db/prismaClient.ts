import { env } from '../config/env';

// Dynamically import or reference PrismaClient safely
let PrismaClientClass: any;
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const clientPkg = require('@prisma/client');
  PrismaClientClass = clientPkg.PrismaClient || class EmptyPrismaClient {};
} catch {
  PrismaClientClass = class EmptyPrismaClient {};
}

declare global {
  // eslint-disable-next-line no-var
  var prismaGlobal: any;
}

export const prisma: any =
  global.prismaGlobal ||
  new PrismaClientClass({
    log: env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
  });

if (env.NODE_ENV !== 'production') {
  global.prismaGlobal = prisma;
}

export default prisma;
