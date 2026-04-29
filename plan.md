# JobTrack Web App Implementation Plan With Local Isolation

## Summary

Build the Job Application Tracking Web App as a full-stack project using **React + Vite**, **Node.js/Express**, and **Supabase PostgreSQL/Auth**. Before implementation, create a project-local isolation setup so all project code, Node dependencies, environment files, and Python helper tooling stay inside `D:\projects\Job Application Tracking Web App`.

Selected defaults:

- UI language: English.
- Auth: Supabase Auth.
- Isolation model: project-level isolation.
- Python venv: create local `.venv` using `C:\Users\Owner\AppData\Local\Python\bin\python.exe`, confirmed as Python 3.14.2.

## Isolation Setup

Before scaffolding the app:

```powershell
& "C:\Users\Owner\AppData\Local\Python\bin\python.exe" -m venv .venv
```

Keep `.venv/` at the project root:

```text
D:\projects\Job Application Tracking Web App\.venv
```

Use `.venv` only for Python-based helper tooling, scripts, and optional local automation.

Use local Node dependency isolation:

- `node_modules/` stays inside the project.
- `package-lock.json` pins installed versions.
- Use `npm.cmd` on Windows because `npm.ps1` is blocked by PowerShell execution policy.

Do not place app source code inside `.venv`; keep source code in normal project folders so the project remains maintainable.

Planned root structure:

```text
Job Application Tracking Web App/
  .venv/
  client/
  server/
  database/
  Reference Image/
  .env.example
  package.json
  package-lock.json
  README.md
```

## UI And Product Spec

Implement **JobTrack** with the tagline **"Track. Manage. Land."**

Match the provided main interface reference:

- Light SaaS dashboard style.
- Fixed left sidebar on desktop.
- Top header with time/date and user profile.
- Green primary brand color.
- KPI cards for total applications, in progress, interviews, and offers.
- Recent applications table.
- Application status donut chart.
- Upcoming interviews/tasks panel.
- Responsive mobile layout with collapsed navigation.

Core colors:

- Primary green: `#22A866`.
- Hover green: `#158A4D`.
- Background: `#F8FAFC`.
- Cards: `#FFFFFF`.
- Text primary: `#111827`.
- Text secondary: `#6B7280`.
- Border: `#E5E7EB`.

Use `lucide-react` icons and compact, professional dashboard spacing.

## Architecture And Features

### Frontend

- React + Vite.
- Supabase client for registration, login, logout, and session handling.
- Protected routes: unauthenticated users redirect to login.
- Views:
  - Login.
  - Register.
  - Dashboard.
  - Applications list.
  - Create/edit application form.
  - Calendar/upcoming view.
  - Settings/profile.
- Sidebar sections from the reference image. Non-core sections can show polished placeholder states in v1.

### Backend

- Node.js + Express REST API.
- Auth middleware verifies Supabase access token.
- All business queries are scoped to authenticated `user.id`.
- API routes:
  - `GET /api/me`
  - `PUT /api/me`
  - `GET /api/applications`
  - `POST /api/applications`
  - `GET /api/applications/:id`
  - `PUT /api/applications/:id`
  - `DELETE /api/applications/:id`
  - `GET /api/dashboard`

### Supabase

- Use Supabase Auth for email/password accounts.
- Store profile and job application data in PostgreSQL.
- Enable RLS for user-owned rows.

Tables:

- `profiles`: user profile linked to `auth.users`.
- `applications`: company, position, status, applied date, next step, notes, timestamps, and `user_id`.

## Test Plan

Verify:

- Python `.venv` exists and uses the provided Python 3.14.2 executable.
- Node dependencies install locally using `npm.cmd`.
- Register/login/logout work.
- Dashboard is blocked when logged out.
- Applications can be created, edited, deleted, and persisted in Supabase.
- Dashboard stats update from real application data.
- User A cannot access User B's applications.
- Desktop UI closely matches the reference image.
- Mobile/tablet layouts have no overlapping text or broken navigation.

## Assumptions

- Supabase project credentials will be supplied through local `.env` files, not hard-coded.
- Passwords are managed by Supabase Auth, not stored manually in custom tables.
- `npm.cmd` will be used instead of `npm` in PowerShell to avoid the current script execution policy issue.
- Non-core sidebar sections may be polished placeholders in v1, while Dashboard, Applications, Calendar/upcoming items, auth, and persistence are fully functional.
