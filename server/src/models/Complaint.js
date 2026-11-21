import mongoose from 'mongoose';
import { CATEGORIES, SEVERITIES, STATUSES } from '../config/constants.js';

const complaintSchema = new mongoose.Schema(
  {
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
      minlength: [10, 'Description must be at least 10 characters'],
      maxlength: [5000, 'Description must be under 5000 characters'],
    },
    location: {
      type: String,
      trim: true,
      default: null,
      maxlength: [300, 'Location must be under 300 characters'],
    },
    originalLanguage: {
      type: String,
      trim: true,
      default: 'en',
      maxlength: 50,
    },
    imageUrl: { type: String, default: null },
    imagePublicId: { type: String, default: null }, // Cloudinary public id for cleanup
    category: {
      type: String,
      enum: { values: CATEGORIES, message: '{VALUE} is not a valid category' },
      default: null,
    },
    severity: {
      type: String,
      enum: { values: SEVERITIES, message: '{VALUE} is not a valid severity' },
      default: null,
    },
    reason: { type: String, default: null }, // AI severity justification
    confidence: { type: Number, default: null, min: 0, max: 1 }, // AI certainty 0-1
    reviewReason: { type: String, default: null }, // why ticket needs human review
    department: { type: String, default: null },
    status: {
      type: String,
      enum: { values: STATUSES, message: '{VALUE} is not a valid status' },
      default: 'Pending',
      index: true,
    },
  },
  { timestamps: true }
);

complaintSchema.index({ severity: 1, createdAt: -1 });
complaintSchema.index({ category: 1 });
complaintSchema.index({ description: 'text' });

export default mongoose.model('Complaint', complaintSchema);
