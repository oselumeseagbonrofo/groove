/**
 * API utility functions with rate limit handling
 * Requirements: 7.5
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

/**
 * Custom error class for API errors
 */
export class ApiError extends Error {
  constructor(message, status, retryAfter = null, retryable = false) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.retryAfter = retryAfter;
    this.retryable = retryable;
  }
}

/**
 * Parse error response from API
 * @param {Response} response - Fetch response object
 * @returns {Promise<ApiError>} - Parsed API error
 */
async function parseErrorResponse(response) {
  let message = 'An error occurred';
  let retryable = false;
  let retryAfter = null;

  try {
    const data = await response.json();
    message = data.error?.message || message;
    retryable = data.error?.retryable || false;
    retryAfter = data.error?.retryAfter || null;
  } catch {
    // If JSON parsing fails, use status text
    message = response.statusText || message;
  }

  // Check for Retry-After header
  if (response.status === 429) {
    retryAfter = parseInt(response.headers.get('Retry-After') || '30', 10);
    retryable = true;
  }

  return new ApiError(message, response.status, retryAfter, retryable);
}

/**
 * Make an API request with error handling
 * @param {string} endpoint - API endpoint (relative to base URL)
 * @param {Object} options - Fetch options
 * @returns {Promise<Response>} - Fetch response
 */
export async function apiRequest(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
  };

  const response = await fetch(url, {
    ...defaultOptions,
    ...options,
    headers: {
      ...defaultOptions.headers,
      ...options.headers,
    },
  });

  // Return response for rate limit handling to process
  return response;
}

/**
 * Make an API request and parse JSON response
 * Throws ApiError for non-ok responses
 * @param {string} endpoint - API endpoint
 * @param {Object} options - Fetch options
 * @returns {Promise<Object>} - Parsed JSON response
 */
export async function apiJson(endpoint, options = {}) {
  const response = await apiRequest(endpoint, options);

  if (!response.ok) {
    throw await parseErrorResponse(response);
  }

  return response.json();
}

/**
 * Check if an error is a rate limit error
 * @param {Error} error - Error to check
 * @returns {boolean} - True if rate limit error
 */
export function isRateLimitError(error) {
  return error?.status === 429 || error?.message?.includes('429');
}

/**
 * Check if an error is retryable
 * @param {Error} error - Error to check
 * @returns {boolean} - True if retryable
 */
export function isRetryableError(error) {
  if (error instanceof ApiError) {
    return error.retryable;
  }
  // Network errors are generally retryable
  return error?.name === 'TypeError' || error?.message?.includes('network');
}

const api = {
  apiRequest,
  apiJson,
  ApiError,
  isRateLimitError,
  isRetryableError,
};

export default api;
