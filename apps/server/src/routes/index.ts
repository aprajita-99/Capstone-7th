import { Router } from 'express';
import authRoutes from './auth.routes';
import courseRoutes from './course.routes';
import sectionRoutes from './section.routes';
import sessionRoutes from './session.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/courses', courseRoutes);
router.use('/courses/:courseId/sections', sectionRoutes);
router.use('/sections', sectionRoutes); // for /sections/:sectionId type routes
router.use('/sections/:sectionId/attendance-sessions', sessionRoutes);
router.use('/attendance-sessions', sessionRoutes);

export default router;
