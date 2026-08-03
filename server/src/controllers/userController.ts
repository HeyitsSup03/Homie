import { Request, Response } from 'express';
import User from '../models/User';
import asyncHandler from '../utils/asyncHandler';

// PATCH /api/users/me  (authenticated users)
export const updateProfile = asyncHandler(async (req: Request, res: Response) => {
  const { phone, bio, occupation, resumeUrl } = req.body as {
    phone?: string;
    bio?: string;
    occupation?: string;
    resumeUrl?: string;
  };

  const user = await User.findById(req.user!._id);
  if (!user) {
    res.status(404).json({ message: 'User not found.' });
    return;
  }

  if (phone !== undefined) user.phone = phone.trim();
  if (bio !== undefined) user.bio = bio.trim();
  if (occupation !== undefined) user.occupation = occupation.trim();
  if (resumeUrl !== undefined) user.resumeUrl = resumeUrl.trim();

  await user.save();

  res.status(200).json({
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      resumeUrl: user.resumeUrl,
      bio: user.bio,
      occupation: user.occupation,
    },
  });
});
