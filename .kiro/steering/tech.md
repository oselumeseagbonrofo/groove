# Tech Stack & Build System

## Frontend

- **Framework**: Next.js 16 (App Router)
- **React**: 19.2
- **Styling**: Tailwind CSS 4
- **Fonts**: Geist (via next/font)
- **Testing**: Jest + React Testing Library

## Backend

- **Runtime**: Node.js (ES Modules)
- **Framework**: Express.js 4
- **Database**: Supabase (PostgreSQL + Auth + Storage)
- **Testing**: Jest + fast-check (property-based testing)

## External APIs

- Spotify Web API (OAuth 2.0)

## Code Quality

- ESLint for linting
- Prettier for formatting

## Common Commands

### Frontend (run from `frontend/`)

```bash
npm run dev      # Start dev server (localhost:3000)
npm run build    # Production build
npm run lint     # Run ESLint
npm test         # Run tests in watch mode
npm run test:run # Run tests once
```

### Backend (run from `backend/`)

```bash
npm run dev      # Start dev server with auto-reload (localhost:3001)
npm start        # Production server
npm run lint     # Run ESLint
npm run format   # Format with Prettier
npm test         # Run tests
npm run db:verify # Verify database setup
```

## Environment Configuration

- Frontend: Uses `NEXT_PUBLIC_` prefix for client-side env vars
- Backend: Uses `.env` file (copy from `.env.example`)

## Code Style

- 2-space indentation
- Single quotes
- Semicolons required
- ES Modules (`import`/`export`)
- Unix line endings
- NextJS components
