/**
 * Property-Based Testing Configuration
 * 
 * This configuration is used across all property-based tests
 * to ensure consistent test execution with minimum 100 iterations.
 */

export const PBT_CONFIG = {
  numRuns: 100,
  verbose: true,
  seed: Date.now()
};

/**
 * Example usage in a property test:
 * 
 * import fc from 'fast-check';
 * import { PBT_CONFIG } from './pbt.config';
 * 
 * describe('Property Tests', () => {
 *   it('Property X: Description', () => {
 *     fc.assert(
 *       fc.property(
 *         fc.integer({ min: 0, max: 100 }),
 *         (value) => {
 *           // Test logic here
 *           return true;
 *         }
 *       ),
 *       PBT_CONFIG
 *     );
 *   });
 * });
 */
