# AGENTS.md

## Core Development Principles

- Follow **Readability, Reusability, and DRY (Don’t Repeat Yourself)** principles at all times.
- Write clean, self-documenting code with meaningful variable and function names.
- Keep components small and focused on a single responsibility.
- Extract repeated logic into reusable hooks, utilities, or shared components.
- Avoid duplication across features. If logic is reused more than once, move it to the `shared` folder.
- Prefer composition over inheritance.
- Keep files concise and avoid unnecessary complexity.

---

## Code Style Guidelines

- Every comment should start with a space and capital letter, and should end with a full stop.
- Use clear and descriptive naming for components, hooks, and variables.
- Prefer functional components with hooks over class components.
- Destructure props for better readability.
- Avoid deeply nested logic. Extract helper functions when needed.
- Use early returns to reduce nesting.
- Maintain consistent formatting across the project.

---

## Package Manager

- This repository is managed by **pnpm**.
- Always use `pnpm` for installing, removing, and managing dependencies.
- Do not use npm or yarn.

---

## Styling

- This repository uses **Chakra UI**.
- Always prefer Chakra UI components and styling props before using raw CSS.
- Use Chakra’s style props and theme tokens for consistency.
- Avoid inline CSS unless absolutely necessary.
- Reuse theme values instead of hardcoded colors, spacing, or font sizes.
- Extract reusable UI patterns into shared components.

---

## Folder Structure

- This repository follows a **feature-based folder structure**.
- Each feature should contain its own:
  - Components.
  - Hooks.
  - Types.
  - Tests.
- All API hooks must live inside the `api` folder.
- The `shared` folder stores:
  - Reusable components.
  - Shared hooks.
  - Utility functions.
  - Constants.
  - Types used across multiple features.
- Avoid cross-feature dependencies unless absolutely necessary.

---

## State Management & Hooks

- Prefer local state when possible.
- Extract reusable logic into custom hooks.
- Keep hooks pure and focused.
- Avoid duplicating API logic across features. Centralize it inside the `api` folder.
- Memoize expensive computations when needed using `useMemo` or `useCallback`.

---

## Component Guidelines

- One component per file unless tightly coupled.
- Keep JSX clean and readable.
- Move complex logic outside of JSX.
- Avoid inline functions inside JSX when possible.
- Make components reusable through proper prop design.
- Use TypeScript interfaces or types for props definition.

---

## Testing

- This repository uses **Vitest**.
- Write tests for:
  - Components.
  - Hooks.
  - Utilities.
- Test behavior, not implementation details.
- Co-locate tests within the feature folder.
- Avoid duplication in test setup. Use helpers when necessary.

---

## Performance & Optimization

- Avoid unnecessary re-renders.
- Use React memoization techniques when appropriate.
- Lazy load heavy components when possible.
- Keep bundle size optimized by avoiding unused dependencies.

---

## General Best Practices

- Keep business logic separate from UI logic.
- Use consistent error handling patterns.
- Validate props and API responses when necessary.
- Write scalable code that is easy to extend.
- Refactor when duplication or complexity increases.
