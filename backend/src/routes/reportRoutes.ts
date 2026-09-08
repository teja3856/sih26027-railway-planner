import { Router, Response } from 'express';
import { repository } from '../repositories';
import { AuthRequest, authenticateToken } from '../middleware/auth';

const router = Router();

// GET /api/reports/plan-summary (Authenticated users)
router.get('/plan-summary', authenticateToken, async (req: AuthRequest, res: Response) => {
  const { planId, format } = req.query;

  const plans = await repository.getPlans();
  const plan = plans.find((p: any) => p.id === planId) || plans[0];
  const blocks = plan ? await repository.getBlocks(plan.id) : [];

  if (format === 'csv') {
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=block_plan_${plan?.id || 'export'}.csv`);

    let csvContent = 'Block ID,Corridor,Scheduled Start,Scheduled End,Duration (Min),Is Joint Block,Coordinating Departments,Affected Passenger Trains,Affected Goods Trains,Expected Delay (Min),Status,Reason\n';

    blocks.forEach((b: any) => {
      csvContent += `"${b.id}","${b.corridorId}","${b.scheduledStartTime}","${b.scheduledEndTime}",${b.durationMinutes},${b.isJointBlock},"${b.coordinatingDepts.join(';')}",${b.affectedPassengerTrains},${b.affectedGoodsTrains},${b.expectedDelayMinutes},"${b.approvalStatus}","${b.recommendationReason.replace(/"/g, '""')}"\n`;
    });

    // Audit log
    await repository.addAuditLog({
      id: `aud-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      userId: req.user?.id || 'usr-1',
      username: req.user?.username || 'admin',
      userRole: req.user?.role || 'ADMIN',
      action: 'REPORT_EXPORTED',
      entityType: 'REPORT',
      entityId: plan?.id || 'export',
      details: `Exported official block plan report (${plan?.planName || plan?.id || 'all'}) in CSV format`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
    });

    return res.send(csvContent);
  }

  res.json({
    plan,
    blocks,
    generatedAt: new Date().toISOString(),
    disclaimer: 'Prototype using synthetic demonstration data. Not connected to live Indian Railways systems.',
  });
});

export default router;
