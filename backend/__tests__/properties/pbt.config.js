/**
 * Property-Based Testing Configuration for Backend
 * 
 * This configuration is used across all property-based tests
 * to ensure consistent test execution with minimum 100 iterations.
 */

export const PBT_CONFIG = {
  numRuns: 100,
  verbose: true,
  seed: Date.now()
};
