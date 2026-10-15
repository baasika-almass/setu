# Setu

Setu is a full-stack platform that bridges NAMASTE (AYUSH) terminology with WHO ICD-11 TM2 codes.

## Features
- FastAPI backend with REST endpoints for terminology mapping
- Dataset of 301 NAMASTE entries, 45 with curated TM2 mappings
- React + Vite frontend (in progress)

## Tech Stack
Python, FastAPI, React, Vite

## Run Locally

Backend:

```
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

Frontend:

```
cd ayush-frontend
npm install
npm run dev
```



## Team
Baasika Almass S, Jenisha, Jeevitha
