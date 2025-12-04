/**
 * Jest configuration for backend property-based testing
 */
export default {
  testEnvironment: 'node',
  transform: {},
  testMatch: [
    '**/__tests__/**/*.test.js',
    '**/__tests__/**/*.properties.test.js'
  ],
  collectCoverageFrom: [
    'routes/**/*.js',
    'services/**/*.js',
    '!**/node_modules/**'
  ],
  moduleFileExtensions: ['js', 'json'],
  verbose: true
};
