FROM ubuntu:24.04

ENV DEBIAN_FRONTEND=noninteractive

# Install curl, wget, CA certs
RUN apt-get update && apt-get install -y --no-install-recommends \
    ca-certificates curl wget \
 && rm -rf /var/lib/apt/lists/*

# Install Bun (pinned)
ENV BUN_INSTALL=/bun
RUN curl -fsSL https://bun.sh/install | bash -s -- bun-v1.2.4
ENV PATH="/bun/bin:${PATH}"

WORKDIR /app

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
