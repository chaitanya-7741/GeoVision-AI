# GeoVision AI

GeoVision AI combines a React frontend, a FastAPI backend, and dedicated directories for geospatial machine-learning workflows.

## Frontend

```powershell
cd frontend
npm install
npm run dev
```

## Backend

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn app.main:app --reload
```

The API health endpoint is available at `http://127.0.0.1:8000/health`.

## Project areas

- `ml/dataset/`, `ml/preprocessing/`, `ml/training/`, and `ml/inference/` hold the ML workflow.
- `ml/trained_models/` is reserved for model artifacts.
- `data/` and `reports/` hold project data and generated reports.
- `backend/uploads/` is reserved for uploaded files.
