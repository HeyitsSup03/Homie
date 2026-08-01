import { Router } from 'express';
import {
  createListing,
  getMyListings,
  getNearbyListings,
  getListingById,
} from '../controllers/listingController';
import auth from '../middleware/auth';
import requireRole from '../middleware/requireRole';

const router = Router();

// POST /api/listings — owner only
router.post('/', auth, requireRole('owner'), createListing);

// GET /api/listings/my-listings — owner only (must be before /:id)
router.get('/my-listings', auth, requireRole('owner'), getMyListings);

// GET /api/listings/nearby — any authenticated user (must be before /:id)
router.get('/nearby', auth, getNearbyListings);

// GET /api/listings/:id — any authenticated user
router.get('/:id', auth, getListingById);

export default router;
