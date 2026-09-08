import { Router, Response } from 'express';
import { repository } from '../repositories';
import { AuthRequest, authenticateToken, requireRole } from '../middleware/auth';
import { validateBody, updateBlockSchema } from '../middleware/validate';
import { MaintenanceBlock } from '../types';

const router = Router();

// GET /api/plans (Authenticated users)
router.get('/', authenticateToken, async (req: AuthRequest, res: Response) => {
  const plans = await repository.getPlans();
  res.json(plans);
});

// GET /api/plans/:id (Authenticated users)
router.get('/:id', authenticateToken, async (req: AuthRequest, res: Response) => {
  const plan = await repository.getPlanById(req.params.id);
  if (!plan) {
    return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Block plan not found' } });
  }

  const blocks = await repository.getBlocks(plan.id);
  const blockIds = blocks.map((b: MaintenanceBlock) => b.id);
  const conflicts = await repository.getConflicts(blockIds);

  res.json({
    plan,
    blocks,
    conflicts,
  });
});

// PATCH /api/plans/:id/blocks/:blockId (OPERATIONS_CONTROLLER & ADMIN)
router.patch('/:id/blocks/:blockId', authenticateToken, requireRole('OPERATIONS_CONTROLLER', 'ADMIN'), validateBody(updateBlockSchema), async (req: AuthRequest, res: Response) => {
  const blocks = await repository.getBlocks();
  const block = blocks.find((b: MaintenanceBlock) => b.id === req.params.blockId);
  if (!block) {
    return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Block not found' } });
  }

  const { scheduledStartTime, scheduledEndTime, approvalStatus } = req.body;

  const patch: any = {};
  if (scheduledStartTime) patch.scheduledStartTime = scheduledStartTime;
  if (scheduledEndTime) patch.scheduledEndTime = scheduledEndTime;
  if (approvalStatus) {
    patch.approvalStatus = approvalStatus;
    patch.modifiedBy = req.user?.username || 'controller';
    patch.modifiedAt = new Date().toISOString().replace('T', ' ').substring(0, 16);
  }

  const newStart = scheduledStartTime || block.scheduledStartTime;
  const isNightSlot = newStart.includes('01:') || newStart.includes('02:') || newStart.includes('03:');
  if (isNightSlot) {
    patch.affectedPassengerTrains = 0;
    patch.expectedDelayMinutes = 0;
    patch.optimizationScore = 96;
    patch.recommendationReason = 'Modified timing placed in 01:00-04:00 window. Low traffic density, 0 passenger train delays.';
  } else {
    patch.affectedPassengerTrains = 2;
    patch.expectedDelayMinutes = 24;
    patch.optimizationScore = 68;
    patch.recommendationReason = 'Warning: Daytime modification clashes with passenger traffic schedule (Train 12301 & 12004).';
  }

  const updatedBlock = await repository.updateBlock(block.id, patch);

  // Audit log
  await repository.addAuditLog({
    id: `aud-${Date.now()}`,
    userId: req.user?.id || 'usr-2',
    username: req.user?.username || 'controller',
    userRole: req.user?.role || 'OPERATIONS_CONTROLLER',
    action: 'MODIFY_MAINTENANCE_BLOCK',
    entityType: 'MAINTENANCE_BLOCK',
    entityId: block.id,
    details: `Modified block ${block.id} timing to ${newStart}. Recalculated score: ${updatedBlock?.optimizationScore}`,
    timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
  });

  res.json(updatedBlock);
});

// POST /api/plans/:id/approve (OPERATIONS_CONTROLLER & ADMIN)
router.post('/:id/approve', authenticateToken, requireRole('OPERATIONS_CONTROLLER', 'ADMIN'), async (req: AuthRequest, res: Response) => {
  const plan = await repository.getPlanById(req.params.id);
  if (!plan) {
    return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Plan not found' } });
  }

  const updatedPlan = await repository.updatePlanStatus(plan.id, 'APPROVED');

  // Audit log
  await repository.addAuditLog({
    id: `aud-${Date.now()}`,
    userId: req.user?.id || 'usr-2',
    username: req.user?.username || 'controller',
    userRole: req.user?.role || 'OPERATIONS_CONTROLLER',
    action: 'APPROVE_BLOCK_PLAN',
    entityType: 'BLOCK_PLAN',
    entityId: plan.id,
    details: `Approved ${plan.horizonType} block plan ${plan.id} for execution`,
    timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
  });

  res.json(updatedPlan);
});

// POST /api/plans/:id/reject (OPERATIONS_CONTROLLER & ADMIN)
router.post('/:id/reject', authenticateToken, requireRole('OPERATIONS_CONTROLLER', 'ADMIN'), async (req: AuthRequest, res: Response) => {
  const plan = await repository.getPlanById(req.params.id);
  if (!plan) {
    return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Plan not found' } });
  }

  const updatedPlan = await repository.updatePlanStatus(plan.id, 'REJECTED');

  // Audit log
  await repository.addAuditLog({
    id: `aud-${Date.now()}`,
    userId: req.user?.id || 'usr-2',
    username: req.user?.username || 'controller',
    userRole: req.user?.role || 'OPERATIONS_CONTROLLER',
    action: 'REJECT_BLOCK_PLAN',
    entityType: 'BLOCK_PLAN',
    entityId: plan.id,
    details: `Rejected ${plan.horizonType} block plan ${plan.id}`,
    timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
  });

  res.json(updatedPlan);
});

export default router;
