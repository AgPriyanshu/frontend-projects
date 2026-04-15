# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

---

## Commands

```bash
pnpm dev              # Start dev server on port 3000
pnpm build            # Type-check and build for production (tsc -b && vite build)
pnpm lint             # Type-check, ESLint --fix, and Prettier --write
pnpm lint:ci          # Type-check and ESLint (no auto-fix, used in CI)
pnpm test:e2e         # Run Playwright end-to-end tests
pnpm test:e2e:ui      # Run Playwright in interactive UI mode
pnpm storybook        # Start Storybook dev server on port 6006
```

There is no unit/component test script in `package.json`; Vitest runs through Storybook (`@storybook/addon-vitest`). Tests are co-located within each feature folder.

Environment variables live in `env-files/`. Copy `env-files/.env.sample` to `env-files/.env.development.local` and set `VITE_API_BASE_URL` before starting the dev server.

---

## Path Aliases

Four top-level aliases are configured in both `tsconfig.app.json` and `vite.config.ts`:

| Alias             | Resolves to           |
| ----------------- | --------------------- |
| `api/*`           | `src/api/*`           |
| `app/*`           | `src/app/*`           |
| `design-system/*` | `src/design-system/*` |
| `shared/*`        | `src/shared/*`        |

`src/features/*` has no alias — use relative imports or `src/features/` paths within features. Cross-feature imports should be avoided; shared logic goes in `src/shared/`.

---

## Architecture Overview

### Entry Point

`src/root.tsx` bootstraps the app: `BrowserRouter → QueryProvider → ThemeProvider → AppRouter`. The `AppRouter` (`src/app/router/app-router.tsx`) wraps all authenticated routes inside `<ProtectedRoute><App /></ProtectedRoute>`. `App` renders the `Navbar`, a flex content area with `<Outlet />`, and the persistent `ChatPanel`.

### Source Layout

```
src/
  api/          # Axios instance, React Query client/provider/keys, SSE hook, per-feature API hooks
  app/          # Router, app-level config (env vars), MobX app store
  design-system/# Chakra UI theme, shared UI primitives (Navbar, Toaster, Tooltip, color-mode)
  features/     # Feature slices (auth, chat, home, todo, url-shortner, web-gis)
  shared/       # Cross-feature hooks, utils, types, constants, local-storage helpers
```

### API Layer (`src/api/`)

- `api.ts` — Axios instance with JWT injection and automatic camelCase ↔ snake_case conversion via interceptors. All request bodies are mapped to snake_case before sending; all responses are mapped to camelCase on receipt.
- `query-keys.ts` — Central `QueryKeys` object; every React Query key lives here. Always add new keys here rather than inline.
- `query-client.ts` / `query-provider.tsx` — Shared `queryClient` singleton wrapped in `QueryProvider`.
- `events/events-stream.ts` — `useNotificationStream` hook that opens an SSE connection to `/events/?token=...` and writes incoming notifications directly into the React Query cache.
- Per-feature sub-folders (`auth/`, `todo/`, `web-gis/`, `chat/`, etc.) hold React Query hooks for that domain.

### State Management

Two distinct strategies coexist and should not be mixed:

1. **React Query** — all server state. Mutations use optimistic updates where appropriate. The `queryClient` singleton (`src/api/query-client.ts`) can be imported anywhere to imperatively read or write the cache.
2. **MobX** — GIS domain state only. MapLibre GL renders outside the React lifecycle, so MobX stores bridge that gap. Do not use MobX outside the `web-gis` feature.

### Web GIS Feature (`src/features/web-gis/`)

The GIS subsystem is the most complex part of the codebase and follows a strict layered architecture:

- **Engines / Ports** (`engines/ports/`) — TypeScript interfaces (`IMapEngine`, `ILayerEngine`, `IDrawEngine`, `IMapManager`) that abstract the underlying map library. Never depend on MapLibre directly outside the `engines/maplibre/` implementation.
- **MapLibre Implementation** (`engines/maplibre/`) — Concrete implementations of the port interfaces using MapLibre GL JS and Terra Draw.
- **MobX Stores** (`stores/`) — `MapStore`, `LayerStore`, `ToolStore`, `DrawStore` each bind to their respective engine port via a `bind(engine)` method. `WorkspaceStore` owns all sub-stores and is the single unit of a "map workspace".
- **WorkspaceManager** (`stores/workspace-manager.ts`) — Global singleton that manages multiple `WorkspaceStore` instances by ID. Use `workspaceManager.getOrCreateWorkspace(id)` to obtain a workspace.

When adding new map capabilities: define the interface in `engines/ports/`, implement it in `engines/maplibre/`, and expose it through the relevant MobX store.

### Design System (`src/design-system/`)

Built on Chakra UI v3. Theme customization lives in `design-system/theme/` (semantic tokens, recipes, color palette). Always extend the theme rather than writing one-off styles.

### Shared Utilities (`src/shared/`)

- `shared/utils/type-utils.ts` — `toCamelCase` / `toSnakeCase` used by the API interceptors.
- `shared/local-storage/` — Typed helpers for reading/writing tokens and other persisted values.
- `shared/enums.ts`, `shared/types.ts` — App-wide enums and types.

---

## UI Patterns

### Page layout — full-width vs centred card

Most feature pages (`Todo`, `Home`, `WebGIS`) stretch to fill the outlet with `w="full" h="full"`. When a feature calls for a focused, card-style layout (like `LevelUp`), centre it inside the outlet instead:

```tsx
<Flex
  w="full"
  maxW="960px"
  h="600px"
  borderRadius="2xl"
  borderWidth="1px"
  borderColor="border.default"
  overflow="hidden"
  shadow="lg"
  mx="auto"
>
```

The outlet is already wrapped in `<Center>` inside `App`, so `mx="auto"` + `maxW` is all that is needed.

### Inline editing with Chakra Editable

Use `Editable.Root / Editable.Preview / Editable.Input` for click-to-edit fields. Always set `key={record.id}` so the component resets its internal value when the selected record changes.

```tsx
<Editable.Root
  key={`field-${record.id}`}
  defaultValue={record.field}
  onValueCommit={(e) => onUpdate(e.value)}
>
  <Editable.Preview _hover={{ cursor: "text", color: "intent.primary" }} />
  <Editable.Input _focus={{ outlineColor: "intent.primary" }} />
</Editable.Root>
```

### Avatar upload (image or emoji)

`AvatarDisplay` (`src/features/level-up/avatar-display.tsx`) detects whether `avatar` is an image src (`data:` / `http`) or an emoji and renders accordingly. `AvatarUpload` wraps it with a hidden `<input type="file">` and a hover camera overlay that calls `FileReader.readAsDataURL` and fires `onUpload(dataUrl)`. This pattern can be reused for any feature that needs user-supplied images stored locally in state.

### Level Up feature (`src/features/level-up/`)

RPG-style character development scorecard. All state is local (no backend). Key decisions:

- `avatar` field on `Character` holds either an emoji string or a `data:` URL — `AvatarDisplay` handles both.
- `key={character.id}` on every `Editable.Root` is required; without it, switching characters leaves stale values in the inputs.
- The `updateSelected` helper in `LevelUpPage` avoids repeating the `prev.map(char => char.id === selectedId ? {...} : char)` pattern across every handler.
