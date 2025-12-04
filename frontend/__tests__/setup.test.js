/**
 * Setup verification tests
 * These tests verify that Jest, React Testing Library, and fast-check are properly configured
 */

import { render, screen } from '@testing-library/react';
import fc from 'fast-check';
import { PBT_CONFIG } from './properties/pbt.config';

describe('Test Environment Setup', () => {
  describe('Jest and React Testing Library', () => {
    it('should render a simple component', () => {
      const TestComponent = () => <div>Hello Test</div>;
      render(<TestComponent />);
      expect(screen.getByText('Hello Test')).toBeInTheDocument();
    });
  });

  describe('fast-check Property-Based Testing', () => {
    it('should run property-based tests with configured iterations', () => {
      let executionCount = 0;
      
      fc.assert(
        fc.property(
          fc.integer(),
          (value) => {
            executionCount++;
            return typeof value === 'number';
          }
        ),
        PBT_CONFIG
      );
      
      // Verify it ran at least 100 times as configured
      expect(executionCount).toBeGreaterThanOrEqual(100);
    });

    it('should generate valid test data', () => {
      fc.assert(
        fc.property(
          fc.string(),
          fc.integer({ min: 0, max: 100 }),
          fc.boolean(),
          (str, num, bool) => {
            return (
              typeof str === 'string' &&
              typeof num === 'number' &&
              num >= 0 &&
              num <= 100 &&
              typeof bool === 'boolean'
            );
          }
        ),
        PBT_CONFIG
      );
    });
  });
});
