import { Router } from 'express';
import multer from 'multer';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { upload } from '../services/uploadService.js';
import { validateComplaint } from '../middleware/validateComplaint.js';
import {
  createComplaint,
  listComplaints,
  getComplaintById,
  getStats,
} from '../controllers/complaintController.js';

const mapMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    const message =
      err.code === 'LIMIT_FILE_SIZE'
        ? 'Image exceeds the 8 MB limit'
        : `Upload error: ${err.message}`;
    return next(new ApiError(400, message));
  }
  next(err);
};

const router = Router();

router.get('/stats', asyncHandler(getStats));
router.get('/', asyncHandler(listComplaints));
router.get('/:id', asyncHandler(getComplaintById));
router.post(
  '/',
  upload.single('photo'),
  mapMulterError,
  validateComplaint,
  asyncHandler(createComplaint)
);

export default router;
