# 🛍️ Olist E-Commerce Data Pipeline & Order Explorer

A high-performance full-stack analytical platform and data pipeline built on the **Kaggle Brazilian E-Commerce Dataset (Olist)** (~100,000 orders). The system features an **automated ETL pipeline**, an **in-memory RAM acceleration engine** for sub-millisecond query responses, **4 statistical algorithms**, and a responsive **React + TypeScript dashboard** with classic numbered pagination.

---


## 🛠️ Tech Stack

- **Backend**: Python 3.12, FastAPI, SQLite (WAL mode), Pydantic v2, Scikit-Learn, Pandas.
- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, Lucide React, TanStack Query.
- **Data Source**: [Olist Brazilian E-Commerce Dataset](https://www.kaggle.com/datasets/olistbr/brazilian-ecommerce) (99,441 orders).

---

## 🚀 Quick Start Guide

### Prerequisites
- **Python**: Version `3.12` or higher
- **Node.js**: Version `18` or higher (with `npm`)
- **Git**

---

### Step 1: Clone the Repository
```bash
git clone https://github.com/AVINASH-U-WEB/dashboard.git
cd dashboard
```

---

### Step 2: Set Up & Run the Backend

1. Navigate to the `backend` directory:
   ```bash
   cd backend
   ```

2. Create and activate a Python virtual environment:
   ```bash
   # Windows (PowerShell)
   py -3.12 -m venv .venv
   .\.venv\Scripts\Activate.ps1

   # Linux / macOS
   python3 -m venv .venv
   source .venv/bin/activate
   ```

3. Install required dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Download data and execute the ETL pipeline:
   ```bash
   python download_data.py --run-pipeline
   ```
   *This automatically downloads the Kaggle dataset via `kagglehub`, enriches the 9 tables, runs the algorithms, and generates `olist.db`.*

5. Start the FastAPI development server:
   ```bash
   uvicorn app.main:app --reload --port 8000
   ```
   - **Backend API**: `http://localhost:8000`
   - **Interactive Swagger Docs**: `http://localhost:8000/docs`
   - **Alternative ReDoc**: `http://localhost:8000/redoc`

---

### Step 3: Set Up & Run the Frontend

1. In a new terminal, navigate to the `frontend` directory:
   ```bash
   cd frontend
   ```

2. Install Node dependencies:
   ```bash
   npm install
   ```

3. Launch the Vite development server:
   ```bash
   npm run dev
   ```

4. Open your browser and navigate to:
   ```
   http://localhost:5173
   ```

---

## 🧪 Running the Automated Test Suite

A comprehensive end-to-end verification test suite is included in `backend/test_suite.py`.

```bash
cd backend
python test_suite.py
```

### Verified Test Cases:
1. `GET /health` — In-memory warm-up and 99,441 records verified in RAM.
2. `GET /api/v1/orders/stats` — KPI metrics (delivered count, late deliveries, anomalies).
3. `GET /api/v1/orders?page=1` — Numbered pagination and metadata contracts.
4. `GET /api/v1/orders?status=delivered` — $O(1)$ Hash index status filtering.
5. `GET /api/v1/orders?is_anomaly=1` — Category Z-Score anomaly filter ($|Z| > 2$).
6. `GET /api/v1/orders?is_late=1` — Sliding-window seller late rate verification.
7. `GET /api/v1/orders/search?q=atrasou` — TF-IDF cosine similarity search on reviews.
8. `GET /api/v1/orders/{order_id}` — Single order direct RAM retrieval.
9. `LRU Cache Speed Test` — Repeat query latency verification (< 1 ms).

---

## 📡 REST API Reference

| Method | Endpoint | Description | Query Parameters |
|---|---|---|---|
| `GET` | `/health` | Server health & orders loaded count | None |
| `GET` | `/api/v1/orders` | Paginated and filtered order ledger | `status`, `from_date`, `to_date`, `is_anomaly`, `is_late`, `page`, `limit` |
| `GET` | `/api/v1/orders/stats` | Aggregated fulfillment and anomaly statistics | None |
| `GET` | `/api/v1/orders/search` | TF-IDF semantic search over review comments | `q` (required), `limit` |
| `GET` | `/api/v1/orders/{order_id}` | Fetch a single order by UUID | `order_id` (path) |

---

## 📂 Project Structure

```text
olist-explorer/
├── backend/
│   ├── app/
│   │   ├── api/v1/routes/orders.py   # REST API route handlers
│   │   ├── core/
│   │   │   ├── memory_store.py       # RAM acceleration & dual indexes
│   │   │   ├── lru_filter.py         # 256-slot bitwise query cache
│   │   │   └── search_index.py       # In-memory TF-IDF search engine
│   │   ├── schemas/order.py          # Pydantic v2 schemas
│   │   ├── config.py                 # App configuration
│   │   └── main.py                   # FastAPI lifespan entry point
│   ├── ingestion/
│   │   ├── algorithms/               # Sliding window & Z-score implementations
│   │   ├── loaders.py                # CSV batch loader
│   │   ├── transformers.py           # Relational joins & normalization
│   │   ├── writers.py                # SQLite WAL batch writer
│   │   └── pipeline.py               # ETL pipeline runner
│   ├── download_data.py              # Automated KaggleHub dataset fetcher
│   ├── requirements.txt              # Backend dependencies
│   └── test_suite.py                 # Full backend automated test suite
│
├── frontend/
│   ├── src/
│   │   ├── api/ordersApi.ts          # Type-safe API client
│   │   ├── components/               # Navbar & Hero presentation components
│   │   ├── features/orders/          # Table, pagination, filters, KPI cards
│   │   ├── pages/Dashboard.tsx       # Main dashboard layout
│   │   ├── types/order.ts            # TypeScript interfaces
│   │   ├── App.tsx                   # Light glassmorphic canvas
│   │   └── main.tsx                  # React DOM & QueryClient entry point
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.ts
│
├── .gitignore
└── README.md
```

---

## 🏗️ Production Build

To create an optimized production build for the frontend:
```bash
cd frontend
npm run build
```
Build output will be bundled in `frontend/dist/`.
