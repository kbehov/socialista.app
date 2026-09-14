# AGENTS.md

Coding agents for **Socialista** — pnpm + Turborepo monorepo: Next.js dashboard (`@socialista/web`), Hono API (`@socialista/api`), Mongoose (`@socialista/db`), wire types (`@socialista/types`), Trigger.dev jobs (`@socialista/trigger`). Product: create social creatives → publish to connected channels → measure analytics. **Scope:** `@socialista/*` only (not `@repo/*`).

## Agent verification (Cursor)

Unless the user asks otherwise:

| Do | Don't |
| --- | --- |
| `pnpm --filter <pkg> run lint` / `check-types` on **touched** packages only | Root `pnpm lint`, `pnpm check-types`, `pnpm build`, `turbo run build` |
| `pnpm --filter <pkg> run build` only for changed libs that emit `dist/`: `types`, `db`, `trigger`, `ai`, `email` | `@socialista/web` / `next build`, API `build` unless user asks |
| Dependency order when cross-package: `types` → `db` → `trigger` / `api` / `web` | `pnpm dev*`, deploy, smoke/e2e/Playwright, browsers, screenshots |

`@socialista/web`: usually `lint` only (no `check-types` script). `@socialista/api`: no `lint`/`check-types` scripts — skip API `build` unless asked.

After editing `types` or `db`, build that package so dependents see declarations.

## Coding & git

1. Smallest correct diff; match surrounding patterns; no drive-by refactors.
2. **Types:** `interface` for documents, `type` for unions; `.js` extensions on relative imports in `packages/*` and `apps/api` (NodeNext). Persisted enums in db/types.
3. **Split:** Mongoose shapes → `@socialista/db`; wire DTOs/constants → `@socialista/types` (e.g. `TASK_IDS`, `PromptKey`, `ConnectProvider`).
4. Comments only for non-obvious logic. Tests only when requested or high value.
5. New env vars used in code → add to `turbo.json` `globalEnv`. No `dotenv` in shared libs (except API owns process env).
6. **Git:** no commit/push unless asked; no hook skip, force-push main, or amend others' commits.

## Layout & commands

```
apps/web, apps/api | packages/db, types, trigger, ai, email, eslint-config, typescript-config
```

Humans: `pnpm dev`, `pnpm build`, `dev:web` / `dev:api` / `dev:trigger`, `deploy:trigger`. Agents: filtered tasks only (see above).

| Package | Role |
| --- | --- |
| web | UI, NextAuth, OAuth connector, API client, Trigger hooks |
| api | Hono CRUD, R2, billing; routes in `src/index.ts` |
| db | Models, repos, `connectDb` / `disconnectDb` (disconnect in Trigger `finally`) |
| types | Shared DTOs/constants; `build` after changes |
| trigger | `schemaTask` + Zod; `id` = `TASK_IDS`; tasks under `src/tasks/`; shared logic in `tasks/shared/` |

**Web:** App Router `app/(app)/dashboard/`; routes in `apps/web/constants/app-routes.ts`. API via `lib/api.ts`; clients in `services/`. Studio: colocate `_actions/`, `_lib/`; publishing in `components/posts/`, `components/accounts/`. OAuth: `lib/connector/` + `app/api/connect/<provider>/`. Next.js 16 nuances → `apps/web/AGENTS.md`.

**Dashboard paths (under `dashboard/`):** `files` (home), `analytics`, `accounts`, `posts`, `studio/images|static-ads|slideshows|videos|influencers|ugc`, `context/brands|products|skills`, `generations`, `settings`, `upgrade`. Manager `/manager/*` is ops-only.

**db:** `types/` then `models/`; `repo/` for queries; `enumValues()`; secrets `select: false`; export via package `index` only. Lists: `account.repo` / `post.repo` + `buildFilters`.

## Domain (quick reference)

Models in `@socialista/db`: User, Workspace, Project, Account (social channel), Post, Generation, Brand, Product, Skill, Influencer, UgcProject, Image, Slideshow, Video, Notification, AccountAnalyticsSnapshot, Invitation, …

- `User.oauthAccounts` = app sign-in; **`Account`** = connected social channel for publishing.
- **Post** = publish workflow (`draft`…`published`); **Generation** = AI run history.
- Brands/products/skills = studio **inputs**; influencers/UGC = studio **assets**.
- **ConnectProvider:** facebook, instagram, tiktok, threads, linkedin (OAuth in web). Post types: text, image, video, reel, carousel. One post doc = one account.

Credits/limits on workspace; enforced in Trigger before generation. Skills: `tasks/shared/skills.ts`.

## Out of scope unless asked

Commits, PRs, extra docs, new dependencies, large refactors, full builds, deploys, dev servers, e2e/smoke/browser verification.
