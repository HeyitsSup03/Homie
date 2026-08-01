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

// GET /api/listings/my-listings  (owner only)
export const getMyListings = asyncHandler(async (req: Request, res: Response) => {
  const listings = await Listing.find({ owner: req.user!._id })
    .sort({ createdAt: -1 });

  res.status(200).json({ listings });
});

// GET /api/listings/:id  (any authenticated user)
export const getListingById = asyncHandler(async (req: Request, res: Response) => {
  const listing = await Listing.findById(req.params.id)
    .populate('owner', 'name email phone');

  if (!listing) {
    res.status(404).json({ message: 'Listing not found.' });
    return;
  }

  res.status(200).json({ listing });
});

// GET /api/listings/nearby  (any authenticated user)
export const getNearbyListings = asyncHandler(async (req: Request, res: Response) => {
  const { lat, lng, radiusKm } = req.query as {
    lat?: string;
    lng?: string;
    radiusKm?: string;
  };

  if (!lat || !lng) {
    res.status(400).json({ message: 'lat and lng query parameters are required.' });
    return;
  }

  const latitude = parseFloat(lat);
  const longitude = parseFloat(lng);
  const radius = parseFloat(radiusKm ?? '20');

  if (isNaN(latitude) || isNaN(longitude)) {
    res.status(400).json({ message: 'lat and lng must be valid numbers.' });
    return;
  }

  const listings = await Listing.find({
    location: {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates: [longitude, latitude], // [lng, lat] — GeoJSON order
        },
        $maxDistance: radius * 1000, // metres
      },
    },
  }).limit(50);

  res.status(200).json({ listings });
});
