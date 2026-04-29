# JobTrack - Job Application Tracking Web App

JobTrack is a deployed full-stack job application tracking system built with React, Supabase, and Vercel.

It enables job seekers to securely manage applications with persistent updates, user-scoped access control, Supabase Row Level Security (RLS) policies, and a serverless deployment model.

The project demonstrates end-to-end system design, including authentication, protected API routes, user-scoped database access, and cloud deployment using serverless functions.

**Live Demo:** [https://job-application-tracking-web-app-cl.vercel.app/login](https://job-application-tracking-web-app-cl.vercel.app/login)

**Tech Highlights:** Supabase (Auth + RLS), Serverless APIs, React + Vite, PostgreSQL, Vercel Deployment

## Screenshots

### Dashboard

![JobTrack dashboard](Reference%20Image/vercel/Landing%20Page.png)

### Login

![JobTrack login](Reference%20Image/vercel/Login%20In.png)

## Project Goals

This project was built to demonstrate a complete full-stack application with practical job-search tracking features:

- Developed a full-stack web application for managing job applications with CRUD operations and persistent storage.
- Implemented a hybrid backend architecture using Supabase (Auth, PostgreSQL, RLS) and serverless Express APIs on Vercel, enabling secure user-scoped data access without managing traditional infrastructure.
- Built responsive user interfaces with React for efficient data display and user interaction.
- Designed a relational database schema using Supabase PostgreSQL to support scalable user-owned data storage and querying.
- Deployed the production app with Vercel and connected it to Supabase Auth and PostgreSQL.

## Why This Project Matters

This project demonstrates real-world full-stack engineering beyond simple CRUD applications:

- User-scoped data access using API-level ownership checks and Supabase Row Level Security (RLS) policies
- Serverless backend architecture deployed on Vercel
- Authentication-integrated API design with user-scoped queries
- Production deployment with environment configuration and cloud integration

## Key Engineering Highlights

- Designed a full-stack SaaS-style application with user-scoped access control using API-level ownership checks and Supabase Row Level Security (RLS) policies
- Built a serverless backend architecture using Vercel Functions and Express, eliminating the need for traditional infrastructure
- Implemented authentication-integrated APIs with user-scoped access control
- Deployed a full-stack application with environment configuration, cloud database integration, and a GitHub-based deployment workflow

## Core Features

- **Authentication:** users can register, log in, and log out with Supabase Auth.
- **Protected dashboard:** users must be logged in before accessing the main application.
- **Application CRUD:** users can create, view, edit, and delete job applications.
- **Status tracking:** applications support `Applied`, `In Progress`, `Interview`, `Offer`, and `Rejected`.
- **Dashboard analytics:** KPI cards, recent applications, status distribution chart, and upcoming next steps.
- **Calendar/upcoming view:** next-step dates are surfaced as upcoming events.
- **User profile:** basic user profile display and settings page.
- **Responsive UI:** dashboard layout adapts across desktop, tablet, and mobile screens.
- **Secure data ownership:** every API query is scoped to the authenticated Supabase user.

## Tech Stack

| Layer | Technology |
| --- | --- |
| Frontend | React, Vite, React Router |
| UI | CSS, Lucide React icons, Recharts |
| Backend | Supabase (Auth, PostgreSQL, RLS) + Serverless Express (Vercel Functions) |
| Auth | Supabase Auth |
| Database | Supabase PostgreSQL |
| Validation | Zod |
| Deployment | Vercel |
| Local isolation | Project-local Python `.venv`, local `node_modules` |

## Architecture

```text
React + Vite Client
        |
        | Supabase Auth session
        v
Express REST API on Vercel Functions
        |
        | user-scoped queries
        v
Supabase PostgreSQL
```

The frontend handles Supabase email/password authentication and sends the Supabase access token to the Express API. The API verifies the token, derives the authenticated user, and only reads or writes rows owned by that user.

## Data Model

The database schema is defined in [`database/schema.sql`](database/schema.sql).

Main tables:

- `profiles`: stores app-level user profile information linked to `auth.users`.
- `applications`: stores each job application, status, applied date, next step, notes, and ownership through `user_id`.

Supabase Row Level Security is enabled for user-owned access.

## API Overview

Protected API routes:

```text
GET    /api/me
PUT    /api/me
GET    /api/dashboard
GET    /api/applications
POST   /api/applications
GET    /api/applications/:id
PUT    /api/applications/:id
DELETE /api/applications/:id
```

Health check:

```text
GET /health
```

## Local Development

Install dependencies:

```powershell
npm.cmd install
```

Create environment files:

```powershell
Copy-Item .env.example server/.env
Copy-Item .env.example client/.env
```

Fill in your Supabase values:

```text
SUPABASE_URL
SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
VITE_SUPABASE_URL
VITE_SUPABASE_ANON_KEY
VITE_API_BASE_URL
```

Start the local development servers:

```powershell
npm.cmd run dev
```

Local URLs:

```text
Client: http://localhost:5173
API:    http://localhost:4000/health
```

## Supabase Setup

1. Create a Supabase project.
2. Open the SQL editor.
3. Run [`database/schema.sql`](database/schema.sql).
4. Enable email/password authentication in Supabase Auth.
5. For local testing, optionally disable email confirmation to avoid email rate limits.
6. Copy the project URL, publishable key, and secret/service role key into local environment files.

## Vercel Deployment

This project is configured for Vercel:

- Vite builds the frontend from `client/`.
- Express is exposed as a Vercel Function through `api/index.js`.
- `vercel.json` routes `/api/*` and `/health` to the backend and all other routes to the React SPA.

Vercel build settings:

```text
Install Command: npm install
Build Command: npm run build --workspace client
Output Directory: client/dist
```

Required Vercel environment variables:

```text
SUPABASE_URL
SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
VITE_SUPABASE_URL
VITE_SUPABASE_ANON_KEY
```

After deployment, update Supabase Auth URL settings:

```text
Site URL: https://your-vercel-domain.vercel.app
Redirect URLs: https://your-vercel-domain.vercel.app/*
```

## Project Structure

```text
Job Application Tracking Web App/
  api/                 Vercel Function entrypoint
  client/              React + Vite frontend
  database/            Supabase SQL schema
  server/              Express API source
  Reference Image/     Design references and deployment screenshots
  vercel.json          Vercel routing/build configuration
```

## Future Improvements

- Add application search, filtering, and sorting.
- Expand Calendar into a full month/week view.
- Add company/contact management sections.
- Add richer analytics and trend history.
- Add automated tests for API routes and frontend workflows.
