FROM oven/bun:1.2.4-alpine

WORKDIR /app

# Copy root package.json and lockfile
COPY package.json ./
COPY bun.lock ./

# Copy the api package.json
COPY apps/api/package.json ./apps/api/package.json

RUN bun install

# Copy app source
COPY . .

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 hono
RUN chown -R hono:nodejs /app
USER hono

EXPOSE 3000

CMD ["bun", "run", "apps/api/src/index.ts"]