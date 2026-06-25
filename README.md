# Scout

AI-assisted product delivery platform — from feature request to shipped release.

See [docs/SCOUT-SPEC.md](./docs/SCOUT-SPEC.md) for the full product and engineering specification.

## Stack

- **Monorepo:** Turborepo + pnpm workspaces
- **Web app:** Next.js (`apps/web`)
- **UI:** shadcn/ui (in `apps/web`)
- **Database:** PostgreSQL (Neon) + Drizzle (`packages/db`)
- **Auth:** Better Auth (`packages/auth`)

## Getting started

```bash
corepack enable
corepack prepare pnpm@10.33.4 --activate
pnpm install
./setup.sh
# Edit .env at repo root (DATABASE_URL, BETTER_AUTH_SECRET, BETTER_AUTH_URL)
pnpm --filter @workspace/db db:generate
pnpm --filter @workspace/db db:migrate   # or db:push for dev
pnpm dev
```

`setup.sh` copies `.env.example` → `.env` at the repo root, then hard-links that file into each `apps/*` and `packages/*` workspace as `.env` (via the `link` command). Run it from the repo root.

Generate `BETTER_AUTH_SECRET`:

```bash
pnpm dlx auth@latest secret
```

Open [http://localhost:3000](http://localhost:3000). Auth API: `/api/auth/*`.

Regenerate Better Auth Drizzle schema after plugin changes:

```bash
pnpm db:auth:generate
```

## Adding shadcn components

```bash
pnpm dlx shadcn@latest add card dialog -c apps/web
```

Components are added to `apps/web/components/ui`.
