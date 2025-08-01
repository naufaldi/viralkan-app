# Viralkan 🇮🇩

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Bun](https://img.shields.io/badge/Bun-1.2.4-black)](https://bun.sh)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8.2-blue)](https://www.typescriptlang.org/)
[![Turborepo](https://img.shields.io/badge/Turborepo-2.5.4-red)](https://turbo.build/)

> **Platform komunitas independen untuk menyebarkan informasi kerusakan jalan agar mendapat perhatian luas dan membantu sesama warga menghindari kerusakan sambil menciptakan tekanan publik untuk perbaikan infrastruktur.**

Viralkan adalah platform open-source yang memungkinkan warga Indonesia melaporkan dan membagikan informasi kerusakan jalan untuk menciptakan kesadaran publik dan mendorong perbaikan infrastruktur melalui kekuatan komunitas.

## ✨ Fitur Utama

- 📸 **Upload Foto Kerusakan** - Ambil foto dan laporkan kerusakan jalan dengan mudah
- 🗺️ **Pemetaan Lokasi** - Integrasi GPS untuk lokasi yang akurat
- 🚀 **Viral Sharing** - Bagikan laporan ke media sosial untuk perhatian yang lebih luas
- 👥 **Platform Komunitas** - Independen tanpa afiliasi pemerintah
- 📊 **Dashboard Analytics** - Lihat dampak dan statistik laporan
- 🔐 **Authentication** - Login dengan Google/Firebase
- 📱 **Mobile-First** - Desain responsif yang dioptimalkan untuk mobile

## 🚀 Quick Start

### Prerequisites

- [Bun](https://bun.sh) (v1.2.4 atau lebih baru)
- [PostgreSQL](https://postgresql.org) dengan ekstensi PostGIS
- Node.js 18+ (untuk kompatibilitas)

### Installation

1. **Clone repository**:
   ```bash
   git clone https://github.com/yourusername/viralkan-app.git
   cd viralkan-app
   ```

2. **Install dependencies**:
   ```bash
   bun install
   ```

3. **Set up environment variables**:
   ```bash
   cp .env.example .env
   # Edit .env dengan kredensial database dan konfigurasi lainnya
   ```

4. **Set up PostgreSQL dengan PostGIS**:
   ```bash
   # Menggunakan Docker (recommended)
   docker run --name postgres-viralkan \
     -e POSTGRES_PASSWORD=password \
     -e POSTGRES_DB=viralkan \
     -p 5432:5432 \
     -d postgis/postgis:15
   ```

5. **Run database migrations**:
   ```bash
   bun run db:migrate
   ```

6. **Start development servers**:
   ```bash
   bun run dev
   ```

Server akan berjalan di:
- 🌐 **Web App**: `http://localhost:3000`
- 🔧 **API Server**: `http://localhost:3000/api`
- 📚 **Docs**: `http://localhost:3001`

## 🏗️ Project Structure

```
viralkan-app/
├── apps/
│   ├── api/              # Hono API server (Clean Architecture)
│   │   ├── src/
│   │   │   ├── routes/   # API endpoints
│   │   │   ├── core/     # Business logic
│   │   │   ├── data/     # Database operations
│   │   │   └── shell/    # Service orchestration
│   │   └── tests/        # API tests
│   ├── web/              # Next.js 15 frontend
│   │   ├── app/          # App Router pages
│   │   ├── components/   # React components
│   │   ├── hooks/        # Custom hooks
│   │   └── services/     # API clients
│   └── docs/             # Next.js documentation site
├── packages/
│   ├── ui/               # Shared React component library
│   ├── eslint-config/    # ESLint configurations
│   └── typescript-config/ # TypeScript configurations
└── docs/                 # Project documentation
```

## 🛠️ Tech Stack

### Core Technologies
- **Runtime**: [Bun](https://bun.sh) 1.2.4
- **Monorepo**: [Turborepo](https://turbo.build/) 2.5.4  
- **Language**: [TypeScript](https://www.typescriptlang.org/) 5.8.2

### Backend
- **Framework**: [Hono](https://hono.dev/) 4.6.12
- **Database**: PostgreSQL 15 + PostGIS
- **Authentication**: Firebase Admin SDK
- **Validation**: [Zod](https://zod.dev/) 4.0.5
- **API Docs**: OpenAPI/Swagger

### Frontend  
- **Framework**: [Next.js](https://nextjs.org/) 15.3.0
- **React**: 19.1.0
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) v4
- **UI Components**: Custom library dengan Radix UI primitives
- **Forms**: React Hook Form + Zod

### Infrastructure
- **Storage**: Cloudflare R2 untuk upload gambar
- **Deployment**: Docker + Traefik dengan Let's Encrypt
- **Database**: PostgreSQL dengan PostGIS untuk fitur spatial

## 📚 API Documentation

### Core Endpoints

#### Health & Status
- `GET /` - API health check
- `GET /health` - Database connectivity check
- `GET /docs` - Swagger UI documentation
- `GET /openapi` - OpenAPI specification

#### Authentication
- `POST /api/auth/verify` - Verify Firebase JWT token
- `GET /api/auth/me` - Get current user profile

#### Reports
- `GET /api/reports` - List all reports (paginated)
- `POST /api/reports` - Create new report (requires auth)
- `GET /api/reports/:id` - Get specific report
- `GET /api/me/reports` - Get current user's reports

### Authentication

API menggunakan Firebase Authentication dengan JWT tokens:

```bash
curl -H "Authorization: Bearer YOUR_FIREBASE_JWT_TOKEN" \
     https://api.viralkan.com/api/reports
```

## 🧪 Development

### Available Scripts

```bash
# Development
bun run dev          # Start all development servers
bun run dev:api      # Start only API server
bun run dev:web      # Start only web app
bun run dev:docs     # Start only docs site

# Building
bun run build        # Build all apps and packages
bun run build:api    # Build only API
bun run build:web    # Build only web app

# Code Quality
bun run lint         # Lint all packages
bun run format       # Format code with Prettier
bun run check-types  # TypeScript type checking

# Database
bun run db:migrate   # Run database migrations
bun run db:reset     # Reset database (drops all tables)
bun run db:seed      # Seed database with test data

# Testing
cd apps/api && bun test        # Run API tests
cd apps/api && bun test:watch  # Run tests in watch mode
```

### Environment Variables

#### Required
```env
DATABASE_URL=postgresql://user:password@localhost:5432/viralkan
JWT_SECRET=your-jwt-secret
FIREBASE_SERVICE_ACCOUNT_JSON={"type": "service_account", ...}
```

#### Optional (untuk fitur lengkap)
```env
# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Cloudflare R2 Storage
R2_ACCESS_KEY=your-r2-access-key
R2_SECRET_KEY=your-r2-secret-key
R2_BUCKET=your-r2-bucket
R2_ENDPOINT=your-r2-endpoint
```

### Code Style & Architecture

Project ini mengikuti:
- **Clean Architecture** untuk API dengan 4 layers (API → Shell → Core → Data)
- **TypeScript strict mode** - No `any` types allowed
- **ESLint + Prettier** untuk konsistensi kode
- **Zod validation** untuk semua input API
- **React hooks pattern** untuk state management
- **Server-side authentication** untuk performa optimal

## 🧪 Testing

### API Testing
```bash
cd apps/api
bun test                    # Run all tests
bun test:watch             # Watch mode
bun test src/routes/auth   # Test specific module
```

### E2E Testing
```bash
bun run test:e2e           # Run Playwright tests
```

## 🚀 Deployment

### Production Build
```bash
bun run build
```

### Docker Deployment
```bash
# Build dan jalankan dengan Docker Compose
docker-compose up -d
```

### Environment Setup
1. Set up PostgreSQL dengan PostGIS
2. Configure Firebase project untuk authentication  
3. Set up Cloudflare R2 bucket untuk image storage
4. Configure environment variables
5. Run migrations dan deploy

Lihat [deployment guide](docs/deployment.md) untuk instruksi lengkap.

## 🤝 Contributing

Kami sangat menghargai kontribusi dari komunitas! Viralkan adalah proyek open-source yang dibangun untuk kepentingan masyarakat Indonesia.

### How to Contribute

1. **Fork** repository ini
2. **Clone** fork Anda: `git clone https://github.com/yourusername/viralkan-app.git`
3. **Create branch** untuk fitur baru: `git checkout -b feature/amazing-feature`
4. **Make changes** dan pastikan tests lulus: `bun run lint && bun test`
5. **Commit** perubahan: `git commit -m 'Add amazing feature'`
6. **Push** ke branch: `git push origin feature/amazing-feature`
7. **Open Pull Request**

### Development Guidelines

- Follow existing code patterns dan architecture
- Write tests untuk fitur baru
- Update documentation sesuai kebutuhan
- Ensure semua linter checks pass
- Use descriptive commit messages

### Types of Contributions

- 🐛 **Bug fixes**
- ✨ **New features**
- 📚 **Documentation improvements**  
- 🎨 **UI/UX enhancements**
- 🔧 **Performance optimizations**
- 🌐 **Translations**

## 📝 Documentation

- 📖 **[API Documentation](docs/api.md)** - Complete API reference
- 🏗️ **[Architecture Guide](docs/architecture.md)** - System design dan patterns
- 🎨 **[UI Design System](docs/ui-concept.md)** - Design principles dan components
- 🚀 **[Deployment Guide](docs/deployment.md)** - Production deployment
- 💻 **[Frontend Development](docs/code/frontend-code.md)** - Frontend coding standards
- 📋 **[Product Requirements](docs/prd.md)** - Project vision dan roadmap

## 📄 License

Viralkan dilisensikan di bawah **MIT License** - lihat file [LICENSE](LICENSE) untuk detail lengkap.

```
MIT License

Copyright (c) 2025 Viralkan Contributors

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

## 🙏 Acknowledgments

- Terinspirasi oleh kebutuhan masyarakat Indonesia akan infrastruktur jalan yang lebih baik
- Dibangun dengan teknologi open-source modern
- Didedikasikan untuk kemajuan civic engagement di Indonesia

## 📞 Support & Community

- 🐛 **Issues**: [GitHub Issues](https://github.com/yourusername/viralkan-app/issues)
- 💬 **Discussions**: [GitHub Discussions](https://github.com/yourusername/viralkan-app/discussions)
- 📧 **Email**: contact@viralkan.com
- 🌐 **Website**: [viralkan.com](https://viralkan.com)

---

<p align="center">
  <strong>Dibuat dengan ❤️ untuk kemajuan infrastruktur Indonesia</strong>
</p>

<p align="center">
  <a href="#viralkan--">⬆️ Back to Top</a>
</p>