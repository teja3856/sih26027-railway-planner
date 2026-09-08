import { Router, Response } from 'express';
import { repository } from '../repositories';
import { AuthRequest, authenticateToken, requireRole } from '../middleware/auth';
import { MaintenanceTask } from '../types';
import { validateBody, createTaskSchema, updateTaskSchema } from '../middleware/validate';

const router = Router();

// GET /api/tasks (Authenticated users)
router.get('/', authenticateToken, async (req: AuthRequest, res: Response) => {
  const { department, status, criticality } = req.query;

  const results = await repository.getTasks({
    department: department as string,
    status: status as string,
    criticality: criticality as string,
  });

  res.json(results);
});

// POST /api/tasks (MAINTENANCE_ENGINEER & ADMIN)
router.post('/', authenticateToken, requireRole('MAINTENANCE_ENGINEER', 'ADMIN'), validateBody(createTaskSchema), async (req: AuthRequest, res: Response) => {
  const {
    assetId,
    department,
    maintenanceType,
    description,
    defectId,
    criticality,
    estimatedDurationMinutes,
    requiredResources,
    preferredWindowStart,
    preferredWindowEnd,
    deadline,
  } = req.body;

  const asset = await repository.getAssetById(assetId);
  if (!asset) {
    return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Associated asset not found' } });
  }

  // Compute calculated priority score
  let baseScore = criticality === 'CRITICAL' ? 90 : criticality === 'HIGH' ? 75 : criticality === 'MEDIUM' ? 50 : 30;
  if (defectId) baseScore += 10;
  if (asset.conditionScore < 40) baseScore += 10;

  const allTasks = await repository.getTasks();

  const newTask: MaintenanceTask = {
    id: `tsk-${Date.now()}`,
    taskId: `MT-${String(allTasks.length + 1).padStart(3, '0')}`,
    assetId: asset.id,
    department: department || asset.department,
    maintenanceType: maintenanceType || 'CORRECTIVE',
    description: description || `Maintenance on ${asset.assetCode}`,
    defectId,
    priorityScore: Math.min(100, baseScore),
    criticality: criticality || asset.criticality,
    urgency: defectId ? 'CRITICAL' : 'HIGH',
    estimatedDurationMinutes: Number(estimatedDurationMinutes) || 120,
    requiredResources: Array.isArray(requiredResources) ? requiredResources : ['Power-Block'],
    preferredWindowStart: preferredWindowStart || '01:00',
    preferredWindowEnd: preferredWindowEnd || '04:00',
    deadline: deadline || '2026-09-15',
    status: 'PENDING',
    createdAt: new Date().toISOString().substring(0, 10),
  };

  await repository.createTask(newTask);

  // Audit log
  await repository.addAuditLog({
    id: `aud-${Date.now()}`,
    userId: req.user?.id || 'usr-3',
    username: req.user?.username || 'engineer',
    userRole: req.user?.role || 'MAINTENANCE_ENGINEER',
    action: 'CREATE_MAINTENANCE_TASK',
    entityType: 'MAINTENANCE_TASK',
    entityId: newTask.taskId,
    details: `Created maintenance task ${newTask.taskId} for asset ${asset.assetCode} (${newTask.department})`,
    timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
  });

  res.status(201).json(newTask);
});

// PATCH /api/tasks/:id (MAINTENANCE_ENGINEER, OPERATIONS_CONTROLLER & ADMIN)
router.patch('/:id', authenticateToken, requireRole('MAINTENANCE_ENGINEER', 'OPERATIONS_CONTROLLER', 'ADMIN'), validateBody(updateTaskSchema), async (req: AuthRequest, res: Response) => {
  const task = await repository.getTaskById(req.params.id);
  if (!task) {
    return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Task not found' } });
  }

  const { status, estimatedDurationMinutes, preferredWindowStart, preferredWindowEnd, priorityScore } = req.body;

  const updatedTask = await repository.updateTask(task.id, {
    ...(status && { status }),
    ...(estimatedDurationMinutes && { estimatedDurationMinutes: Number(estimatedDurationMinutes) }),
    ...(preferredWindowStart && { preferredWindowStart }),
    ...(preferredWindowEnd && { preferredWindowEnd }),
    ...(priorityScore !== undefined && { priorityScore: Number(priorityScore) }),
  });

  res.json(updatedTask);
});

export default router;
