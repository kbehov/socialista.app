# AGENTS.md

Instructions for coding agents working in the **Socialista** repository — a social media manager and schedule app.

## Project overview

Socialista helps teams manage social accounts, schedule posts, and collaborate in workspaces. The codebase is a **pnpm + Turborepo monorepo** with shared packages and (future) apps under `apps/`.

| Area            | Choice                                                 |
| --------------- | ------------------------------------------------------ |
| Language        | TypeScript (strict)                                    |
| Package manager | pnpm 9 (`packageManager` field in root `package.json`) |
| Monorepo        | Turborepo                                              |
| Database        | MongoDB via Mongoose (`@socialista/db`)                |
| Node            | >= 18                                                  |

## Repository layout

```
socialista.app/
├── apps/                   # Application packages (web, api, etc.) — not yet populated
├── packages/
│   ├── db/                 # @socialista/db — Mongoose models & connection
│   ├── eslint-config/      # @socialista/eslint-config
│   └── typescript-config/  # @socialista/typescript-config
├── turbo.json
├── pnpm-workspace.yaml
└── AGENTS.md
```

**Workspace packages use the `@socialista/*` scope.** Do not introduce `@repo/*` or other scopes.

## Commands

Run from the repository root:

```bash
pnpm install
pnpm build                    # turbo run build (all packages)
pnpm lint                     # turbo run lint
pnpm check-types              # turbo run check-types
pnpm format                   # prettier --write
```

Target a single package:

```bash
pnpm --filter @socialista/db run build
pnpm --filter @socialista/db run lint
pnpm --filter @socialista/db run check-types
```

After changing TypeScript in a library package, **build it before** dependent apps can consume updated types.

## Environment variables

| Variable       | Used by          | Purpose                           |
| -------------- | ---------------- | --------------------------------- |
| `MONGODB_URI`  | `@socialista/db` | Primary MongoDB connection string |
| `DATABASE_URL` | `@socialista/db` | Fallback connection string        |

Both are declared in `turbo.json` → `globalEnv`. When adding new env vars referenced in code, add them to `globalEnv` so Turborepo cache stays correct.

Apps load `.env` themselves. **Do not add `dotenv` to shared library packages.**

## Coding principles

1. **Minimize scope** — Smallest correct diff. Do not refactor or expand unrelated code.
2. **Match existing patterns** — Read surrounding files before writing new code.
3. **No over-engineering** — Avoid premature abstractions, extra helpers, or speculative error handling.
4. **Comments sparingly** — Only for non-obvious business logic or technical constraints.
5. **Tests when meaningful** — Add tests when requested or when they cover real behavior; skip trivial assertions.

### TypeScript

- `"type": "module"` — use `.js` extensions in relative imports (NodeNext resolution).
- Strict mode is on; respect `noUncheckedIndexedAccess`.
- Prefer `interface` for document shapes, `type` for unions/compositions.
- Use string enums for persisted values (see `@socialista/db` types).

### Formatting & lint

- Prettier for formatting (`pnpm format`).
- ESLint configs live in `@socialista/eslint-config`; extend them in package-level `eslint.config.mjs`.
- Do not commit secrets (`.env`, credentials, tokens).

### Git

- **Do not commit** unless the user explicitly asks.
- **Do not push** unless the user explicitly asks.
- Never skip hooks, force-push to main, or amend commits you did not create.

## Domain model

Three core entities in `@socialista/db`:

| Entity        | Model            | Purpose                                                                       |
| ------------- | ---------------- | ----------------------------------------------------------------------------- |
| **User**      | `UserModel`      | App user. `oauthAccounts` = sign-in providers (Google, GitHub, etc.).         |
| **Workspace** | `WorkspaceModel` | Team/org container: members, limits, usage, billing.                          |
| **Account**   | `AccountModel`   | Social platform connected to a workspace for publishing (Instagram, X, etc.). |

**Naming distinction:** `oauthAccounts` on User ≠ `Account` model. The former is auth; the latter is a managed social channel.

## `@socialista/db` conventions

When adding or changing database code, follow this structure:

```
packages/db/
├── connect.ts              # connectDb, disconnectDb, getMongoUri
├── index.ts                # public exports only
├── lib/schema.ts           # shared helpers (enumValues)
├── models/<entity>.model.ts
└── types/<entity>.types.ts
```

### Model checklist

- Define TypeScript types/enums in `types/` first, then implement the Mongoose schema in `models/`.
- Use `enumValues()` from `lib/schema.ts` for enum fields.
- Mark sensitive fields with `select: false` (passwords, access/refresh tokens).
- Add indexes for common query patterns and compound uniqueness where needed.
- Use `{ _id: false }` on embedded subdocuments that do not need their own `_id`.
- Export models and types through `index.ts` — consumers import from `@socialista/db` only.

### Connection

```typescript
import { connectDb, UserModel } from '@socialista/db'

await connectDb()
const users = await UserModel.find({ status: 'active' })
```

`connectDb()` caches the connection for serverless reuse. Call `disconnectDb()` in tests.

## Adding packages & apps

### New shared package (`packages/`)

1. Create directory under `packages/<name>/`.
2. Set `"name": "@socialista/<name>"` in `package.json`.
3. Extend `@socialista/typescript-config` in `tsconfig.json`.
4. Add `build`, `lint`, and `check-types` scripts.
5. Declare workspace dependency: `"@socialista/foo": "workspace:^"`.

### New app (`apps/`)

1. Create under `apps/<name>/`.
2. Depend on shared packages via `workspace:^`.
3. Register tasks in `turbo.json` if new task types or env vars are needed.

## Turborepo notes

- Root `package.json` scripts delegate to `turbo run` — put build logic in package scripts, not the root.
- Use `--filter=<package>` to run tasks for one package.
- Library packages output to `dist/`; ensure `build` produces declarations (`tsc` with `declaration: true`).

## What to verify before finishing

1. `pnpm --filter <changed-package> run build`
2. `pnpm --filter <changed-package> run check-types`
3. `pnpm --filter <changed-package> run lint`

For cross-package changes, run checks on all affected packages.

## Out of scope unless asked

- Creating git commits or pull requests
- Updating README or other docs the user did not request
- Adding dependencies without a clear need
- Large refactors beyond the task at hand
