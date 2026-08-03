import { Router } from 'express';
import {
  uploadResume,
  uploadMiddleware,
  uploadImages,
  uploadImageMiddleware,
} from '../controllers/uploadController';
import auth from '../middleware/auth';

const router = Router();

// POST /api/uploads/resume — upload PDF tenant resume
router.post('/resume', auth, uploadMiddleware.single('resume'), uploadResume);

// POST /api/uploads/images — upload property images (max 5)
router.post('/images', auth, uploadImageMiddleware.array('images', 5), uploadImages);

export default router;
