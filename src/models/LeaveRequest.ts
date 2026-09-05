import mongoose, { Schema, Document } from 'mongoose';

export interface ILeaveRequest extends Document {
  studentId: mongoose.Types.ObjectId;
  studentName: string;
  rollNo: number;
  subject: string;
  date: string;
  reason: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  classId: mongoose.Types.ObjectId;
  teacherId: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const LeaveRequestSchema = new Schema<ILeaveRequest>(
  {
    studentId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    studentName: {
      type: String,
      required: true,
    },
    rollNo: {
      type: Number,
      required: true,
    },
    subject: {
      type: String,
      required: true,
    },
    date: {
      type: String,
      required: true,
    },
    reason: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['Pending', 'Approved', 'Rejected'],
      default: 'Pending',
    },
    classId: {
      type: Schema.Types.ObjectId,
      ref: 'Class',
      required: true,
    },
    teacherId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.LeaveRequest || mongoose.model<ILeaveRequest>('LeaveRequest', LeaveRequestSchema);
