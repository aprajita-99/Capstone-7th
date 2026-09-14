import { Router } from 'express';
import { createInvite, getSectionInvites, revokeInvite, validateInvite } from '../controllers/invite.controller';
import { acceptInvite } from '../controllers/student.controller';
import { validate, requireAuth, requireRole } from '../middleware';
import { createInviteSchema } from '../schemas/invite.schema';
import { asyncHandler } from '../utils/asyncHandler';

const router = Router({ mergeParams: true }); // Supports nested mounts

// Teacher endpoints under /api/sections/:sectionId/invites
router.post('/', requireAuth, requireRole('TEACHER'), validate(createInviteSchema), asyncHandler(createInvite));
router.get('/list', requireAuth, requireRole('TEACHER'), asyncHandler(getSectionInvites)); 

// Teacher endpoint under /api/invites/:inviteId/revoke
router.post('/:inviteId/revoke', requireAuth, requireRole('TEACHER'), asyncHandler(revokeInvite));

// Public/Student endpoints under /api/invites/:token
router.get('/:token', asyncHandler(validateInvite)); // Public validation check for mobile UI rendering
router.post('/:token/accept', requireAuth, requireRole('STUDENT'), asyncHandler(acceptInvite)); // Secure enrolment

export default router;
