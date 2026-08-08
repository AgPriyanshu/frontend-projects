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
2. **MobX** — GIS domain state only. MapLibre GL renders outside the React lifecycle, so MobX stores bridge that gap. MobX is only used for map state; keep it confined to `shared/map/stores/` and the `web-gis` feature.

### Map Engine (`src/shared/map/`)

The map engine is the reusable infrastructure layer shared across features. It follows a strict ports-and-adapters architecture:

- **Engines / Ports** (`shared/map/engines/ports/`) — TypeScript interfaces (`IMapEngine`, `ILayerEngine`, `IDrawEngine`, `IMapManager`) that abstract the underlying map library. Never depend on MapLibre directly outside `shared/map/engines/maplibre/`.
- **MapLibre Implementation** (`shared/map/engines/maplibre/`) — Concrete implementations of the port interfaces using MapLibre GL JS and Terra Draw.
- **MobX Stores** (`shared/map/stores/`) — `MapStore`, `LayerStore`, `ToolStore`, `DrawStore` each bind to their respective engine port via a `bind(engine)` method. `WorkspaceStore` owns all sub-stores and is the single unit of a "map workspace".
- **WorkspaceManager** (`shared/map/stores/workspace-manager.ts`) — Global singleton that manages multiple `WorkspaceStore` instances by ID. Use `workspaceManager.getOrCreateWorkspace(id)` to obtain a workspace.
- **Domain types** (`shared/map/domain/`) — Engine-agnostic types (`MapView`, `DrawMode`, `LayerType`, `SerializedLayer`, `LayerModel`).

Import via the `shared/*` alias: `import { workspaceManager } from "shared/map/stores/workspace-manager"`.

When adding new map capabilities: define the interface in `shared/map/engines/ports/`, implement it in `shared/map/engines/maplibre/`, and expose it through the relevant MobX store.

### Web GIS Feature (`src/features/web-gis/`)

Atlas-specific GIS UI built on top of the shared map engine:

- **Components** (`components/`) — Chakra UI components for the map canvas, layer panel, toolbar, draw tools, data sources, and geoprocessing.
- **Services** (`services/`) — `LayerFactory` converts API layer responses into `LayerModel` instances.
- **Actions** (`actions/`) — `WebGISActionHandler` integrates map operations with the chat agent.

### Node-Graph / Canvas Foundations

No dedicated node-graph editor exists for GIS pipelines yet, but the pieces are already in the codebase:

- **`@xyflow/react` (React Flow) + `dagre`** are already used to build a full node-graph editor in `src/features/workload-tree/components/org-graph/` — `org-graph.tsx` (`ReactFlowProvider` wrapper, `useNodesState`/`useEdgesState`, custom `nodeTypes`, `Background`/`Controls`/`MiniMap`, `fitView`), `layout.ts` (`applyDagreLayout` — builds a `dagre.graphlib.Graph`, fixed node size, computes positions), `person-node.tsx` (custom node using Chakra `Box`/`Flex` + React Flow `Handle`/`Position`). This is the template to copy for any future node-based canvas (e.g. a workflow builder) — swap the node types and edge semantics, keep or drop the dagre auto-layout.
- **`@dnd-kit/core`/`sortable`/`utilities`** are installed but only used for sortable image lists (`features/dead-stock/components/owner/`) — not for canvas dragging. React Flow's own node dragging, or native HTML5 drag-and-drop (see below), covers canvas interactions without needing dnd-kit.
- **Native HTML5 drag-and-drop** (no library) is how datasets get dropped onto the map: `features/web-gis/components/map-canvas/map-canvas.tsx` implements `onDragOver`/`onDrop` reading `dataTransfer.getData("application/dataset-id")`, with the drag source set in the dataset tree (`data-sources/dataset-tree-node.tsx`, `react-arborist`-based). Reusable pattern for dragging a data source or operation from a palette onto a canvas.
- `ProcessingToolDefinition` / `ProcessingJobResponse` (`src/api/web-gis/types.ts`) already model "an operation with typed inputs/outputs and a parameter schema" (`toolName`, `category`, `inputTypes`, `outputType`, `parameters: ProcessingToolParam[]`) — the closest existing analog to a workflow "operation node" definition. `processing-api.ts` (`useProcessingTools`, `useSubmitProcessingJob`, `useProcessingJobs` with polling) and `tool-parameter-form.tsx` (dynamic `react-hook-form` + `zod` form built from a tool's parameter schema) are the reusable pieces for rendering/submitting a node's config.
- No charting/visx/d3 library is installed — needed only if a future canvas requires inline data previews.

### Design System (`src/design-system/`)

Built on Chakra UI v3. Always extend the theme rather than writing one-off styles.

**Three colour layers — only ever consume the middle one from components:**

1. `theme/colors.ts` — raw scales under `palette.*`. The only file allowed to contain hex literals. Never referenced from a component.
2. `theme/semantic-tokens.ts` — the vocabulary components use: `surface.*`, `text.*`, `border.*`, `intent.*`, `icon.*`, `object.*`. Every token is light/dark aware.
3. `tone/` — `Tone` (`neutral | primary | info | success | warning | danger`) plus `toneTokens`, which returns a `{ solid, subtle, border, fg }` token set. Features map their own domain status onto a `Tone` instead of maintaining private status→colour maps.

Rules:

- Never use Chakra's built-in `fg.*` / `bg.*` / `gray.500` / `blue.400` style values — they bypass the semantic layer and break dark mode. Use `text.*` / `surface.*` / `intent.*`.
- `surface.container` is always elevated above `surface.page` (white on grey in light, lighter grey on near-black in dark). Cards, panels and the navbar use `container`; the app canvas uses `page`.
- `intent.primary` is the accent _fill_; `intent.primaryText` is the darker variant for small text/icons on a surface. `primaryHover` / `primaryActive` are interaction states — never use them for a resting selected state.
- `colorPalette="brand"` works because `colors.brand` is aliased at the top level.
- Third-party DOM (React Flow controls, etc.) is themed via `globalCss` in `theme/theme.tsx`, not per-feature `.css` files.

### Shared Utilities (`src/shared/`)

- `shared/map/` — Reusable map engine: port interfaces, MapLibre adapters, MobX stores, domain types. Import via `shared/map` or specific sub-paths (`shared/map/stores`, `shared/map/domain`, etc.).
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
