import mongoose, { Schema, Document } from 'mongoose';

export interface IClass extends Document {
  name: string;
  teacherId: mongoose.Types.ObjectId;
  /** Number of students currently enrolled (denormalised from Student). */
  totalStudents: number;
  /** Maximum number of students allowed to enroll. */
  capacity: number;
  /** Whether students may still self-register for this course. */
  enrollmentOpen: boolean;
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
      min: 0,
    },
    capacity: {
      type: Number,
      default: 60,
      min: 1,
    },
    enrollmentOpen: {
      type: Boolean,
      default: true,
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

// A teacher cannot own two courses with the same name
ClassSchema.index({ teacherId: 1, name: 1 }, { unique: true });

export default mongoose.models.Class || mongoose.model<IClass>('Class', ClassSchema);
