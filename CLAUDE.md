# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
pnpm dev        # Start dev server (http://localhost:5173)
pnpm build      # Type-check + production build → ./dist/
pnpm lint       # ESLint static analysis
pnpm preview    # Preview production build (http://localhost:4173)
```

No test framework is configured — features are tested manually.

## Tech Stack

- **React 19** + **React Router 7** + **TypeScript 6**
- **Vite 8** with `@/` alias pointing to `./src/`
- **Tailwind CSS 4** (configured via `@tailwindcss/vite` plugin — no `tailwind.config.js`)
- **Supabase** (Postgres + Auth) via `@supabase/supabase-js`
- **date-fns** with `es` locale (UI is entirely in Spanish)
- **Lucide React** for icons

## Architecture

Multi-tenant SaaS for physiotherapy clinics. The hierarchy is: **Clinic → Branch → Staff/Patients**.

### Auth & Roles

`src/context/AuthContext.tsx` is the core. On login it fetches the user's profile, their clinic, and available branches. Roles are `admin | therapist | receptionist | patient`. Admin can switch branches; other roles are locked to their assigned branch.

`src/App.tsx` wraps routes in a `ProtectedRoute` component that enforces role checks.

### Routing Structure

Each role has its own dashboard that acts as a sub-router:

- `/admin/*` → `AdminDashboard.tsx`
- `/receptionist/*` → `ReceptionistDashboard.tsx`
- `/therapist/*` → `TherapistDashboard.tsx`

### Domain Model (src/types/index.ts)

Key entities and their relationships:
- `Clinic` → `Branch` → `Therapist` / `Patient`
- `Patient` → `PatientIntake` (one-time health questionnaire)
- `Package` (session bundles) → `PatientPackage` (purchase/tracking with `sessions_used`)
- `Appointment` (with status: `scheduled | completed | cancelled | no_show`) → `SessionNote` + `SatisfactionSurvey`

### Component Patterns

- **Pages** (`src/pages/`) = Full-screen route views
- **Components** (`src/components/`) = Modals and layout (all CRUD happens in modals)
- `AppShell.tsx` = Responsive sidebar layout (desktop sidebar + mobile hamburger)

### Environment Variables

Supabase credentials must be set for the app to load. Without them a `SetupScreen` is shown.

```
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

## Roadmap Context

See `.claude/tasks.md` for the full task list. Upcoming work includes:
- **Phase 2**: Patient intake form (public link, no auth), package sales with session deduction, email/WhatsApp reminders (Resend + Twilio), subscription billing (Culqi)
- **Phase 3**: AI features via Claude API — voice-to-note, intake analysis, churn detection, no-show prediction
