# Run Playwright E2E Tests

Run the Playwright end-to-end test suite for atlas-platform-web.

```bash
cd /Users/priyanshuagarwal/Work/my-projects/huge/atlas-platform-web
```

## Determine what to run

Parse the args (available as `$SKILL_ARGS` or the user's message following `/e2e`):

| Arg pattern                                           | What to run                                        |
| ----------------------------------------------------- | -------------------------------------------------- |
| _(none)_                                              | Full suite: `pnpm test:e2e`                        |
| A file name or path (e.g. `auth`, `level-up`, `todo`) | Only that spec: `pnpm test:e2e e2e/<name>.spec.ts` |
| `--ui`                                                | Interactive Playwright UI: `pnpm test:e2e:ui`      |
| `--headed`                                            | Headed mode: `pnpm exec playwright test --headed`  |
| `--debug`                                             | Debug mode: `pnpm exec playwright test --debug`    |

## Steps

1. Check that the dev server is not already running on port 3000.
   - If it is running, Playwright will reuse it (`reuseExistingServer: true` in config).
   - If it is not running, Playwright will start it automatically.

2. Run the appropriate command based on the args above.

3. After the run completes, report:
   - Total tests passed / failed / skipped.
   - Any failing test names and their error messages.
   - The path to the HTML report (`playwright-report/index.html`) if tests failed — remind the user they can open it with `pnpm exec playwright show-report`.

4. If tests fail, investigate the failures:
   - Read the relevant spec file and the component under test.
   - Identify whether the failure is a test issue (wrong selector, stale assertion) or a real regression.
   - Propose a fix only if confident; otherwise summarise what you found and ask the user.

## Examples

```
/e2e                    → pnpm test:e2e (all specs, chromium + firefox + webkit)
/e2e auth               → pnpm test:e2e e2e/auth.spec.ts
/e2e level-up           → pnpm test:e2e e2e/level-up.spec.ts
/e2e todo               → pnpm test:e2e e2e/todo.spec.ts
/e2e --ui               → pnpm test:e2e:ui
/e2e auth --headed      → pnpm exec playwright test e2e/auth.spec.ts --headed
```
