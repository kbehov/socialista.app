# AGENTS.md

Instructions for coding agents working in the **Socialista** repository — a social media content studio and workspace app.

## Project overview

Socialista helps teams create and manage social content inside workspaces: AI image generation, static ads, slideshows, videos, product catalogs, and file storage. The codebase is a **pnpm + Turborepo monorepo**.

| Area            | Choice                                                                 |
| --------------- | ---------------------------------------------------------------------- |
| Language        | TypeScript (strict)                                                    |
| Package manager | pnpm 11 (`packageManager` field in root `package.json`)                |
| Monorepo        | Turborepo                                                              |
| Web             | Next.js 16 (`@socialista/web`) — App Router                            |
| API             | Hono on Node (`@socialista/api`)                                       |
| Database        | MongoDB via Mongoose (`@socialista/db`)                                |
| Shared types    | `@socialista/types` (API/web DTOs; not Mongoose documents)             |
| Background jobs | Trigger.dev v4 (`@socialista/trigger`)                                 |
| Auth            | NextAuth (web) + JWT against the API                                   |
| Billing         | Polar                                                                  |
| Object storage  | Cloudflare R2                                                          |
| Node            | >= 18                                                                  |

**Workspace packages use the `@socialista/*` scope.** Do not introduce `@repo/*` or other scopes.

## Repository layout

```
socialista.app/
├── apps/
│   ├── web/                 # @socialista/web — Next.js dashboard & studio
│   └── api/                 # @socialista/api — Hono REST API
├── packages/
│   ├── db/                  # @socialista/db — Mongoose models, repos, connection
│   ├── types/               # @socialista/types — shared DTOs & constants
│   ├── trigger/             # @socialista/trigger — Trigger.dev tasks
│   ├── eslint-config/       # @socialista/eslint-config
│   └── typescript-config/   # @socialista/typescript-config
├── turbo.json
├── pnpm-workspace.yaml
└── AGENTS.md
```

### App responsibilities

| Package              | Role                                                                                          |
| -------------------- | --------------------------------------------------------------------------------------------- |
| `@socialista/web`    | UI, NextAuth session, server actions, Trigger.dev client hooks, calls the API                 |
| `@socialista/api`    | Auth tokens, CRUD, product URL extraction, file/R2 uploads, workspace/billing endpoints       |
| `@socialista/db`     | Models, repos, filters, connection helpers — used by API and Trigger tasks                    |
| `@socialista/types`  | Cross-app request/response types, `TASK_IDS`, aspect ratios, static-ad styles                 |
| `@socialista/trigger`| Realtime image & static-ad generation tasks; providers (fal / Vercel AI); prompt builders     |

## Commands

Run from the repository root:

```bash
pnpm install
pnpm build                    # turbo run build (all packages)
pnpm dev                      # turbo run dev
pnpm lint                     # turbo run lint
pnpm check-types              # turbo run check-types
pnpm format                   # prettier --write
```

Common filters:

```bash
pnpm --filter @socialista/web run dev
pnpm --filter @socialista/api run dev
pnpm --filter @socialista/db run build
pnpm --filter @socialista/types run build
pnpm --filter @socialista/trigger run check-types

pnpm dev:web                  # Next.js only
pnpm dev:api                  # API only
pnpm dev:trigger              # Trigger.dev local worker
pnpm deploy:trigger           # Deploy Trigger.dev tasks
```

After changing TypeScript in a library package (`db`, `types`), **build it before** dependent apps can consume updated types/declarations.

## Environment variables

Declared in `turbo.json` → `globalEnv`. When adding new env vars referenced in code, add them there so Turborepo cache stays correct.

Apps load `.env` themselves. **Do not add `dotenv` to shared library packages** (except `@socialista/api`, which owns its process env).

| Area        | Examples                                                                 |
| ----------- | ------------------------------------------------------------------------ |
| Database    | `MONGODB_URI`, `DATABASE_URL`                                            |
| API / web   | `PORT`, `API_URL`, `NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_APP_URL`          |
| Auth        | `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`, `AUTH_SECRET`, Google OAuth   |
| Billing     | `POLAR_*`, `NEXT_PUBLIC_POLAR_PRO_PRODUCT_ID`, Stripe (legacy/optional)   |
| Storage     | `R2_*`                                                                   |
| AI / jobs   | `TRIGGER_*`, `FAL_KEY`, `AI_GATEWAY_API_KEY`, `INTERNAL_API_SECRET`      |
| Media       | `UNSPLASH_*`, `PINTEREST_*`                                              |

## Coding principles

1. **Minimize scope** — Smallest correct diff. Do not refactor or expand unrelated code.
2. **Match existing patterns** — Read surrounding files before writing new code.
3. **No over-engineering** — Avoid premature abstractions, extra helpers, or speculative error handling.
4. **Comments sparingly** — Only for non-obvious business logic or technical constraints.
5. **Tests when meaningful** — Add tests when requested or when they cover real behavior; skip trivial assertions.

### TypeScript

- `"type": "module"` — use `.js` extensions in relative imports (NodeNext resolution) in `packages/*` and `apps/api`.
- Strict mode is on; respect `noUncheckedIndexedAccess`.
- Prefer `interface` for document shapes, `type` for unions/compositions.
- Use string enums / const objects for persisted values (see `@socialista/db` and `@socialista/types`).
- **Document types** live in `@socialista/db`. **API/UI DTOs** live in `@socialista/types`. Do not mix them.

### Formatting & lint

- Prettier for formatting (`pnpm format`).
- ESLint configs live in `@socialista/eslint-config`; extend them in package-level `eslint.config.mjs`.
- Do not commit secrets (`.env`, credentials, tokens).

### Git

- **Do not commit** unless the user explicitly asks.
- **Do not push** unless the user explicitly asks.
- Never skip hooks, force-push to main, or amend commits you did not create.

## Domain model

Core entities in `@socialista/db`:

| Entity          | Model                     | Purpose                                                                 |
| --------------- | ------------------------- | ----------------------------------------------------------------------- |
| **User**        | `UserModel`               | App user. `oauthAccounts` = sign-in providers (Google, GitHub, etc.).   |
| **Workspace**   | `WorkspaceModel`          | Team/org container: members, plan limits, usage, billing.               |
| **Account**     | `AccountModel`            | Social platform connected to a workspace for publishing.                |
| **Product**     | `ProductModel`            | Catalog product (URL extract + manual fields) for ads/studio.           |
| **Image**       | `ImageModel` / collections| Generated & uploaded images, collections/folders.                       |
| **Slideshow**   | `SlideshowModel`          | Multi-slide canvas compositions.                                        |
| **Video**       | `VideoModel`              | Timeline-based video projects.                                          |
| **Inspiration** | Inspiration models        | Inspiration/reference content.                                          |
| **Model**       | `ModelModel`              | AI model catalog (provider, cost, capabilities).                        |
| **Invitation**  | `InvitationModel`         | Workspace invites.                                                      |

**Naming distinction:** `oauthAccounts` on User ≠ `Account` model. The former is auth; the latter is a managed social channel.

Credits/limits are enforced on the workspace (checked in Trigger tasks before generation).

## Product surface (dashboard)

Under `apps/web/app/(app)/dashboard/`:

| Area            | Path                         | Notes                                                                 |
| --------------- | ---------------------------- | --------------------------------------------------------------------- |
| Studio — images | `studio/images/`             | Prompt studio + realtime generation runs (`[runId]`)                  |
| Studio — ads    | `studio/images/static-ads/`  | Product-aware static ad generation                                    |
| Studio — slides | `studio/slideshows/`         | Slideshow editor                                                      |
| Studio — video  | `studio/videos/`             | Video editor                                                          |
| Products        | `products/`                  | Product catalog (create via URL extract or form)                      |
| Files           | `files/`, `folders/`         | Workspace file browser                                                |
| Upgrade         | `upgrade/`                   | Polar paywall / plan upgrade                                          |

Web talks to the API via `apps/web/lib/api.ts` (Bearer + `x-user-id`). Domain clients live in `apps/web/services/`. Studio Trigger flows use colocated `_actions/` and hooks (`use-generation-run`, `use-static-ad-generation-run`).

## `@socialista/db` conventions

```
packages/db/
├── connect.ts              # connectDb, disconnectDb, getMongoUri
├── index.ts                # public exports only
├── lib/schema.ts           # shared helpers (enumValues)
├── models/<entity>.model.ts
├── types/<entity>.types.ts
├── repo/<entity>.repo.ts   # query helpers used by API / Trigger
└── utils/                  # buildFilters, validators
```

### Model checklist

- Define TypeScript types/enums in `types/` first, then implement the Mongoose schema in `models/`.
- Prefer a matching `repo/` module for list/get/update patterns instead of scattering queries.
- Use `enumValues()` from `lib/schema.ts` for enum fields.
- Mark sensitive fields with `select: false` (passwords, access/refresh tokens).
- Add indexes for common query patterns and compound uniqueness where needed.
- Use `{ _id: false }` on embedded subdocuments that do not need their own `_id`.
- Export models, types, and repos through `index.ts` — consumers import from `@socialista/db` only.

### Connection

```typescript
import { connectDb, UserModel } from '@socialista/db'

await connectDb()
const users = await UserModel.find({ status: 'active' })
```

`connectDb()` caches the connection for serverless reuse. Call `disconnectDb()` in Trigger task `finally` blocks and in tests.

## `@socialista/types` conventions

- Shared **wire** types for web ↔ API ↔ Trigger (payloads, responses, constants).
- Put new cross-package constants here (e.g. `TASK_IDS`, `ASPECT_RATIOS`, `STATIC_AD_MODEL`).
- Build after changes: `pnpm --filter @socialista/types run build`.

## `@socialista/trigger` conventions

```
packages/trigger/src/
├── client.ts                 # public exports for web (schemas, prompts, TASK_IDS re-exports)
├── task-types.ts             # task type map for Trigger clients
├── ai/                       # system prompts
├── schemas/                  # Zod payload schemas
├── providers/                # fal, Vercel AI image generators
├── services/                 # upload helpers
└── tasks/
    ├── image/                # generate-image-realtime, generate-static-ad-realtime
    └── shared/               # credits, workspace load, status metadata
```

- Tasks are discovered from `dirs: ["./src/tasks"]` in `trigger.config.ts`.
- Use `schemaTask` + Zod schemas; task `id` must match `TASK_IDS` in `@socialista/types`.
- Export schemas/types through `package.json` `exports` (`@socialista/trigger`, `./schemas/*`, `./task-types`).
- Prefer shared helpers in `tasks/shared/` for credits, status, and finalize — do not duplicate per task.
- Local: `pnpm dev:trigger`. Deploy: `pnpm deploy:trigger`.

## `@socialista/api` conventions

- Hono app entry: `apps/api/src/index.ts`.
- Structure: `routes/` → `controllers/` → services/utils; use `@socialista/db` repos.
- Keep route mounts in `index.ts` in sync when adding resources.
- Product URL extraction lives in API utils (`extract-product`) and is exposed via product routes.

## `@socialista/web` conventions

- App Router under `app/`. Dashboard shell: `app/(app)/dashboard/`.
- Colocate feature UI: `_components/`, `_actions/`, `_lib/` next to the route.
- Prefer existing `services/` for API calls; server actions for mutations that need session/Trigger.
- Next.js 16 may differ from older training data — check `apps/web/AGENTS.md` / local Next docs when unsure.
- React performance: follow `.agents/skills/vercel-react-best-practices` when writing or refactoring React/Next code.

## Adding packages & apps

### New shared package (`packages/`)

1. Create directory under `packages/<name>/`.
2. Set `"name": "@socialista/<name>"` in `package.json`.
3. Extend `@socialista/typescript-config` in `tsconfig.json`.
4. Add `build`, `lint`, and `check-types` scripts.
5. Declare workspace dependency: `"@socialista/foo": "workspace:^"`.

### New app (`apps/`)

1. Create under `apps/<name>/`.
2. Depend on shared packages via `workspace:^` / `workspace:*`.
3. Register tasks in `turbo.json` if new task types or env vars are needed.

## Turborepo notes

- Root `package.json` scripts delegate to `turbo run` — put build logic in package scripts, not the root.
- Use `--filter=<package>` to run tasks for one package.
- Library packages that emit declarations (`db`, `types`) output to `dist/`; ensure `build` produces them before dependents consume updates.

## What to verify before finishing

1. `pnpm --filter <changed-package> run build` (when the package has a build)
2. `pnpm --filter <changed-package> run check-types` (when available)
3. `pnpm --filter <changed-package> run lint` (when available)

For cross-package changes, run checks on all affected packages (often `types` → `db` → `api`/`trigger`/`web`).

## Out of scope unless asked

- Creating git commits or pull requests
- Updating README or other docs the user did not request
- Adding dependencies without a clear need
- Large refactors beyond the task at hand
