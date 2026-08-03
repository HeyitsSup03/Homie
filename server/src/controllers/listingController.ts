import { Request, Response } from 'express';
import Listing from '../models/Listing';
import geocodeAddress, { geocodeAddressDetailed } from '../services/geocode';
import asyncHandler from '../utils/asyncHandler';

// POST /api/listings  (owner only)
export const createListing = asyncHandler(async (req: Request, res: Response) => {
  const { title, rent, description, amenities, address, images } = req.body as {
    title?: string;
    rent?: number;
    description?: string;
    amenities?: string[];
    address?: string;
    images?: string[];
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
    images: Array.isArray(images) ? images : [],
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
  const { lat, lng, radiusKm, minRent, maxRent, amenities, sortBy } = req.query as {
    lat?: string;
    lng?: string;
    radiusKm?: string;
    minRent?: string;
    maxRent?: string;
    amenities?: string;
    sortBy?: 'price_asc' | 'price_desc' | 'newest';
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

  // Construct MongoDB filter
  const filter: any = {
    location: {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates: [longitude, latitude], // [lng, lat] — GeoJSON order
        },
        $maxDistance: radius * 1000, // metres
      },
    },
  };

  // Budget filter
  if (minRent || maxRent) {
    filter.rent = {};
    if (minRent && !isNaN(parseFloat(minRent))) {
      filter.rent.$gte = parseFloat(minRent);
    }
    if (maxRent && !isNaN(parseFloat(maxRent))) {
      filter.rent.$lte = parseFloat(maxRent);
    }
  }

  // Multi-amenity filter ($all)
  if (amenities) {
    const amenityList = amenities.split(',').map(a => a.trim()).filter(Boolean);
    if (amenityList.length > 0) {
      filter.amenities = { $all: amenityList };
    }
  }

  let listings = await Listing.find(filter).limit(100);

  // Apply in-memory sorting if explicit sortBy option is selected
  if (sortBy === 'price_asc') {
    listings.sort((a, b) => a.rent - b.rent);
  } else if (sortBy === 'price_desc') {
    listings.sort((a, b) => b.rent - a.rent);
  } else if (sortBy === 'newest') {
    listings.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  res.status(200).json({ listings });
});

// DELETE /api/listings/:id  (owner only)
export const deleteListing = asyncHandler(async (req: Request, res: Response) => {
  const listing = await Listing.findById(req.params.id);
  if (!listing) {
    res.status(404).json({ message: 'Listing not found.' });
    return;
  }

  // Ownership verification
  if (listing.owner.toString() !== req.user!._id.toString()) {
    res.status(403).json({ message: 'Not authorized to delete this listing.' });
    return;
  }

  await Listing.findByIdAndDelete(req.params.id);

  res.status(200).json({ message: 'Listing deleted successfully.' });
});

// GET /api/listings/geocode?q=  (any authenticated user)
export const geocodeSearch = asyncHandler(async (req: Request, res: Response) => {
  const { q } = req.query as { q?: string };
  if (!q || !q.trim()) {
    res.status(400).json({ message: 'Query parameter q is required.' });
    return;
  }

  const result = await geocodeAddressDetailed(q.trim());
  res.status(200).json(result);
});
