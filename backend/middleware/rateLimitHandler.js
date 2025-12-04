import { supabase } from '../config/supabase.js';

/**
 * Simple in-memory rate limiter
 * In production, use Redis or similar for distributed rate limiting
 * Requirements: 7.5
 */
const rateLimitStore = new Map();

// Clean up old entries every minute
setInterval(() => {
  const now = Date.now();
  for (const [key, data] of rateLimitStore.entries()) {
    if (now > data.resetTime) {
      rateLimitStore.delete(key);
    }
  }
}, 60000);

/**
 * Rate limit configuration
 */
const RATE_LIMIT_CONFIG = {
  windowMs: 60000, // 1 minute window
  maxRequests: 100, // Max requests per window
  retryAfterSeconds: 30 // Retry-After header value
};

/**
 * Get rate limit key from request
 * @param {Object} req - Express request object
 * @returns {string} - Rate limit key
 */
function getRateLimitKey(req) {
  // Use user ID if authenticated, otherwise use IP
  const userId = req.user?.id || req.body?.userId || req.query?.userId;
  if (userId) {
    return `user:${userId}`;
  }
  
  // Fall back to IP address
  const ip = req.ip || 
    req.headers['x-forwarded-for']?.split(',')[0] || 
    req.connection?.remoteAddress ||
    'unknown';
  return `ip:${ip}`;
}

/**
 * Check if request is rate limited
 * @param {string} key - Rate limit key
 * @returns {Object} - Rate limit status
 */
function checkRateLimit(key) {
  const now = Date.now();
  const data = rateLimitStore.get(key);

  if (!data || now > data.resetTime) {
    // Create new window
    rateLimitStore.set(key, {
      count: 1,
      resetTime: now + RATE_LIMIT_CONFIG.windowMs
    });
    return { limited: false, remaining: RATE_LIMIT_CONFIG.maxRequests - 1 };
  }

  // Increment count
  data.count++;
  
  if (data.count > RATE_LIMIT_CONFIG.maxRequests) {
    return {
      limited: true,
      remaining: 0,
      retryAfter: Math.ceil((data.resetTime - now) / 1000)
    };
  }

  return {
    limited: false,
    remaining: RATE_LIMIT_CONFIG.maxRequests - data.count
  };
}

/**
 * Rate limit middleware
 * Requirements: 7.5
 */
export function rateLimitMiddleware(req, res, next) {
  const key = getRateLimitKey(req);
  const result = checkRateLimit(key);

  // Set rate limit headers
  res.set('X-RateLimit-Limit', RATE_LIMIT_CONFIG.maxRequests.toString());
  res.set('X-RateLimit-Remaining', result.remaining.toString());

  if (result.limited) {
    res.set('Retry-After', (result.retryAfter || RATE_LIMIT_CONFIG.retryAfterSeconds).toString());
    
    // Log rate limit event
    logRateLimitEvent(key, req.path).catch(err => {
      console.error('Failed to log rate limit event:', err);
    });

    return res.status(429).json({
      error: {
        message: 'Too many requests. Please wait before trying again.',
        code: 'RATE_LIMITED',
        retryable: true,
        retryAfter: result.retryAfter || RATE_LIMIT_CONFIG.retryAfterSeconds
      }
    });
  }

  next();
}

/**
 * Log rate limit event to Supabase
 * @param {string} key - Rate limit key
 * @param {string} path - Request path
 */
async function logRateLimitEvent(key, path) {
  try {
    await supabase.from('error_logs').insert({
      error_type: 'RATE_LIMITED',
      error_message: `Rate limit exceeded for ${key}`,
      request_path: path,
      created_at: new Date().toISOString()
    });
  } catch (error) {
    console.error('Failed to log rate limit to Supabase:', error);
  }
}

export default rateLimitMiddleware;
