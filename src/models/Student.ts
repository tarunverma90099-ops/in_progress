import mongoose, { Schema, Document } from 'mongoose';

export interface IStudent extends Document {
  userId?: mongoose.Types.ObjectId | null;
  classId: mongoose.Types.ObjectId;
  name: string;
  rollNo: number;
  email?: string;
  attended: number;
  total: number;
  createdAt: Date;
  updatedAt: Date;
}

const StudentSchema = new Schema<IStudent>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    classId: {
      type: Schema.Types.ObjectId,
      ref: 'Class',
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    rollNo: {
      type: Number,
      required: true,
    },
    email: {
      type: String,
    },
    attended: {
      type: Number,
      default: 0,
    },
    total: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// A roll number must be unique within a class
StudentSchema.index({ classId: 1, rollNo: 1 }, { unique: true });
// A user account can only be enrolled once per class
StudentSchema.index(
  { classId: 1, userId: 1 },
  { unique: true, partialFilterExpression: { userId: { $type: 'objectId' } } }
);
// Fast lookup of "which courses is this user enrolled in?"
StudentSchema.index({ userId: 1 });

export default mongoose.models.Student || mongoose.model<IStudent>('Student', StudentSchema);
