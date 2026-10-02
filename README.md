# Voice Command Recognition - Frontend

Next.js app that records 2 seconds of audio in the browser, sends it to
the FastAPI backend, and shows the predicted command.

**Live demo:** [voice-command-recognition-system.vercel.app](https://voice-command-recognition-system.vercel.app/)

## Run locally

```bash
npm install
cp .env.local.example .env.local
# edit .env.local to point at your backend (local or Render URL)
npm run dev
```

Open http://localhost:3000

## Deploy to Vercel

1. Push this folder to a GitHub repo.
2. On Vercel: New Project -> import the repo.
3. In Vercel project settings -> Environment Variables, add:
NEXT_PUBLIC_API_URL = https://your-backend.onrender.com

4. Deploy.

## Notes

- Recording is fixed at 2 seconds per press (see `RECORD_MS` in `app/page.tsx`).
- Browsers require HTTPS (or localhost) to allow microphone access -
  Vercel serves over HTTPS by default, so this is fine once deployed.
- The backend must have CORS enabled for your Vercel domain (see backend README).