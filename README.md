# Piscord

A modern, feature-rich community platform built with Nuxt 4, Vue 3, and PostgreSQL. Create communities, manage channels and workspaces, and collaborate with your team.

## Features

- **User Authentication** — Secure auth with JWT, 2FA via TOTP, and session management
- **Community Management** — Create public/private communities with approval workflows
- **Multi-Community Support** — Users can join multiple communities and switch between them seamlessly
- **Channels & Workspaces** — Organize discussions with text/voice/announcement channels and dedicated workspaces
- **Role-Based Permissions** — Granular permission system with custom roles and member management
- **Rich Text Editor** — Tiptap-powered editor with syntax highlighting, mentions, and media embeds
- **AI Agent Integration** — Community-level AI assistants with customizable personalities
- **Notifications** — Real-time notifications for community activities
- **Dark Mode** — Full dark mode support with smooth transitions
- **Responsive Design** — Works beautifully on all screen sizes

## Tech Stack

### Frontend
- **Framework:** [Nuxt 4](https://nuxt.com) (Vue 3, Nitro server)
- **Styling:** Tailwind CSS v4 with custom design system
- **UI Components:** shadcn-vue + Radix UI primitives
- **State Management:** Pinia with persistence
- **Animations:** Motion-v (Vue port of Framer Motion)
- **Forms:** VeeValidate + Zod schemas
- **Rich Text:** Tiptap with lowlight syntax highlighting
- **Icons:** Lucide Vue

### Backend
- **Database:** PostgreSQL 16
- **Query Builder:** Kysely (type-safe SQL)
- **Authentication:** JWT with bcrypt password hashing
- **2FA:** Speakeasy TOTP with QR code generation
- **Validation:** Zod schemas
- **File Uploads:** Formidable (multipart/form-data)

### Development
- **TypeScript:** Full type safety across frontend and backend
- **ESLint:** @nuxt/eslint with Vue and TypeScript rules
- **Prettier:** Code formatting with Tailwind plugin
- **Docker:** Containerized PostgreSQL for development

## Prerequisites

- **Node.js** 18+ (tested on v25.6.0)
- **npm** 9+ (tested on v11.8.0)
- **PostgreSQL** 16+ (or use the included Docker setup)
- **Docker** (optional, for running PostgreSQL)

## Installation

1. **Clone the repository**

```bash
git clone <repository-url>
cd piscord
```

2. **Install dependencies**

```bash
npm install
```

3. **Set up environment variables**

Copy the example environment file and fill in your values:

```bash
cp .env.example .env
```

Required environment variables:

```env
# Database
DB_NAME=piscord
DB_HOST=localhost
DB_USER=postgres
DB_PASSWORD=your_password
DB_PORT=5432
DB_MAX_POOL_SIZE=10

# JWT Secrets (generate random strings)
JWT_SECRET=your_jwt_secret_here
JWT_REFRESH_SECRET=your_refresh_secret_here

# Optional: local/self-hosted Ollama for AI pets
OLLAMA_BASE_URL=http://127.0.0.1:11434
OLLAMA_DEFAULT_MODEL=llama3.2:latest
```

4. **Start PostgreSQL**

Using Docker (recommended):

```bash
docker-compose up -d
```

Or use your own PostgreSQL instance and update the `.env` file accordingly.

5. **Run database migrations**

```bash
npm run db:migrate
```

This will create all necessary tables (users, communities, channels, roles, etc.)

## Development

Start the development server at `http://localhost:3000`:

```bash
npm run dev
```

The app will hot-reload as you make changes to the code.

## Production

Build the application for production:

```bash
npm run build
```

Preview the production build locally:

```bash
npm run preview
```

For deployment, see the [Nuxt deployment documentation](https://nuxt.com/docs/getting-started/deployment).

## Project Structure

```
piscord/
├── app/
│   ├── assets/css/        # Global styles & Tailwind config
│   ├── components/        # Vue components
│   │   ├── ui/           # shadcn-vue UI components
│   │   ├── nav/          # Navigation components (dock, community switcher)
│   │   ├── channel/      # Channel-related components
│   │   └── ...
│   ├── composables/       # Vue composables (useAuth, useApi, etc.)
│   ├── layouts/          # Nuxt layouts (default, auth)
│   ├── middleware/       # Route middleware (auth.global.ts)
│   ├── pages/            # File-based routing
│   │   ├── auth/         # Login, register, 2FA
│   │   ├── community/    # Community pages
│   │   ├── discover/     # Community discovery
│   │   └── me/           # User profile & settings
│   ├── plugins/          # Nuxt plugins (auth initialization)
│   ├── stores/           # Pinia stores (user, community)
│   ├── app.vue           # Root component
│   └── error.vue         # Error page
├── server/
│   ├── api/              # API routes
│   │   ├── auth/         # Authentication endpoints
│   │   ├── communities/  # Community CRUD
│   │   ├── users/        # User endpoints
│   │   └── ...
│   ├── db/
│   │   ├── db.ts         # Kysely database instance
│   │   └── tables/       # TypeScript table definitions
│   ├── middleware/       # Server middleware
│   ├── services/         # Business logic layer
│   │   ├── authService.ts
│   │   ├── channelService.ts
│   │   ├── communityService.ts
│   │   └── ...
│   └── utils/            # Server utilities
├── migrations/           # Database migrations
├── scripts/              # Utility scripts
│   ├── create-migration.ts
│   └── run-migration.ts
├── public/               # Static assets
├── .env.example          # Environment template
├── docker-compose.yml    # PostgreSQL container
├── nuxt.config.ts        # Nuxt configuration
├── package.json
└── README.md
```

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm run db:migrate` | Run database migrations |
| `npm run create-migration` | Create a new migration file |

## Database Schema

Key tables:
- **users** — User accounts with 2FA support
- **communities** — Community definitions with metadata
- **community_members** — User-to-community membership
- **channels** — Communication channels (text/voice/announcement/category)
- **workspaces** — Collaborative workspaces
- **roles** — Permission roles with bitmask flags
- **member_roles** — User role assignments
- **notifications** — User notifications
- **ai_agents** — Community AI assistants
- **join_requests** — Community join approval queue

## Permission System

Permissions use a bitmask system:

| Permission | Bit | Value |
|------------|-----|-------|
| View Channels | 0 | 1 |
| Send Messages | 1 | 2 |
| Manage Channels | 2 | 4 |
| Manage Members | 3 | 8 |
| Manage Roles | 4 | 16 |
| Admin | 5 | 32 |

Combine permissions with bitwise OR: `VIEW_CHANNELS | SEND_MESSAGES = 3`

## Design System

The app uses a custom design system built on Tailwind CSS v4 with:
- **Colors:** oklch-based color palette with dark mode support
- **Typography:** DM Sans (primary), Inter (secondary)
- **Components:** shadcn-vue with Radix UI primitives
- **Animations:** Smooth transitions with motion-v

Key design tokens are defined in `app/assets/css/main.css`.

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is private and proprietary.

---

Built with ❤️ using [Nuxt](https://nuxt.com)
