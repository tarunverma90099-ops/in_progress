import mongoose, { Schema, Document } from 'mongoose';

export interface ISession extends Document {
  classId: mongoose.Types.ObjectId;
  teacherId: mongoose.Types.ObjectId;
  qrData: string;
  qrExpiresAt: Date;
  sessionExpiresAt: Date;
  isActive: boolean;
  scannedStudents: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const SessionSchema = new Schema<ISession>(
  {
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
    qrData: {
      type: String,
    },
    qrExpiresAt: {
      type: Date,
    },
    sessionExpiresAt: {
      type: Date,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    scannedStudents: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Session || mongoose.model<ISession>('Session', SessionSchema);
