# Setu: run the whole project

You need two terminals.

## Terminal 1: backend
1. `cd backend`
2. `python -m venv .venv`
3. `.venv\Scripts\activate`
4. `pip install -r requirements.txt`
5. `uvicorn app.main:app --reload --port 8000`

## Terminal 2: website
1. `cd ayush-frontend`
2. `npm install`
3. `npm run dev`
4. Open http://localhost:5173 and sign in with `DOC-9831-ABDM` / `setu@123`

The website reads the backend address from `ayush-frontend/.env`.
Delete that line to run the website alone in demo mode (no backend, any login works).
