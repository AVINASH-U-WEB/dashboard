# Architecture & Repository Standards

This repository follows an enterprise **Vertical-Slice / Feature-Sliced** layout separating domain features, shared infrastructure, data pipelines, and governance.

## Repository Layout

- `.github/workflows/ci.yml` — Automated CI running backend `pytest` and frontend `tsc && vite build`.
- `Makefile` — Standardized developer commands (`etl`, `dev-backend`, `dev-frontend`, `test-backend`, `build-frontend`).
- `backend/` — FastAPI service, SQLite infrastructure, ETL pipeline, and test pyramid.
  - `app/main.py` — Application factory, lifespan warmup, and router registration.
  - `app/infrastructure/database.py` — Shared SQLite connection provider (`get_db()`).
  - `app/api/v1/routes/` — HTTP controllers (`orders`, `customers`, `sla`, `tickets`).
  - `app/services/` — Domain business logic.
  - `app/schemas/` — Pydantic v2 request/response contracts.
  - `ingestion/` — Standalone ETL pipeline and analytical algorithms.
  - `scripts/` — CLI operational scripts (`download_data.py`).
  - `tests/` — Unit/service tests (`tests/*.py`) and integration benchmarks (`tests/integration/`).
  - `pyproject.toml` — Central configuration for `pytest`, `ruff`, and `mypy`.
- `frontend/` — React + TypeScript + Vite web application.
  - `src/app/` — Global providers, router, and `queryClient.ts`.
  - `src/layouts/` — Application shell (`DashboardLayout`, `Sidebar`, `TopBar`).
  - `src/features/<domain>/` — Self-contained domain modules (`orders`, `customers`, `sla`, `tickets`), each exposing a public barrel `index.ts`.
  - `src/shared/` — Cross-cutting HTTP client and reusable UI primitives.

## Module Boundary Rules

1. **Frontend:** `AppRoutes.tsx` and external features import only from `@/features/<domain>` (its `index.ts` barrel), never deep internal component paths.
2. **Backend:** Services should acquire SQLite connections via `app/infrastructure/database.py` rather than ad-hoc `sqlite3.connect()` calls.
3. **Tests:** Fast isolated tests live in `backend/tests/` and run in CI without requiring external data downloads; full 99k-row benchmarks live in `backend/tests/integration/`.
