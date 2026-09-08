import { IDataRepository } from './IDataRepository';
import { store } from '../db/store';
import {
  User, Asset, AssetDefect, MaintenanceTask, MaintenanceHistory,
  Train, TrainSchedule, GoodsTrainForecast, Corridor, CorridorAvailability,
  MaintenanceBlock, BlockConflict, BlockPlan, OptimizationWeight,
  Notification, AuditLog
} from '../types';

export class InMemoryRepository implements IDataRepository {
  async getUsers(): Promise<User[]> {
    return [...store.users];
  }

  async getUserById(id: string): Promise<User | undefined> {
    return store.users.find(u => u.id === id);
  }

  async getUserByUsername(identifier: string): Promise<User | undefined> {
    const term = identifier.toLowerCase().trim();
    return store.users.find(u =>
      u.username.toLowerCase() === term ||
      u.email.toLowerCase() === term ||
      (term === 'admin' && u.username === 'abcadmin') ||
      (term === 'controller' && u.username === 'abccontrol') ||
      (term === 'engineer_eng' && u.username === 'abceng')
    );
  }

  async getAssets(filter?: { department?: string; corridorId?: string; criticality?: string; hasDefect?: boolean }): Promise<Asset[]> {
    let results = [...store.assets];
    if (filter?.department) results = results.filter(a => a.department === filter.department);
    if (filter?.corridorId) results = results.filter(a => a.corridorId === filter.corridorId);
    if (filter?.criticality) results = results.filter(a => a.criticality === filter.criticality);
    if (filter?.hasDefect !== undefined) results = results.filter(a => a.hasDefect === filter.hasDefect);
    return results;
  }

  async getAssetById(id: string): Promise<Asset | undefined> {
    return store.assets.find(a => a.id === id || a.assetCode === id);
  }

  async getDefectsByAssetId(assetId: string): Promise<AssetDefect[]> {
    return store.defects.filter(d => d.assetId === assetId);
  }

  async createDefect(defect: AssetDefect): Promise<AssetDefect> {
    store.defects.push(defect);
    const asset = store.assets.find(a => a.id === defect.assetId);
    if (asset) {
      asset.hasDefect = true;
      asset.conditionScore = Math.max(20, asset.conditionScore - 25);
    }
    return defect;
  }

  async getTasks(filter?: { department?: string; status?: string; criticality?: string }): Promise<MaintenanceTask[]> {
    let results = [...store.tasks];
    if (filter?.department) results = results.filter(t => t.department === filter.department);
    if (filter?.status) results = results.filter(t => t.status === filter.status);
    if (filter?.criticality) results = results.filter(t => t.criticality === filter.criticality);
    results.sort((a, b) => b.priorityScore - a.priorityScore);
    return results;
  }

  async getTaskById(id: string): Promise<MaintenanceTask | undefined> {
    return store.tasks.find(t => t.id === id || t.taskId === id);
  }

  async createTask(task: MaintenanceTask): Promise<MaintenanceTask> {
    store.tasks.unshift(task);
    return task;
  }

  async updateTask(id: string, patch: Partial<MaintenanceTask>): Promise<MaintenanceTask | undefined> {
    const task = store.tasks.find(t => t.id === id || t.taskId === id);
    if (!task) return undefined;
    Object.assign(task, patch);
    return task;
  }

  async getHistoryByAssetId(assetId: string): Promise<MaintenanceHistory[]> {
    return store.history.filter(h => h.assetId === assetId);
  }

  async getCorridors(): Promise<Corridor[]> {
    return [...store.corridors];
  }

  async getCorridorById(id: string): Promise<Corridor | undefined> {
    return store.corridors.find(c => c.id === id);
  }

  async getCorridorAvailabilities(corridorId?: string): Promise<CorridorAvailability[]> {
    let results = [...store.corridorAvailabilities];
    if (corridorId) results = results.filter(ca => ca.corridorId === corridorId);
    return results;
  }

  async getSchedules(filter?: { corridorId?: string; trainType?: string }): Promise<TrainSchedule[]> {
    let results = [...store.schedules];
    if (filter?.corridorId) results = results.filter(s => s.corridorId === filter.corridorId);
    if (filter?.trainType) results = results.filter(s => s.trainType === filter.trainType);
    return results;
  }

  async getFreightForecasts(filter?: { corridorId?: string; forecastDate?: string }): Promise<GoodsTrainForecast[]> {
    let results = [...store.freightForecasts];
    if (filter?.corridorId) results = results.filter(f => f.corridorId === filter.corridorId);
    if (filter?.forecastDate) results = results.filter(f => f.forecastDate === filter.forecastDate);
    return results;
  }

  async getTrains(): Promise<Train[]> {
    return [...store.trains];
  }

  async getPlans(): Promise<BlockPlan[]> {
    return [...store.plans];
  }

  async getPlanById(id: string): Promise<BlockPlan | undefined> {
    return store.plans.find(p => p.id === id);
  }

  async createPlan(plan: BlockPlan): Promise<BlockPlan> {
    store.plans.unshift(plan);
    return plan;
  }

  async updatePlanStatus(id: string, status: BlockPlan['status']): Promise<BlockPlan | undefined> {
    const plan = store.plans.find(p => p.id === id);
    if (!plan) return undefined;
    plan.status = status;
    store.blocks.filter(b => b.planId === plan.id).forEach(b => b.approvalStatus = status === 'APPROVED' ? 'APPROVED' : 'REJECTED');
    return plan;
  }

  async getBlocks(planId?: string): Promise<MaintenanceBlock[]> {
    let results = [...store.blocks];
    if (planId) results = results.filter(b => b.planId === planId);
    return results;
  }

  async setBlocks(blocks: MaintenanceBlock[]): Promise<void> {
    store.blocks = [...blocks, ...store.blocks];
  }

  async updateBlock(blockId: string, patch: Partial<MaintenanceBlock>): Promise<MaintenanceBlock | undefined> {
    const block = store.blocks.find(b => b.id === blockId);
    if (!block) return undefined;
    Object.assign(block, patch);
    return block;
  }

  async getConflicts(blockIds?: string[]): Promise<BlockConflict[]> {
    let results = [...store.conflicts];
    if (blockIds && blockIds.length > 0) results = results.filter(c => blockIds.includes(c.blockId));
    return results;
  }

  async getWeights(): Promise<OptimizationWeight[]> {
    return [...store.weights];
  }

  async updateWeights(weightsPatch: Partial<OptimizationWeight>): Promise<OptimizationWeight> {
    if (store.weights.length === 0) {
      const defaultWeight: OptimizationWeight = {
        id: 'w-01',
        assetCriticalityWeight: 0.25,
        maintenanceUrgencyWeight: 0.25,
        trainImpactWeight: 0.15,
        delayWeight: 0.15,
        conflictWeight: 0.10,
        assetDowntimeWeight: 0.05,
        blockUtilizationWeight: 0.05,
        isDefault: true,
      };
      store.weights.push(defaultWeight);
    }
    Object.assign(store.weights[0], weightsPatch);
    return store.weights[0];
  }

  async getAuditLogs(): Promise<AuditLog[]> {
    return [...store.auditLogs];
  }

  async addAuditLog(log: AuditLog): Promise<AuditLog> {
    store.auditLogs.unshift(log);
    return log;
  }

  async seedData(): Promise<void> {
    store.seedData();
  }
}

export const repository: IDataRepository = new InMemoryRepository();
