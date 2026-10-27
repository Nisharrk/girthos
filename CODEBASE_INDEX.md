# Codebase index

Girthos is a small Next.js 15 App Router application for recording and viewing body measurements. The dashboard is a client component, data is stored in MongoDB through Mongoose, and writes to the measurements API require an API key.

## Start here

- [`app/page.js`](app/page.js) — dashboard state and UI; fetches measurements, calculates summary values, and coordinates add, edit, and delete flows.
- [`app/api/measurements/route.js`](app/api/measurements/route.js) — JSON API for listing, creating, updating, and deleting measurement records.
- [`models/Measurement.js`](models/Measurement.js) — Mongoose schema for measurement fields and timestamps.
- [`components/MeasurementForm.js`](components/MeasurementForm.js) — add/edit form, client validation, and API submission.

## Application structure

### Routes and setup

- `app/layout.js` — root HTML layout, Roboto font, and page metadata.
- `app/page.js` — entry screen offers Guest or Admin; Admin verifies the API key before opening the dashboard. Dashboard renders cards, chart/history views, and modal flows. Exiting returns to the entry screen and clears the session.
- `app/api/measurements/route.js` — route handlers: `GET` lists entries by date ascending; `POST` creates; `PUT` updates by `id`; `DELETE` removes by query-string `id`.
- `middleware.js` — checks `x-api-key` against `API_KEY` for `POST`, `PUT`, and `DELETE` under `/api/measurements`; reads remain public.

### UI components

- `components/StatsCard.js` — displays the latest recorded metric and its change from the previous recorded value, skipping blank entries via `getMetricTrend`.
- `components/ProgressChart.js` — client-only ApexCharts view with declarative, accessible series toggles. `lib/chartData.mjs` prepares sorted, aligned daily series and finite axis bounds; `lib/chartOptions.mjs` owns renderer styling and responsive options.
- `components/MeasurementForm.js` — measurement entry/edit dialog; remembers height in local storage.
- `components/ApiKeyPrompt.js` — collects the API key before dashboard write actions.
- `components/LoadingSkeleton.js` — dashboard loading placeholder.

### Data and styling

- `lib/db.js` — connects to MongoDB using `MONGODB_URI`.
- `models/Measurement.js` — date, height, weight, chest, left/right biceps, waist, left/right thighs, and left/right calves; includes Mongoose timestamps.
- `app/globals.css` — global styles; most component styling uses utility classes.
- `public/` — static assets (currently default Next.js SVGs).

## Data flow

1. Admin entry verifies the API key through `POST /api/measurements/verify-key`, then requests `GET /api/measurements` and keeps the returned date-ascending array in client state. The key is held in memory for the current admin session; failed write authorization prompts for it again.
2. Guest entry starts an independent empty dashboard without API requests. “Fill with sample data” supplies eight prepared weekly measurements for the graph; “Reset to sample data” replaces the temporary records. Guests can also add, edit, and delete their own entries.
3. The form sends `POST` for a new record or `PUT` for an edit; delete sends `DELETE` with the record `id` in the query string. These calls include `x-api-key`.
4. On success, the dashboard reloads the list and recalculates its summary and chart/table display from the returned records.

Guest changes are only held in React state, with no API writes or browser storage. They disappear on exit, reload, or page close. `lib/guestMeasurements.mjs` creates fresh sample records relative to the local date and orders guest saves chronologically, retaining insertion order for same-day entries. `hooks/useMeasurements.js` only fetches when enabled for Admin.

The circumference chart ignores weight/height-only rows, invalid dates, and non-positive/non-finite values. For multiple entries on one calendar date it uses the last nonblank value per metric; history still shows every record. Paired measurements require both sides in the same record. Sparse series share date coordinates with null gaps, and empty series are omitted. Axis bounds remain stable when hiding series, including on mobile. Empty datasets and all-hidden selections use explicit empty states, with no imperative calls on chart instances.

## Configuration and commands

- Environment variables: `MONGODB_URI` (database connection) and `API_KEY` (write authorization). Keep values in the local environment; do not commit secrets.
- `npm run dev` — start the development server.
- `npm run build` — create a production build.
- `npm start` — serve a production build.
- `npm run lint` — configured script currently invokes `next lint`.

## Dependencies

Next.js 15, React 19, Mongoose, ApexCharts / `react-apexcharts`, and Tailwind CSS 4. The `@/` import alias is configured in `jsconfig.json`.
