# MilesWeb Deployment Guide

## Folder Structure

```
milesweb/
├── frontend/           ← Deploy this as Node.js app on MilesWeb
│   ├── dist/           ← Copy the built React app here (run: npm run build in /client)
│   ├── server.js       ← Express server that serves the dist/ folder
│   └── package.json    ← Only needs "express" dependency
│
└── backend/            ← Deploy this as a separate Node.js app on MilesWeb
    ├── src/
    │   ├── server.js                           ← Main entry point
    │   ├── config/
    │   │   ├── env.js
    │   │   └── database.js
    │   ├── middleware/
    │   │   └── errorHandler.js
    │   ├── routes/
    │   │   ├── landingPages.routes.js
    │   │   └── downloadLeads.routes.js
    │   ├── controllers/
    │   │   ├── landingPages.controller.js
    │   │   └── downloadLeads.controller.js
    │   └── services/
    │       ├── landingPage.service.js
    │       ├── openai.service.js
    │       └── codeGeneration.service.js
    ├── prisma/          ← Copy from server/prisma/
    │   └── schema.prisma
    ├── .env             ← Create from .env.example, fill in real values
    ├── .env.example
    └── package.json
```

---

## Step-by-Step Deployment

### Step 1 — Build the Frontend

Run this on your local machine (in the `client/` folder):

```bash
cd client
npm run build
```

This creates a `client/dist/` folder. **Copy the entire `dist/` folder** into `milesweb/frontend/dist/`.

### Step 2 — Copy Prisma Schema

Copy `server/prisma/schema.prisma` into `milesweb/backend/prisma/schema.prisma`.

### Step 3 — Deploy Frontend on MilesWeb

1. Upload the entire `milesweb/frontend/` folder (with `dist/` inside) to MilesWeb
2. Set the **startup file** to: `server.js`
3. Set **Node.js version** to: 18+
4. Run in SSH terminal:
   ```bash
   npm install
   npm start
   ```
5. The app runs on the `PORT` environment variable (MilesWeb sets this automatically)

### Step 4 — Deploy Backend on MilesWeb

1. Upload the entire `milesweb/backend/` folder to MilesWeb
2. Set the **startup file** to: `src/server.js`
3. Set **Node.js version** to: 18+
4. Create a `.env` file from `.env.example` with real values:
   ```
   DATABASE_URL=postgresql://user:pass@host:5432/dbname
   OPENAI_API_KEY=sk-...
   PORT=3001
   NODE_ENV=production
   CORS_ORIGIN=https://your-frontend-url.milesweb.in
   ```
5. Run in SSH terminal:
   ```bash
   npm install
   npx prisma generate
   npx prisma migrate deploy
   npm start
   ```

### Step 5 — Update Frontend API URL

In `client/.env` (before building), set:
```
VITE_API_BASE_URL=https://your-backend-url.milesweb.in
```

Then rebuild and re-upload the dist/ folder.

---

## Important Notes

- **`"type": "module"`** is set in both package.json files — MilesWeb Node.js 18+ supports this.
- **No TypeScript** — the backend is pure JavaScript, no `tsc` or `tsx` needed.
- The frontend `server.js` serves `dist/index.html` for all routes (SPA fallback).
- The backend's `start` script is simply `node src/server.js`.
- Prisma requires `prisma generate` to be run after `npm install`.
