# Project Structure

Monorepo with separate frontend and backend directories.

```
groove/
├── frontend/          # Next.js web application
│   ├── app/           # App Router pages and layouts
│   │   ├── components/  # Shared React components
│   │   ├── hooks/       # Custom React hooks
│   │   ├── gallery/     # Playlist gallery page
│   │   ├── home/        # Home page
│   │   └── welcome/     # Auth welcome page
│   ├── __tests__/     # Test files
│   │   ├── unit/        # Unit tests (components, hooks)
│   │   └── properties/  # Property-based tests
│   └── public/        # Static assets
│
├── backend/           # Express.js API server
│   ├── config/        # Configuration (Supabase client)
│   ├── routes/        # API route handlers
│   ├── services/      # Business logic, external APIs
│   ├── middleware/    # Express middleware
│   ├── migrations/    # SQL database migrations
│   ├── scripts/       # Setup and utility scripts
│   └── __tests__/     # Test files
│
└── .kiro/             # Kiro configuration
    ├── specs/         # Feature specifications
    └── steering/      # AI guidance rules
```

## Conventions

- **Components**: PascalCase, one component per file, JSDoc comments with requirement references
- **Hooks**: camelCase with `use` prefix (e.g., `useAuth.js`)
- **Routes**: Lowercase, organized by resource (e.g., `routes/auth.js`)
- **API Endpoints**: RESTful, prefixed with `/api/`
- **Tests**: Mirror source structure in `__tests__/` directories

## Database

- Migrations in `backend/migrations/` (numbered sequentially)
- Schema includes: users, auth_tokens, vinyl_designs, error_logs
- Row Level Security (RLS) policies defined in migrations
