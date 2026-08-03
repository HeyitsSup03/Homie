import { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import multer from 'multer';
import asyncHandler from '../utils/asyncHandler';

// Ensure uploads directories exist
const resumeUploadDir = path.join(process.cwd(), 'public', 'uploads', 'resumes');
const imageUploadDir = path.join(process.cwd(), 'public', 'uploads', 'images');

if (!fs.existsSync(resumeUploadDir)) {
  fs.mkdirSync(resumeUploadDir, { recursive: true });
}
if (!fs.existsSync(imageUploadDir)) {
  fs.mkdirSync(imageUploadDir, { recursive: true });
}

// Multer storage config for resumes
const resumeStorage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, resumeUploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const userId = req.user!._id.toString();
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e4);
    cb(null, `resume-${userId}-${uniqueSuffix}${ext}`);
  },
});

// Multer storage config for property images
const imageStorage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, imageUploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const userId = req.user!._id.toString();
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e4);
    cb(null, `img-${userId}-${uniqueSuffix}${ext}`);
  },
});

// PDF File filter & size limit (5MB)
export const uploadMiddleware = multer({
  storage: resumeStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
  fileFilter: (_req, file, cb) => {
    if (file.mimetype === 'application/pdf' || file.originalname.toLowerCase().endsWith('.pdf')) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files (.pdf) are allowed.'));
    }
  },
});

// Image File filter & size limit (5MB per image, max 5 images)
export const uploadImageMiddleware = multer({
  storage: imageStorage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only image files (JPEG, PNG, WEBP) are allowed.'));
    }
  },
});

// POST /api/uploads/resume  (authenticated users)
export const uploadResume = asyncHandler(async (req: Request, res: Response) => {
  if (!req.file) {
    res.status(400).json({ message: 'No PDF file uploaded.' });
    return;
  }

  // Construct accessible static URL
  const resumeUrl = `/uploads/resumes/${req.file.filename}`;

  res.status(200).json({
    message: 'Tenant resume uploaded successfully.',
    resumeUrl,
  });
});

// POST /api/uploads/images  (authenticated users, max 5 files)
export const uploadImages = asyncHandler(async (req: Request, res: Response) => {
  const files = req.files as Express.Multer.File[];
  if (!files || files.length === 0) {
    res.status(400).json({ message: 'No image files uploaded.' });
    return;
  }

  const imageUrls = files.map(file => `/uploads/images/${file.filename}`);

  res.status(200).json({
    message: 'Property images uploaded successfully.',
    imageUrls,
  });
});
