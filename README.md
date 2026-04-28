# ngoma

Ngoma House is a house music prompt generator project scaffold with a TypeScript frontend and a Python backend in a single root repository.

This project is focused on strictly African instruments and styles, using datasets such as NSynth, IRMAS, MedleyDB, and Kaggle instrument sound sets for future model integration.

## Project structure

- `app/` — Next.js + TypeScript UI
- `public/` — static frontend assets and icons
- `styles/` — global CSS for the frontend
- `server/` — FastAPI backend with placeholder audio generation
- `server/generated/` — generated audio output

## Getting started

### Frontend

```bash
npm install
npm run dev
```

The frontend will run at `http://localhost:3000`.

### Backend

```bash
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn server.main:app --reload --host 0.0.0.0 --port 8000
```

The backend will run at `http://localhost:8000`.

## What works now

- Prompt form in the frontend
- `POST /api/generate` in the backend
- Dataset loader stub available at `/api/datasets` and `/api/datasets/load`
- Placeholder WAV file generation from the prompt
- Static audio serving from `/generated/<filename>.wav`

## Next steps

- Replace the placeholder generator with a real model or inference service using African instrument dataset assets
- Integrate NSynth, IRMAS, MedleyDB, and Kaggle instrument datasets into the backend pipeline
- Add user authentication, history, and audio export
- Add MIDI support and richer prompt-to-music capabilities
