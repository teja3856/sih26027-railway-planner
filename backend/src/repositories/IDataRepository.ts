import {
  User, Asset, AssetDefect, MaintenanceTask, MaintenanceHistory,
  Train, TrainSchedule, GoodsTrainForecast, Corridor, CorridorAvailability,
  MaintenanceBlock, BlockConflict, BlockPlan, OptimizationWeight,
  Notification, AuditLog
} from '../types';

export interface IDataRepository {
  // Users
  getUsers(): Promise<User[]>;
  getUserById(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;

  // Assets
  getAssets(filter?: { department?: string; corridorId?: string; criticality?: string; hasDefect?: boolean }): Promise<Asset[]>;
  getAssetById(id: string): Promise<Asset | undefined>;

  // Defects
  getDefectsByAssetId(assetId: string): Promise<AssetDefect[]>;
  createDefect(defect: AssetDefect): Promise<AssetDefect>;

  // Tasks
  getTasks(filter?: { department?: string; status?: string; criticality?: string }): Promise<MaintenanceTask[]>;
  getTaskById(id: string): Promise<MaintenanceTask | undefined>;
  createTask(task: MaintenanceTask): Promise<MaintenanceTask>;
  updateTask(id: string, patch: Partial<MaintenanceTask>): Promise<MaintenanceTask | undefined>;

  // History & Corridor
  getHistoryByAssetId(assetId: string): Promise<MaintenanceHistory[]>;
  getCorridors(): Promise<Corridor[]>;
  getCorridorById(id: string): Promise<Corridor | undefined>;
  getCorridorAvailabilities(corridorId?: string): Promise<CorridorAvailability[]>;

  // Traffic
  getSchedules(filter?: { corridorId?: string; trainType?: string }): Promise<TrainSchedule[]>;
  getFreightForecasts(filter?: { corridorId?: string; forecastDate?: string }): Promise<GoodsTrainForecast[]>;
  getTrains(): Promise<Train[]>;

  // Plans & Blocks
  getPlans(): Promise<BlockPlan[]>;
  getPlanById(id: string): Promise<BlockPlan | undefined>;
  createPlan(plan: BlockPlan): Promise<BlockPlan>;
  updatePlanStatus(id: string, status: BlockPlan['status']): Promise<BlockPlan | undefined>;
  
  getBlocks(planId?: string): Promise<MaintenanceBlock[]>;
  setBlocks(blocks: MaintenanceBlock[]): Promise<void>;
  updateBlock(blockId: string, patch: Partial<MaintenanceBlock>): Promise<MaintenanceBlock | undefined>;

  getConflicts(blockIds?: string[]): Promise<BlockConflict[]>;

  // Weights
  getWeights(): Promise<OptimizationWeight[]>;
  updateWeights(weights: Partial<OptimizationWeight>): Promise<OptimizationWeight>;

  // Audit Logs & Reset
  getAuditLogs(): Promise<AuditLog[]>;
  addAuditLog(log: AuditLog): Promise<AuditLog>;

  seedData(): Promise<void>;
}
