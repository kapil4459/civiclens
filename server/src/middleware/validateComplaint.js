import { badRequest } from '../utils/ApiError.js';

/**
 * Validates complaint submission fields.
 * NOTE: category/severity are deliberately NOT accepted from the client —
 * they are assigned by the AI pipeline, never trusted from user input.
 */
export const validateComplaint = (req, res, next) => {
  const { description, originalLanguage, location } = req.body || {};
  const errors = [];

  if (typeof description !== 'string' || description.trim().length < 10) {
    errors.push('description must be a string of at least 10 characters');
  } else if (description.length > 5000) {
    errors.push('description must be under 5000 characters');
  }

  if (originalLanguage !== undefined && (typeof originalLanguage !== 'string' || originalLanguage.length > 50)) {
    errors.push('originalLanguage must be a string under 50 characters');
  }

  if (location !== undefined && (typeof location !== 'string' || location.length > 300)) {
    errors.push('location must be a string under 300 characters');
  }

  if (errors.length) {
    return next(badRequest('Invalid complaint submission', errors));
  }
  next();
};
