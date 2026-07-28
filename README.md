# Turborepo starter

This Turborepo starter is maintained by the Turborepo core team.

## Using this example

Run the following command:

```sh
npx create-turbo@latest
```

## What's inside?

This Turborepo includes the following packages/apps:

### Apps and Packages

- `docs`: a [Next.js](https://nextjs.org/) app
- `web`: another [Next.js](https://nextjs.org/) app
- `@repo/ui`: a stub React component library shared by both `web` and `docs` applications
- `@repo/eslint-config`: `eslint` configurations (includes `eslint-config-next` and `eslint-config-prettier`)
- `@repo/typescript-config`: `tsconfig.json`s used throughout the monorepo

Each package/app is 100% [TypeScript](https://www.typescriptlang.org/).

### Utilities

This Turborepo has some additional tools already setup for you:

- [TypeScript](https://www.typescriptlang.org/) for static type checking
- [ESLint](https://eslint.org/) for code linting
- [Prettier](https://prettier.io) for code formatting

### Build

To build all apps and packages, run the following command:

With [global `turbo`](https://turborepo.dev/docs/getting-started/installation#global-installation) installed (recommended):

```sh
cd my-turborepo
turbo build
```

Without global `turbo`, use your package manager:

```sh
cd my-turborepo
npx turbo build
pnpm dlx turbo build
pnpm exec turbo build
```

You can build a specific package by using a [filter](https://turborepo.dev/docs/crafting-your-repository/running-tasks#using-filters):

With [global `turbo`](https://turborepo.dev/docs/getting-started/installation#global-installation) installed:

```sh
turbo build --filter=docs
```

Without global `turbo`:

```sh
npx turbo build --filter=docs
pnpm exec turbo build --filter=docs
pnpm exec turbo build --filter=docs
```

### Develop

To develop all apps and packages, run the following command:

With [global `turbo`](https://turborepo.dev/docs/getting-started/installation#global-installation) installed (recommended):

```sh
cd my-turborepo
turbo dev
```

Without global `turbo`, use your package manager:

```sh
cd my-turborepo
npx turbo dev
pnpm exec turbo dev
pnpm exec turbo dev
```

You can develop a specific package by using a [filter](https://turborepo.dev/docs/crafting-your-repository/running-tasks#using-filters):

With [global `turbo`](https://turborepo.dev/docs/getting-started/installation#global-installation) installed:

```sh
turbo dev --filter=web
```

Without global `turbo`:

```sh
npx turbo dev --filter=web
pnpm exec turbo dev --filter=web
pnpm exec turbo dev --filter=web
```

### Remote Caching

> [!TIP]
> Vercel Remote Cache is free for all plans. Get started today at [vercel.com](https://vercel.com/signup?utm_source=remote-cache-sdk&utm_campaign=free_remote_cache).

Turborepo can use a technique known as [Remote Caching](https://turborepo.dev/docs/core-concepts/remote-caching) to share cache artifacts across machines, enabling you to share build caches with your team and CI/CD pipelines.

By default, Turborepo will cache locally. To enable Remote Caching you will need an account with Vercel. If you don't have an account you can [create one](https://vercel.com/signup?utm_source=turborepo-examples), then enter the following commands:

With [global `turbo`](https://turborepo.dev/docs/getting-started/installation#global-installation) installed (recommended):

```sh
cd my-turborepo
turbo login
```

Without global `turbo`, use your package manager:

```sh
cd my-turborepo
npx turbo login
pnpm exec turbo login
pnpm exec turbo login
```

This will authenticate the Turborepo CLI with your [Vercel account](https://vercel.com/docs/concepts/personal-accounts/overview).

Next, you can link your Turborepo to your Remote Cache by running the following command from the root of your Turborepo:

With [global `turbo`](https://turborepo.dev/docs/getting-started/installation#global-installation) installed:

```sh
turbo link
```

Without global `turbo`:

```sh
npx turbo link
pnpm exec turbo link
pnpm exec turbo link
```

## Useful Links

Learn more about the power of Turborepo:

- [Tasks](https://turborepo.dev/docs/crafting-your-repository/running-tasks)
- [Caching](https://turborepo.dev/docs/crafting-your-repository/caching)
- [Remote Caching](https://turborepo.dev/docs/core-concepts/remote-caching)
- [Filtering](https://turborepo.dev/docs/crafting-your-repository/running-tasks#using-filters)
- [Configuration Options](https://turborepo.dev/docs/reference/configuration)
- [CLI Usage](https://turborepo.dev/docs/reference/command-line-reference)

## Analytics

Workspace analytics (Pro / Enterprise) pulls Instagram and Facebook Page performance
metrics on a schedule, stores time-series snapshots, and serves dashboard-ready
aggregates via the API.

### Data flow

```
POST /cron/analytics/sweep (every 5 min, internal secret)
  → analytics-sweep for current slot only (hash(accountId) % 144)
      pages premium workspaces → pages accounts in this slot
      → batchTrigger fetch-account-analytics in mini-batches of 100
          → fetch Graph profile + insights
          → normalize → upsert AccountAnalyticsSnapshot
  → GET /workspaces/:workspaceId/analytics/... (on-read aggregation)
```

Accounts are spread across a rolling 12h window (144 × 5-minute slots). Each account is fetched once per 12h, but 100k accounts trickle continuously instead of spiking twice a day.

### Snapshot cadence (gauges vs flows)

Instagram returns **gauges** (followers, following, media count) as point-in-time values and **flows** (views, reach, likes, …) as totals over a requested window.

- Snapshots are upserted **once per account per UTC calendar day** (`bucketAt` at 00:00).
  Re-running the sweep updates that same document (no same-day duplicates).
- Slots in the **00:00–12:00** window set `isDailyAnchor: true` (gauges + 24h flow window).
- Slots in the **12:00–00:00** window merge gauges into the same day’s doc without wiping flows.
- Read APIs **sum flows only on daily-anchor docs**; gauges use first/last in range.

### Premium gating

`hasAnalyticsAccess(workspace)` requires `billing.plan` in (`pro`, `enterprise`) and `billing.status === active`. The API middleware returns **403** for free workspaces. The fetch task re-checks entitlement at run time so lapsed subscriptions stop collecting.

### Platforms (this pass)

| Platform | Status | Notes |
| --- | --- | --- |
| Instagram (Page-linked) | Supported | `instagram_manage_insights` |
| Instagram Login | Supported after reconnect | `instagram_business_manage_insights` |
| Facebook Page | Supported after reconnect | Requires `read_insights` (+ Page access token) |
| TikTok / Threads / LinkedIn | Not yet | No fetcher in `ANALYTICS_FETCHERS` |

Page Insights map into the shared snapshot shape: `page_media_view` → views,
`page_total_media_view_unique` → reach, like reactions → likes, post engagements → engagement,
and `page_positive_feedback_by_type` → comments / shares when Meta returns them.
Saves are not available at Page level and are recorded as missing.
Legacy `page_impressions*` metrics were deprecated by Meta (Nov 2025) and are no longer requested.

`impressions` is never requested for Instagram (deprecated by Meta; use `views`). Missing metrics are recorded on the snapshot and surfaced in `dataQuality.missingMetrics`.

### API

- `GET /workspaces/:workspaceId/analytics/accounts/:accountId?range=daily|weekly|monthly`
- `GET /workspaces/:workspaceId/analytics/summary?range=daily|weekly|monthly`
- `POST /cron/analytics/sweep` — internal cron (header `x-internal-api-secret`); call **every 5 minutes**; each tick processes one hash slot (~1/144 of accounts)

Responses include current values, previous period, delta, `%` change, and a `series[]` ready for charts — no client-side aggregation required.

### Migration notes

- New collection `accountanalyticssnapshots` — no backfill.
- Existing `Account` documents get `analytics` defaults lazily (`status: ok` when absent).
- `analytics.refreshSlot` is set on create and backfilled by the sweep for older accounts.
- Indexes: `(account, bucketAt)` unique, `(workspace, bucketAt)`, `(provider, connectionStatus, analytics.refreshSlot, _id)`, plus billing plan/status sweep helpers.
- **Reconnect Facebook Pages** after deploying `read_insights` so existing Page tokens pick up the new permission.
