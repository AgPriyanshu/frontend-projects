# 🌐 Atlas Platform Web Client

> **A high-performance, modular React/Vite front-end orchestrating state across multiple micro-feature domains, featuring real-time data sync and advanced geospatial rendering.**

Atlas Platform Web is the unified user interface designed to interact with the [Atlas Platform Services](https://github.com/AgPriyanshu/atlas-platform-services) backend. It leverages an event-driven architecture to keep disparate domains (To-dos, File management, Complex Web GIS) visually synchronized and flawlessly state-managed.

## 🏗️ Architecture & System Design

Atlas Web uses a **Feature-Driven Monorepo Architecture** to ensure that disparate domains remain conceptually unified without cross-feature coupling.

### Key Engineering Decisions:

- **Aggressive Caching Strategy with React Query:** Adopted TanStack Query (v5) for normalized server state, ensuring UI consistency across multiple components while minimizing redundant network calls. Features optimistic updates for instantaneous user interactions (e.g., Todo toggles).
- **High-Performance Geospatial Rendering (Web GIS):** Integrated **MapLibre GL JS** directly into the DOM alongside React, offloading heavy vector map tile rendering to the GPU. **Terra Draw** and **MobX** are utilized within the GIS namespace to handle granular, complex spatial state outside of standard React component lifecycles to prevent reconciliation lag.
- **Real-time Server Comm:** Leverages Server-Sent Events (SSE) via the `/events/` stream to push live notification and data invalidation requests down from the Django/Redis broker layer.
- **Component-Driven UI Design:** A strict token-based custom design system built over **Chakra UI (v3)** ensuring A11y compliance and theme elasticity across Light/Dark modes.

```mermaid
graph TD
    Client[React SPA] --> Router[React Router 7]

    subgraph State Management
        Router --> RQ[React Query Context]
        Router --> MobX[MobX - GIS Store]
    end

    subgraph Features
        RQ --> Core[Auth & Core Launcher]
        RQ --> Task[Task Management]
        MobX --> Map[Web GIS & Tiles]
    end

    Map -->|Vector Tiles| BackendAPI((Atlas Backend API))
    Core -->|REST/JSON| BackendAPI
    Task -->|REST/JSON| BackendAPI
    Client <--|SSE Events| RedisBridge((Redis / Django Channels))
```

## 🛠️ Technology Stack

**Core Framework:** React 19, TypeScript, Vite 7
**Routing & Forms:** React Router 7, React Hook Form, Zod (Schema validation)
**State Management:** TanStack React Query 5 (Server State), MobX 6 (GIS Domain State)
**UI & Styling:** Chakra UI 3, Emotion
**Geospatial (GIS):** MapLibre GL 5, Terra Draw
**Testing Strategy:** Playwright (End-to-End), Vitest (Unit/Component), Storybook

## 🚀 Local Development Setup

### Prerequisites

- Node.js v22+
- pnpm v10+

### Quickstart

1. Clone the repository and install dependencies using `pnpm` to ensure strict lockfile compliance.

   ```bash
   pnpm install
   ```

2. Establish local environment config.

   ```bash
   cp env-files/.env.sample .env.development.local
   # Ensure VITE_API_BASE_URL points to your running backend (e.g., http://localhost:8000)
   ```

3. Initialize the lightning-fast Vite dev server.
   ```bash
   pnpm dev
   ```

## 🧪 Testing and Quality Assurance

Testing is considered a first-class citizen inside the Atlas Web Platform.

- **E2E Browser Tests:** Complete UI workflows are verified via **Playwright**. Run them using `pnpm test:e2e` (or `pnpm test:e2e:ui` for visual debugging).
- **Isolated UI Testing:** Components and complex UI states are visually tested and isolated using **Storybook** (`pnpm storybook`).
- **Static Analysis:** Strict ESLint and Prettier configs enforced via Husky pre-commit hooks.

## 🐳 Containerization

A multi-stage Docker build is optimized for minimal bundle size and secure runtime execution.

1. **Build Stage:** Utilizes pnpm within a Node environment to emit the highly optimized production bundle (`dist/`).
2. **Runtime Stage:** Employs a lightweight, hardened NGINX Alpine image configured with SPA fallback routing behavior.

```bash
docker build -t atlas-platform-web .
docker run -p 8080:80 atlas-platform-web
```
