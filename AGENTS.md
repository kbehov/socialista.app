# AGENTS.md

Instructions for coding agents working in the **Socialista** repository — a social content studio and publishing workspace.

## What Socialista is

**Socialista** is a social content studio for creators, agencies, and brands. Users create multi-format creatives, publish to connected channels, and measure performance — without exporting files between tools.

**Positioning (product copy):** “The fastest way to create social content.” Tagline: social content studio for creators, agencies, and brands.

**Core loop:** Create → Publish → Measure

| Stage | What users do |
| ----- | ------------- |
| **Create** | Generate images, static ads, carousels/slideshows, short video, AI influencers, and UGC talking clips — steered by brand voice, product catalog, and reusable skills |
| **Publish** | Connect social accounts, compose per-platform variants, schedule from a calendar, publish without leaving the workspace |
| **Measure** | Workspace + per-account analytics next to the posts and generations that produced them |

**Who it is for:** Teams that need on-brand social creatives at volume (stills, ads, carousels, UGC, video), shared workspace context (brands, products, skills), and one place to schedule and review performance.

**What “workspace” means here:** A team/org container with members, plan limits/credits, connected social accounts, studio assets, and optional **projects** (scoped sub-containers inside a workspace). Generation and publishing stay workspace-scoped; many queries also accept `projectId`.

## Project overview

The codebase is a **pnpm + Turborepo monorepo** that powers that product: dashboard + studio UI, REST API, MongoDB models, shared wire types, and Trigger.dev background jobs (AI generation, publish, analytics, token refresh).

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
| Social OAuth    | Meta (Facebook/Instagram), Instagram Login, TikTok, Threads, LinkedIn  |
| Node            | >= 18                                                                  |

**Workspace packages use the `@socialista/*` scope.** Do not introduce `@repo/*` or other scopes.

## Repository layout

```
socialista.app/
├── apps/
│   ├── web/                 # @socialista/web — Next.js dashboard, studio, publishing
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

| Package              | Role                                                                                                      |
| -------------------- | --------------------------------------------------------------------------------------------------------- |
| `@socialista/web`    | UI, NextAuth session, server actions, social OAuth connector, Trigger.dev client hooks, calls the API     |
| `@socialista/api`    | Auth tokens, CRUD (accounts, posts, generations, brands, products, skills, influencers, UGC, …), R2, billing |
| `@socialista/db`     | Models, repos, filters, connection helpers — used by API and Trigger tasks                                |
| `@socialista/types`  | Cross-app DTOs & constants (`TASK_IDS`, ratios, `PromptKey`, account/post DTOs)                           |
| `@socialista/trigger`| AI generation (image, static-ad, video, slideshow, influencer, UGC), publish, analytics, token refresh   |

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

| Area             | Examples                                                                 |
| ---------------- | ------------------------------------------------------------------------ |
| Database         | `MONGODB_URI`, `DATABASE_URL`                                            |
| API / web        | `PORT`, `API_URL`, `NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_APP_URL`          |
| Auth             | `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`, `AUTH_SECRET`, Google OAuth   |
| Billing          | `POLAR_*`, `NEXT_PUBLIC_POLAR_PRO_PRODUCT_ID`, Stripe (legacy/optional)   |
| Storage          | `R2_*`                                                                   |
| AI / jobs        | `TRIGGER_*`, `FAL_KEY`, `AI_GATEWAY_API_KEY`, `INTERNAL_API_SECRET`      |
| Media            | `UNSPLASH_*`, `PINTEREST_*`                                              |
| Social connectors| `META_*`, `INSTAGRAM_*`, `TIKTOK_*`, `THREADS_*`, `LINKEDIN_*`           |

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

## Feature map (product → code)

Use this when deciding where a change belongs:

| Feature | User value | Primary surface |
| ------- | ---------- | --------------- |
| **Images** | Prompt studio; native social ratios; brand-aware stills | `studio/images/`, image Trigger tasks |
| **Static ads** | Product catalog → framed ads with headline / offer / CTA in-layout | `studio/images/static-ads/` |
| **Slideshows** | Carousel editor + AI slideshow generation; publish as carousel posts | `studio/slideshows/` |
| **Videos** | Browser timeline (trim/caption/export MP4) + AI video generation | `studio/videos/` |
| **Influencers** | Persistent AI personas (generate/clone); reuse across stills & UGC | `studio/influencers/` |
| **UGC ads** | Script → talent → scene stills → phone-native talking clips (audio/video takes) | `studio/ugc/` |
| **Accounts** | OAuth-connected social channels for publishing | `accounts/`, `lib/connector/` |
| **Posts** | Multi-platform composer, variants, calendar, schedule/publish | `posts/`, `components/posts/` |
| **Analytics** | Workspace overview + per-account insights (synced via Trigger) | `analytics/`, `accounts/analytics/[id]` |
| **Context & skills** | Brands (voice/logo/colors), Products (catalog), Skills (prompt instructions by `PromptKey`) | `context/brands|products|skills` |
| **Generations** | AI run history; reopen / continue from prior runs | `generations/` |
| **Files** | Workspace media library on R2 | `files/` |
| **Projects** | Named scopes inside a workspace (sidebar `ProjectSwitcher`) | `Project` model; many list APIs take `projectId` |
| **Settings / billing** | Members, Polar plans (credits, seats, accounts, scheduled posts) | `settings/`, `upgrade/` |

Landing copy for these features lives in `apps/web/components/landing/content.ts` — keep product language consistent when changing marketing or empty states.

## Domain model

Core entities in `@socialista/db`:

| Entity            | Model                              | Purpose                                                                 |
| ----------------- | ---------------------------------- | ----------------------------------------------------------------------- |
| **User**          | `UserModel`                        | App user. `oauthAccounts` = sign-in providers (Google, GitHub, etc.).   |
| **Workspace**     | `WorkspaceModel`                   | Team/org container: members, plan limits, usage, billing.               |
| **Project**       | `ProjectModel`                     | Scoped container inside a workspace (name, timezone, default/archived). |
| **Account**       | `AccountModel`                     | Social platform channel connected to a workspace for publishing.        |
| **Post**          | `PostModel`                        | Draft / scheduled / published post targeting one account + provider.    |
| **Generation**    | `GenerationModel`                  | Persisted AI run record + Trigger run metadata (image, ad, video, …).   |
| **Brand**         | `BrandModel`                       | Brand context (name, voice/description, logo, colors) for studio runs.  |
| **Product**       | `ProductModel`                     | Catalog product (URL extract + manual fields) for ads / UGC / studio.   |
| **Skill**         | `SkillModel`                       | Reusable prompt instructions keyed by `PromptKey` / target.             |
| **Influencer**    | `InfluencerModel`                  | AI persona roster (generate / clone); identity for stills & UGC.        |
| **UgcProject**    | `UgcProjectModel`                  | Multi-step UGC pipeline (product → scenes → avatar → script → video).   |
| **Image**         | `ImageModel` / collections         | Generated & uploaded images, collections/folders.                       |
| **Slideshow**     | `SlideshowModel`                   | Multi-slide canvas compositions.                                        |
| **Video**         | `VideoModel`                       | Timeline-based video projects.                                          |
| **Notification**  | `NotificationModel`                | In-app notifications for workspace users.                               |
| **Account analytics** | `AccountAnalyticsSnapshotModel` | Synced performance snapshots per connected account.                     |
| **Inspiration**   | Inspiration models                 | Inspiration/reference content (also used in manager ops).               |
| **Model**         | `ModelModel`                       | AI model catalog (provider, cost, capabilities).                        |
| **Invitation**    | `InvitationModel`                  | Workspace invites.                                                      |

**Naming distinction:** `oauthAccounts` on User ≠ `Account` model. The former is **app auth**; the latter is a **managed social channel** used for publishing.

**Post vs Generation:** Posts are social publishables (draft → scheduled → published). Generations are AI job history (studio runs), not publish payloads.

**Context vs Studio:** Brands, products, and skills are **inputs** the studio reads. Influencers and UGC projects are **studio outputs / assets** that can feed posts.

Credits/limits are enforced on the workspace (checked in Trigger tasks before generation). Skills are injected into generation via shared Trigger helpers (`tasks/shared/skills.ts`).

### Account & post shapes (agents)

- **Providers** (`SocialProvider`): `instagram`, `facebook`, `twitter`, `linkedin`, `tiktok`, `youtube`, `pinterest`, `threads`.
- **Connectable today** (`ConnectProvider`): `facebook`, `instagram`, `tiktok`, `threads`, `linkedin` — OAuth lives in the web app (`apps/web/lib/connector/`, `app/api/connect/`).
- **Connection status**: `pending` | `connected` | `disconnected` | `error`. Tokens are `select: false` on the model and never returned in public DTOs.
- **Post types**: `text` | `image` | `video` | `reel` | `carousel` (slideshows publish as carousel).
- **Post status**: `draft` | `scheduled` | `publishing` | `published` | `failed` | `canceled`.
- One post document = one account. Multi-account compose creates one post per selected account (platform variants / captions can differ).

## Product surface (dashboard)

Under `apps/web/app/(app)/dashboard/`. Sidebar IA roughly: **Platform** (Analytics / Accounts / Posts) → **Studio** (six tools) → **Workspace** (Context & skills / Generations). Files remain a primary media home (`DASHBOARD_ROUTES.HOME` → `/dashboard/files`).

| Area                 | Path                              | Notes                                                                 |
| -------------------- | --------------------------------- | --------------------------------------------------------------------- |
| Analytics            | `analytics/` (also dashboard root)| Workspace performance overview                                        |
| Accounts             | `accounts/`                       | Connect / manage social channels; OAuth callback handling             |
| Account analytics    | `accounts/analytics/[id]`         | Per-channel insights                                                  |
| Posts                | `posts/`, `posts/create/`         | List + calendar; multi-platform composer                              |
| Studio — images      | `studio/images/`                  | Prompt studio + realtime runs (`[runId]`)                             |
| Studio — ads         | `studio/images/static-ads/`       | Product-aware static ad generation                                    |
| Studio — slides      | `studio/slideshows/`              | Carousel editor + AI slideshow runs                                   |
| Studio — video       | `studio/videos/`                  | Timeline editor + AI video / captions / export                        |
| Studio — influencers | `studio/influencers/`             | Persona library; create / clone                                       |
| Studio — UGC         | `studio/ugc/`                     | UGC project wizard (script → stills → audio/video)                    |
| Context              | `context/`                        | Hub for brands, products, skills                                      |
| Brands               | `context/brands/`                 | Brand voice / logo / colors                                           |
| Products             | `context/products/`               | Catalog (URL extract or form); old `/dashboard/products` redirects    |
| Skills               | `context/skills/`                 | Reusable prompt instructions                                          |
| Generations          | `generations/`                    | Workspace AI run history                                              |
| Files                | `files/`                          | Workspace file browser / folders                                      |
| Notifications        | `notifications/`                  | In-app notification center                                            |
| Settings             | `settings/`, `members/`, `billing/` | Workspace settings, team, billing                                   |
| Account (user)       | `account/`                        | Signed-in user profile                                                |
| Upgrade              | `upgrade/`                        | Polar paywall / plan upgrade                                          |

Route constants live in `apps/web/constants/app-routes.ts` (`DASHBOARD_ROUTES`). Keep sidebar active-state helpers in sync when adding paths. Command palette mirrors create/nav for studio tools including UGC and influencers.

Web talks to the API via `apps/web/lib/api.ts` (Bearer + `x-user-id`). Domain clients live in `apps/web/services/`. Studio Trigger flows use colocated `_actions/` and hooks (e.g. `use-generation-run`, `use-static-ad-generation-run`).

Internal **manager** (`/manager/…`) is ops-only (inspirations, models, files) — separate from the user dashboard.

### Publishing UI (posts & accounts)

| Area            | Location                                                                 | Notes                                                                 |
| --------------- | ------------------------------------------------------------------------ | --------------------------------------------------------------------- |
| Post composer   | `apps/web/components/posts/composer/`                                    | Account picker, media/carousel, schedule, platform variants, previews |
| Posts list UI   | `apps/web/components/posts/`                                             | Table / calendar, toolbar filters, status badges                      |
| Accounts UI     | `apps/web/components/accounts/`                                          | Connect dialog, Meta page picker, edit dialog, OAuth result handler   |
| Connector       | `apps/web/lib/connector/`                                                | Per-provider OAuth + token exchange; configs assert env is set        |
| Connect routes  | `apps/web/app/api/connect/<provider>/`                                   | Start + callback (Facebook also has `accounts` + `finalize`)          |
| Filters         | `apps/web/lib/post-filters.ts`, `account-filters.ts`                     | URL search-param ↔ API query helpers                                  |

Platform preview components live under `composer/previews/` and are registered in `preview-registry.ts`. Prefer extending the registry over scattering provider conditionals.

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

### Posts & accounts repos

- Prefer `account.repo` / `post.repo` + `buildFilters` for workspace-scoped list queries (provider, status, search, date range, pagination).
- Account uniqueness: `(workspace, provider, providerAccountId)`.
- Post indexes support publish workers (`status` + `scheduledAt`) and workspace calendar/list views.

## `@socialista/types` conventions

- Shared **wire** types for web ↔ API ↔ Trigger (payloads, responses, constants).
- Put new cross-package constants here (e.g. `TASK_IDS`, `ASPECT_RATIOS`, `STATIC_AD_MODEL`, `ConnectProvider`, `PromptKey`).
- Account/post DTOs omit secrets; use `AccountSummary` for lean list rows when the UI does not need tokens/scopes/metadata.
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
    ├── image/                # realtime image + static-ad generation
    ├── video/                # realtime video, captions, export
    ├── slideshow/            # realtime slideshow generation
    ├── influencer/           # generate + clone influencers
    ├── ugc/                  # UGC stills, audio, video
    ├── posts/                # publish-post
    ├── analytics/            # fetch + sweep account analytics
    ├── accounts/             # refresh-account-token
    └── shared/               # credits, workspace, skills, status, notify
```

- Tasks are discovered from `dirs: ["./src/tasks"]` in `trigger.config.ts`.
- Use `schemaTask` + Zod schemas; task `id` must match `TASK_IDS` in `@socialista/types` (image/static-ad/video/slideshow generation, influencer generate/clone, UGC stills/audio/video, video captions/export, publish-post, analytics fetch/sweep, refresh-account-token).
- Export schemas/types through `package.json` `exports` (`@socialista/trigger`, `./schemas/*`, `./task-types`).
- Prefer shared helpers in `tasks/shared/` for credits, skills injection, status, and finalize — do not duplicate per task.
- Generation documents are written/updated so the Generations dashboard and studio run pages stay in sync.
- Local: `pnpm dev:trigger`. Deploy: `pnpm deploy:trigger`.

## `@socialista/api` conventions

- Hono app entry: `apps/api/src/index.ts`.
- Structure: `routes/` → `controllers/` → services/utils; use `@socialista/db` repos.
- Keep route mounts in `index.ts` in sync when adding resources (current: `/accounts`, `/posts`, `/generations`, products, studio entities, billing, …).
- Product URL extraction lives in API utils (`extract-product`) and is exposed via product routes.
- Social **OAuth** is owned by the web app connector routes; the API stores/serves account + post CRUD after connect/finalize.

## `@socialista/web` conventions

- App Router under `app/`. Dashboard shell: `app/(app)/dashboard/`.
- Colocate feature UI: `_components/`, `_actions/`, `_lib/` next to the route when studio-specific; shared publishing UI lives under `components/posts/` and `components/accounts/`.
- Prefer existing `services/` for API calls; server actions for mutations that need session/Trigger (see `actions/post.actions.ts`).
- Social connect: implement provider logic in `lib/connector/`, wire `app/api/connect/<provider>/`, then surface UX in `components/accounts/`.
- New studio formats (influencers, UGC) and context entities (brands, skills) follow the same pattern: types/db → API routes → web services → dashboard route + sidebar/`DASHBOARD_ROUTES`.
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
