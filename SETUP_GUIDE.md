# Employee Portal - Setup Guide

## Overview
Modern Employee Data Management System with JWT authentication and role-based access control.

## Features
✅ JWT Authentication
✅ Role-based access (Employee & Administrator)
✅ User Profile Management
✅ Projects Management
✅ Tasks Management
✅ User Management (Admin only)
✅ Responsive Design
✅ Modern UI with shadcn/ui

---

## Prerequisites

### Backend Requirements
- .NET 6.0 SDK or higher
- SQL Server
- Your ASP.NET Web API running

### Frontend Requirements
- Node.js 18+ and npm
- Modern web browser

---

## Backend Setup

### 1. Start Your .NET API
```bash
cd /path/to/ASP.NET_Web_API
dotnet restore
dotnet run
```

The API should start on `http://localhost:5000` (or your configured port)

### 2. Verify CORS Configuration
Make sure your `Program.cs` or `Startup.cs` includes:
```csharp
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.WithOrigins("http://localhost:8080") // Frontend URL
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

// Before app.Run()
app.UseCors();
```

### 3. Create Test Users
Use your database or API to create test accounts:

**Administrator Account:**
- Username: `admin`
- Password: `admin123`
- Role: `Administrator`

**Employee Account:**
- Username: `employee`
- Password: `employee123`
- Role: `Employee`

---

## Frontend Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure API URL
Create a `.env` file in the project root:
```env
VITE_API_BASE_URL=http://localhost:5000
```

Adjust the URL to match your backend API endpoint.

### 3. Start Development Server
```bash
npm run dev
```

The application will start on `http://localhost:8080`

### 4. Login
Navigate to `http://localhost:8080/login` and use one of the test accounts.

---

## Project Structure

```
src/
├── components/
│   ├── ui/                    # shadcn/ui components
│   ├── Layout/
│   │   └── DashboardLayout.tsx
│   └── ProtectedRoute.tsx
├── pages/
│   ├── Login.tsx
│   ├── Dashboard.tsx
│   ├── Profile.tsx
│   ├── Projects.tsx
│   ├── Tasks.tsx
│   ├── Users.tsx
│   └── NotFound.tsx
├── stores/
│   └── authStore.ts          # Zustand state management
├── lib/
│   ├── axios.ts              # API client with interceptors
│   ├── auth.ts               # Auth utilities
│   └── utils.ts
├── App.tsx                    # Routing configuration
└── index.css                  # Design system tokens
```

---

## Features Guide

### For Employees
- **Dashboard:** View personal task and project stats
- **My Profile:** Update username and profile picture
- **Projects:** View assigned projects
- **Tasks:** View and complete assigned tasks

### For Administrators
- **Dashboard:** System-wide overview
- **User Management:** Create, edit, and delete users
- **Projects:** Manage all projects
- **Tasks:** View and manage all tasks
- **Full CRUD operations** on all entities

---

## API Integration

All API calls are handled through `/src/lib/axios.ts` which:
- Automatically adds JWT token to requests
- Handles 401 errors (redirects to login)
- Configures base URL from environment variable

Example API call:
```typescript
import api from '@/lib/axios';

// GET request
const response = await api.get('/api/Project');

// POST request
const response = await api.post('/api/User/login', null, {
  params: { username, password }
});

// PUT request
await api.put(`/api/User/${userId}`, userData);
```

---

## Design System

The application uses a professional design system defined in `src/index.css`:

**Primary Colors:**
- Primary: `hsl(217 91% 60%)` - Professional blue
- Success: `hsl(142 76% 36%)` - Green
- Warning: `hsl(38 92% 50%)` - Amber
- Destructive: `hsl(0 84% 60%)` - Red

**Component Variants:**
All components use semantic tokens from the design system. Never use hardcoded colors like `text-white` or `bg-blue-500`.

---

## Troubleshooting

### Login Returns 401
- Verify backend is running
- Check CORS configuration
- Verify username/password in database

### API Calls Fail with CORS Error
Add CORS middleware to your .NET API:
```csharp
app.UseCors();
```

### JWT Token Expires Quickly
Check token expiration settings in your .NET API JWT configuration.

### Cannot Access Admin Features
Ensure user role is exactly `"Administrator"` (case-sensitive) in database.

---

## Building for Production

### 1. Build Frontend
```bash
npm run build
```

### 2. Configure Production API URL
Update `.env` with production backend URL:
```env
VITE_API_BASE_URL=https://your-api-domain.com
```

### 3. Deploy
Deploy the `dist/` folder to your hosting provider (Vercel, Netlify, etc.)

---

## Security Notes

### Authentication
- JWT tokens stored in localStorage
- Token auto-refreshed on page load
- Auto-logout on 401 responses

### Authorization
- Protected routes check authentication
- Admin routes verify role
- API calls include Bearer token

### Best Practices
- Never commit `.env` file
- Use HTTPS in production
- Implement token refresh mechanism
- Add rate limiting on backend

---

## Next Steps

### Enhance the Application
1. **Profile Picture Upload:** Implement file upload endpoint
2. **Project Details Page:** Show team members and tasks
3. **Task Assignment:** Create/edit task modal
4. **User Creation Form:** Add user creation modal
5. **Notifications:** Real-time task assignments
6. **Analytics:** Task completion charts

### Backend Enhancements Needed
1. Add pagination to list endpoints
2. Implement search/filter endpoints
3. Add profile picture upload endpoint
4. Token refresh endpoint
5. Email notifications

---

## Support

### Documentation
- [API Documentation](./API_DOCUMENTATION.md)
// ...existing code...
- [shadcn/ui](https://ui.shadcn.com/)

### Common Issues
Check the console for error messages and verify:
1. Backend is running and accessible
2. CORS is properly configured
3. JWT token format matches expected structure
4. Database has test users created

---

## Technology Stack

**Frontend:**
- React 18 + TypeScript
- Vite (Build tool)
- Tailwind CSS (Styling)
- shadcn/ui (Component library)
- Zustand (State management)
- Axios (HTTP client)
- React Router (Routing)
- jwt-decode (Token parsing)

**Backend (Your API):**
- .NET 6.0 Web API
- Entity Framework
- JWT Authentication
- SQL Server

---

Happy coding! 🚀
