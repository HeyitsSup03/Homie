import mongoose, { Document, Schema } from 'mongoose';

export type InterestStatus = 'pending' | 'accepted' | 'declined';

export interface IInterest extends Document {
  listing: mongoose.Types.ObjectId;
  seeker: mongoose.Types.ObjectId;
  owner: mongoose.Types.ObjectId;
  status: InterestStatus;
  message?: string;
  createdAt: Date;
  updatedAt: Date;
}

const interestSchema = new Schema<IInterest>(
  {
    listing: {
      type: Schema.Types.ObjectId,
      ref: 'Listing',
      required: true,
    },
    seeker: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'declined'],
      default: 'pending',
    },
    message: {
      type: String,
      trim: true,
      maxlength: 500,
    },
  },
  { timestamps: true }
);

// Prevent duplicate interest — a seeker can only express interest in a listing once
interestSchema.index({ listing: 1, seeker: 1 }, { unique: true });

const Interest = mongoose.model<IInterest>('Interest', interestSchema);
export default Interest;
