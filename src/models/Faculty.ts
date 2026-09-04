import mongoose, { Schema, Document } from 'mongoose';

export interface IFaculty extends Document {
  userId: mongoose.Types.ObjectId;
  name: string;
  email: string;
  department: string;
  status: 'active' | 'leave';
  photo: string;
  subjects: string[];
  attendance: string;
  lastAttendance?: {
    subject: string;
    year: string;
    branch: string;
    timestamp: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const FacultySchema = new Schema<IFaculty>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    department: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['active', 'leave'],
      default: 'active',
    },
    photo: {
      type: String,
      default: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR0mpEAFXv-iIa50q5rA2L6nnHGy_akXDFyQQ&s',
    },
    subjects: [
      {
        type: String,
      },
    ],
    attendance: {
      type: String,
      default: '100%',
    },
    lastAttendance: {
      subject: String,
      year: String,
      branch: String,
      timestamp: String,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Faculty || mongoose.model<IFaculty>('Faculty', FacultySchema);
