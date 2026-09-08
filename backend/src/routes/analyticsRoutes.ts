import { Router, Response } from 'express';
import { repository } from '../repositories';
import { AuthRequest, authenticateToken } from '../middleware/auth';

const router = Router();

// GET /api/analytics/dashboard (Authenticated users)
router.get('/dashboard', authenticateToken, async (req: AuthRequest, res: Response) => {
  const assets = await repository.getAssets();
  const tasks = await repository.getTasks();
  const blocks = await repository.getBlocks();
  const plans = await repository.getPlans();

  const totalAssets = assets.length;
  const availableAssets = assets.filter((a: any) => a.conditionScore >= 50).length;
  const criticalAssets = assets.filter((a: any) => a.criticality === 'CRITICAL').length;
  
  const pendingMaintenance = tasks.filter((t: any) => t.status === 'PENDING').length;
  const overdueMaintenance = tasks.filter((t: any) => t.urgency === 'CRITICAL' || t.status === 'PRIORITIZED').length;
  const activeBlocks = blocks.filter((b: any) => b.approvalStatus === 'APPROVED').length;
  
  const currentPlan = plans[0];
  const conflictsCount = currentPlan ? currentPlan.metrics.conflictCount : 0;
  const affectedTrains = currentPlan ? currentPlan.metrics.affectedTrainsCount : 2;
  const assetAvailabilityPercent = Number(((availableAssets / (totalAssets || 1)) * 100).toFixed(1));

  // Department task counts
  const departmentBreakdown = {
    ENGINEERING: tasks.filter((t: any) => t.department === 'ENGINEERING').length,
    TRACTION_DISTRIBUTION: tasks.filter((t: any) => t.department === 'TRACTION_DISTRIBUTION').length,
    SIGNAL_TELECOM: tasks.filter((t: any) => t.department === 'SIGNAL_TELECOM').length,
  };

  const availabilityTimeline = [
    { day: 'Mon', original: 87.2, optimized: 97.4 },
    { day: 'Tue', original: 86.8, optimized: 97.8 },
    { day: 'Wed', original: 88.0, optimized: 98.1 },
    { day: 'Thu', original: 85.5, optimized: 97.5 },
    { day: 'Fri', original: 87.9, optimized: 98.4 },
    { day: 'Sat', original: 89.1, optimized: 98.9 },
    { day: 'Sun', original: 90.0, optimized: 99.2 },
  ];

  const trafficByHour = Array.from({ length: 24 }, (_, i) => ({
    hour: `${String(i).padStart(2, '0')}:00`,
    passengerTrains: i >= 6 && i <= 22 ? 6 : 2,
    goodsTrains: i >= 0 && i <= 5 ? 3 : 5,
  }));

  const conflictsBySeverity = {
    LOW: 1,
    MEDIUM: 2,
    HIGH: 1,
    CRITICAL: 0,
  };

  res.json({
    kpis: {
      totalAssets,
      availableAssets,
      criticalAssets,
      pendingMaintenance,
      overdueMaintenance,
      activeBlocks,
      conflictsCount,
      affectedTrains,
      assetAvailabilityPercent,
    },
    departmentBreakdown,
    availabilityTimeline,
    trafficByHour,
    conflictsBySeverity,
    beforeVsAfter: {
      before: currentPlan?.beforeMetrics || {
        affectedTrainsCount: 9,
        totalDelayMinutes: 135,
        conflictCount: 6,
        assetDowntimeHours: 16.5,
        blockUtilizationPercent: 52.0,
      },
      after: currentPlan?.metrics || {
        affectedTrainsCount: 2,
        totalDelayMinutes: 27,
        conflictCount: 0,
        assetDowntimeHours: 8.0,
        blockUtilizationPercent: 91.5,
      },
    },
  });
});

export default router;
