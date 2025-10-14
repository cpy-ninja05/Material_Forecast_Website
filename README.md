 Material Forecast Backend (Flask)

## 🚀 Overview
- **Backend**: Flask (JWT auth, CORS)
- **DB**: MongoDB (collections: `users`, `projects`, `forecasts`, `project_forecasts`, `inventory`, `orders`, `material_actuals`)
- **ML artifacts**: `multi_xgb_model.joblib`, `feature_cols1.joblib`, `target_cols1.joblib`, `label_encoders.joblib`
- **Data**: `powergrid_realistic_material_dataset1.csv`
- **Frontend**: React + Vite (`frontend/`)

Default server: `http://localhost:5000`

## 📦 Prerequisites
- Python 3.12 (recommended)
- MongoDB Community Server running locally
- Node.js 18+ (for the React frontend)

## 🔧 Environment Variables
Create a `.env` (or set OS env vars) before running the backend:
```bash
# Mongo
MONGO_URI=mongodb://localhost:27017/PLANGRID_DATA

# JWT
# You can override the in-code default `plangrid-secret-key-2025`
JWT_SECRET_KEY=your-secure-secret

# From repo root
cd backend

# Create & activate virtualenv (Windows PowerShell)
python -m venv venv
./venv/Scripts/Activate.ps1

# Install deps
pip install -r requirements.txt

# Ensure MongoDB is running locally, then start the API
python app.py
# Flask will bind 0.0.0.0:5000 in debug mode
```

## 💻 Setup & Run (Frontend)
```bash
cd frontend
npm install
npm run dev
# Vite dev server (defaults to http://localhost:5173)
```

## 🗂️ Project Structure (key parts)
- `backend/app.py` — Flask app, routes, Mongo init, ML inference
- `backend/requirements.txt` — Python dependencies
- `frontend/` — React + Vite app (Tailwind config present)
- ML/data files at repo root:
  - `multi_xgb_model.joblib`
  - `feature_cols1.joblib`
  - `target_cols1.joblib`
  - `label_encoders.joblib`
  - `powergrid_realistic_material_dataset1.csv`
