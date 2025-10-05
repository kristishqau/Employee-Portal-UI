# Employee Portal — Frontend

This repository contains the frontend for the Employee Portal application. It's a Vite + React + TypeScript single-page application (SPA) built with the shadcn/ui-style component set and Radix primitives. The frontend is intended to be used together with a separate backend API (ASP.NET Core in my setup) which provides authentication and the business endpoints for users, projects and tasks.

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

Key behavior
- Authentication: login sends credentials to the backend login endpoint and receives a JWT token which is saved to localStorage. The axios instance attaches the token as `Authorization: Bearer <token>` for subsequent requests.
- Activity Feed: `src/components/ActivityFeed.tsx` will attempt to load recent activity from the backend, and falls back to mock items if the API is not available.

API / Backend
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

License
- This repository does not include a specific license file by default. If you want to make the project public, add a LICENSE file (for example the MIT license) and update this README.

Contact / Backend
- This frontend is designed to be paired with a backend API. If you need the backend repository or details about the API contract (models/payloads), see the public backend repository below.

Backend repository
- The backend for this project is available publicly on GitHub: https://github.com/kristishqau/ASP.NET_Web_API

  This repository contains the ASP.NET Web API implementation that the frontend expects (authentication, users, projects, tasks, etc.). Clone or browse that repo and follow its README for instructions to run the backend locally. Once the backend is running, update `VITE_API_BASE_URL` in this frontend to point to the backend's base URL (for example: `http://localhost:5000`).

--------------------------
Quick start summary

1. Set `VITE_API_BASE_URL` in `.env.local` to your backend URL (for example: `http://localhost:5000`).
2. Install deps: `npm install`.
3. Start dev server: `npm run dev` (use Command Prompt on Windows if PowerShell blocks npm.ps1).
4. Visit the app and login via the Login page (the app expects the backend to implement `/api/User/login`).

If you'd like, I can also add a `.env.example`, CI config, or a short CONTRIBUTING.md — tell me which you'd prefer next.
