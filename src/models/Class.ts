import mongoose, { Schema, Document } from 'mongoose';

export interface IClass extends Document {
  name: string;
  teacherId: mongoose.Types.ObjectId;
  totalStudents: number;
  sessionHistory: {
    date: string;
    present: number;
  }[];
  createdAt: Date;
  updatedAt: Date;
}

const ClassSchema = new Schema<IClass>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    teacherId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    totalStudents: {
      type: Number,
      default: 0,
    },
    sessionHistory: [
      {
        date: String,
        present: Number,
      },
    ],
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Class || mongoose.model<IClass>('Class', ClassSchema);
