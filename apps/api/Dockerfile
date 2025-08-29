FROM oven/bun:1.2.4-alpine

WORKDIR /app

# Install wget for health checks
RUN apk add --no-cache wget

# Copy root package.json and lockfile
COPY package.json ./
COPY bun.lock ./

# Copy the api package.json and packages
COPY apps/api/package.json ./apps/api/package.json
COPY packages ./packages

RUN bun install

# Copy app source
COPY . .

# Build the API (with sourcemaps, no minify for diagnosis)
RUN cd apps/api && bun build src/index.ts --outdir dist --target bun --sourcemap --minify=false

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 hono
RUN chown -R hono:nodejs /app
USER hono

EXPOSE 3000

CMD ["bun", "run", "apps/api/dist/index.js"]