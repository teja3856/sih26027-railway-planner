import { Router, Response } from 'express';
import { repository } from '../repositories';
import { AuthRequest, authenticateToken } from '../middleware/auth';

const router = Router();

// GET /api/reports/plan-summary (Authenticated users)
router.get('/plan-summary', authenticateToken, async (req: AuthRequest, res: Response) => {
  const { planId, format } = req.query;

  const plans = await repository.getPlans();
  const plan = plans.find(p => p.id === planId) || plans[0];
  const blocks = plan ? await repository.getBlocks(plan.id) : [];

  if (format === 'csv') {
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=block_plan_${plan?.id || 'export'}.csv`);

    let csvContent = 'Block ID,Corridor,Scheduled Start,Scheduled End,Duration (Min),Is Joint Block,Coordinating Departments,Affected Passenger Trains,Affected Goods Trains,Expected Delay (Min),Status,Reason\n';

    blocks.forEach(b => {
      csvContent += `"${b.id}","${b.corridorId}","${b.scheduledStartTime}","${b.scheduledEndTime}",${b.durationMinutes},${b.isJointBlock},"${b.coordinatingDepts.join(';')}",${b.affectedPassengerTrains},${b.affectedGoodsTrains},${b.expectedDelayMinutes},"${b.approvalStatus}","${b.recommendationReason.replace(/"/g, '""')}"\n`;
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
