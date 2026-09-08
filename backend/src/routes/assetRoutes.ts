import { Router, Response } from 'express';
import { repository } from '../repositories';
import { AuthRequest, authenticateToken, requireRole } from '../middleware/auth';
import { AssetDefect, MaintenanceTask } from '../types';
import { validateBody, createDefectSchema } from '../middleware/validate';

const router = Router();

// GET /api/assets (Authenticated users)
router.get('/', authenticateToken, async (req: AuthRequest, res: Response) => {
  const { department, corridorId, criticality, hasDefect } = req.query;

  const results = await repository.getAssets({
    department: department as string,
    corridorId: corridorId as string,
    criticality: criticality as string,
    hasDefect: hasDefect !== undefined ? hasDefect === 'true' : undefined,
  });

  res.json(results);
});

// GET /api/assets/:id (Authenticated users)
router.get('/:id', authenticateToken, async (req: AuthRequest, res: Response) => {
  const asset = await repository.getAssetById(req.params.id);
  if (!asset) {
    return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Asset not found' } });
  }

  const assetDefects = await repository.getDefectsByAssetId(asset.id);
  const tasks = await repository.getTasks();
  const assetTasks = tasks.filter((t: MaintenanceTask) => t.assetId === asset.id);
  const history = await repository.getHistoryByAssetId(asset.id);
  const corridor = await repository.getCorridorById(asset.corridorId);

  res.json({
    asset,
    corridor,
    defects: assetDefects,
    tasks: assetTasks,
    history,
  });
});

// POST /api/assets/:id/defects (MAINTENANCE_ENGINEER & ADMIN)
router.post('/:id/defects', authenticateToken, requireRole('MAINTENANCE_ENGINEER', 'ADMIN'), validateBody(createDefectSchema), async (req: AuthRequest, res: Response) => {
  const asset = await repository.getAssetById(req.params.id);
  if (!asset) {
    return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Asset not found' } });
  }

  const { defectType, description, severity, speedRestrictionKmh } = req.body;

  const newDefect: AssetDefect = {
    id: `def-${Date.now()}`,
    assetId: asset.id,
    defectType: defectType || 'General Mechanical/Electrical Defect',
    description: description || 'Reported maintenance defect',
    severity: severity || 'MAJOR',
    speedRestrictionKmh: speedRestrictionKmh ? Number(speedRestrictionKmh) : undefined,
    reportedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
    reportedBy: req.user?.username || 'Maintenance Engineer',
    isResolved: false,
  };

  await repository.createDefect(newDefect);

  // Add audit log
  await repository.addAuditLog({
    id: `aud-${Date.now()}`,
    userId: req.user?.id || 'usr-3',
    username: req.user?.username || 'engineer',
    userRole: req.user?.role || 'MAINTENANCE_ENGINEER',
    action: 'REPORT_DEFECT',
    entityType: 'ASSET_DEFECT',
    entityId: newDefect.id,
    details: `Reported ${newDefect.severity} defect on asset ${asset.assetCode}: ${newDefect.defectType}`,
    timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
  });

  res.status(201).json(newDefect);
});

export default router;
