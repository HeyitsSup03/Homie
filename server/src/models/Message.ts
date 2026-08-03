import mongoose, { Document, Schema } from 'mongoose';

export interface IMessage extends Document {
  interest: mongoose.Types.ObjectId;
  sender: mongoose.Types.ObjectId;
  recipient: mongoose.Types.ObjectId;
  text: string;
  createdAt: Date;
  updatedAt: Date;
}

const messageSchema = new Schema<IMessage>(
  {
    interest: {
      type: Schema.Types.ObjectId,
      ref: 'Interest',
      required: true,
    },
    sender: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    recipient: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    text: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2000,
    },
  },
  { timestamps: true }
);

// Index for fast chronological message retrieval per interest thread
messageSchema.index({ interest: 1, createdAt: 1 });

const Message = mongoose.model<IMessage>('Message', messageSchema);
export default Message;
