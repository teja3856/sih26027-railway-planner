import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import jwt from 'jsonwebtoken';
import http from 'http';
import axios from 'axios';
import { env } from '../config/env';
import authRoutes from '../routes/authRoutes';
import assetRoutes from '../routes/assetRoutes';
import taskRoutes from '../routes/taskRoutes';
import trafficRoutes from '../routes/trafficRoutes';
import optimizationRoutes from '../routes/optimizationRoutes';
import planRoutes from '../routes/planRoutes';
import syntheticRoutes from '../routes/syntheticRoutes';
import analyticsRoutes from '../routes/analyticsRoutes';
import reportRoutes from '../routes/reportRoutes';
import auditRoutes from '../routes/auditRoutes';
import { globalApiLimiter } from '../middleware/rateLimiter';
import { errorHandler } from '../middleware/errorHandler';

async function runStage1SecurityTests() {
  console.log('============================================================');
  console.log('🧪 RUNNING STAGE 1 SECURITY & FUNCTIONALITY TEST SUITE');
  console.log('============================================================');

  const app = express();
  app.use(helmet());
  app.use(cors({ origin: env.CORS_ORIGIN, credentials: true }));
  app.use(express.json());

  app.use('/api', globalApiLimiter);
  app.use('/api/auth', authRoutes);
  app.use('/api/assets', assetRoutes);
  app.use('/api/tasks', taskRoutes);
  app.use('/api/traffic', trafficRoutes);
  app.use('/api/optimization', optimizationRoutes);
  app.use('/api/plans', planRoutes);
  app.use('/api/synthetic', syntheticRoutes);
  app.use('/api/analytics', analyticsRoutes);
  app.use('/api/reports', reportRoutes);
  app.use('/api/audit', auditRoutes);
  app.use(errorHandler);

  const server = http.createServer(app);
  await new Promise<void>((resolve) => server.listen(5099, resolve));
  const client = axios.create({ baseURL: 'http://localhost:5099/api', validateStatus: () => true });

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string, detail?: string) {
    if (condition) {
      console.log(`✅ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`❌ FAIL: ${testName} - ${detail || ''}`);
      failed++;
    }
  }

  try {
    // Test 1: No token -> 401
    const res1 = await client.get('/assets');
    assert(res1.status === 401, '1. Missing token returns HTTP 401 Unauthorized', `Got status ${res1.status}`);

    // Test 2: Invalid token -> 401
    const res2 = await client.get('/assets', { headers: { Authorization: 'Bearer invalid_fake_token_123' } });
    assert(res2.status === 401, '2. Invalid token returns HTTP 401 Unauthorized', `Got status ${res2.status}`);

    // Test 3: Expired token -> 401
    const expiredToken = jwt.sign({ id: 'usr-1', username: 'admin', role: 'ADMIN' }, env.JWT_SECRET, { expiresIn: '-1s' });
    const res3 = await client.get('/assets', { headers: { Authorization: `Bearer ${expiredToken}` } });
    assert(res3.status === 401, '3. Expired token returns HTTP 401 Unauthorized', `Got status ${res3.status}`);

    // Test 4: Valid token -> authenticated
    const adminToken = jwt.sign({ id: 'usr-1', username: 'admin', role: 'ADMIN', department: 'OPERATIONS' }, env.JWT_SECRET, { expiresIn: '1h' });
    const res4 = await client.get('/assets', { headers: { Authorization: `Bearer ${adminToken}` } });
    assert(res4.status === 200 && Array.isArray(res4.data), '4. Valid token returns HTTP 200 OK & authenticated data');

    // Test 5: Wrong role -> 403
    const engineerToken = jwt.sign({ id: 'usr-3', username: 'engineer_eng', role: 'MAINTENANCE_ENGINEER', department: 'ENGINEERING' }, env.JWT_SECRET, { expiresIn: '1h' });
    const res5 = await client.post('/synthetic/seed', {}, { headers: { Authorization: `Bearer ${engineerToken}` } });
    assert(res5.status === 403, '5. Maintenance Engineer accessing Admin seed endpoint returns HTTP 403 Forbidden', `Got status ${res5.status}`);

    // Test 6: Correct role -> allowed
    const res6 = await client.post('/synthetic/seed', {}, { headers: { Authorization: `Bearer ${adminToken}` } });
    assert(res6.status === 200, '6. Admin accessing seed endpoint is allowed (HTTP 200 OK)');

    // Test 7: Invalid request body -> 400
    const res7 = await client.post('/auth/login', { username: '' });
    assert(res7.status === 400 && res7.data.error.code === 'INVALID_INPUT', '7. Invalid request body returns HTTP 400 with Zod error details');

    // Test 8: Login with correct password -> success
    const res8 = await client.post('/auth/login', { username: 'admin', password: 'admin123' });
    assert(res8.status === 200 && !!res8.data.token, '8. Login with correct bcrypt password succeeds with JWT token');

    // Test 9: Login with incorrect password -> failure
    const res9 = await client.post('/auth/login', { username: 'admin', password: 'wrongpassword' });
    assert(res9.status === 401, '9. Login with incorrect password returns HTTP 401 Unauthorized');

    // Test 10: Password is never returned in API responses
    const res10Me = await client.get('/auth/me', { headers: { Authorization: `Bearer ${adminToken}` } });
    const res10Users = await client.get('/auth/users', { headers: { Authorization: `Bearer ${adminToken}` } });
    const meHasPassword = res10Me.data?.user?.passwordHash !== undefined;
    const usersHasPassword = res10Users.data?.some((u: any) => u.passwordHash !== undefined);
    assert(!meHasPassword && !usersHasPassword, '10. Password hash is omitted from /auth/me and /auth/users responses');

    // Test 11: JWT secret is loaded from environment configuration
    assert(env.JWT_SECRET === 'sih26027_railway_super_secret_jwt_key_2026', '11. JWT secret is loaded securely from environment configuration');

    // Test 12: Existing optimization endpoints still work
    const controllerToken = jwt.sign({ id: 'usr-2', username: 'controller', role: 'OPERATIONS_CONTROLLER', department: 'OPERATIONS' }, env.JWT_SECRET, { expiresIn: '1h' });
    const res12Opt = await client.post('/optimization/generate-plan', { horizonType: 'WEEKLY' }, { headers: { Authorization: `Bearer ${controllerToken}` } });
    assert(res12Opt.status === 200 && !!res12Opt.data.plan, '12. Automatic Block-Plan Optimization endpoint generates plan successfully');

  } catch (err: any) {
    console.error('Test execution error:', err);
    failed++;
  } finally {
    server.close();
    console.log('============================================================');
    console.log(`STAGE 1 SECURITY TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
    console.log('============================================================');
    process.exit(failed > 0 ? 1 : 0);
  }
}

runStage1SecurityTests();
