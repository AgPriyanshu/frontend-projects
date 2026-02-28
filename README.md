# World of Apps Frontend

Frontend monorepo app built with React, TypeScript, Vite, Chakra UI, and React Query.

This project provides a single authenticated workspace with multiple feature apps, including:

- Home app launcher.
- Todo management.
- Web GIS workspace (MapLibre + Terra Draw).
- Notification streaming via Server-Sent Events.

## Core Features

- Authentication flow with protected routes.
- Reusable design system built on Chakra UI.
- API layer with Axios + request/response mappers.
- React Query for server state and caching.
- Feature-based folder structure for scalability.
- Storybook for isolated UI development.

## Tech Stack

- React 19 + TypeScript.
- Vite 7.
- Chakra UI 3.
- React Router 7.
- TanStack React Query 5.
- MobX (used in Web GIS domain stores).
- MapLibre GL + Terra Draw.
- pnpm.

## Available Routes

- `/login` - Public login page.
- `/` - Home app launcher (protected).
- `/todo` - Todo app (protected).
- `/map` - Web GIS workspace (protected).
- `/device-classifier`, `/store`, `/whiteboard` - Placeholder apps (protected).

## Prerequisites

- Node.js 22+.
- pnpm 10+.

## Getting Started

1. Install dependencies:

```bash
pnpm install
```

2. Create environment file (from sample):

```bash
cp env-files/.env.sample .env
```

3. Start development server:

```bash
pnpm dev
```

The app runs on the default Vite port (usually `http://localhost:5173`).

## Environment Variables

Required variables:

- `VITE_API_BASE_URL`: Backend API base URL.

Examples in this repo:

- `env-files/.env.sample`.
- `env-files/.env.development.local`.
- `env-files/.env.production`.

## Scripts

- `pnpm dev` - Start Vite dev server.
- `pnpm build` - Type-check and build production bundle.
- `pnpm preview` - Preview built app locally.
- `pnpm lint` - Run ESLint with fixes and Prettier.
- `pnpm lint:ci` - Run ESLint checks without fixing.
- `pnpm storybook` - Start Storybook.
- `pnpm build-storybook` - Build Storybook static output.

## Project Structure

```text
src/
  api/            # API clients, hooks, query setup, shared request logic
  app/            # App config and routing
  design-system/  # Chakra theme, color mode, navbar, shared UI primitives
  features/       # Feature modules (auth, home, todo, web-gis)
  shared/         # Cross-feature components, utils, local storage, enums
```

## Docker

A multi-stage Dockerfile is included:

- Build stage: installs dependencies with pnpm and runs production build.
- Runtime stage: serves `dist/` with Nginx and SPA fallback routing.

Build and run:

```bash
docker build -t world-of-apps-frontend .
docker run -p 8080:80 world-of-apps-frontend
```

## Screenshots

- [Screenshot 2026-02-28 at 12.41.40 PM](<screenshots/Screenshot 2026-02-28 at 12.41.40 PM.png>)
- [Screenshot 2026-02-28 at 12.42.02 PM](<screenshots/Screenshot 2026-02-28 at 12.42.02 PM.png>)
- [Screenshot 2026-02-28 at 12.56.00 PM](<screenshots/Screenshot 2026-02-28 at 12.56.00 PM.png>)
- [Screenshot 2026-02-28 at 12.56.22 PM](<screenshots/Screenshot 2026-02-28 at 12.56.22 PM.png>)
- [Screenshot 2026-02-28 at 12.57.00 PM](<screenshots/Screenshot 2026-02-28 at 12.57.00 PM.png>)

## Notes

- Package manager is `pnpm` (do not use npm/yarn).
- API auth token is stored in local storage and attached to API requests.
- Notifications are updated in real time using SSE (`/events/`).
