import { Router, Response } from 'express';
import jwt from 'jsonwebtoken';
import { repository } from '../repositories';
import { AuthRequest, authenticateToken, requireRole } from '../middleware/auth';
import { env } from '../config/env';
import { comparePassword } from '../utils/password';
import { validateBody, loginSchema } from '../middleware/validate';
import { authLimiter } from '../middleware/rateLimiter';

const router = Router();

// POST /api/auth/login
router.post('/login', authLimiter, validateBody(loginSchema), async (req: AuthRequest, res: Response) => {
  const identifier = String(req.body.email || req.body.username || '').trim();
  const { password } = req.body;
  const user = await repository.getUserByUsername(identifier);

  if (!user) {
    return res.status(401).json({ success: false, error: { code: 'INVALID_CREDENTIALS', message: 'Invalid username or password' } });
  }

  const isPasswordValid = await comparePassword(password, user.passwordHash);
  if (!isPasswordValid) {
    return res.status(401).json({ success: false, error: { code: 'INVALID_CREDENTIALS', message: 'Invalid username or password' } });
  }

  const token = jwt.sign(
    { id: user.id, username: user.username, role: user.role, department: user.department },
    env.JWT_SECRET,
    { expiresIn: '24h' }
  );

  // Audit log
  await repository.addAuditLog({
    id: `aud-${Date.now()}`,
    userId: user.id,
    username: user.username,
    userRole: user.role,
    action: 'USER_LOGIN',
    entityType: 'USER',
    entityId: user.id,
    details: `User ${user.name} logged in successfully with role ${user.role}`,
    timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
  });

  const { passwordHash, ...userWithoutPassword } = user;

  res.json({
    token,
    user: userWithoutPassword,
  });
});

// POST /api/auth/demo-session (Silently issues signed JWT for requested demo role)
router.post('/demo-session', authLimiter, async (req: AuthRequest, res: Response) => {
  const rawRole = String(req.body?.role || 'ADMIN').toUpperCase();
  let targetRole = 'ADMIN';
  if (rawRole === 'OPERATIONS_CONTROLLER' || rawRole === 'CONTROLLER') {
    targetRole = 'OPERATIONS_CONTROLLER';
  } else if (rawRole === 'MAINTENANCE_ENGINEER' || rawRole === 'ENGINEER') {
    targetRole = 'MAINTENANCE_ENGINEER';
  } else if (rawRole === 'ADMIN') {
    targetRole = 'ADMIN';
  }

  const users = await repository.getUsers();
  const user = users.find((u: any) => u.role === targetRole) || users[0];

  if (!user) {
    return res.status(500).json({ success: false, error: { code: 'NO_DEMO_USER', message: 'No demo user available' } });
  }

  const token = jwt.sign(
    { id: user.id, username: user.username, role: user.role, department: user.department },
    env.JWT_SECRET,
    { expiresIn: '24h' }
  );

  const { passwordHash, ...userWithoutPassword } = user;

  res.json({
    token,
    user: userWithoutPassword,
  });
});

// GET /api/auth/me (Authenticated user profile)
router.get('/me', authenticateToken, async (req: AuthRequest, res: Response) => {
  const userId = req.user?.id;
  if (!userId) {
    return res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'User unauthenticated' } });
  }

  const user = await repository.getUserById(userId);
  if (!user) {
    return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'User not found' } });
  }

  const { passwordHash, ...userWithoutPassword } = user;
  res.json({ user: userWithoutPassword });
});

// GET /api/auth/users (ADMIN only)
router.get('/users', authenticateToken, requireRole('ADMIN'), async (req: AuthRequest, res: Response) => {
  const users = await repository.getUsers();
  const safeUsers = users.map((u: any) => {
    const { passwordHash, ...rest } = u;
    return rest;
  });
  res.json(safeUsers);
});

export default router;
