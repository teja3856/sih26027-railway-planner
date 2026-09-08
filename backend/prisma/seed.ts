import { prisma } from '../src/db/prismaClient';
import { PrismaRepository } from '../src/repositories/PrismaRepository';

async function main() {
  console.log('🌱 Starting Prisma database seeding for SIH26027...');
  const repo = new PrismaRepository();
  await repo.seedData();
  console.log('✅ All 16 collections seeded successfully into PostgreSQL.');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
