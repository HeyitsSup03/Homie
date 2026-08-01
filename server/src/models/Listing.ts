import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IListing extends Document {
  owner: Types.ObjectId;
  title: string;
  rent: number;
  description?: string;
  amenities: string[];
  address: string;
  location: {
    type: 'Point';
    coordinates: [number, number]; // [longitude, latitude]
  };
  isAvailable: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ListingSchema = new Schema<IListing>(
  {
    owner: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    rent: {
      type: Number,
      required: true,
      min: 0,
    },
    description: {
      type: String,
      trim: true,
    },
    amenities: {
      type: [String],
      default: [],
    },
    address: {
      type: String,
      required: true,
      trim: true,
    },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        required: true,
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: true,
      },
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// 2dsphere index — required for $near / $geoWithin queries in Phase 3
ListingSchema.index({ location: '2dsphere' });

export default mongoose.model<IListing>('Listing', ListingSchema);
