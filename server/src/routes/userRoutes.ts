import { Router } from 'express';
import { updateProfile } from '../controllers/userController';
import auth from '../middleware/auth';

const router = Router();

// PATCH /api/users/me — update user profile
router.patch('/me', auth, updateProfile);

export default router;
