import { Router } from 'express';
import { createCourse, getMyCourses, getMyCourse } from '../controllers/course.controller';
import { validate, requireAuth, requireRole } from '../middleware';
import { createCourseSchema } from '../schemas/course.schema';
import { asyncHandler } from '../utils/asyncHandler';

const router = Router();

router.use(requireAuth, requireRole('TEACHER'));

router.post('/', validate(createCourseSchema), asyncHandler(createCourse));
router.get('/', asyncHandler(getMyCourses));
router.get('/:courseId', asyncHandler(getMyCourse));

export default router;
