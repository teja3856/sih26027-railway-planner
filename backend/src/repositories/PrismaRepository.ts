import { IDataRepository } from './IDataRepository';
import { prisma } from '../db/prismaClient';
import { store } from '../db/store';
import {
  User, Asset, AssetDefect, MaintenanceTask, MaintenanceHistory,
  Train, TrainSchedule, GoodsTrainForecast, Corridor, CorridorAvailability,
  MaintenanceBlock, BlockConflict, BlockPlan, OptimizationWeight,
  AuditLog
} from '../types';

export class PrismaRepository implements IDataRepository {
  // Users
  async getUsers(): Promise<User[]> {
    const users = await prisma.user.findMany();
    return users.map((u: any) => ({
      id: u.id,
      username: u.username,
      name: u.name,
      email: u.email,
      passwordHash: u.passwordHash,
      role: u.role as any,
      department: u.department as any,
    }));
  }

  async getUserById(id: string): Promise<User | undefined> {
    const u = await prisma.user.findUnique({ where: { id } });
    if (!u) return undefined;
    return {
      id: u.id,
      username: u.username,
      name: u.name,
      email: u.email,
      passwordHash: u.passwordHash,
      role: u.role as any,
      department: u.department as any,
    };
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const u = await prisma.user.findUnique({ where: { username } });
    if (!u) return undefined;
    return {
      id: u.id,
      username: u.username,
      name: u.name,
      email: u.email,
      passwordHash: u.passwordHash,
      role: u.role as any,
      department: u.department as any,
    };
  }

  // Assets
  async getAssets(filter?: { department?: string; corridorId?: string; criticality?: string; hasDefect?: boolean }): Promise<Asset[]> {
    const where: any = {};
    if (filter?.department) where.department = filter.department;
    if (filter?.corridorId) where.corridorId = filter.corridorId;
    if (filter?.criticality) where.criticality = filter.criticality;
    if (filter?.hasDefect !== undefined) where.hasDefect = filter.hasDefect;

    const assets = await prisma.asset.findMany({ where });
    return assets.map((a: any) => ({
      id: a.id,
      assetCode: a.assetCode,
      name: a.name,
      assetType: a.assetType as any,
      department: a.department as any,
      corridorId: a.corridorId,
      location: a.location,
      criticality: a.criticality as any,
      conditionScore: a.conditionScore,
      availability: a.availability,
      lastMaintenanceDate: a.lastMaintenanceDate,
      nextDueDate: a.nextDueDate,
      hasDefect: a.hasDefect,
    }));
  }

  async getAssetById(id: string): Promise<Asset | undefined> {
    const a = await prisma.asset.findFirst({
      where: {
        OR: [{ id }, { assetCode: id }],
      },
    });
    if (!a) return undefined;
    return {
      id: a.id,
      assetCode: a.assetCode,
      name: a.name,
      assetType: a.assetType as any,
      department: a.department as any,
      corridorId: a.corridorId,
      location: a.location,
      criticality: a.criticality as any,
      conditionScore: a.conditionScore,
      availability: a.availability,
      lastMaintenanceDate: a.lastMaintenanceDate,
      nextDueDate: a.nextDueDate,
      hasDefect: a.hasDefect,
    };
  }

  // Defects
  async getDefectsByAssetId(assetId: string): Promise<AssetDefect[]> {
    const defects = await prisma.assetDefect.findMany({ where: { assetId } });
    return defects.map((d: any) => ({
      id: d.id,
      assetId: d.assetId,
      defectType: d.defectType,
      description: d.description,
      severity: d.severity as any,
      speedRestrictionKmh: d.speedRestrictionKmh ?? undefined,
      reportedAt: d.reportedAt,
      reportedBy: d.reportedBy,
      isResolved: d.isResolved,
    }));
  }

  async createDefect(defect: AssetDefect): Promise<AssetDefect> {
    const d = await prisma.assetDefect.create({
      data: {
        id: defect.id,
        assetId: defect.assetId,
        defectType: defect.defectType,
        description: defect.description,
        severity: defect.severity as any,
        speedRestrictionKmh: defect.speedRestrictionKmh ?? null,
        reportedAt: defect.reportedAt,
        reportedBy: defect.reportedBy,
        isResolved: defect.isResolved ?? false,
      },
    });

    // Also update asset hasDefect flag
    await prisma.asset.update({
      where: { id: defect.assetId },
      data: { hasDefect: true },
    }).catch(() => {});

    return {
      id: d.id,
      assetId: d.assetId,
      defectType: d.defectType,
      description: d.description,
      severity: d.severity as any,
      speedRestrictionKmh: d.speedRestrictionKmh ?? undefined,
      reportedAt: d.reportedAt,
      reportedBy: d.reportedBy,
      isResolved: d.isResolved,
    };
  }

  // Tasks
  async getTasks(filter?: { department?: string; status?: string; criticality?: string }): Promise<MaintenanceTask[]> {
    const where: any = {};
    if (filter?.department) where.department = filter.department;
    if (filter?.status) where.status = filter.status;
    if (filter?.criticality) where.criticality = filter.criticality;

    const tasks = await prisma.maintenanceTask.findMany({
      where,
      orderBy: { priorityScore: 'desc' },
    });

    return tasks.map((t: any) => ({
      id: t.id,
      taskId: t.taskId,
      assetId: t.assetId,
      department: t.department as any,
      maintenanceType: t.maintenanceType as any,
      description: t.description,
      defectId: t.defectId ?? undefined,
      priorityScore: t.priorityScore,
      criticality: t.criticality as any,
      urgency: t.urgency as any,
      estimatedDurationMinutes: t.estimatedDurationMinutes,
      requiredResources: t.requiredResources,
      preferredWindowStart: t.preferredWindowStart,
      preferredWindowEnd: t.preferredWindowEnd,
      deadline: t.deadline,
      status: t.status as any,
      createdAt: t.createdAt,
    }));
  }

  async getTaskById(id: string): Promise<MaintenanceTask | undefined> {
    const t = await prisma.maintenanceTask.findFirst({
      where: {
        OR: [{ id }, { taskId: id }],
      },
    });
    if (!t) return undefined;
    return {
      id: t.id,
      taskId: t.taskId,
      assetId: t.assetId,
      department: t.department as any,
      maintenanceType: t.maintenanceType as any,
      description: t.description,
      defectId: t.defectId ?? undefined,
      priorityScore: t.priorityScore,
      criticality: t.criticality as any,
      urgency: t.urgency as any,
      estimatedDurationMinutes: t.estimatedDurationMinutes,
      requiredResources: t.requiredResources,
      preferredWindowStart: t.preferredWindowStart,
      preferredWindowEnd: t.preferredWindowEnd,
      deadline: t.deadline,
      status: t.status as any,
      createdAt: t.createdAt,
    };
  }

  async createTask(task: MaintenanceTask): Promise<MaintenanceTask> {
    const t = await prisma.maintenanceTask.create({
      data: {
        id: task.id,
        taskId: task.taskId,
        assetId: task.assetId,
        department: task.department as any,
        maintenanceType: task.maintenanceType as any,
        description: task.description,
        defectId: task.defectId ?? null,
        priorityScore: task.priorityScore,
        criticality: task.criticality as any,
        urgency: task.urgency as any,
        estimatedDurationMinutes: task.estimatedDurationMinutes,
        requiredResources: task.requiredResources,
        preferredWindowStart: task.preferredWindowStart,
        preferredWindowEnd: task.preferredWindowEnd,
        deadline: task.deadline,
        status: (task.status || 'PENDING') as any,
        createdAt: task.createdAt,
      },
    });

    return {
      id: t.id,
      taskId: t.taskId,
      assetId: t.assetId,
      department: t.department as any,
      maintenanceType: t.maintenanceType as any,
      description: t.description,
      defectId: t.defectId ?? undefined,
      priorityScore: t.priorityScore,
      criticality: t.criticality as any,
      urgency: t.urgency as any,
      estimatedDurationMinutes: t.estimatedDurationMinutes,
      requiredResources: t.requiredResources,
      preferredWindowStart: t.preferredWindowStart,
      preferredWindowEnd: t.preferredWindowEnd,
      deadline: t.deadline,
      status: t.status as any,
      createdAt: t.createdAt,
    };
  }

  async updateTask(id: string, patch: Partial<MaintenanceTask>): Promise<MaintenanceTask | undefined> {
    const existing = await this.getTaskById(id);
    if (!existing) return undefined;

    const data: any = {};
    if (patch.status) data.status = patch.status;
    if (patch.priorityScore !== undefined) data.priorityScore = patch.priorityScore;
    if (patch.urgency) data.urgency = patch.urgency;
    if (patch.description) data.description = patch.description;
    if (patch.estimatedDurationMinutes !== undefined) data.estimatedDurationMinutes = patch.estimatedDurationMinutes;
    if (patch.requiredResources) data.requiredResources = patch.requiredResources;
    if (patch.preferredWindowStart) data.preferredWindowStart = patch.preferredWindowStart;
    if (patch.preferredWindowEnd) data.preferredWindowEnd = patch.preferredWindowEnd;
    if (patch.deadline) data.deadline = patch.deadline;

    const updated = await prisma.maintenanceTask.update({
      where: { id: existing.id },
      data,
    });

    return {
      id: updated.id,
      taskId: updated.taskId,
      assetId: updated.assetId,
      department: updated.department as any,
      maintenanceType: updated.maintenanceType as any,
      description: updated.description,
      defectId: updated.defectId ?? undefined,
      priorityScore: updated.priorityScore,
      criticality: updated.criticality as any,
      urgency: updated.urgency as any,
      estimatedDurationMinutes: updated.estimatedDurationMinutes,
      requiredResources: updated.requiredResources,
      preferredWindowStart: updated.preferredWindowStart,
      preferredWindowEnd: updated.preferredWindowEnd,
      deadline: updated.deadline,
      status: updated.status as any,
      createdAt: updated.createdAt,
    };
  }

  // History & Corridor
  async getHistoryByAssetId(assetId: string): Promise<MaintenanceHistory[]> {
    const list = await prisma.maintenanceHistory.findMany({ where: { assetId } });
    return list.map((h: any) => ({
      id: h.id,
      assetId: h.assetId,
      taskId: h.taskId,
      completedAt: h.completedAt,
      downtimeMinutes: h.downtimeMinutes,
      engineerInCharge: h.engineerInCharge,
      remarks: h.remarks,
    }));
  }

  async getCorridors(): Promise<Corridor[]> {
    const list = await prisma.corridor.findMany();
    return list.map((c: any) => ({
      id: c.id,
      code: c.code,
      name: c.name,
      startStation: c.startStation,
      endStation: c.endStation,
      lengthKm: c.lengthKm,
      totalTracks: c.totalTracks,
    }));
  }

  async getCorridorById(id: string): Promise<Corridor | undefined> {
    const c = await prisma.corridor.findUnique({ where: { id } });
    if (!c) return undefined;
    return {
      id: c.id,
      code: c.code,
      name: c.name,
      startStation: c.startStation,
      endStation: c.endStation,
      lengthKm: c.lengthKm,
      totalTracks: c.totalTracks,
    };
  }

  async getCorridorAvailabilities(corridorId?: string): Promise<CorridorAvailability[]> {
    const list = await prisma.corridorAvailability.findMany({
      where: corridorId ? { corridorId } : undefined,
    });
    return list.map((a: any) => ({
      id: a.id,
      corridorId: a.corridorId,
      timeSlot: a.timeSlot,
      status: a.status as any,
      trafficDensity: a.trafficDensity as any,
    }));
  }

  // Traffic
  async getSchedules(filter?: { corridorId?: string; trainType?: string }): Promise<TrainSchedule[]> {
    const where: any = {};
    if (filter?.corridorId) where.corridorId = filter.corridorId;
    if (filter?.trainType) where.trainType = filter.trainType;

    const list = await prisma.trainSchedule.findMany({ where });
    return list.map((s: any) => ({
      id: s.id,
      trainId: s.trainId,
      trainNumber: s.trainNumber,
      trainName: s.trainName,
      trainType: s.trainType as any,
      corridorId: s.corridorId,
      origin: s.origin,
      destination: s.destination,
      arrivalTime: s.arrivalTime,
      departureTime: s.departureTime,
      dayOfWeek: s.dayOfWeek,
      isDaily: s.isDaily,
    }));
  }

  async getFreightForecasts(filter?: { corridorId?: string; forecastDate?: string }): Promise<GoodsTrainForecast[]> {
    const where: any = {};
    if (filter?.corridorId) where.corridorId = filter.corridorId;
    if (filter?.forecastDate) where.forecastDate = filter.forecastDate;

    const list = await prisma.goodsTrainForecast.findMany({ where });
    return list.map((f: any) => ({
      id: f.id,
      corridorId: f.corridorId,
      forecastDate: f.forecastDate,
      timeSlot: f.timeSlot,
      expectedTrainsCount: f.expectedTrainsCount,
      trafficLevel: f.trafficLevel as any,
    }));
  }

  async getTrains(): Promise<Train[]> {
    const list = await prisma.train.findMany();
    return list.map((t: any) => ({
      id: t.id,
      trainNumber: t.trainNumber,
      trainName: t.trainName,
      trainType: t.trainType as any,
      priorityRank: t.priorityRank,
    }));
  }

  // Plans & Blocks
  async getPlans(): Promise<BlockPlan[]> {
    const list = await prisma.blockPlan.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return list.map((p: any) => ({
      id: p.id,
      planName: p.planName,
      horizonType: p.horizonType as any,
      startDate: p.startDate,
      endDate: p.endDate,
      status: p.status as any,
      totalOptimizationScore: p.totalOptimizationScore,
      metrics: p.metrics as any,
      beforeMetrics: p.beforeMetrics as any,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
    }));
  }

  async getPlanById(id: string): Promise<BlockPlan | undefined> {
    const p = await prisma.blockPlan.findUnique({ where: { id } });
    if (!p) return undefined;
    return {
      id: p.id,
      planName: p.planName,
      horizonType: p.horizonType as any,
      startDate: p.startDate,
      endDate: p.endDate,
      status: p.status as any,
      totalOptimizationScore: p.totalOptimizationScore,
      metrics: p.metrics as any,
      beforeMetrics: p.beforeMetrics as any,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
    };
  }

  async createPlan(plan: BlockPlan): Promise<BlockPlan> {
    const p = await prisma.blockPlan.create({
      data: {
        id: plan.id,
        planName: plan.planName,
        horizonType: plan.horizonType as any,
        startDate: plan.startDate,
        endDate: plan.endDate,
        status: plan.status as any,
        totalOptimizationScore: plan.totalOptimizationScore,
        metrics: plan.metrics as any,
        beforeMetrics: plan.beforeMetrics as any ?? null,
        createdAt: plan.createdAt,
        updatedAt: plan.updatedAt,
      },
    });

    return {
      id: p.id,
      planName: p.planName,
      horizonType: p.horizonType as any,
      startDate: p.startDate,
      endDate: p.endDate,
      status: p.status as any,
      totalOptimizationScore: p.totalOptimizationScore,
      metrics: p.metrics as any,
      beforeMetrics: p.beforeMetrics as any,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
    };
  }

  async updatePlanStatus(id: string, status: BlockPlan['status']): Promise<BlockPlan | undefined> {
    const targetPlan = await prisma.blockPlan.findUnique({ where: { id } });
    if (!targetPlan) return undefined;

    const blockStatusMap: Record<string, string> = {
      APPROVED: 'APPROVED',
      REJECTED: 'REJECTED',
    };

    const targetBlockStatus = blockStatusMap[status];

    // Transaction-safe atomic update
    const [updatedPlan] = await prisma.$transaction([
      prisma.blockPlan.update({
        where: { id },
        data: {
          status: status as any,
          updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
        },
      }),
      ...(targetBlockStatus
        ? [
            prisma.maintenanceBlock.updateMany({
              where: { planId: id },
              data: { approvalStatus: targetBlockStatus as any },
            }),
          ]
        : []),
    ]);

    return {
      id: updatedPlan.id,
      planName: updatedPlan.planName,
      horizonType: updatedPlan.horizonType as any,
      startDate: updatedPlan.startDate,
      endDate: updatedPlan.endDate,
      status: updatedPlan.status as any,
      totalOptimizationScore: updatedPlan.totalOptimizationScore,
      metrics: updatedPlan.metrics as any,
      beforeMetrics: updatedPlan.beforeMetrics as any,
      createdAt: updatedPlan.createdAt,
      updatedAt: updatedPlan.updatedAt,
    };
  }

  async getBlocks(planId?: string): Promise<MaintenanceBlock[]> {
    const list = await prisma.maintenanceBlock.findMany({
      where: planId ? { planId } : undefined,
    });

    return list.map((b: any) => ({
      id: b.id,
      planId: b.planId,
      taskId: b.taskId,
      corridorId: b.corridorId,
      scheduledStartTime: b.scheduledStartTime,
      scheduledEndTime: b.scheduledEndTime,
      durationMinutes: b.durationMinutes,
      isJointBlock: b.isJointBlock,
      coordinatingDepts: b.coordinatingDepts as any,
      affectedPassengerTrains: b.affectedPassengerTrains,
      affectedGoodsTrains: b.affectedGoodsTrains,
      expectedDelayMinutes: b.expectedDelayMinutes,
      assetCriticality: b.assetCriticality as any,
      urgency: b.urgency as any,
      conflictsCount: b.conflictsCount,
      optimizationScore: b.optimizationScore,
      recommendationReason: b.recommendationReason,
      approvalStatus: b.approvalStatus as any,
      modifiedBy: b.modifiedBy ?? undefined,
      modifiedAt: b.modifiedAt ?? undefined,
    }));
  }

  async setBlocks(blocks: MaintenanceBlock[]): Promise<void> {
    await prisma.blockConflict.deleteMany();
    await prisma.maintenanceBlock.deleteMany();

    if (blocks.length > 0) {
      await prisma.maintenanceBlock.createMany({
        data: blocks.map((b: any) => ({
          id: b.id,
          planId: b.planId,
          taskId: b.taskId,
          corridorId: b.corridorId,
          scheduledStartTime: b.scheduledStartTime,
          scheduledEndTime: b.scheduledEndTime,
          durationMinutes: b.durationMinutes,
          isJointBlock: b.isJointBlock,
          coordinatingDepts: b.coordinatingDepts as any,
          affectedPassengerTrains: b.affectedPassengerTrains,
          affectedGoodsTrains: b.affectedGoodsTrains,
          expectedDelayMinutes: b.expectedDelayMinutes,
          assetCriticality: b.assetCriticality as any,
          urgency: b.urgency as any,
          conflictsCount: b.conflictsCount,
          optimizationScore: b.optimizationScore,
          recommendationReason: b.recommendationReason,
          approvalStatus: (b.approvalStatus || 'PROPOSED') as any,
          modifiedBy: b.modifiedBy ?? null,
          modifiedAt: b.modifiedAt ?? null,
        })),
        skipDuplicates: true,
      });
    }
  }

  async updateBlock(blockId: string, patch: Partial<MaintenanceBlock>): Promise<MaintenanceBlock | undefined> {
    const existing = await prisma.maintenanceBlock.findUnique({ where: { id: blockId } });
    if (!existing) return undefined;

    const data: any = {};
    if (patch.scheduledStartTime) data.scheduledStartTime = patch.scheduledStartTime;
    if (patch.scheduledEndTime) data.scheduledEndTime = patch.scheduledEndTime;
    if (patch.approvalStatus) data.approvalStatus = patch.approvalStatus;
    if (patch.modifiedBy) data.modifiedBy = patch.modifiedBy;
    if (patch.modifiedAt) data.modifiedAt = patch.modifiedAt;
    if (patch.affectedPassengerTrains !== undefined) data.affectedPassengerTrains = patch.affectedPassengerTrains;
    if (patch.expectedDelayMinutes !== undefined) data.expectedDelayMinutes = patch.expectedDelayMinutes;
    if (patch.optimizationScore !== undefined) data.optimizationScore = patch.optimizationScore;
    if (patch.recommendationReason) data.recommendationReason = patch.recommendationReason;

    const updated = await prisma.maintenanceBlock.update({
      where: { id: blockId },
      data,
    });

    return {
      id: updated.id,
      planId: updated.planId,
      taskId: updated.taskId,
      corridorId: updated.corridorId,
      scheduledStartTime: updated.scheduledStartTime,
      scheduledEndTime: updated.scheduledEndTime,
      durationMinutes: updated.durationMinutes,
      isJointBlock: updated.isJointBlock,
      coordinatingDepts: updated.coordinatingDepts as any,
      affectedPassengerTrains: updated.affectedPassengerTrains,
      affectedGoodsTrains: updated.affectedGoodsTrains,
      expectedDelayMinutes: updated.expectedDelayMinutes,
      assetCriticality: updated.assetCriticality as any,
      urgency: updated.urgency as any,
      conflictsCount: updated.conflictsCount,
      optimizationScore: updated.optimizationScore,
      recommendationReason: updated.recommendationReason,
      approvalStatus: updated.approvalStatus as any,
      modifiedBy: updated.modifiedBy ?? undefined,
      modifiedAt: updated.modifiedAt ?? undefined,
    };
  }

  async getConflicts(blockIds?: string[]): Promise<BlockConflict[]> {
    const where: any = {};
    if (blockIds && blockIds.length > 0) {
      where.blockId = { in: blockIds };
    }

    const list = await prisma.blockConflict.findMany({ where });
    return list.map((c: any) => ({
      id: c.id,
      blockId: c.blockId,
      conflictType: c.conflictType as any,
      severity: c.severity as any,
      description: c.description,
      affectedEntity: c.affectedEntity,
    }));
  }

  // Weights
  async getWeights(): Promise<OptimizationWeight[]> {
    const list = await prisma.optimizationWeight.findMany();
    if (list.length === 0) {
      return [
        {
          id: 'w-default',
          assetCriticalityWeight: 0.25,
          maintenanceUrgencyWeight: 0.25,
          trainImpactWeight: 0.15,
          delayWeight: 0.15,
          conflictWeight: 0.10,
          assetDowntimeWeight: 0.05,
          blockUtilizationWeight: 0.05,
          isDefault: true,
        },
      ];
    }

    return list.map((w: any) => ({
      id: w.id,
      assetCriticalityWeight: w.assetCriticalityWeight,
      maintenanceUrgencyWeight: w.maintenanceUrgencyWeight,
      trainImpactWeight: w.trainImpactWeight,
      delayWeight: w.delayWeight,
      conflictWeight: w.conflictWeight,
      assetDowntimeWeight: w.assetDowntimeWeight,
      blockUtilizationWeight: w.blockUtilizationWeight,
      isDefault: w.isDefault,
    }));
  }

  async updateWeights(weights: Partial<OptimizationWeight>): Promise<OptimizationWeight> {
    const existing = await prisma.optimizationWeight.findFirst({ where: { isDefault: true } });
    if (existing) {
      const updated = await prisma.optimizationWeight.update({
        where: { id: existing.id },
        data: weights as any,
      });
      return {
        id: updated.id,
        assetCriticalityWeight: updated.assetCriticalityWeight,
        maintenanceUrgencyWeight: updated.maintenanceUrgencyWeight,
        trainImpactWeight: updated.trainImpactWeight,
        delayWeight: updated.delayWeight,
        conflictWeight: updated.conflictWeight,
        assetDowntimeWeight: updated.assetDowntimeWeight,
        blockUtilizationWeight: updated.blockUtilizationWeight,
        isDefault: updated.isDefault,
      };
    } else {
      const created = await prisma.optimizationWeight.create({
        data: {
          id: weights.id || 'w-default',
          assetCriticalityWeight: weights.assetCriticalityWeight ?? 0.25,
          maintenanceUrgencyWeight: weights.maintenanceUrgencyWeight ?? 0.25,
          trainImpactWeight: weights.trainImpactWeight ?? 0.15,
          delayWeight: weights.delayWeight ?? 0.15,
          conflictWeight: weights.conflictWeight ?? 0.10,
          assetDowntimeWeight: weights.assetDowntimeWeight ?? 0.05,
          blockUtilizationWeight: weights.blockUtilizationWeight ?? 0.05,
          isDefault: true,
        },
      });
      return created;
    }
  }

  // Audit Logs
  async getAuditLogs(): Promise<AuditLog[]> {
    const list = await prisma.auditLog.findMany({
      orderBy: { timestamp: 'desc' },
    });
    return list.map((a: any) => ({
      id: a.id,
      userId: a.userId,
      username: a.username,
      userRole: a.userRole as any,
      action: a.action,
      entityType: a.entityType,
      entityId: a.entityId,
      details: a.details,
      timestamp: a.timestamp,
    }));
  }

  async addAuditLog(log: AuditLog): Promise<AuditLog> {
    const created = await prisma.auditLog.create({
      data: {
        id: log.id,
        userId: log.userId,
        username: log.username,
        userRole: log.userRole as any,
        action: log.action,
        entityType: log.entityType,
        entityId: log.entityId,
        details: log.details,
        timestamp: log.timestamp,
      },
    });

    return {
      id: created.id,
      userId: created.userId,
      username: created.username,
      userRole: created.userRole as any,
      action: created.action,
      entityType: created.entityType,
      entityId: created.entityId,
      details: created.details,
      timestamp: created.timestamp,
    };
  }

  // Relational Seed Data in Transaction Order
  async seedData(): Promise<void> {
    // Reset store data in memory to guarantee source state
    store.seedData();

    await prisma.$transaction(async (tx: any) => {
      // 1. Delete in reverse dependency order
      await tx.auditLog.deleteMany();
      await tx.notification.deleteMany();
      await tx.blockConflict.deleteMany();
      await tx.maintenanceBlock.deleteMany();
      await tx.blockPlan.deleteMany();
      await tx.optimizationWeight.deleteMany();
      await tx.corridorAvailability.deleteMany();
      await tx.goodsTrainForecast.deleteMany();
      await tx.trainSchedule.deleteMany();
      await tx.train.deleteMany();
      await tx.maintenanceHistory.deleteMany();
      await tx.maintenanceTask.deleteMany();
      await tx.assetDefect.deleteMany();
      await tx.asset.deleteMany();
      await tx.corridor.deleteMany();
      await tx.user.deleteMany();

      // 2. Insert Users
      await tx.user.createMany({
        data: store.users.map(u => ({
          id: u.id,
          username: u.username,
          name: u.name,
          email: u.email,
          passwordHash: u.passwordHash,
          role: u.role as any,
          department: u.department as any,
        })),
      });

      // 3. Insert Corridors
      await tx.corridor.createMany({
        data: store.corridors.map(c => ({
          id: c.id,
          code: c.code,
          name: c.name,
          startStation: c.startStation,
          endStation: c.endStation,
          lengthKm: c.lengthKm,
          totalTracks: c.totalTracks,
        })),
      });

      // 4. Insert Assets
      await tx.asset.createMany({
        data: store.assets.map(a => ({
          id: a.id,
          assetCode: a.assetCode,
          name: a.name,
          assetType: a.assetType as any,
          department: a.department as any,
          corridorId: a.corridorId,
          location: a.location,
          criticality: a.criticality as any,
          conditionScore: a.conditionScore,
          availability: a.availability,
          lastMaintenanceDate: a.lastMaintenanceDate,
          nextDueDate: a.nextDueDate,
          hasDefect: a.hasDefect,
        })),
      });

      // 5. Insert Asset Defects
      await tx.assetDefect.createMany({
        data: store.defects.map(d => ({
          id: d.id,
          assetId: d.assetId,
          defectType: d.defectType,
          description: d.description,
          severity: d.severity as any,
          speedRestrictionKmh: d.speedRestrictionKmh ?? null,
          reportedAt: d.reportedAt,
          reportedBy: d.reportedBy,
          isResolved: d.isResolved ?? false,
        })),
      });

      // 6. Insert Tasks
      await tx.maintenanceTask.createMany({
        data: store.tasks.map(t => ({
          id: t.id,
          taskId: t.taskId,
          assetId: t.assetId,
          department: t.department as any,
          maintenanceType: t.maintenanceType as any,
          description: t.description,
          defectId: t.defectId ?? null,
          priorityScore: t.priorityScore,
          criticality: t.criticality as any,
          urgency: t.urgency as any,
          estimatedDurationMinutes: t.estimatedDurationMinutes,
          requiredResources: t.requiredResources,
          preferredWindowStart: t.preferredWindowStart,
          preferredWindowEnd: t.preferredWindowEnd,
          deadline: t.deadline,
          status: (t.status || 'PENDING') as any,
          createdAt: t.createdAt,
        })),
      });

      // 7. Insert Trains
      await tx.train.createMany({
        data: store.trains.map(t => ({
          id: t.id,
          trainNumber: t.trainNumber,
          trainName: t.trainName,
          trainType: t.trainType as any,
          priorityRank: t.priorityRank,
        })),
      });

      // 8. Insert Train Schedules
      await tx.trainSchedule.createMany({
        data: store.schedules.map(s => ({
          id: s.id,
          trainId: s.trainId,
          trainNumber: s.trainNumber,
          trainName: s.trainName,
          trainType: s.trainType as any,
          corridorId: s.corridorId,
          origin: s.origin,
          destination: s.destination,
          arrivalTime: s.arrivalTime,
          departureTime: s.departureTime,
          dayOfWeek: s.dayOfWeek,
          isDaily: s.isDaily,
        })),
      });

      // 9. Insert Goods Train Forecasts
      await tx.goodsTrainForecast.createMany({
        data: store.freightForecasts.map(f => ({
          id: f.id,
          corridorId: f.corridorId,
          forecastDate: f.forecastDate,
          timeSlot: f.timeSlot,
          expectedTrainsCount: f.expectedTrainsCount,
          trafficLevel: f.trafficLevel as any,
        })),
      });

      // 10. Insert Corridor Availabilities
      await tx.corridorAvailability.createMany({
        data: store.corridorAvailabilities.map(a => ({
          id: a.id,
          corridorId: a.corridorId,
          timeSlot: a.timeSlot,
          status: a.status as any,
          trafficDensity: a.trafficDensity as any,
        })),
      });

      // 11. Insert Optimization Weights
      await tx.optimizationWeight.createMany({
        data: store.weights.map(w => ({
          id: w.id,
          assetCriticalityWeight: w.assetCriticalityWeight,
          maintenanceUrgencyWeight: w.maintenanceUrgencyWeight,
          trainImpactWeight: w.trainImpactWeight,
          delayWeight: w.delayWeight,
          conflictWeight: w.conflictWeight,
          assetDowntimeWeight: w.assetDowntimeWeight,
          blockUtilizationWeight: w.blockUtilizationWeight,
          isDefault: w.isDefault,
        })),
      });

      // 12. Insert Block Plans
      for (const p of store.plans) {
        await tx.blockPlan.create({
          data: {
            id: p.id,
            planName: p.planName,
            horizonType: p.horizonType as any,
            startDate: p.startDate,
            endDate: p.endDate,
            status: p.status as any,
            totalOptimizationScore: p.totalOptimizationScore,
            metrics: p.metrics as any,
            beforeMetrics: p.beforeMetrics as any ?? null,
            createdAt: p.createdAt,
            updatedAt: p.updatedAt,
          },
        });
      }

      // 13. Insert Maintenance Blocks
      await tx.maintenanceBlock.createMany({
        data: store.blocks.map(b => ({
          id: b.id,
          planId: b.planId,
          taskId: b.taskId,
          corridorId: b.corridorId,
          scheduledStartTime: b.scheduledStartTime,
          scheduledEndTime: b.scheduledEndTime,
          durationMinutes: b.durationMinutes,
          isJointBlock: b.isJointBlock,
          coordinatingDepts: b.coordinatingDepts as any,
          affectedPassengerTrains: b.affectedPassengerTrains,
          affectedGoodsTrains: b.affectedGoodsTrains,
          expectedDelayMinutes: b.expectedDelayMinutes,
          assetCriticality: b.assetCriticality as any,
          urgency: b.urgency as any,
          conflictsCount: b.conflictsCount,
          optimizationScore: b.optimizationScore,
          recommendationReason: b.recommendationReason,
          approvalStatus: (b.approvalStatus || 'PROPOSED') as any,
          modifiedBy: b.modifiedBy ?? null,
          modifiedAt: b.modifiedAt ?? null,
        })),
      });

      // 14. Insert Notifications
      await tx.notification.createMany({
        data: store.notifications.map(n => ({
          id: n.id,
          userId: n.userId ?? null,
          title: n.title,
          message: n.message,
          type: n.type as any,
          isRead: n.isRead,
          createdAt: n.createdAt,
        })),
      });

      // 15. Insert Audit Logs
      await tx.auditLog.createMany({
        data: store.auditLogs.map(a => ({
          id: a.id,
          userId: a.userId,
          username: a.username,
          userRole: a.userRole as any,
          action: a.action,
          entityType: a.entityType,
          entityId: a.entityId,
          details: a.details,
          timestamp: a.timestamp,
        })),
      });
    });
  }
}
