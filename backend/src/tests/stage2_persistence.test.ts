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
import { repository } from '../repositories';
import { prisma } from '../db/prismaClient';

function createApp() {
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
  return app;
}

async function runStage2PersistenceTests() {
  console.log('============================================================');
  console.log('🧪 RUNNING STAGE 2 POSTGRESQL PERSISTENCE TEST SUITE');
  console.log('============================================================');

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
    // 1. Initialize repository with PostgreSQL
    const initRes = await repository.initialize();
    assert(initRes.mode === 'POSTGRES', '1. Repository successfully connected in POSTGRES mode', initRes.message);

    // 2. Start Backend Instance 1 on port 5088
    let app1 = createApp();
    let server1 = http.createServer(app1);
    await new Promise<void>((resolve) => server1.listen(5088, resolve));
    const client1 = axios.create({ baseURL: 'http://localhost:5088/api', validateStatus: () => true });

    const adminToken = jwt.sign(
      { id: 'usr-1', username: 'admin', role: 'ADMIN', department: 'OPERATIONS' },
      env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    const testDefectId = `def-persist-${Date.now()}`;
    const testTimestamp = new Date().toISOString().replace('T', ' ').substring(0, 16);

    // 3. Create a defect record via Instance 1 API
    const defectPayload = {
      defectType: 'PERSISTENCE_TEST_RAIL_FRACTURE',
      description: 'Test defect created to verify PostgreSQL restart persistence',
      severity: 'CRITICAL',
      speedRestrictionKmh: 30,
    };

    const resCreate = await client1.post('/assets/ast-101/defects', defectPayload, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    if (resCreate.status !== 201) {
      console.error('resCreate Error:', resCreate.status, resCreate.data);
    }

    assert(resCreate.status === 201 && resCreate.data.severity === 'CRITICAL', '2. Created test defect record in PostgreSQL via API Instance 1');

    // 4. Generate an optimization plan via Instance 1 API
    const resPlan = await client1.post('/optimization/generate-plan', {
      horizonType: 'WEEKLY',
      startDate: '2026-09-09',
      endDate: '2026-09-15',
    }, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });

    assert(resPlan.status === 200 && !!resPlan.data.plan?.id, '3. Generated and saved automatic block plan in PostgreSQL via API Instance 1');
    const generatedPlanId = resPlan.data.plan?.id;

    // 5. STOP Server Instance 1 (simulating process termination / restart)
    await new Promise<void>((resolve) => server1.close(() => resolve()));
    console.log('🔄 Backend Server 1 stopped. Starting fresh Backend Server 2 (Simulating Restart)...');

    // 6. START Backend Instance 2 on port 5089
    let app2 = createApp();
    let server2 = http.createServer(app2);
    await new Promise<void>((resolve) => server2.listen(5089, resolve));
    const client2 = axios.create({ baseURL: 'http://localhost:5089/api', validateStatus: () => true });

    // 7. Retrieve defect from Instance 2
    const resAsset = await client2.get('/assets/ast-101', {
      headers: { Authorization: `Bearer ${adminToken}` },
    });

    const foundDefect = resAsset.data.defects?.find((d: any) => d.defectType === 'PERSISTENCE_TEST_RAIL_FRACTURE');
    assert(!!foundDefect && foundDefect.severity === 'CRITICAL', '4. Defect record persisted in PostgreSQL and retrieved successfully after server restart');

    // 8. Retrieve plan from Instance 2
    const resGetPlan = await client2.get(`/plans/${generatedPlanId}`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });

    assert(resGetPlan.status === 200 && resGetPlan.data.plan?.id === generatedPlanId, '5. Optimization plan persisted in PostgreSQL and retrieved successfully after server restart');
    assert(Array.isArray(resGetPlan.data.blocks) && resGetPlan.data.blocks.length > 0, '6. Optimization maintenance blocks persisted in PostgreSQL after server restart');

    // 9. Stop Server Instance 2
    await new Promise<void>((resolve) => server2.close(() => resolve()));

    console.log('============================================================');
    console.log(`STAGE 2 PERSISTENCE TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
    console.log('============================================================');

    if (failed > 0) {
      process.exit(1);
    }
  } catch (err: any) {
    console.error('❌ Test execution error:', err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

runStage2PersistenceTests();
