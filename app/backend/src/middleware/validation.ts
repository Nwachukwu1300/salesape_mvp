import { body, param, query, validationResult } from 'express-validator';
import type { Request, Response, NextFunction } from 'express';

/**
 * Centralized validation rules and middleware for express-validator
 * Prevents common vulnerabilities and enforces data consistency
 */

/**
 * Validation error handler middleware
 */
export const validationErrorHandler = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation failed',
      details: errors.array().map(err => ({
        field: err.type === 'field' ? (err as any).path : 'unknown',
        message: err.msg,
      })),
    });
  }
  next();
};

/**
 * Authentication validation rules
 */
export const authValidation = {
  register: [
    body('email')
      .isEmail()
      .normalizeEmail()
      .withMessage('Invalid email address'),
    body('password')
      .isLength({ min: 8 })
      .withMessage('Password must be at least 8 characters'),
    body('name')
      .trim()
      .notEmpty()
      .withMessage('Name is required')
      .isLength({ max: 255 })
      .withMessage('Name must be less than 255 characters'),
  ],

  login: [
    body('email')
      .isEmail()
      .normalizeEmail()
      .withMessage('Invalid email address'),
    body('password')
      .notEmpty()
      .withMessage('Password is required'),
  ],
};

/**
 * Business validation rules
 */
export const businessValidation = {
  create: [
    body('url')
      .isURL()
      .withMessage('Invalid URL format'),
    body('name')
      .optional()
      .trim()
      .isLength({ max: 255 })
      .withMessage('Name must be less than 255 characters'),
    body('description')
      .optional()
      .trim()
      .isLength({ max: 5000 })
      .withMessage('Description must be less than 5000 characters'),
  ],

  idParam: [
    param('id')
      .isLength({ min: 1 })
      .withMessage('Business ID is required'),
  ],
};

/**
 * Lead validation rules
 */
export const leadValidation = {
  create: [
    param('businessId')
      .isLength({ min: 1 })
      .withMessage('Business ID is required'),
    body('name')
      .trim()
      .notEmpty()
      .withMessage('Name is required')
      .isLength({ max: 255 })
      .withMessage('Name must be less than 255 characters'),
    body('email')
      .isEmail()
      .normalizeEmail()
      .withMessage('Invalid email address'),
    body('company')
      .optional()
      .trim()
      .isLength({ max: 255 })
      .withMessage('Company must be less than 255 characters'),
    body('message')
      .optional()
      .trim()
      .isLength({ max: 5000 })
      .withMessage('Message must be less than 5000 characters'),
  ],

  update: [
    param('businessId')
      .isLength({ min: 1 })
      .withMessage('Business ID is required'),
    param('leadId')
      .isLength({ min: 1 })
      .withMessage('Lead ID is required'),
    body('status')
      .isIn(['new', 'contacted', 'converted', 'declined'])
      .withMessage('Invalid status'),
  ],

  filter: [
    param('businessId')
      .isLength({ min: 1 })
      .withMessage('Business ID is required'),
    query('status')
      .optional()
      .isIn(['new', 'contacted', 'converted', 'declined'])
      .withMessage('Invalid status filter'),
  ],
};

/**
 * Booking validation rules
 */
export const bookingValidation = {
  create: [
    param('businessId')
      .isLength({ min: 1 })
      .withMessage('Business ID is required'),
    body('name')
      .trim()
      .notEmpty()
      .withMessage('Name is required'),
    body('email')
      .isEmail()
      .normalizeEmail()
      .withMessage('Invalid email address'),
    body('date')
      .isISO8601()
      .withMessage('Invalid date format'),
    body('time')
      .matches(/^\d{2}:\d{2}$/)
      .withMessage('Invalid time format (HH:mm)'),
  ],
};

/**
 * Email sequence validation rules
 */
export const emailSequenceValidation = {
  create: [
    param('businessId')
      .isLength({ min: 1 })
      .withMessage('Business ID is required'),
    body('name')
      .trim()
      .notEmpty()
      .withMessage('Name is required')
      .isLength({ max: 255 })
      .withMessage('Name must be less than 255 characters'),
    body('subject')
      .trim()
      .notEmpty()
      .withMessage('Subject is required')
      .isLength({ max: 255 })
      .withMessage('Subject must be less than 255 characters'),
    body('body')
      .trim()
      .notEmpty()
      .withMessage('Body is required')
      .isLength({ max: 10000 })
      .withMessage('Body must be less than 10000 characters'),
    body('triggerEvent')
      .isIn(['lead_created', 'booking_created', 'lead_contacted', 'lead_converted', 'lead_declined'])
      .withMessage('Invalid trigger event'),
    body('delayMinutes')
      .optional()
      .isInt({ min: 0, max: 10080 })
      .withMessage('Delay must be between 0 and 10080 minutes'),
  ],
};

/**
 * Website validation rules
 */
export const websiteValidation = {
  scrape: [
    body('url')
      .isURL()
      .withMessage('Invalid URL format'),
  ],

  analyze: [
    body('description')
      .optional()
      .trim()
      .isLength({ max: 5000 })
      .withMessage('Description must be less than 5000 characters'),
  ],
};
