import mongoose, { Schema, Document } from 'mongoose';

export interface IStudentAttendance extends Document {
  studentId: mongoose.Types.ObjectId;
  subject: string;
  attended: number;
  total: number;
  history: {
    date: string;
    status: 'Present' | 'Absent' | 'Leave';
  }[];
  createdAt: Date;
  updatedAt: Date;
}

const StudentAttendanceSchema = new Schema<IStudentAttendance>(
  {
    studentId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    subject: {
      type: String,
      required: true,
    },
    attended: {
      type: Number,
      default: 0,
    },
    total: {
      type: Number,
      default: 0,
    },
    history: [
      {
        date: String,
        status: {
          type: String,
          enum: ['Present', 'Absent', 'Leave'],
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Create compound index for efficient queries
StudentAttendanceSchema.index({ studentId: 1, subject: 1 }, { unique: true });

export default mongoose.models.StudentAttendance || mongoose.model<IStudentAttendance>('StudentAttendance', StudentAttendanceSchema);
