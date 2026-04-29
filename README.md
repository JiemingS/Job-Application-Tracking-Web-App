# JobTrack

JobTrack is a full-stack job application tracking web app built with React, Express, and Supabase.

## Stack

- React + Vite client
- Node.js + Express API
- Supabase Auth for registration and login
- Supabase PostgreSQL for profiles and applications
- Project-local Python `.venv` for helper tooling isolation

## Local Setup

The Python virtual environment has been created at:

```text
.venv/
```

This project uses `npm.cmd` on Windows because the PowerShell `npm.ps1` shim may be blocked by execution policy.

Install dependencies:

```powershell
npm.cmd install
```

Create environment files:

```powershell
Copy-Item .env.example server/.env
Copy-Item .env.example client/.env
```

Fill in these values from your Supabase project:

```text
SUPABASE_URL
SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
VITE_SUPABASE_URL
VITE_SUPABASE_ANON_KEY
VITE_API_BASE_URL
```

For local development, use:

```text
VITE_API_BASE_URL=http://localhost:4000
CLIENT_ORIGIN=http://localhost:5173
PORT=4000
```

## Supabase Setup

1. Create a Supabase project.
2. Open the SQL editor.
3. Run `database/schema.sql`.
4. Enable email/password authentication in Supabase Auth if it is not already enabled.
5. Copy the project URL, anon key, and service role key into the local env files.

## Run

Start both the API and the client:

```powershell
npm.cmd run dev
```

Client:

```text
http://localhost:5173
```

API health check:

```text
http://localhost:4000/health
```

## Deploy To Vercel

This project is prepared for Vercel deployment:

- Vite builds the frontend from `client/`.
- Express is exposed as a Vercel Function through `api/index.js`.
- `vercel.json` routes `/api/*` and `/health` to the backend and all other paths to the React SPA.

Vercel build settings:

```text
Install Command: npm install
Build Command: npm run build --workspace client
Output Directory: client/dist
```

Add these environment variables in Vercel Project Settings:

```text
SUPABASE_URL=https://yniculsrqjtjpdmzeaka.supabase.co
SUPABASE_ANON_KEY=your-publishable-key
SUPABASE_SERVICE_ROLE_KEY=your-secret-key
VITE_SUPABASE_URL=https://yniculsrqjtjpdmzeaka.supabase.co
VITE_SUPABASE_ANON_KEY=your-publishable-key
VITE_API_BASE_URL=https://your-vercel-domain.vercel.app
CLIENT_ORIGIN=https://your-vercel-domain.vercel.app
```

After Vercel creates the deployment URL, update Supabase Auth settings:

- Site URL: `https://your-vercel-domain.vercel.app`
- Redirect URLs: `https://your-vercel-domain.vercel.app/*`

## Main Features

- Register and log in with Supabase Auth.
- Protect the dashboard behind authentication.
- Create, read, update, and delete job applications.
- Persist application data per authenticated user.
- Dashboard with KPI cards, recent applications, status chart, and upcoming next steps.
- Responsive interface based on the reference image in `Reference Image/Main Interface.png`.
