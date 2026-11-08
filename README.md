# TripPlanner Frontend

Web client for **TripPlanner**, a travel-planning application for discovering destinations, receiving personalized recommendations, planning trips and tracking expenses. The app communicates with the [TripPlanner backend](../trip-planner-backend/).

## About

The frontend is a single-page application built with Vue 3 and TypeScript. Vue Router lazy-loads the views and applies client-side authentication and role guards. Pinia stores the current authentication state, Axios handles API requests and access-token refresh, and Vue I18n provides English and Slovak translations.

## Features

- Registration, login, logout, forgot-password and password-reset flows
- Automatic access-token refresh after an unauthorized API response
- Destination search and browsing, including filters, autocomplete and random destination selection
- Destination details with likes, saves, ratings and reviews
- Preference questionnaire and personalized recommendations with match scores and load-more pagination
- Trip planning with ordered destinations, planned dates, accommodation information and map markers
- Per-trip expense tracking and a statistics dashboard
- Dashboard data export as CSV, XLSX or PDF
- Admin tools for managing destinations and moderating reviews
- Super-admin tools for managing admin roles and viewing the audit log
- Contact, About, Privacy and Terms pages
- English and Slovak interface, initially selected from the browser language and saved in `localStorage`

## Roles

| Role | Value | Frontend access |
| ---- | ----- | --------------- |
| User | `USER` | Authenticated destination, preference, recommendation, trip and dashboard pages |
| Admin | `ADMIN` | User pages plus destination and review administration |
| Super Admin | `SUPER_ADMIN` | Admin pages plus `/manage-admins` for role management and the audit log |

Frontend route guards improve navigation but do not replace backend authorization.

## Tech Stack

| Layer | Technology | What it is used for |
| ----- | ---------- | ------------------- |
| Framework | Vue 3 | Reactive single-page interface |
| Language | TypeScript | Typed components, stores and API data |
| Build tool | Vite | Development server and production bundling |
| Routing | Vue Router | Lazy-loaded pages and route guards |
| State | Pinia | Authentication state |
| HTTP | Axios | API client and token-refresh interceptors |
| Localization | Vue I18n | English and Slovak translations |
| Styling | Tailwind CSS 4 | Utility styling and design tokens |
| Maps | Leaflet, `@vue-leaflet/vue-leaflet` | Trip maps with destination markers |
| Charts | Chart.js, `vue-chartjs` | Dashboard and budget visualizations |
| Exports | `fflate`, `jspdf`, `html2canvas` | XLSX and PDF generation and chart snapshots |
| Unit tests | Vitest, Vue Test Utils, jsdom | Component, store, router, API and utility tests |
| E2E tests | Playwright | Browser flows in Chromium against the frontend and backend |

## Project Structure

```text
trip-planner-frontend/
├── e2e/                      # Playwright tests and setup notes
├── public/                   # Static assets
├── src/
│   ├── api/                  # API modules and shared Axios client
│   ├── assets/               # Application assets
│   ├── components/           # Shared UI components
│   ├── composables/          # Reusable Vue logic
│   ├── layouts/              # Application and authentication layouts
│   ├── locales/              # Global translations and i18n setup
│   ├── router/               # Routes and navigation guards
│   ├── stores/               # Pinia stores
│   ├── types/                # TypeScript data types
│   ├── utils/                # Formatting, validation and export utilities
│   ├── views/                # Feature pages and page-specific components
│   ├── __tests__/            # Vitest unit tests
│   ├── App.vue
│   ├── main.ts
│   └── main.css
├── playwright.config.ts
├── vite.config.ts
├── vitest.config.ts
└── .env.example
```

## Routes

| Path | Page | Access |
| ---- | ---- | ------ |
| `/`, `/search`, `/about`, `/privacy`, `/terms`, `/contact` | Home, search and information pages | Public |
| `/login`, `/register`, `/forgot-password`, `/reset-password` | Authentication | Public |
| `/destinations`, `/destinations/:id` | Destination catalog and details | Signed-in |
| `/preferences`, `/recommendations` | Preference quiz and recommendations | Signed-in |
| `/trips`, `/trips/:id` | Trip planning and expenses | Signed-in |
| `/dashboard` | Statistics and exports | Signed-in |
| `/manage-admins` | Admin role management and audit log | `SUPER_ADMIN` |

Unauthenticated users navigating to a protected page are redirected to login with the requested page as a redirect parameter.

## Getting Started

### Requirements

- Node.js `^22.18.0` or `>=24.12.0`
- npm
- The backend running locally or another reachable TripPlanner API

### Run locally

From this directory:

```powershell
npm ci
Copy-Item .env.example .env
npm run dev
```

Vite serves the app at `http://localhost:5173` by default. Start the backend separately; the default API URL is `http://localhost:3000/api`.

### Configuration

| Variable | Default | Description |
| -------- | ------- | ----------- |
| `VITE_API_URL` | `http://localhost:3000/api` | Base URL of the backend API |

Set `VITE_API_URL` in `.env` if the API runs at a different address. Vite embeds `VITE_` variables in the client bundle, so do not put secrets in them.

## Authentication Flow

1. The frontend receives access and refresh tokens from the registration or login API.
2. The Pinia auth store keeps the tokens and persists them in `localStorage`.
3. Axios adds the access token to API requests.
4. On an eligible `401` response, Axios makes one refresh request shared by concurrent requests and retries the failed request with the new access token.
5. If refresh fails, the session is cleared and the user is redirected to login.
6. On navigation after a page reload, the router loads the current user from the API before applying role guards.

## Testing

### Unit tests

```powershell
npm test
```

Vitest runs the unit tests once. Use `npm run test:watch` while developing or `npm run test:coverage` to generate a coverage report.

### End-to-end tests

Playwright runs Chromium against the frontend and a real backend, so use a PostgreSQL test database. The tests create accounts and trip data; do not use a database containing data you need to keep.

1. Start the backend with `DATABASE_URL` pointing to an isolated test database, apply migrations and seed the catalog. See the [backend README](../trip-planner-backend/README.md).
2. Install the browser once with `npx playwright install chromium`.
3. Run the tests:

```powershell
npm run test:e2e
```

The Playwright configuration starts the Vite development server on port `5173`. The E2E setup and rate-limit note are documented in [`e2e/README.md`](./e2e/README.md).

## Scripts

| Command | Description |
| ------- | ----------- |
| `npm run dev` | Start the development server |
| `npm run build` | Type-check and create the production build in `dist/` |
| `npm run build-only` | Create the production build without type-checking |
| `npm run preview` | Preview the production build locally |
| `npm run type-check` | Run the Vue/TypeScript type-check |
| `npm test` | Run unit tests once |
| `npm run test:watch` | Run unit tests in watch mode |
| `npm run test:coverage` | Run unit tests with coverage |
| `npm run test:e2e` | Run Playwright end-to-end tests |
