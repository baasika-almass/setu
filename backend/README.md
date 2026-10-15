# Setu backend (FastAPI)

Serves the endpoints listed on the website's API Docs page, stores encounters and API logs in SQLite,
and builds a FHIR R4 bundle for every saved encounter.

## Run it (Windows)

1. Open a terminal inside this `backend` folder.
2. `python -m venv .venv`
3. `.venv\Scripts\activate`
4. `pip install -r requirements.txt`
5. `uvicorn app.main:app --reload --port 8000`
6. Check it at http://localhost:8000/docs (interactive API page).

Then start the website (`npm run dev` in `ayush-frontend`) and sign in with:

- Doctor ID: `DOC-9831-ABDM`
- Password: `setu@123`

## Check that everything works

`python test_api.py` should print "All backend checks passed".

## Add or reset a doctor

`python -m app.create_user DOC-1234 "Dr. Full Name" yourpassword`

## Settings (environment variables)

- `SETU_SECRET`: secret used to sign login tokens. Set your own before deploying.
- `SETU_DEMO_PASSWORD`: password for the seeded demo doctor (default `setu@123`).
- `SETU_CORS`: comma-separated website addresses allowed to call the API
  (default `http://localhost:5173`).
- `SETU_DB`: path of the SQLite file (default `backend/setu.db`).

## Data

`data/terms.json` holds the 250 sample terms (50 per AYUSH system) with demonstration codes.
Replace it with the official NAMASTE / ICD-11 TM2 data and keep the same shape:
`{ "Ayurveda": [ { term, namasteCode, icd11Code, icd11Label, symptoms: [...] } ] }`.
