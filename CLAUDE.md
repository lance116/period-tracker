# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Perica is a privacy-focused period tracking application built with React, TypeScript, and Supabase. The app helps users track menstrual cycles, log symptoms, get cycle predictions, and interact with an AI health assistant.

## Development Commands

```bash
# Start development server (runs on http://localhost:8080)
npm run dev

# Build for production
npm run build

# Build for development (with source maps)
npm run build:dev

# Run linter
npm run lint

# Preview production build
npm run preview
```

## Environment Setup

Create a `.env.local` file with your Supabase credentials:
```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

The app uses fallback credentials in `src/integrations/supabase/client.ts` if environment variables are not set.

## Architecture

### Application Flow

1. **Entry Point** (`src/main.tsx`): Renders the React app into the DOM
2. **App Component** (`src/App.tsx`): Sets up routing, React Query, and global providers
3. **Index Page** (`src/pages/Index.tsx`): Orchestrates authentication flow:
   - Unauthenticated users see `LandingPage` → `AuthModal`
   - New users go through `OnboardingFlow` after signup
   - Authenticated users with complete profiles see `Dashboard`

### Core Hooks

- **`useAuth`** (`src/hooks/useAuth.tsx`): Manages Supabase authentication state, listens for auth changes
- **`useCycles`** (`src/hooks/useCycles.tsx`): Handles all cycle data and predictions
  - Fetches cycle data from Supabase
  - Calculates cycle statistics (average length, variability)
  - Generates future period predictions using statistical analysis
  - Determines current cycle phase
- **`useProfile`** (`src/hooks/useProfile.tsx`): Manages user profile data (birth date, cycle preferences)

### Database Schema (Supabase)

Schema is defined in `src/integrations/supabase/types.ts`:

- **`profiles`**: User profile data (date_of_birth, average_cycle_length, average_period_duration)
- **`cycles`**: Period cycles (start_date, end_date, cycle_length, period_duration)
- **`daily_logs`**: Daily symptom tracking (flow, mood, pain_level, sleep_hours, notes)
- **`chat_messages`**: AI chat conversation history

All tables include `user_id` foreign keys linking to Supabase auth users.

### Key Components

- **`Dashboard`** (`src/components/Dashboard.tsx`): Main app interface with tabs for Calendar, Insights, and AI Chat
- **`CycleCalendar`** (`src/components/CycleCalendar.tsx`): Interactive calendar for viewing/logging periods
- **`PeriodLogger`** (`src/components/PeriodLogger.tsx`): Modal for adding/editing period entries
- **`CycleInsights`** (`src/components/CycleInsights.tsx`): Displays cycle statistics and trends
- **`ChatInterface`** / **`ChatBot`**: AI assistant for health questions

### Styling

- Uses **shadcn/ui** component library (components in `src/components/ui/`)
- Tailwind CSS for styling with custom configuration
- Path alias `@/` points to `src/` directory

### TypeScript Configuration

The project has relaxed TypeScript settings for faster development:
- `noImplicitAny: false`
- `strictNullChecks: false`
- `noUnusedLocals: false`
- `noUnusedParameters: false`

When making changes, be mindful that some type safety features are disabled.

## Important Patterns

### Date Handling
- Dates are normalized to midnight (00:00:00) for consistent comparisons
- The `useCycles` hook filters out future cycles and always works with past/current data
- Cycle predictions use statistical analysis with variability calculations for more realistic forecasts

### Authentication Flow
- The `Index` page checks both auth state and profile completeness
- Users without complete profiles are routed to onboarding
- Auth state is managed globally via the `useAuth` hook with Supabase session listeners

### Data Fetching
- Uses `@tanstack/react-query` for server state management
- Supabase queries are wrapped in hooks for reusability
- Most data fetching happens in custom hooks (`useCycles`, `useProfile`)

## Common Development Tasks

### Adding a new database table
1. Update Supabase schema via Supabase dashboard or migrations
2. Regenerate types in `src/integrations/supabase/types.ts` using Supabase CLI
3. Create a custom hook (following pattern of `useCycles.tsx` or `useProfile.tsx`)

### Adding a new page/route
1. Create component in `src/pages/`
2. Add route in `src/App.tsx` (above the catch-all `*` route)
3. Update navigation in relevant components

### Working with shadcn/ui components
- Components are in `src/components/ui/`
- Configuration in `components.json`
- Add new components using `npx shadcn@latest add [component-name]`
