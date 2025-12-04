import { supabase } from '../config/supabase.js';

/**
 * Error types with their configurations
 * Requirements: 7.3
 */
export const ErrorTypes = {
  AUTH_EXPIRED: { statusCode: 401, retryable: false },
  AUTH_FAILED: { statusCode: 401, retryable: true },
  API_UNAVAILABLE: { statusCode: 503, retryable: true },
  NETWORK_ERROR: { statusCode: 0, retryable: true },
  RATE_LIMITED: { statusCode: 429, retryable: true },
  INVALID_IMAGE: { statusCode: 400, retryable: false },
  PLAYLIST_CREATE_FAILED: { statusCode: 500, retryable: true },
  VALIDATION_ERROR: { statusCode: 400, retryable: false },
  NOT_FOUND: { statusCode: 404, retryable: false },
  INTERNAL_ERROR: { statusCode: 500, retryable: true }
};

/**
 * Custom application error class
 */
export class AppError extends Error {
  constructor(message, code = 'INTERNAL_ERROR', statusCode = 500, retryable = false) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.statusCode = statusCode;
    this.retryable = retryable;
  }

  static fromType(type, message) {
    const config = ErrorTypes[type] || ErrorTypes.INTERNAL_ERROR;
    return new AppError(message, type, config.statusCode, config.retryable);
  }
}

/**
 * Log error to Supabase error_logs table
 * Requirements: 7.3
 * @param {Object} errorData - Error details to log
 * @returns {Promise<boolean>} - Success status
 */
export async function logErrorToSupabase(errorData) {
  try {
    const { error } = await supabase.from('error_logs').insert({
      user_id: errorData.userId || null,
      error_type: errorData.errorType || 'UNKNOWN',
      error_message: errorData.message || 'Unknown error',
      stack_trace: errorData.stack || null,
      request_path: errorData.requestPath || null,
      created_at: new Date().toISOString()
    });

    if (error) {
      console.error('Failed to log error to Supabase:', error);
      return false;
    }
    return true;
  } catch (err) {
    console.error('Error logging to Supabase:', err);
    return false;
  }
}


/**
 * Express error handling middleware
 * Logs errors to Supabase and returns appropriate error responses
 * Requirements: 7.3
 */
export function errorHandler(err, req, res, next) {
  // Extract user ID from request if available
  const userId = req.user?.id || req.body?.userId || req.query?.userId || null;

  // Determine error details
  const errorType = err.code || 'INTERNAL_ERROR';
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal server error';
  const retryable = err.retryable !== undefined ? err.retryable : true;

  // Log error to Supabase (async, don't wait)
  logErrorToSupabase({
    userId,
    errorType,
    message,
    stack: err.stack,
    requestPath: req.path
  }).catch(logErr => {
    console.error('Background error logging failed:', logErr);
  });

  // Log to console for debugging
  console.error(`[${errorType}] ${message}`, {
    path: req.path,
    method: req.method,
    statusCode
  });

  // Return error response
  res.status(statusCode).json({
    error: {
      message,
      code: errorType,
      retryable,
      ...(retryable && { retryAfter: calculateRetryAfter(errorType) })
    }
  });
}

/**
 * Calculate retry delay based on error type
 * @param {string} errorType - The type of error
 * @returns {number|undefined} - Retry delay in seconds
 */
function calculateRetryAfter(errorType) {
  switch (errorType) {
    case 'RATE_LIMITED':
      return 30; // 30 seconds for rate limits
    case 'API_UNAVAILABLE':
      return 10; // 10 seconds for service unavailable
    case 'NETWORK_ERROR':
      return 5; // 5 seconds for network errors
    default:
      return 3; // 3 seconds default
  }
}

/**
 * Async handler wrapper to catch errors in async route handlers
 * @param {Function} fn - Async route handler function
 * @returns {Function} - Wrapped handler that catches errors
 */
export function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

/**
 * Not found handler for undefined routes
 */
export function notFoundHandler(req, res, next) {
  const error = AppError.fromType('NOT_FOUND', `Route ${req.method} ${req.path} not found`);
  next(error);
}

export default errorHandler;
