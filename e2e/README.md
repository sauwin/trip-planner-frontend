# End-to-end tests (Playwright)

The tests run in Chromium against the frontend and a real backend, so they
require a PostgreSQL test database. Do not point them at a database containing
data you need to keep: the tests register users and create trips.

## Setup

1. Configure and start the backend using
   [`trip-planner-backend/README.md`](../../trip-planner-backend/README.md),
   with `DATABASE_URL` pointing to an isolated test database. Apply migrations
   and seed the catalog before running the tests.
2. From the frontend directory, install the Chromium browser once if it is
   not already available:

   ```powershell
   npx playwright install chromium
   ```

The Playwright configuration starts the frontend dev server on port `5173`.

## Run

From the frontend directory:

```powershell
npm run test:e2e
```

The backend applies a shared limit of 10 requests per 15 minutes per IP to
registration, login, and token-refresh endpoints. Repeated test runs can hit
this limit; wait for its window to expire before retrying.