.PHONY: help etl dev-backend dev-frontend test-backend build-frontend

help:
	@echo "Available targets:"
	@echo "  etl           - Run the Olist ETL ingestion pipeline"
	@echo "  dev-backend   - Start FastAPI backend on port 8000"
	@echo "  dev-frontend  - Start Vite frontend on port 5173"
	@echo "  test-backend  - Run backend unit/service pytest suite"
	@echo "  build-frontend - Typecheck and build frontend bundle"

etl:
	cd backend && .venv/Scripts/python.exe -m ingestion.pipeline

dev-backend:
	cd backend && .venv/Scripts/python.exe -m uvicorn app.main:app --reload --port 8000

dev-frontend:
	cd frontend && npm run dev

test-backend:
	cd backend && .venv/Scripts/python.exe -m pytest tests/ --ignore=tests/integration

build-frontend:
	cd frontend && npm run build
