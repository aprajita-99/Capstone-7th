import { Router } from 'express';
import { createSession, startSession, stopSession, getActiveSession, getSectionSessions } from '../controllers/session.controller';
import { validate, requireAuth, requireRole } from '../middleware';
import { createSessionSchema } from '../schemas/session.schema';
import { asyncHandler } from '../utils/asyncHandler';

const router = Router({ mergeParams: true });

router.use(requireAuth, requireRole('TEACHER'));

// Nested under /api/sections/:sectionId/attendance-sessions
router.post('/', validate(createSessionSchema), asyncHandler(createSession));
router.get('/', asyncHandler(getSectionSessions));
router.get('/active', asyncHandler(getActiveSession));

// Under /api/attendance-sessions/:sessionId
router.post('/start', asyncHandler(startSession));
router.post('/stop', asyncHandler(stopSession));

export default router;
