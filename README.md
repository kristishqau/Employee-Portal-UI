# Employee Portal — Frontend

This repository contains the frontend for the Employee Portal application. It's a Vite + React + TypeScript single-page application (SPA) built with the shadcn/ui-style component set and Radix primitives. The frontend can be used in demo mode without a backend, or connected to a backend API (ASP.NET Core in my setup) for full functionality.

## Demo Mode

The application includes a demo mode for testing without a backend:

```env
VITE_DEMO_MODE=true
```

Demo Accounts:
- Admin: `admin` / `admin123`
- Employee: `employee` / `employee123`

Features available in demo mode:
- Project management
- Task creation and assignment
- Task status updates
- Admin-specific operations (project creation, task deletion)

Note: Demo data persists only during the browser session.

Overview
- Built with: Vite, React, TypeScript
- UI: Custom shadcn-style components (Radix primitives + Tailwind)
- State: Zustand
- HTTP client: axios (configured in `src/lib/axios.ts`)
- Auth: JSON Web Token (stored in localStorage via `src/lib/auth.ts`)

Project structure (important files)
- `src/` — main application source
  - `pages/` — top-level routes (Dashboard, Login, Tasks, Projects, Users, Profile, NotFound)
  - `components/` — reusable pieces (UI composition, ActivityFeed, ProtectedRoute, layout)
  - `lib/axios.ts` — axios instance and interceptors (adds Bearer token from localStorage)
  - `lib/auth.ts` — helpers for storing/decoding token and reading the current user
  - `stores/authStore.ts` — login/logout logic and small auth state
- `package.json` — scripts and dependencies

# API / Backend 
This frontend expects a separate backend API. You must run and have the backend reachable from the frontend. The base URL for the API is configurable via environment variables (see below). Some of the API endpoints the frontend interacts with:

- POST /api/User/login — authenticate and receive { token, userId, username, role, profilePictureUrl }
- GET /api/User — list users (admin)
- GET /api/Project — list projects (admin)
- GET /api/Project/GetProjectsForUser — list projects for the current user (employee)
- GET /api/Task — list tasks
- GET /api/Project/{id}/tasks — list tasks for a project
- POST /api/Task — create a task (the frontend may send projectId and userId as query params depending on the endpoint signature)
- PUT /api/Task/{id} — update a task
- DELETE /api/Task/{id} — delete a task

If you run the backend on HTTPS (for example: https://localhost:5001), update the frontend API base to that URL.

Environment variables
Create a `.env` or `.env.local` file in the project root (not committed) with variables for Vite. Example (copy to `.env.local`):

```env
# Backend API base URL (change to your backend host and port)
VITE_API_BASE_URL=https://localhost:5001

# Enable demo mode to run without a backend
VITE_DEMO_MODE=true
```

Notes:
- `src/lib/axios.ts` uses `import.meta.env.VITE_API_BASE_URL` or defaults to `http://localhost:5000` when not set.
- The dev server (Vite) proxies are not configured here, so using a proper backend URL or enabling CORS on the API is required.

Local development
Use Command Prompt on Windows (PowerShell execution policy may prevent running npm scripts via the PowerShell wrapper in some environments).

Commands

```cmd
cd \path\to\Employee-Portal-UI
npm install
npm run dev   # start Vite development server (hot reload)
npm run build # build production assets
npm run preview # serve the production build locally
npm run lint  # run eslint
```

Open the dev server in your browser (Vite usually runs at http://localhost:5173). If your backend runs on HTTPS (like https://localhost:44346), update `VITE_API_BASE_URL` to that address.

Authentication flow
- Login form calls `POST ${VITE_API_BASE_URL}/api/User/login` with JSON body { username, password }.
- The server responds with a JSON containing a `token` (JWT). The token is stored in localStorage. The app decodes the token to extract user info (see `src/lib/auth.ts`).
- axios interceptors attach the token automatically on requests.

Troubleshooting
- `400 Bad Request` on login: Make sure the frontend sends JSON body (this app sends credentials in the POST JSON body). Also confirm the backend login route and payload format.
- CORS issues: If the browser blocks requests from the frontend to the backend, enable CORS on the backend or use a dev proxy.
- TLS / certificate: If your backend runs on `http://localhost:5000` with a development certificate, the browser must trust the certificate. Consider running backend in dev mode with a trusted cert or use HTTP locally.
- PowerShell `npm.ps1` execution policy: If running npm commands in PowerShell fails with an execution policy error, either run commands using Command Prompt (cmd.exe) or update the policy:

```powershell
Set-ExecutionPolicy RemoteSigned -Scope CurrentUser
```

Testing and linting
- ESLint is configured in the repo. Run `npm run lint` to see lint warnings and errors.

Contributing
- Fork or branch, add features or fixes, then open a pull request. Keep changes small and add tests where appropriate.

## Backend Repository

The backend API implementation is available at:
https://github.com/kristishqau/ASP.NET_Web_API

Clone the repository and follow its setup instructions to run the backend locally.

## Quick Start

### Demo Mode Setup

1. Create `.env.local`:
```env
VITE_DEMO_MODE=true
```
2. Install and run:
```bash
npm install
npm run dev
```
3. Login with demo credentials

### Production Setup

1. Create `.env.local`:
```env
VITE_API_BASE_URL=http://localhost:5000
```
2. Install and run:
```bash
npm install
npm run dev
```
3. Connect to your backend API