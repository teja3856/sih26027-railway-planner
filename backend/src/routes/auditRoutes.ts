import { Router, Response } from 'express';
import { repository } from '../repositories';
import { AuthRequest, authenticateToken } from '../middleware/auth';

const router = Router();

// GET /api/audit (Authenticated users)
router.get('/', authenticateToken, async (req: AuthRequest, res: Response) => {
  const auditLogs = await repository.getAuditLogs();
  res.json(auditLogs);
});

export default router;
