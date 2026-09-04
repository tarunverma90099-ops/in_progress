import mongoose, { Schema, Document } from 'mongoose';

export interface IStudent extends Document {
  userId: mongoose.Types.ObjectId;
  classId: mongoose.Types.ObjectId;
  name: string;
  rollNo: number;
  email: string;
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
      required: true,
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

export default mongoose.models.Student || mongoose.model<IStudent>('Student', StudentSchema);
