import { IDataRepository } from './IDataRepository';
import { InMemoryRepository, repository as inMemoryRepo } from './InMemoryRepository';
import { PrismaRepository } from './PrismaRepository';
import { prisma } from '../db/prismaClient';
import { env } from '../config/env';
import { store } from '../db/store';

export { IDataRepository };

// Lazy / resilient repository proxy
class ResilientRepository implements IDataRepository {
  private activeRepo: IDataRepository = inMemoryRepo;
  private isInitialized = false;
  private usePrisma = false;

  public async initialize(): Promise<{ mode: 'POSTGRES' | 'IN_MEMORY'; message: string }> {
    if (this.isInitialized) {
      return {
        mode: this.usePrisma ? 'POSTGRES' : 'IN_MEMORY',
        message: this.usePrisma ? 'Connected to PostgreSQL via Prisma' : 'Running in in-memory fallback mode',
      };
    }

    if (!env.DATABASE_URL) {
      this.activeRepo = inMemoryRepo;
      this.isInitialized = true;
      this.usePrisma = false;
      return {
        mode: 'IN_MEMORY',
        message: 'DATABASE_URL not set. Running in in-memory store mode.',
      };
    }

    try {
      // Test Prisma connection with a 3-second timeout
      await Promise.race([
        prisma.$connect(),
        new Promise((_, reject) => setTimeout(() => reject(new Error('PostgreSQL connection timeout (3s)')), 3000)),
      ]);

      // Verify connection by running a quick count
      const userCount = await prisma.user.count();
      const prismaRepo = new PrismaRepository();

      // If database is empty, automatically seed it
      if (userCount === 0) {
        console.log('📦 PostgreSQL database is empty. Seeding demo dataset...');
        await prismaRepo.seedData();
        console.log('✅ PostgreSQL database seeded successfully.');
      } else {
        // Ensure demo accounts exist and are up to date with correct bcrypt password hashes
        for (const u of store.users) {
          await prisma.user.upsert({
            where: { id: u.id },
            update: {
              username: u.username,
              name: u.name,
              email: u.email,
              passwordHash: u.passwordHash,
              role: u.role as any,
              department: u.department as any,
            },
            create: {
              id: u.id,
              username: u.username,
              name: u.name,
              email: u.email,
              passwordHash: u.passwordHash,
              role: u.role as any,
              department: u.department as any,
            },
          });
        }
      }

      this.activeRepo = prismaRepo;
      this.usePrisma = true;
      this.isInitialized = true;
      return {
        mode: 'POSTGRES',
        message: `Connected to PostgreSQL successfully (${userCount > 0 ? userCount : 'seeded'} users ready).`,
      };
    } catch (err: any) {
      console.warn(`⚠️ PostgreSQL unavailable (${err.message}). Falling back to in-memory store.`);
      this.activeRepo = inMemoryRepo;
      this.usePrisma = false;
      this.isInitialized = true;
      return {
        mode: 'IN_MEMORY',
        message: `PostgreSQL connection failed: ${err.message}. Using in-memory fallback.`,
      };
    }
  }

  public async checkHealth(): Promise<{ database: 'connected' | 'disconnected'; mode: 'POSTGRES' | 'IN_MEMORY' }> {
    try {
      if (this.usePrisma) {
        await prisma.$queryRaw`SELECT 1`;
        return { database: 'connected', mode: 'POSTGRES' };
      }
      return { database: 'disconnected', mode: 'IN_MEMORY' };
    } catch {
      return { database: 'disconnected', mode: 'IN_MEMORY' };
    }
  }

  getUsers(): Promise<any> { return this.activeRepo.getUsers(); }
  getUserById(id: string): Promise<any> { return this.activeRepo.getUserById(id); }
  getUserByUsername(username: string): Promise<any> { return this.activeRepo.getUserByUsername(username); }
  getAssets(filter?: any): Promise<any> { return this.activeRepo.getAssets(filter); }
  getAssetById(id: string): Promise<any> { return this.activeRepo.getAssetById(id); }
  getDefectsByAssetId(assetId: string): Promise<any> { return this.activeRepo.getDefectsByAssetId(assetId); }
  createDefect(defect: any): Promise<any> { return this.activeRepo.createDefect(defect); }
  getTasks(filter?: any): Promise<any> { return this.activeRepo.getTasks(filter); }
  getTaskById(id: string): Promise<any> { return this.activeRepo.getTaskById(id); }
  createTask(task: any): Promise<any> { return this.activeRepo.createTask(task); }
  updateTask(id: string, patch: any): Promise<any> { return this.activeRepo.updateTask(id, patch); }
  getHistoryByAssetId(assetId: string): Promise<any> { return this.activeRepo.getHistoryByAssetId(assetId); }
  getCorridors(): Promise<any> { return this.activeRepo.getCorridors(); }
  getCorridorById(id: string): Promise<any> { return this.activeRepo.getCorridorById(id); }
  getCorridorAvailabilities(corridorId?: string): Promise<any> { return this.activeRepo.getCorridorAvailabilities(corridorId); }
  getSchedules(filter?: any): Promise<any> { return this.activeRepo.getSchedules(filter); }
  getFreightForecasts(filter?: any): Promise<any> { return this.activeRepo.getFreightForecasts(filter); }
  getTrains(): Promise<any> { return this.activeRepo.getTrains(); }
  getPlans(): Promise<any> { return this.activeRepo.getPlans(); }
  getPlanById(id: string): Promise<any> { return this.activeRepo.getPlanById(id); }
  createPlan(plan: any): Promise<any> { return this.activeRepo.createPlan(plan); }
  updatePlanStatus(id: string, status: any): Promise<any> { return this.activeRepo.updatePlanStatus(id, status); }
  getBlocks(planId?: string): Promise<any> { return this.activeRepo.getBlocks(planId); }
  setBlocks(blocks: any[]): Promise<any> { return this.activeRepo.setBlocks(blocks); }
  updateBlock(blockId: string, patch: any): Promise<any> { return this.activeRepo.updateBlock(blockId, patch); }
  getConflicts(blockIds?: string[]): Promise<any> { return this.activeRepo.getConflicts(blockIds); }
  getWeights(): Promise<any> { return this.activeRepo.getWeights(); }
  updateWeights(weights: any): Promise<any> { return this.activeRepo.updateWeights(weights); }
  getAuditLogs(): Promise<any> { return this.activeRepo.getAuditLogs(); }
  addAuditLog(log: any): Promise<any> { return this.activeRepo.addAuditLog(log); }
  seedData(): Promise<any> { return this.activeRepo.seedData(); }
}

export const repository = new ResilientRepository();
