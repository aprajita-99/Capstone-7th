import { Router } from 'express';
import { register, login, getMe } from '../controllers/auth.controller';
import { validate, requireAuth } from '../middleware';
import { registerSchema, loginSchema } from '../schemas/auth.schema';
import { asyncHandler } from '../utils/asyncHandler';

const router = Router();

router.post('/register', validate(registerSchema), asyncHandler(register));
router.post('/login', validate(loginSchema), asyncHandler(login));
router.get('/me', requireAuth, asyncHandler(getMe));

export default router;
