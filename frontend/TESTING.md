# Testing Configuration

This document describes the testing setup for the Groove frontend application.

## Testing Stack

- **Jest**: JavaScript testing framework
- **React Testing Library**: Component testing utilities
- **fast-check**: Property-based testing library

## Running Tests

```bash
# Run tests in watch mode (for development)
npm test

# Run tests once (for CI/CD)
npm run test:run
```

## Test Structure

```
frontend/
├── __tests__/
│   ├── unit/
│   │   ├── components/     # Component unit tests
│   │   └── hooks/          # Hook unit tests
│   ├── properties/         # Property-based tests
│   │   └── pbt.config.js   # PBT configuration
│   └── setup.test.js       # Setup verification tests
├── jest.config.js          # Jest configuration
└── jest.setup.js           # Jest setup file
```

## Property-Based Testing

All property-based tests use the configuration from `__tests__/properties/pbt.config.js`:

- **numRuns**: 100 (minimum iterations per property test)
- **verbose**: true (detailed output)
- **seed**: Date.now() (reproducible test runs)

### Property Test Format

Each property-based test must include a comment referencing the correctness property:

```javascript
/**
 * **Feature: vinyl-spotify-player, Property X: Property Name**
 * Description of the property being tested
 */
it('should satisfy property X', () => {
  fc.assert(
    fc.property(
      // generators
      (value) => {
        // test logic
        return true;
      }
    ),
    PBT_CONFIG
  );
});
```

## Custom Tailwind Colors

The following custom colors are available for use in components:

- `purple-dark`: #2D1B4E (dark purple for gradients)
- `purple-medium`: #4A2C6D (medium purple)
- `lavender`: #B8A4D4 (lavender for gradients)
- `pink-light`: #F5E6E8 (light pink/cream background)
- `pink-medium`: #E8C5D0 (medium pink)
- `teal-primary`: #00BCD4 (primary action buttons)
- `cream`: #FFF8F0 (cream background)

### Usage Example

```jsx
<button className="bg-teal-primary text-white">
  Create Playlist
</button>

<div className="bg-gradient-to-r from-purple-dark to-lavender">
  Welcome Screen
</div>
```

## Next.js App Router

The project uses Next.js App Router structure:

- `app/` - Application routes and pages
- `app/layout.js` - Root layout component
- `app/page.js` - Home page
- `app/globals.css` - Global styles with Tailwind

## Configuration Files

- `jest.config.js` - Jest configuration with Next.js integration
- `jest.setup.js` - Jest setup with Testing Library matchers
- `next.config.mjs` - Next.js configuration
- `postcss.config.mjs` - PostCSS configuration for Tailwind CSS v4
- `app/globals.css` - Global styles with custom Tailwind theme
