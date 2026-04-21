# Mining Operations Monitoring Dashboard

Internal web dashboard based on `PRD_Mining_Dashboard.pdf`.

## Run

```bash
npm run dev
```

Open `http://localhost:4173`.

## Verify

```bash
npm.cmd test
```

The test script runs syntax linting, format checks, unit tests, then starts a temporary server on `http://localhost:4174`, checks server route behavior, validates the app flow with Chrome, and writes screenshots to `artifacts/`.

## Included Scope

- Login page
- Dashboard with 6 summary cards, production chart, utilization, operation table, and alert panel
- Fleet monitoring with status/site filters and unit detail modal
- Production monitoring
- Safety monitoring
- Maintenance schedule
- Reports
- Settings
- Notification dropdown
- Role selector with consistent core navigation
- Mock JSON API at `/api/mock-data`

The implementation is intentionally dependency-free so it can run consistently in this workspace without downloading packages.

## Structure

- `server.js` - static server and mock API
- `data/mock-data.json` - dummy operations data
- `public/app.js` - app entry and shell orchestration
- `public/css/` - modular CSS layers for tokens, base, layout, components, pages, and responsive rules
- `public/js/store.js` - local state and data loading
- `public/js/routes.js` - route and role visibility configuration
- `public/js/shell.js` - app shell rendering and global event binding
- `public/js/nav.js` - navigation rendering and route synchronization
- `public/js/notifications.js` - notification dropdown rendering and events
- `public/js/fleet-interactions.js` - fleet filters and unit detail modal events
- `public/js/components.js` - reusable UI fragments
- `public/js/charts.js` - canvas chart rendering
- `public/js/pages/` - page-level renderers
- `tests/helpers.test.js` - focused tests for route and status helpers
- `tests/unit.js` - helper-level unit tests
- `tests/lint.js` and `tests/format-check.js` - local quality checks
