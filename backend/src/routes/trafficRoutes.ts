import { Router, Response } from 'express';
import { repository } from '../repositories';
import { AuthRequest, authenticateToken } from '../middleware/auth';

const router = Router();

// GET /api/traffic/timetable (Authenticated users)
router.get('/timetable', authenticateToken, async (req: AuthRequest, res: Response) => {
  const { corridorId, trainType } = req.query;

  const results = await repository.getSchedules({
    corridorId: corridorId as string,
    trainType: trainType as string,
  });

  res.json(results);
});

// GET /api/traffic/freight-forecast (Authenticated users)
router.get('/freight-forecast', authenticateToken, async (req: AuthRequest, res: Response) => {
  const { corridorId, forecastDate } = req.query;

  const results = await repository.getFreightForecasts({
    corridorId: corridorId as string,
    forecastDate: forecastDate as string,
  });

  res.json(results);
});

// GET /api/traffic/corridors (Authenticated users)
router.get('/corridors', authenticateToken, async (req: AuthRequest, res: Response) => {
  const corridors = await repository.getCorridors();
  res.json(corridors);
});

// GET /api/traffic/corridor-availabilities (Authenticated users)
router.get('/corridor-availabilities', authenticateToken, async (req: AuthRequest, res: Response) => {
  const { corridorId } = req.query;
  const availabilities = await repository.getCorridorAvailabilities(corridorId as string);
  res.json(availabilities);
});

export default router;
