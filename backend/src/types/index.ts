export type UserRole = 'ADMIN' | 'OPERATIONS_CONTROLLER' | 'MAINTENANCE_ENGINEER';
export type Department = 'ENGINEERING' | 'TRACTION_DISTRIBUTION' | 'SIGNAL_TELECOM' | 'OPERATIONS';

export interface User {
  id: string;
  username: string;
  name: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  department: Department;
}

export type AssetType = 'TRACK' | 'OHE_LINE' | 'SIGNAL' | 'TELECOM' | 'SWITCH' | 'CROSSING' | 'BRIDGE';
export type Criticality = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface Asset {
  id: string;
  assetCode: string;
  name: string;
  assetType: AssetType;
  department: Department;
  corridorId: string;
  location: string; // e.g. "Km 142/12 - 145/00"
  criticality: Criticality;
  conditionScore: number; // 0-100 (100 = prime condition, <40 = defect warning)
  availability: number; // percentage e.g. 96.5
  lastMaintenanceDate: string;
  nextDueDate: string;
  hasDefect: boolean;
}

export type DefectSeverity = 'MINOR' | 'MAJOR' | 'SEVERE' | 'CRITICAL';

export interface AssetDefect {
  id: string;
  assetId: string;
  defectType: string;
  description: string;
  severity: DefectSeverity;
  speedRestrictionKmh?: number;
  reportedAt: string;
  reportedBy: string;
  isResolved: boolean;
}

export type MaintenanceType = 'PREVENTIVE' | 'CORRECTIVE' | 'DEFECT_RECTIFICATION' | 'OVERHAUL';
export type TaskStatus = 'PENDING' | 'PRIORITIZED' | 'SCHEDULED' | 'APPROVED' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED';

export interface MaintenanceTask {
  id: string;
  taskId: string; // MT-001
  assetId: string;
  department: Department;
  maintenanceType: MaintenanceType;
  description: string;
  defectId?: string;
  priorityScore: number; // 0-100
  criticality: Criticality;
  urgency: Criticality;
  estimatedDurationMinutes: number;
  requiredResources: string[]; // e.g. ["Power-Block", "Tower-Wagon", "Tamper-Machine", "Gang-6"]
  preferredWindowStart: string; // HH:mm
  preferredWindowEnd: string; // HH:mm
  deadline: string; // YYYY-MM-DD
  status: TaskStatus;
  createdAt: string;
}

export interface MaintenanceHistory {
  id: string;
  assetId: string;
  taskId: string;
  completedAt: string;
  downtimeMinutes: number;
  engineerInCharge: string;
  remarks: string;
}

export type TrainType = 'PASSENGER' | 'EXPRESS' | 'SUPERFAST' | 'FREIGHT';

export interface Train {
  id: string;
  trainNumber: string;
  trainName: string;
  trainType: TrainType;
  priorityRank: number; // 1 (Superfast) to 4 (Freight)
}

export interface TrainSchedule {
  id: string;
  trainId: string;
  trainNumber: string;
  trainName: string;
  trainType: TrainType;
  corridorId: string;
  origin: string;
  destination: string;
  arrivalTime: string; // HH:mm
  departureTime: string; // HH:mm
  dayOfWeek: string;
  isDaily: boolean;
}

export type TrafficLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface GoodsTrainForecast {
  id: string;
  corridorId: string;
  forecastDate: string; // YYYY-MM-DD
  timeSlot: string; // e.g. "00:00-04:00"
  expectedTrainsCount: number;
  trafficLevel: TrafficLevel;
}

export interface Corridor {
  id: string;
  code: string; // C001
  name: string; // NDLS-CNB Main Line
  startStation: string;
  endStation: string;
  lengthKm: number;
  totalTracks: number;
}

export type AvailabilityStatus = 'AVAILABLE' | 'BUSY' | 'RESTRICTED';

export interface CorridorAvailability {
  id: string;
  corridorId: string;
  timeSlot: string; // e.g. "01:00-04:00"
  status: AvailabilityStatus;
  trafficDensity: TrafficLevel;
}

export type BlockApprovalStatus = 'PROPOSED' | 'APPROVED' | 'MODIFIED' | 'REJECTED';

export interface MaintenanceBlock {
  id: string;
  planId: string;
  taskId: string;
  corridorId: string;
  scheduledStartTime: string; // YYYY-MM-DD HH:mm
  scheduledEndTime: string;   // YYYY-MM-DD HH:mm
  durationMinutes: number;
  isJointBlock: boolean;
  coordinatingDepts: Department[];
  affectedPassengerTrains: number;
  affectedGoodsTrains: number;
  expectedDelayMinutes: number;
  assetCriticality: Criticality;
  urgency: Criticality;
  conflictsCount: number;
  optimizationScore: number; // 0-100
  recommendationReason: string;
  approvalStatus: BlockApprovalStatus;
  modifiedBy?: string;
  modifiedAt?: string;
}

export type ConflictType = 
  | 'TRAIN_VS_BLOCK' 
  | 'GOODS_VS_BLOCK' 
  | 'MAINT_VS_MAINT' 
  | 'RESOURCE_CONFLICT' 
  | 'CORRIDOR_CAPACITY' 
  | 'ASSET_LOCK' 
  | 'TIME_WINDOW' 
  | 'EXISTING_BLOCK';

export interface BlockConflict {
  id: string;
  blockId: string;
  conflictType: ConflictType;
  severity: Criticality;
  description: string;
  affectedEntity: string;
}

export type PlanningHorizon = 'WEEKLY' | 'MONTHLY';
export type PlanStatus = 'DRAFT' | 'OPTIMIZED' | 'APPROVED' | 'REJECTED';

export interface BlockPlan {
  id: string;
  planName: string;
  horizonType: PlanningHorizon;
  startDate: string;
  endDate: string;
  status: PlanStatus;
  totalOptimizationScore: number;
  metrics: {
    totalBlocks: number;
    jointBlocksCount: number;
    affectedTrainsCount: number;
    totalDelayMinutes: number;
    assetDowntimeHours: number;
    conflictCount: number;
    blockUtilizationPercent: number;
    assetAvailabilityPercent: number;
  };
  beforeMetrics?: {
    totalBlocks: number;
    affectedTrainsCount: number;
    totalDelayMinutes: number;
    assetDowntimeHours: number;
    conflictCount: number;
    blockUtilizationPercent: number;
    assetAvailabilityPercent: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface OptimizationWeight {
  id: string;
  assetCriticalityWeight: number; // e.g. 0.25
  maintenanceUrgencyWeight: number; // e.g. 0.25
  trainImpactWeight: number; // e.g. 0.15
  delayWeight: number; // e.g. 0.15
  conflictWeight: number; // e.g. 0.10
  assetDowntimeWeight: number; // e.g. 0.05
  blockUtilizationWeight: number; // e.g. 0.05
  isDefault: boolean;
}

export interface Notification {
  id: string;
  userId?: string;
  title: string;
  message: string;
  type: 'DEFECT' | 'CONFLICT' | 'APPROVAL' | 'SYSTEM';
  isRead: boolean;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  userId: string;
  username: string;
  userRole: UserRole;
  action: string;
  entityType: string;
  entityId: string;
  details: string;
  timestamp: string;
}
