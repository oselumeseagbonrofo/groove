'use client';

import React from 'react';

/**
 * ErrorFallback component - displays user-friendly error message
 * Requirements: 7.1
 * @param {Object} props - Component props
 * @param {Error} props.error - The error that was caught
 * @param {Function} props.onRetry - Callback to retry the failed operation
 * @param {boolean} props.retryable - Whether the error is retryable
 */
function ErrorFallback({ error, onRetry, retryable = true }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[200px] p-6 bg-gradient-to-b from-purple-900/20 to-pink-900/20 rounded-lg">
      <div className="text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-500/20 flex items-center justify-center">
          <svg
            className="w-8 h-8 text-red-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>
        <h2 className="text-xl font-semibold text-white mb-2">
          Something went wrong
        </h2>
        <p className="text-gray-300 mb-4 max-w-md">
          {error?.message || 'An unexpected error occurred. Please try again.'}
        </p>
        {retryable && onRetry && (
          <button
            onClick={onRetry}
            className="px-6 py-2 bg-teal-500 hover:bg-teal-600 text-white rounded-full transition-colors font-medium"
          >
            Try Again
          </button>
        )}
      </div>
    </div>
  );
}


/**
 * ErrorBoundary class component - catches component-level errors
 * Requirements: 7.1
 * 
 * Usage:
 * <ErrorBoundary fallback={<CustomFallback />}>
 *   <YourComponent />
 * </ErrorBoundary>
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Log error to console for debugging
    console.error('ErrorBoundary caught an error:', error, errorInfo);

    // Call optional onError callback
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
    
    // Call optional onRetry callback
    if (this.props.onRetry) {
      this.props.onRetry();
    }
  };

  render() {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Use default ErrorFallback
      return (
        <ErrorFallback
          error={this.state.error}
          onRetry={this.handleRetry}
          retryable={this.props.retryable !== false}
        />
      );
    }

    return this.props.children;
  }
}

export { ErrorFallback };
export default ErrorBoundary;
