name: Build and Push Images

on:
  push:
    branches:
      - main

permissions:
  packages: write

jobs:
  commit-hash:
    runs-on: ubuntu-latest
    outputs:
      commit_hash: ${{ steps.get_commit.outputs.commit_hash }}
    steps:
      - uses: actions/checkout@v4
      - name: Get commit hash
        id: get_commit
        run: echo "commit_hash=$(git rev-parse HEAD)" >> $GITHUB_OUTPUT

  build-and-push-api:
    needs:
      - commit-hash
    runs-on: ubuntu-latest
    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Set up QEMU
        uses: docker/setup-qemu-action@v3

      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v3

      - name: Log in to the Container registry
        uses: docker/login-action@v3
        with:
          registry: ghcr.io
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}

      - name: Build and push API Docker image
        uses: docker/build-push-action@v5
        with:
          context: .
          file: ./apps/api/Dockerfile
          platforms: linux/amd64,linux/arm64
          push: true
          tags: |
            ghcr.io/${{ github.repository }}/viralkan-api:${{ needs.commit-hash.outputs.commit_hash }}
            ghcr.io/${{ github.repository }}/viralkan-api:latest

  build-and-push-web:
    needs:
      - commit-hash
    runs-on: ubuntu-latest
    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Set up QEMU
        uses: docker/setup-qemu-action@v3

      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v3

      - name: Log in to the Container registry
        uses: docker/login-action@v3
        with:
          registry: ghcr.io
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}

      - name: Build and push Web Docker image
        uses: docker/build-push-action@v5
        with:
          context: .
          file: ./apps/web/Dockerfile
          platforms: linux/amd64,linux/arm64
          push: true
          build-args: |
            NEXT_PUBLIC_FIREBASE_API_KEY=${{ vars.NEXT_PUBLIC_FIREBASE_API_KEY }}
            NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=${{ vars.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN }}
            NEXT_PUBLIC_FIREBASE_PROJECT_ID=${{ vars.NEXT_PUBLIC_FIREBASE_PROJECT_ID }}
            NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=${{ vars.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET }}
            NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=${{ vars.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID }}
            NEXT_PUBLIC_FIREBASE_APP_ID=${{ vars.NEXT_PUBLIC_FIREBASE_APP_ID }}
            NEXT_PUBLIC_API_URL=https://viral-api.faldi.xyz
          tags: |
            ghcr.io/${{ github.repository }}/viralkan-web:${{ needs.commit-hash.outputs.commit_hash }}
            ghcr.io/${{ github.repository }}/viralkan-web:latest

  deploy-to-vps:
    needs: [build-and-push-api, build-and-push-web, commit-hash]
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to VPS
        uses: appleboy/ssh-action@master
        with:
          host: ${{ secrets.VPS_HOST }}
          username: ${{ secrets.VPS_USERNAME }}
          key: ${{ secrets.SSH_PRIVATE_KEY }}
          script: |
            # Navigate to project directory
            cd ~/projects/viralkan-app || {
              echo "Project directory not found. Creating projects directory and cloning repository..."
              mkdir -p ~/projects
              git clone https://github.com/naufaldi/viralkan-app.git ~/projects/viralkan-app
              cd ~/projects/viralkan-app
            }

            # Update to latest code
            git pull origin main || true

            # Login to GitHub Container Registry
            echo "${{ secrets.GITHUB_TOKEN }}" | docker login ghcr.io -u ${{ github.actor }} --password-stdin

            # Pull the latest images (both commit-specific and latest tags)
            echo "📦 Pulling latest images..."
            docker pull ghcr.io/${{ github.repository }}/viralkan-api:${{ needs.commit-hash.outputs.commit_hash }}
            docker pull ghcr.io/${{ github.repository }}/viralkan-api:latest
            docker pull ghcr.io/${{ github.repository }}/viralkan-web:${{ needs.commit-hash.outputs.commit_hash }}
            docker pull ghcr.io/${{ github.repository }}/viralkan-web:latest

            # Create environment file if it doesn't exist
            if [ ! -f .env.production ]; then
              echo "Creating .env.production file..."
              cat > .env.production << EOF
            GITHUB_REPOSITORY=${{ github.repository }}
            IMAGE_TAG=${{ needs.commit-hash.outputs.commit_hash }}
            DB_PASSWORD=your_secure_password
            FIREBASE_SERVICE_ACCOUNT_JSON=your_firebase_json
            JWT_SECRET=your_jwt_secret
            R2_ACCESS_KEY_ID=your_r2_access_key
            R2_SECRET_ACCESS_KEY=your_r2_secret_key
            R2_BUCKET_NAME=your_bucket_name
            R2_ENDPOINT=your_r2_endpoint
            R2_PUBLIC_URL=your_r2_public_url
            ADMIN_EMAILS=your_admin_emails
            OPENROUTER_API_KEY=your_openrouter_key
            OPENROUTER_BASE_URL=your_openrouter_url
            AI_MODEL_FREE=your_free_model
            AI_MODEL_PAID=your_paid_model
            AI_MAX_TOKENS=your_max_tokens
            AI_TEMPERATURE=your_temperature
            NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
            NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
            NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_firebase_project_id
            NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
            NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
            NEXT_PUBLIC_FIREBASE_APP_ID=your_firebase_app_id
            NEXT_PUBLIC_API_URL=https://viral-api.faldi.xyz
            EOF
            fi

            # Download the actual docker-compose.prod.yml from the repository
            curl -H "Authorization: token ${{ secrets.GITHUB_TOKEN }}" \
                 -H "Accept: application/vnd.github.v3.raw" \
                 -o docker-compose.prod.yml \
                 https://api.github.com/repos/${{ github.repository }}/contents/docker-compose.prod.yml

            # Deploy using the actual docker-compose.prod.yml
            docker-compose -f docker-compose.prod.yml --env-file .env.production down || true

            # Start only the DB so we can run migrations against it
            docker-compose -f docker-compose.prod.yml --env-file .env.production up -d db

            # Wait for Postgres to be ready (tries ~60s)
            echo "Waiting for Postgres to be ready..."
            for i in $(seq 1 30); do
              docker-compose -f docker-compose.prod.yml --env-file .env.production exec -T db pg_isready -U postgres &>/dev/null && { echo "Postgres is ready"; break; }
              echo "Waiting for Postgres... attempt $i"
              sleep 2
            done

            # Ensure PostGIS extension exists (best-effort)
            docker-compose -f docker-compose.prod.yml --env-file .env.production exec -T db psql -U postgres -d viralkan -c "CREATE EXTENSION IF NOT EXISTS postgis;" || echo "Warning: couldn't create postgis extension (image may not support it)"

            # Run database migrations (idempotent) every deploy
            echo "Running database migrations..."
            docker run --rm --network viralkan-private --env-file .env.production ghcr.io/${{ github.repository }}/viralkan-api:${{ needs.commit-hash.outputs.commit_hash }} bun run db:migrate || {
              echo "Migrations failed" >&2
              docker-compose -f docker-compose.prod.yml --env-file .env.production logs --tail=200 db
              exit 1
            }

            # After migrations, ensure administrative data exists (provinces/regencies/districts)
            echo "Checking administrative tables (provinces)..."
            PROVINCES_EXISTS=$(docker-compose -f docker-compose.prod.yml --env-file .env.production exec -T db psql -U postgres -d viralkan -tAc "SELECT to_regclass('public.provinces') IS NOT NULL;")

            if [ "${PROVINCES_EXISTS}" != "t" ]; then
              echo "Provinces table missing — running CSV importer via API image"
              RUN_IMPORT="yes"
            else
              PROVINCES_COUNT=$(docker-compose -f docker-compose.prod.yml --env-file .env.production exec -T db psql -U postgres -d viralkan -tAc "SELECT COUNT(*) FROM provinces;" || echo "0")
              if [ "${PROVINCES_COUNT}" = "0" ]; then
                echo "Administrative tables empty — running CSV importer via API image"
                RUN_IMPORT="yes"
              else
                echo "Administrative tables populated (count=${PROVINCES_COUNT}) — skipping CSV import"
                RUN_IMPORT="no"
              fi
            fi

            if [ "${RUN_IMPORT}" = "yes" ]; then
              docker run --rm --network viralkan-private --env-file .env.production ghcr.io/${{ github.repository }}/viralkan-api:${{ needs.commit-hash.outputs.commit_hash }} sh -c "cd apps/api && bun run import:admin-data" || {
                echo "CSV import failed" >&2
                docker-compose -f docker-compose.prod.yml --env-file .env.production logs --tail=200 db
                exit 1
              }
            fi

            # Ensure external 'edge' network exists (used by caddy reverse proxy)
            docker network create edge || true

            # Bring up remaining services
            docker-compose -f docker-compose.prod.yml --env-file .env.production up -d

            # Clean up old images
            docker image prune -f
