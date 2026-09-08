import { Router, Response } from 'express';
import { repository } from '../repositories';
import { AuthRequest, authenticateToken, requireRole } from '../middleware/auth';

const router = Router();

// POST /api/synthetic/seed (ADMIN only)
router.post('/seed', authenticateToken, requireRole('ADMIN'), async (req: AuthRequest, res: Response) => {
  await repository.seedData();

  // Audit log
  await repository.addAuditLog({
    id: `aud-${Date.now()}`,
    userId: req.user?.id || 'usr-1',
    username: req.user?.username || 'admin',
    userRole: req.user?.role || 'ADMIN',
    action: 'RESET_SYNTHETIC_DATA',
    entityType: 'SYNTHETIC_DATA',
    entityId: 'sys-seed',
    details: 'Reset and re-seeded synthetic demo dataset (30+ trains, 24 assets, 22 tasks, 10 corridors).',
    timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
  });

  const assets = await repository.getAssets();
  const tasks = await repository.getTasks();
  const trains = await repository.getTrains();
  const schedules = await repository.getSchedules();
  const corridors = await repository.getCorridors();
  const freightForecasts = await repository.getFreightForecasts();

  res.json({
    message: 'Synthetic demo dataset re-seeded successfully.',
    isSynthetic: true,
    disclaimer: 'Prototype using synthetic demonstration data. Not connected to live Indian Railways systems.',
    stats: {
      assetsCount: assets.length,
      tasksCount: tasks.length,
      trainsCount: trains.length,
      schedulesCount: schedules.length,
      corridorsCount: corridors.length,
      freightForecastsCount: freightForecasts.length,
    },
  });
});

// GET /api/synthetic/status (Authenticated users)
router.get('/status', authenticateToken, async (req: AuthRequest, res: Response) => {
  const assets = await repository.getAssets();
  const tasks = await repository.getTasks();
  const trains = await repository.getTrains();
  const schedules = await repository.getSchedules();
  const corridors = await repository.getCorridors();

  res.json({
    isSynthetic: true,
    disclaimer: 'Prototype using synthetic demonstration data. Not connected to live Indian Railways systems.',
    stats: {
      assetsCount: assets.length,
      tasksCount: tasks.length,
      trainsCount: trains.length,
      schedulesCount: schedules.length,
      corridorsCount: corridors.length,
    },
  });
});

export default router;
