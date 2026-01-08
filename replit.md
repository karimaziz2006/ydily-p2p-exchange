# Next.js + Postgres Auth Starter

## Overview
A Next.js 14 starter kit with NextAuth.js for email/password authentication and a PostgreSQL database for data persistence.

## Project Structure
- `app/` - Next.js App Router pages and components
  - `api/auth/[...nextauth]/` - NextAuth API routes
  - `login/` - Login page
  - `register/` - Registration page
  - `protected/` - Protected page (requires authentication)
  - `auth.ts` - NextAuth configuration with credentials provider
  - `auth.config.ts` - Auth configuration for middleware
  - `db.ts` - Database connection and user management
- `middleware.ts` - Route protection middleware
- `next.config.js` - Next.js configuration

## Technology Stack
- **Framework**: Next.js 14 with Turbopack
- **Authentication**: NextAuth.js v5 (beta) with Credentials provider
- **Database**: PostgreSQL with Drizzle ORM
- **Styling**: Tailwind CSS
- **Language**: TypeScript

## Environment Variables
- `DATABASE_URL` - PostgreSQL connection string (automatically set by Replit)
- `AUTH_SECRET` - Secret for NextAuth session encryption

## Running the Application
The development server runs on port 5000 with:
```
npm run dev -- -p 5000 -H 0.0.0.0
```

## Recent Changes
- 2026-01-06: Initial import and Replit environment setup
  - Updated database connection to use Replit's DATABASE_URL
  - Configured Next.js for Replit proxy compatibility
  - Added AUTH_SECRET environment variable
