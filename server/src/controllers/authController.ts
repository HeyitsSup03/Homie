import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User, { UserRole } from '../models/User';
import Listing from '../models/Listing';
import asyncHandler from '../utils/asyncHandler';

// Helper to sign a JWT for a user
const signToken = (id: string, name: string, email: string, role: string): string => {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('JWT_SECRET not configured');
  return jwt.sign({ id, name, email, role }, secret, { expiresIn: '7d' });
};

// Helper to check if owner has at least one listing
const checkHasListing = async (userId: unknown, role: string): Promise<boolean> => {
  if (role !== 'owner') return false;
  const count = await Listing.countDocuments({ owner: userId });
  return count > 0;
};

// POST /api/auth/register
export const register = asyncHandler(async (req: Request, res: Response) => {
  const { name, email, password, role } = req.body as {
    name?: string;
    email?: string;
    password?: string;
    role?: UserRole;
  };

  // 400 — missing or invalid fields
  if (!name || !email || !password || !role) {
    res.status(400).json({ message: 'name, email, password, and role are required.' });
    return;
  }
  if (!['owner', 'seeker'].includes(role)) {
    res.status(400).json({ message: 'role must be "owner" or "seeker".' });
    return;
  }
  if (password.length < 6) {
    res.status(400).json({ message: 'Password must be at least 6 characters.' });
    return;
  }

  // 409 — duplicate email
  const existing = await User.findOne({ email: email.toLowerCase().trim() });
  if (existing) {
    res.status(409).json({ message: 'An account with this email already exists.' });
    return;
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const user = await User.create({ name, email, passwordHash, role });

  const token = signToken(String(user._id), user.name, user.email, user.role);
  const hasListing = await checkHasListing(user._id, user.role);

  res.status(201).json({
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      hasListing,
    },
  });
});

// POST /api/auth/login
export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body as { email?: string; password?: string };

  // 400 — missing fields
  if (!email || !password) {
    res.status(400).json({ message: 'email and password are required.' });
    return;
  }

  // Explicitly select passwordHash (it has select:false on the schema)
  const user = await User.findOne({ email: email.toLowerCase().trim() }).select('+passwordHash');

  // 401 — wrong email or wrong password (same message to avoid leaking which)
  if (!user) {
    res.status(401).json({ message: 'Invalid email or password.' });
    return;
  }

  const isMatch = await bcrypt.compare(password, user.passwordHash);
  if (!isMatch) {
    res.status(401).json({ message: 'Invalid email or password.' });
    return;
  }

  const token = signToken(String(user._id), user.name, user.email, user.role);
  const hasListing = await checkHasListing(user._id, user.role);

  res.status(200).json({
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      hasListing,
    },
  });
});

// GET /api/auth/me  (protected)
export const getMe = asyncHandler(async (req: Request, res: Response) => {
  // req.user is guaranteed to exist (auth middleware runs first)
  const user = await User.findById(req.user!._id);
  if (!user) {
    res.status(404).json({ message: 'User not found.' });
    return;
  }

  const hasListing = await checkHasListing(user._id, user.role);

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
      hasListing,
    },
  });
});

