import { Request, Response } from 'express';
import Listing from '../models/Listing';
import geocodeAddress from '../services/geocode';
import asyncHandler from '../utils/asyncHandler';

// POST /api/listings  (owner only)
export const createListing = asyncHandler(async (req: Request, res: Response) => {
  const { title, rent, description, amenities, address } = req.body as {
    title?: string;
    rent?: number;
    description?: string;
    amenities?: string[];
    address?: string;
  };

  // 400 — required field validation
  if (!title || rent === undefined || rent === null || !address) {
    res.status(400).json({
      message: 'title, rent, and address are required.',
    });
    return;
  }

  if (typeof rent !== 'number' || rent < 0) {
    res.status(400).json({ message: 'rent must be a non-negative number.' });
    return;
  }

  // Geocode the address — 422 if unresolvable
  let coordinates: [number, number];
  try {
    coordinates = await geocodeAddress(address);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Geocoding failed.';
    res.status(422).json({ message });
    return;
  }

  // Create and persist the listing
  const listing = await Listing.create({
    owner: req.user!._id,
    title: title.trim(),
    rent,
    description: description?.trim(),
    amenities: Array.isArray(amenities) ? amenities : [],
    address: address.trim(),
    location: {
      type: 'Point',
      coordinates, // [longitude, latitude]
    },
  });

  res.status(201).json({ listing });
});
