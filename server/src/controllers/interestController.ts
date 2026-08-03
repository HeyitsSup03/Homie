import { Request, Response } from 'express';
import Interest from '../models/Interest';
import Listing from '../models/Listing';
import Message from '../models/Message';
import asyncHandler from '../utils/asyncHandler';

// POST /api/interests  (seeker only)
export const expressInterest = asyncHandler(async (req: Request, res: Response) => {
  const { listingId, message } = req.body as { listingId?: string; message?: string };

  if (!listingId) {
    res.status(400).json({ message: 'listingId is required.' });
    return;
  }

  // Verify listing exists
  const listing = await Listing.findById(listingId);
  if (!listing) {
    res.status(404).json({ message: 'Listing not found.' });
    return;
  }

  // Owners cannot express interest in their own listings
  if (listing.owner.toString() === req.user!._id.toString()) {
    res.status(403).json({ message: 'Owners cannot express interest in their own listings.' });
    return;
  }

  // Create interest — unique index will throw if already exists
  try {
    const interest = await Interest.create({
      listing: listingId,
      seeker: req.user!._id,
      owner: listing.owner,
      message: message?.trim(),
    });

    res.status(201).json({ interest });
  } catch (err: any) {
    // Mongo duplicate key error code
    if (err.code === 11000) {
      res.status(409).json({ message: 'You have already expressed interest in this property.' });
      return;
    }
    throw err;
  }
});

// GET /api/interests/my-listings  (owner only)
export const getOwnerInterests = asyncHandler(async (req: Request, res: Response) => {
  const interests = await Interest.find({ owner: req.user!._id })
    .populate('seeker', 'name email phone resumeUrl bio occupation')
    .populate('listing', 'title address rent')
    .sort({ createdAt: -1 });

  res.status(200).json({ interests });
});

// GET /api/interests/my-interests  (seeker only)
export const getSeekerInterests = asyncHandler(async (req: Request, res: Response) => {
  const interests = await Interest.find({ seeker: req.user!._id })
    .populate('listing', 'title address rent images')
    .populate('owner', 'name email phone')
    .sort({ createdAt: -1 });

  res.status(200).json({ interests });
});

// PATCH /api/interests/:id/status  (owner only)
export const updateInterestStatus = asyncHandler(async (req: Request, res: Response) => {
  const { status } = req.body as { status?: string };

  if (!status || !['accepted', 'declined'].includes(status)) {
    res.status(400).json({ message: 'status must be "accepted" or "declined".' });
    return;
  }

  const interest = await Interest.findById(req.params.id);
  if (!interest) {
    res.status(404).json({ message: 'Interest request not found.' });
    return;
  }

  // Only the owner of the related property can update this status
  if (interest.owner.toString() !== req.user!._id.toString()) {
    res.status(403).json({ message: 'Not authorised to update this interest request.' });
    return;
  }

  interest.status = status as 'accepted' | 'declined';
  await interest.save();

  // Populate for the response
  await interest.populate('seeker', 'name email phone');
  await interest.populate('listing', 'title address rent');

  res.status(200).json({ interest });
});

// DELETE /api/interests/:id  (seeker or owner)
export const deleteInterest = asyncHandler(async (req: Request, res: Response) => {
  const interest = await Interest.findById(req.params.id);
  if (!interest) {
    res.status(404).json({ message: 'Interest request not found.' });
    return;
  }

  const userIdStr = req.user!._id.toString();
  const seekerIdStr = interest.seeker.toString();
  const ownerIdStr = interest.owner.toString();

  if (userIdStr !== seekerIdStr && userIdStr !== ownerIdStr) {
    res.status(403).json({ message: 'Not authorised to delete this interest request.' });
    return;
  }

  // Delete associated chat messages
  await Message.deleteMany({ interest: req.params.id });

  // Delete interest record
  await Interest.findByIdAndDelete(req.params.id);

  res.status(200).json({ message: 'Interest request and chat history deleted.' });
});
