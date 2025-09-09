FROM oven/bun:1.2.4 AS base
WORKDIR /app

# Install wget for health checks (Debian-based official Bun image)
USER root
RUN apt-get update && apt-get install -y --no-install-recommends wget ca-certificates \
  && rm -rf /var/lib/apt/lists/*

# Copy root package.json and lockfile
COPY package.json ./
COPY bun.lock ./

# Copy the api package.json and packages
COPY apps/api/package.json ./apps/api/package.json
COPY packages ./packages

RUN bun install

# Copy app source
COPY . .

# Build the API (with sourcemaps)
RUN cd apps/api && bun build src/index.ts --outdir dist --target bun --sourcemap

# Create non-root user
RUN addgroup --system --gid 1001 nodejs \
  && adduser --system --uid 1001 --ingroup nodejs hono \
  && chown -R hono:nodejs /app
USER hono

EXPOSE 3000

CMD ["bun", "run", "apps/api/dist/index.js"]
