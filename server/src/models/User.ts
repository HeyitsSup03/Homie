import mongoose, { Document, Schema } from 'mongoose';

export type UserRole = 'owner' | 'seeker';

export interface IUser extends Document {
  name: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  phone?: string;
  resumeUrl?: string;
  bio?: string;
  occupation?: string;
  createdAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: {
      type: String,
      required: [true, 'Password is required'],
      select: false, // never returned by default in any query
    },
    role: {
      type: String,
      enum: ['owner', 'seeker'],
      required: [true, 'Role is required'],
      default: 'seeker',
    },
    phone: {
      type: String,
      trim: true,
    },
    resumeUrl: {
      type: String,
      trim: true,
    },
    bio: {
      type: String,
      trim: true,
      maxlength: 500,
    },
    occupation: {
      type: String,
      trim: true,
      maxlength: 100,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

const User = mongoose.model<IUser>('User', userSchema);
export default User;
