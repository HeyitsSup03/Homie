import { Router } from 'express';
import { createListing } from '../controllers/listingController';
import auth from '../middleware/auth';
import requireRole from '../middleware/requireRole';

const router = Router();

// POST /api/listings — owner only
router.post('/', auth, requireRole('owner'), createListing);

export default router;
