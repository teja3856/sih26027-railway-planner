export type UserRole = 'ADMIN' | 'OPERATIONS_CONTROLLER' | 'MAINTENANCE_ENGINEER';
export type Department = 'ENGINEERING' | 'TRACTION_DISTRIBUTION' | 'SIGNAL_TELECOM' | 'OPERATIONS';

export interface User {
  id: string;
  username: string;
  name: string;
  email: string;
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
  location: string;
  criticality: Criticality;
  conditionScore: number;
  availability: number;
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
  taskId: string;
  assetId: string;
  department: Department;
  maintenanceType: MaintenanceType;
  description: string;
  defectId?: string;
  priorityScore: number;
  criticality: Criticality;
  urgency: Criticality;
  estimatedDurationMinutes: number;
  requiredResources: string[];
  preferredWindowStart: string;
  preferredWindowEnd: string;
  deadline: string;
  status: TaskStatus;
  createdAt: string;
}

export interface TrainSchedule {
  id: string;
  trainId: string;
  trainNumber: string;
  trainName: string;
  trainType: 'PASSENGER' | 'EXPRESS' | 'SUPERFAST' | 'FREIGHT';
  corridorId: string;
  origin: string;
  destination: string;
  arrivalTime: string;
  departureTime: string;
  dayOfWeek: string;
  isDaily: boolean;
}

export interface GoodsTrainForecast {
  id: string;
  corridorId: string;
  forecastDate: string;
  timeSlot: string;
  expectedTrainsCount: number;
  trafficLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}

export interface Corridor {
  id: string;
  code: string;
  name: string;
  startStation: string;
  endStation: string;
  lengthKm: number;
  totalTracks: number;
}

export interface CorridorAvailability {
  id: string;
  corridorId: string;
  timeSlot: string;
  status: 'AVAILABLE' | 'BUSY' | 'RESTRICTED';
  trafficDensity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}

export type BlockApprovalStatus = 'PROPOSED' | 'APPROVED' | 'MODIFIED' | 'REJECTED';

export interface MaintenanceBlock {
  id: string;
  planId: string;
  taskId: string;
  corridorId: string;
  scheduledStartTime: string;
  scheduledEndTime: string;
  durationMinutes: number;
  isJointBlock: boolean;
  coordinatingDepts: Department[];
  affectedPassengerTrains: number;
  affectedGoodsTrains: number;
  expectedDelayMinutes: number;
  assetCriticality: Criticality;
  urgency: Criticality;
  conflictsCount: number;
  optimizationScore: number;
  recommendationReason: string;
  approvalStatus: BlockApprovalStatus;
  modifiedBy?: string;
  modifiedAt?: string;
}

export interface BlockConflict {
  id: string;
  blockId: string;
  conflictType: string;
  severity: Criticality;
  description: string;
  affectedEntity: string;
}

export interface BlockPlan {
  id: string;
  planName: string;
  horizonType: 'WEEKLY' | 'MONTHLY';
  startDate: string;
  endDate: string;
  status: string;
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
  assetCriticalityWeight: number;
  maintenanceUrgencyWeight: number;
  trainImpactWeight: number;
  delayWeight: number;
  conflictWeight: number;
  assetDowntimeWeight: number;
  blockUtilizationWeight: number;
  isDefault: boolean;
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
