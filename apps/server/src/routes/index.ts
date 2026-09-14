import { Router } from 'express';
import authRoutes from './auth.routes';
import courseRoutes from './course.routes';
import sectionRoutes from './section.routes';
import sessionRoutes from './session.routes';
import inviteRoutes from './invite.routes';
import studentRoutes from './student.routes';

const router = Router();

// Cross-Role
router.use('/auth', authRoutes);

// Teacher Paths
router.use('/courses', courseRoutes);
router.use('/courses/:courseId/sections', sectionRoutes);
router.use('/sections', sectionRoutes); 
router.use('/sections/:sectionId/attendance-sessions', sessionRoutes);
router.use('/attendance-sessions', sessionRoutes);
router.use('/sections/:sectionId/invites', inviteRoutes);
router.use('/invites', inviteRoutes);

// Student Paths
router.use('/student', studentRoutes);

export default router;
