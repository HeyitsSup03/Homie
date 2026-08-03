import { Router } from 'express';
import {
  expressInterest,
  getOwnerInterests,
  getSeekerInterests,
  updateInterestStatus,
} from '../controllers/interestController';
import auth from '../middleware/auth';
import requireRole from '../middleware/requireRole';

const router = Router();

// POST /api/interests — seeker only
router.post('/', auth, requireRole('seeker'), expressInterest);

// GET /api/interests/my-listings — owner only (must be before /:id)
router.get('/my-listings', auth, requireRole('owner'), getOwnerInterests);

// GET /api/interests/my-interests — seeker only (must be before /:id)
router.get('/my-interests', auth, requireRole('seeker'), getSeekerInterests);

// PATCH /api/interests/:id/status — owner only
router.patch('/:id/status', auth, requireRole('owner'), updateInterestStatus);

export default router;
