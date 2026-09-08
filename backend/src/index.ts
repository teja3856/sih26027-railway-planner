import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { env } from './config/env';
import authRoutes from './routes/authRoutes';
import assetRoutes from './routes/assetRoutes';
import taskRoutes from './routes/taskRoutes';
import trafficRoutes from './routes/trafficRoutes';
import optimizationRoutes from './routes/optimizationRoutes';
import planRoutes from './routes/planRoutes';
import syntheticRoutes from './routes/syntheticRoutes';
import analyticsRoutes from './routes/analyticsRoutes';
import reportRoutes from './routes/reportRoutes';
import auditRoutes from './routes/auditRoutes';
import { globalApiLimiter } from './middleware/rateLimiter';
import { errorHandler } from './middleware/errorHandler';
import { repository } from './repositories';

const app = express();

// Security Headers & CORS
app.use(helmet());
app.use(cors({
  origin: env.CORS_ORIGIN,
  credentials: true,
}));

app.use(express.json());

// Global Rate Limiting
app.use('/api', globalApiLimiter);

// API Routes
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

// Healthcheck & Disclaimer
app.get('/api/health', async (req, res) => {
  const dbHealth = await (repository as any).checkHealth?.() || { database: 'connected', mode: 'POSTGRES' };
  const isHealthy = dbHealth.database === 'connected' || env.NODE_ENV !== 'production';

  res.status(isHealthy ? 200 : 503).json({
    status: isHealthy ? 'HEALTHY' : 'DEGRADED',
    database: dbHealth.database,
    mode: dbHealth.mode,
    service: 'Indian Railways Automatic Block Planning System Backend',
    version: '1.0.0',
    environment: env.NODE_ENV,
    disclaimer: 'Prototype using synthetic demonstration data. Not connected to live Indian Railways systems.',
    timestamp: new Date().toISOString(),
  });
});

// Centralized Error Handling Middleware
app.use(errorHandler);

const server = app.listen(env.PORT, '0.0.0.0', async () => {
  console.log(`============================================================`);
  console.log(`🚂 SIH26027 Backend running on 0.0.0.0:${env.PORT} [${env.NODE_ENV}]`);
  console.log(`Security: Helmet Enabled | CORS: ${Array.isArray(env.CORS_ORIGIN) ? env.CORS_ORIGIN.join(', ') : env.CORS_ORIGIN}`);

  try {
    const initResult = await repository.initialize();
    console.log(`🗄️ Database: [${initResult.mode}] ${initResult.message}`);
    if (env.NODE_ENV === 'production' && initResult.mode !== 'POSTGRES') {
      console.error('❌ Critical Error: Production mode requires a live PostgreSQL connection. Exiting...');
      process.exit(1);
    }
  } catch (err: any) {
    console.error('❌ Repository initialization error:', err.message);
    if (env.NODE_ENV === 'production') {
      process.exit(1);
    }
  }
  console.log(`============================================================`);
});
