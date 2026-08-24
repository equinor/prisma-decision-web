# Prisma Decision Web

A decision quality assessment tool for Equinor that helps teams structure and evaluate decisions using influence diagrams, decision trees, and strategy comparison tables.

## Features

- **Influence Diagrams** — Visual graph-based modeling of decision relationships using React Flow and ELK layout
- **Decision & Solution Trees** — Expandable tree structures for exploring decision options and outcomes
- **Strategy Management** — Create, edit, and compare strategies with icon-based identification
- **Strategy Table** — Side-by-side comparison of how strategies select different options
- **Decision Quality Assessment** — Structured assessment forms for evaluating decision quality
- **Project Import/Export and Duplication** — Import and export project data,also duplicates the project;
- **Issue view** — Reorder issues with dnd-kit.
- **Authentication** — Azure AD (MSAL) integration for Equinor SSO

## Related repos

- [API](https://github.com/equinor/prisma-decision-api)
- [Docs](https://github.com/equinor/prisma-decision-docs)

## Tech Stack

- **Framework:** React 19 + TypeScript
- **Build:** Vite 8
- **Styling:** Tailwind CSS v4
- **UI Components:** Equinor EDS (eds-core-react)
- **Graph Visualization:** @xyflow/react (React Flow)
- **Layout:** ELK.js (elkjs)
- **State Management:** Jotai, @tanstack/react-query
- **Forms:** react-hook-form + Zod v4
- **Auth:** @azure/msal-react
- **Drag & Drop:** @dnd-kit

## Prerequisites

- Node.js 20+
- npm

## Installation

```bash
git clone https://github.com/equinor/prisma-decision-web.git
cd prisma-decision-web
npm install
```

## Configuration

The app uses environment-specific `.env` files:

| Variable | Description |
|----------|-------------|
| `VITE_APP_CLIENT_ID` | Azure AD application client ID |
| `VITE_APP_REDIRECT_URI` | OAuth redirect URI |
| `VITE_APP_PRISMA_API_URL` | Backend API base URL |
| `VITE_APP_PRISMA_API_SCOPE` | API scope for token acquisition |

Environment files: `.env.development`, `.env.test`, `.env.production`

## Usage

Start the development server:

```bash
npm run dev
```

The application runs at `http://localhost:5004`

### Other commands

```bash
npm run build          # Type-check + production build
npm run build:dev      # Development build
npm run build:test     # Test environment build
npm run build:prod     # Production build
npm run lint           # ESLint
npm run tsc            # TypeScript type-check
npm run prettier       # Check formatting
```

## Project Structure

```
src/
├── auth/           # MSAL authentication config
├── components/     # React components
│   ├── common/     # Shared components (cards, dialogs, drag & drop)
│   ├── CreateProjectPage/
│   ├── Homepage/
│   └── ProjectPage/
│       ├── InfluenceDiagram/
│       ├── Strategies/
│       └── ...
├── config/         # Tree configuration (compact, decision, solution)
├── hooks/          # Custom hooks + API hooks
│   └── api/        # react-query mutation/query hooks
└── utils/          # Utility functions (layout, conversion, validation)
```

## Deployment

Deployed via Docker on [Radix](https://www.radix.equinor.com/) (Equinor's Kubernetes platform). See the [CI/CD](#cicd) section for details.

## Security

This repository uses GitHub Advanced Security (GHAS) features:

- **Dependabot** — Automated dependency vulnerability alerts and update PRs
- **Secret scanning** — Detects accidentally committed secrets and credentials
- **Code scanning** — Static analysis via GitHub's security tooling

For vulnerability reporting, see [SECURITY.md](SECURITY.md).

## CI/CD

### CI — Pull Request Checks

Pull requests to `main` trigger GitHub Actions (`.github/workflows/run-eslint.yml`):

- ESLint (`npm run lint`)
- TypeScript type-check (`npm run tsc`)
- Prettier formatting (`npm run prettier`)

### CD — Radix Deployment

Deployments are managed via [Radix](https://www.radix.equinor.com/) using tag-based triggers defined in `radixconfig.yaml`:

| Environment | Trigger | DNS Alias |
|-------------|---------|-----------|
| **dev** | Push to `main` | `prisma-dev.radix.equinor.com` |
| **test** | `TEST` tag | `prisma-test.radix.equinor.com` |
| **prod** | `PROD` tag | `prisma.radix.equinor.com` |

Release commands:

```bash
npm run release:test   # Tag and push TEST release
npm run release:prod   # Tag and push PROD release
```

The app is built via Docker (`Dockerfile`), served on port 3000 via a Node.js Express server (`deployment/`).

## Running Locally with Docker Compose (Research Mode)

This repository is currently configured to run Docker Compose in research mode.

Current setup:

- [docker-compose.yml](docker-compose.yml) builds with `TARGET_ENVIRONMENTS: research`
- [docker-compose.yml](docker-compose.yml) sets runtime `NODE_ENV=research`
- [Dockerfile](Dockerfile) runs `npm run build:${TARGET_ENVIRONMENTS}` during image build

Important:

- `VITE_APP_PRISMA_API_URL` is baked into the frontend at build time.
- For research mode, update [ .env.research ](.env.research) before building.

### 1. Set research API URL

Edit [ .env.research ](.env.research):

	VITE_APP_PRISMA_API_URL="http://localhost:7075/"

### 2. Build and run

	docker compose build --no-cache
	docker compose up

App URL:

- http://localhost:5004

### 3. Research login requirement

Research auth uses a username stored in browser local storage. If username is missing, the app redirects to [login.html](login.html).

Expected flow:

1. Open http://localhost:5004
2. If redirected, open http://localhost:5004/login.html
3. Submit username
4. Return to influence diagram page

### 4. Troubleshooting

If Docker build fails at `npm ci`:

- Ensure [package.json](package.json) and [package-lock.json](package-lock.json) are in sync.
- Run `npm install` once locally and commit lockfile updates.

If Docker fails with `no space left on device`:

	docker builder prune -af
	docker system prune -af --volumes

To check Docker disk usage:

	docker system df -v


