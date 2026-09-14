import { Router } from 'express';
import { requireAuth, requireRole } from '../middleware/auth';
import { 
    getFaceStatus,
    initEnrollment,
    completeEnrollment,
    deleteEnrollment,
    initVerification,
    verifyFace,
    consumeTokenTest
} from '../controllers/face.controller';
import { asyncHandler } from '../utils/asyncHandler';

const router = Router();

router.use(requireAuth);
router.use(requireRole(['STUDENT']));

router.get('/status', asyncHandler(getFaceStatus));
router.post('/enrollment/init', asyncHandler(initEnrollment));
router.post('/enrollment/complete', asyncHandler(completeEnrollment));
router.delete('/enrollment', asyncHandler(deleteEnrollment));

router.post('/verify/init', asyncHandler(initVerification));
router.post('/verify', asyncHandler(verifyFace));
router.post('/consume-token-test', asyncHandler(consumeTokenTest));

export default router;
