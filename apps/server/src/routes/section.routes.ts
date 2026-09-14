import { Router } from 'express';
import { createSection, getSections, getSection, getSectionEnrollments } from '../controllers/section.controller';
import { validate, requireAuth, requireRole } from '../middleware';
import { createSectionSchema } from '../schemas/section.schema';
import { asyncHandler } from '../utils/asyncHandler';

const router = Router({ mergeParams: true }); // Need mergeParams to access courseId if nested

router.use(requireAuth, requireRole('TEACHER'));

// Relative to /api/courses/:courseId/sections
router.post('/', validate(createSectionSchema), asyncHandler(createSection));
router.get('/', asyncHandler(getSections));

// Relative to /api/sections/:sectionId
router.get('/detail/:sectionId', asyncHandler(getSection)); 
router.get('/:sectionId/enrollments', asyncHandler(getSectionEnrollments));

export default router;
