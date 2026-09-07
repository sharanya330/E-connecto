

> Brief: Next.js web project — prepared for production deployment.

## Quick start (local)

```bash
# ensure corepack & pnpm
corepack enable
corepack prepare pnpm@latest --activate

pnpm install
pnpm dev            # development server
pnpm build          # production build
pnpm start          # start production server
```

## Environment variables

Copy `.env.example` to `.env.local` for local development and set real values:

```
# Copy this file to .env.local (for local dev) or set the variables in your deployment platform
# Replace example values with real secrets

NEXT_PUBLIC_API_URL=your_public_value_here
NEXT_PUBLIC_GOOGLE_ANALYTICS_ID=your_public_value_here
NODE_ENV=replace_with_real_value
SECRET_KEY=replace_with_real_value

```

## Deployment

Recommended options:

- **Vercel:** easiest for Next.js. Connect the repo and set environment variables in Vercel UI.
- **Docker / Cloud Run / ECS:** a `Dockerfile` can be added for container deployment (not committed by default).
- **Static export:** if your app is fully static, you can use `next export` and serve from CDN.

## CI / Quality checks

Consider adding GitHub Actions to run `pnpm lint` and `pnpm build` on PRs.

## Troubleshooting

- If build fails, ensure `NODE_ENV` and other required env vars are set.
- If images break with `next/image`, add external domains to `next.config.js`.

---
Generated on 2025-10-30T11:52:08.615450 UTC
