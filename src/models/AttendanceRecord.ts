import mongoose, { Schema, Document } from 'mongoose';

export interface IAttendanceRecord extends Document {
  studentId: mongoose.Types.ObjectId;
  classId: mongoose.Types.ObjectId;
  date: string;
  status: 'Present' | 'Absent' | 'Leave';
  createdAt: Date;
  updatedAt: Date;
}

const AttendanceRecordSchema = new Schema<IAttendanceRecord>(
  {
    studentId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    classId: {
      type: Schema.Types.ObjectId,
      ref: 'Class',
      required: true,
    },
    date: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['Present', 'Absent', 'Leave'],
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Create compound index for efficient queries
AttendanceRecordSchema.index({ studentId: 1, classId: 1, date: 1 }, { unique: true });

export default mongoose.models.AttendanceRecord || mongoose.model<IAttendanceRecord>('AttendanceRecord', AttendanceRecordSchema);
