FROM oven/bun:1.2.4-alpine AS base

FROM base AS builder
WORKDIR /app

# Copy root package.json and lockfile
COPY package.json ./
COPY bun.lock ./

# Copy the web package.json and packages
COPY apps/web/package.json ./apps/web/package.json
COPY packages ./packages

RUN bun install

# Copy app source
COPY . .

# Build the project
RUN cd apps/web && bun run build

FROM base AS runner
WORKDIR /app

# Don't run production as root
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs
USER nextjs

# Copy built application
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/static ./apps/web/.next/static
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/public ./apps/web/public

EXPOSE 3000

CMD ["node", "apps/web/server.js"]