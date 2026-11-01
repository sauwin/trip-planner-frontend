# TripPlanner frontend

The frontend for TripPlanner, a travel-planning application. It lets signed-in
users browse destinations, save preferences, view recommendations, plan trips,
record expenses, and review their activity.

The app is built with Vue 3, TypeScript, Vite, Vue Router, Pinia, Vue I18n,
Tailwind CSS, Leaflet, and Chart.js. The REST API and database are in the
neighboring [`trip-planner-backend`](../trip-planner-backend/) project.

## Requirements

- Node.js `^22.18.0` or `>=24.12.0`
- The backend running locally, unless you configure another API URL

## Run locally

From this directory:

```powershell
npm ci
Copy-Item .env.example .env
npm run dev
```

By default, the frontend sends API requests to `http://localhost:3000/api`.
Set `VITE_API_URL` in `.env` to override that URL.

## Validate

```powershell
npm run build
npm test
```

The build runs the Vue/TypeScript type-check and creates the production bundle.
For browser-based end-to-end tests, see [`e2e/README.md`](./e2e/README.md).
