# Scout

AI-assisted product delivery platform — from feature request to shipped release.

See [docs/SCOUT-SPEC.md](./docs/SCOUT-SPEC.md) for the full product and engineering specification.

## Stack

- **Monorepo:** Turborepo + pnpm workspaces
- **Web app:** Next.js (`apps/web`)
- **UI:** shadcn/ui (in `apps/web`)

## Getting started

```bash
corepack enable
corepack prepare pnpm@10.33.4 --activate
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

## Adding shadcn components

```bash
pnpm dlx shadcn@latest add card dialog -c apps/web
```

Components are added to `apps/web/components/ui`.
