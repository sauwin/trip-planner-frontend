# TripPlanner Frontend

Web client for **TripPlanner** — a travel-planning application that recommends destinations based on a short preference quiz and the user's own activity, and helps plan trips and track their budget. It handles authentication, destination browsing, reviews, personalised recommendations, trip planning with a map, expense tracking, a statistics dashboard and report exports.

The app talks to the REST API from the neighbouring [`trip-planner-backend`](../trip-planner-backend/) project.

## About

TripPlanner Frontend is a single-page application written in Vue 3 and TypeScript. Views are lazy-loaded through Vue Router, global state (the signed-in user and tokens) lives in Pinia, all HTTP communication goes through one Axios instance, and the UI is available in English and Slovak.

## Features

- Registration, login, logout, forgotten / reset password
- JWT authentication with automatic access-token refresh on `401` (parallel requests share a single refresh call); the user returns to the originally requested page after login
- 3 roles — `USER`, `ADMIN`, `SUPER_ADMIN` — enforced by router guards
- **Destinations**: paginated list, filters by country and features, random destination, autocomplete search in the navbar and a search results page
- **Destination detail**: like, save and rate a destination, read and write reviews (rating, text up to 2000 characters, up to 3 photos — JPEG / PNG / WebP, max 2 MB each)
- **Preference quiz**: 15 categories (activity, budget, climate, season, travel pace, food, …); any category can be skipped and answers can be edited later
- **Recommendations**: ranked list with a match score, the features that matched, and "load more" pagination. The score combines the quiz answers with the user's behaviour (views, likes, ratings, saves)
- **Trips**: title, budget, number of people, dates and an automatic status (`planning`, `upcoming`, `active`, `completed`)
- **Trip detail**: ordered list of destinations with planned dates and accommodation (name, price, link), map with markers, budget summary
- **Expenses** per trip in the categories transport, food, activities and other
- **Dashboard**: activity over time, interaction breakdown, budget vs. actual spending, spending by category and by destination, recent activity
- **Exports**: dashboard data as CSV, XLSX or PDF, generated in the browser
- **Admin tools**: create / edit / delete destinations (EN and SK texts, feature weights), delete any review
- **Super admin tools**: grant or revoke the admin role, view the audit log of admin actions
- Contact form (with a honeypot field against bots), About, Privacy and Terms pages
- Languages: English and Slovak, chosen from the browser and remembered in `localStorage`
- Unit tests (Vitest) and end-to-end tests (Playwright)

## Roles

| Role          | Value         | What it can do                                                     |
| ------------- | ------------- | ------------------------------------------------------------------ |
| User          | `USER`        | Quiz, recommendations, trips, expenses, reviews, dashboard         |
| Admin         | `ADMIN`       | Everything above + manages destinations and deletes reviews        |
| Super Admin   | `SUPER_ADMIN` | Everything above + `/manage-admins` (roles and audit log)          |

## Tech Stack

| Layer            | Technology                          | What it is used for                                         |
| ---------------- | ----------------------------------- | ----------------------------------------------------------- |
| Framework        | Vue 3 (`<script setup>`)            | Reactive UI built from single-file components               |
| Language         | TypeScript                          | Typed API responses, stores and components                  |
| Build tool       | Vite                                | Dev server with hot reload and production bundling          |
| Routing          | Vue Router                          | Pages, lazy loading, auth and role guards                   |
| State            | Pinia                               | Auth store (tokens and current user)                        |
| HTTP             | Axios                               | API client with token interceptor and refresh logic         |
| i18n             | Vue I18n                            | EN / SK translations                                        |
| Styling          | Tailwind CSS 4                      | Utility classes plus design tokens in `main.css`            |
| Map              | Leaflet + `@vue-leaflet/vue-leaflet`| Trip map with OpenStreetMap tiles                           |
| Charts           | Chart.js + `vue-chartjs`            | Dashboard and budget charts                                 |
| Exports          | `fflate`, `jspdf`, `html2canvas`    | XLSX (zipped XML), PDF reports and chart snapshots          |
| Unit tests       | Vitest, Vue Test Utils, jsdom       | Components, stores, router, utilities                       |
| E2E tests        | Playwright (Chromium)               | Full user flows against a real backend                      |

## Project Structure

```text
trip-planner-frontend/
├── e2e/                      # Playwright tests (auth, trips, recommendations)
├── public/                   # favicon, icons, hero map
├── src/
│   ├── api/                  # one module per API area + shared Axios instance (http.ts)
│   ├── components/           # shared components (navbar, footer, charts, search, filters)
│   ├── composables/          # reusable logic (e.g. useEscapeKey)
│   ├── layouts/              # AppLayout and AuthLayout
│   ├── locales/              # global translations and i18n setup (index.ts)
│   ├── router/               # routes and navigation guards
│   ├── stores/               # Pinia stores (auth.store.ts)
│   ├── types/                # TypeScript interfaces for API data
│   ├── utils/                # formatting, validation, exports, trip status, …
│   ├── views/                # one folder per page (pages/, components/, locales/)
│   │   ├── home/  login/  register/  forgot-password/  reset-password/
│   │   ├── search/  destinations/  destination-detail/
│   │   ├── preferences/  recommendations/
│   │   ├── trips/  trip-detail/  dashboard/
│   │   ├── admin/  about/  contact/  privacy/  terms/
│   ├── __tests__/            # unit tests (api, components, router, stores, utils)
│   ├── App.vue
│   ├── main.ts
│   └── main.css              # Tailwind theme and global styles
├── playwright.config.ts
├── vite.config.ts
├── vitest.config.ts
└── .env.example
```

Each page keeps its own translations in `views/<page>/locales/` and they are merged in `src/locales/index.ts`.

## Routes

| Path                                                                | Page                  | Access        |
| ------------------------------------------------------------------- | --------------------- | ------------- |
| `/`, `/search`, `/about`, `/privacy`, `/terms`, `/contact`          | Public pages          | Anyone        |
| `/login`, `/register`, `/forgot-password`, `/reset-password`        | Authentication        | Anyone        |
| `/destinations`, `/destinations/:id`                                | Destinations          | Signed-in     |
| `/preferences`, `/recommendations`                                  | Quiz and results      | Signed-in     |
| `/trips`, `/trips/:id`                                              | Trip planning         | Signed-in     |
| `/dashboard`                                                        | Statistics and export | Signed-in     |
| `/manage-admins`                                                    | Admin management      | `SUPER_ADMIN` |

Unauthenticated users who open a protected page are redirected to `/login?redirect=<original path>`.

## Getting Started

### Prerequisites

- Node.js `^22.18.0` or `>=24.12.0`
- The [backend](../trip-planner-backend/) running locally (default `http://localhost:3000`), unless you point the app to another API

### Setup

```bash
git clone https://github.com/your-username/trip-planner-frontend.git
cd trip-planner-frontend
npm ci
cp .env.example .env      # Windows PowerShell: Copy-Item .env.example .env
npm run dev
```

Vite prints the local URL (usually `http://localhost:5173`).

## Configuration

| Variable       | Default                     | Description                      |
| -------------- | --------------------------- | -------------------------------- |
| `VITE_API_URL` | `http://localhost:3000/api` | Base URL of the backend REST API |

Variables prefixed with `VITE_` are embedded into the bundle at build time, so never put secrets in them.

## Scripts

| Command                 | Description                                          |
| ----------------------- | ---------------------------------------------------- |
| `npm run dev`           | Start the development server                         |
| `npm run build`         | Type-check (`vue-tsc`) and create the production build in `dist/` |
| `npm run build-only`    | Production build without the type-check              |
| `npm run type-check`    | Type-check only                                      |
| `npm run preview`       | Serve the production build locally                   |
| `npm test`              | Run unit tests once                                  |
| `npm run test:watch`    | Run unit tests in watch mode                         |
| `npm run test:coverage` | Run unit tests with a coverage report                |
| `npm run test:e2e`      | Run Playwright end-to-end tests                      |

## Authentication Flow

1. `POST /auth/register` or `POST /auth/login` returns an `accessToken` and a `refreshToken`.
2. Both tokens are stored in the Pinia auth store and in `localStorage`.
3. An Axios request interceptor adds `Authorization: Bearer <accessToken>` to every request.
4. When the API answers `401`, the response interceptor calls `POST /auth/refresh` once (concurrent requests wait for the same call) and repeats the failed request with the new token.
5. If the refresh fails, the user is logged out and redirected to `/login`.
6. After a page reload the router guard loads the current user with `GET /auth/me`.

## Testing

### Unit tests

```bash
npm test
```

Unit tests run in Vitest with the jsdom environment and cover the Axios client (token refresh), router guards, the auth store, the login view and utilities such as validation, password strength, trip status and expense breakdown.

### End-to-end tests

Playwright runs in Chromium against the frontend and a **real backend**, so a PostgreSQL test database is required. Do not use a database with data you want to keep — the tests register users and create trips.

1. Start the backend with `DATABASE_URL` pointing to an isolated test database, apply migrations and seed the catalog (see the backend README).
2. Install the browser once: `npx playwright install chromium`
3. Run `npm run test:e2e`

Playwright starts the dev server on port `5173` by itself. The backend limits registration, login and token refresh to 10 requests per 15 minutes per IP, so repeated runs may need a short pause. More details are in [`e2e/README.md`](./e2e/README.md).

## Related Repositories

- **trip-planner-backend** — REST API and database for this frontend
