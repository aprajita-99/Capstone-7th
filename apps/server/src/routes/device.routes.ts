import { Router } from 'express';
import { registerDevice, revokeDevice } from '../controllers/device.controller';
import { validate, requireAuth, requireRole } from '../middleware';
import { registerDeviceSchema } from '../schemas/device.schema';
import { asyncHandler } from '../utils/asyncHandler';

const router = Router();

// Inherits /api/student scope
router.use(requireAuth, requireRole('STUDENT'));

router.post('/', validate(registerDeviceSchema), asyncHandler(registerDevice));
router.post('/:deviceId/revoke', asyncHandler(revokeDevice));

export default router;
