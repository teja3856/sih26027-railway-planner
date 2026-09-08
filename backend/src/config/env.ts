import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const NODE_ENV = process.env.NODE_ENV || 'development';
const PORT = Number(process.env.PORT) || 5000;
const JWT_SECRET = process.env.JWT_SECRET;
const PYTHON_AI_URL = process.env.PYTHON_AI_URL || 'http://127.0.0.1:8000';
const rawCors = process.env.CORS_ORIGIN;
const CORS_ORIGIN = rawCors 
  ? (rawCors.includes(',') ? rawCors.split(',').map(s => s.trim()) : rawCors)
  : (NODE_ENV === 'production' ? 'https://ai-resume-68ff7.web.app' : 'http://localhost:3000');
const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/sih_railway_db';

if (NODE_ENV === 'production' && (!JWT_SECRET || JWT_SECRET === 'sih26027_railway_secret_key')) {
  console.error('CRITICAL CONFIGURATION ERROR: JWT_SECRET must be explicitly set to a secure secret in production environment.');
  throw new Error('JWT_SECRET configuration missing for production deployment.');
}

export const env = {
  NODE_ENV,
  PORT,
  JWT_SECRET: JWT_SECRET || 'sih26027_railway_secret_key_dev_only',
  PYTHON_AI_URL,
  CORS_ORIGIN,
  DATABASE_URL,
};
