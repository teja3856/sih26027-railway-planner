import { Request, Response, NextFunction } from 'express';
import { z, ZodError } from 'zod';

export const validateBody = (schema: z.ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        const issue = err.issues[0];
        const fieldName = issue.path.join('.');
        return res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_INPUT',
            message: fieldName ? `Validation error on field '${fieldName}': ${issue.message}` : issue.message,
            details: err.issues.map(i => ({ field: i.path.join('.'), message: i.message })),
          },
        });
      }
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_INPUT',
          message: 'Invalid request body format.',
        },
      });
    }
  };
};

// Schemas
export const loginSchema = z.object({
  username: z.string().optional(),
  email: z.string().optional(),
  password: z.string().min(1, 'Password is required'),
}).refine(data => !!(data.username || data.email), {
  message: 'Username or email is required',
  path: ['email'],
});

export const createTaskSchema = z.object({
  assetId: z.string().min(1, 'Asset ID is required'),
  department: z.enum(['ENGINEERING', 'TRACTION_DISTRIBUTION', 'SIGNAL_TELECOM', 'OPERATIONS']).optional(),
  maintenanceType: z.enum(['PREVENTIVE', 'CORRECTIVE', 'DEFECT_RECTIFICATION', 'OVERHAUL']).optional(),
  description: z.string().optional(),
  defectId: z.string().optional(),
  criticality: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).optional(),
  estimatedDurationMinutes: z.number().or(z.string().transform(Number)).optional(),
  requiredResources: z.array(z.string()).optional(),
  preferredWindowStart: z.string().optional(),
  preferredWindowEnd: z.string().optional(),
  deadline: z.string().optional(),
});

export const updateTaskSchema = z.object({
  status: z.enum(['PENDING', 'PRIORITIZED', 'SCHEDULED', 'APPROVED', 'ACTIVE', 'COMPLETED', 'CANCELLED']).optional(),
  estimatedDurationMinutes: z.number().or(z.string().transform(Number)).optional(),
  preferredWindowStart: z.string().optional(),
  preferredWindowEnd: z.string().optional(),
  priorityScore: z.number().or(z.string().transform(Number)).optional(),
});

export const createDefectSchema = z.object({
  defectType: z.string().optional(),
  description: z.string().optional(),
  severity: z.enum(['MINOR', 'MAJOR', 'SEVERE', 'CRITICAL']).optional(),
  speedRestrictionKmh: z.number().or(z.string().transform(Number)).optional(),
});

export const optimizeRequestSchema = z.object({
  horizonType: z.enum(['WEEKLY', 'MONTHLY']).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

export const weightsSchema = z.object({
  assetCriticalityWeight: z.number().min(0).max(1).optional(),
  maintenanceUrgencyWeight: z.number().min(0).max(1).optional(),
  trainImpactWeight: z.number().min(0).max(1).optional(),
  delayWeight: z.number().min(0).max(1).optional(),
  conflictWeight: z.number().min(0).max(1).optional(),
  assetDowntimeWeight: z.number().min(0).max(1).optional(),
  blockUtilizationWeight: z.number().min(0).max(1).optional(),
});

export const updateBlockSchema = z.object({
  scheduledStartTime: z.string().optional(),
  scheduledEndTime: z.string().optional(),
  approvalStatus: z.enum(['PROPOSED', 'APPROVED', 'MODIFIED', 'REJECTED']).optional(),
});

export const simulationSchema = z.object({
  scenarioType: z.string().optional(),
  speedRestrictions: z.array(z.any()).optional(),
  delaySpikes: z.array(z.any()).optional(),
  trackClosure: z.any().optional(),
});
