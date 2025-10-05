# API Integration Documentation

## Backend API Endpoints

This document details the complete API structure from your .NET backend.

### Base URL Configuration
Set your backend API URL in `.env` file:
```
VITE_API_BASE_URL=http://localhost:5000
```

---

## Authentication Endpoints

### Login
**POST** `/api/User/login`
- **Authorization:** Public (AllowAnonymous)
- **Parameters:** 
  - `username` (query string) - User's username
  - `password` (query string) - User's password
- **Response:**
```json
{
  "Token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```
- **Error Response:**
```json
{
  "Message": "Invalid credentials"
}
```

---

## User Endpoints

### Get All Users (Admin Only)
**GET** `/api/User`
- **Authorization:** Administrator role required
- **Response:** Array of UserDto
```json
[
  {
    "id": 1,
    "userName": "john.doe",
    "role": "Employee",
    "profilePictureUrl": "https://..."
  }
]
```

### Get User by ID
**GET** `/api/User/{id}`
- **Authorization:** Authenticated
- **Response:** UserDto object

### Get Users of a Task
**GET** `/api/User/tasks/{taskId}/users`
- **Authorization:** Authenticated
- **Response:** Array of UserDto

### Get Users of a Project
**GET** `/api/User/projects/{projectId}/users`
- **Authorization:** Authenticated
- **Response:** Array of UserDto

### Create User (Admin Only)
**POST** `/api/User`
- **Authorization:** Administrator role required
- **Query Parameters:**
  - `projectId` (optional) - Assign user to project
  - `taskId` (optional) - Assign user to task
- **Request Body:**
```json
{
  "userName": "jane.smith",
  "password": "SecurePass123!",
  "role": "Employee"
}
```

### Update User
**PUT** `/api/User/{userId}`
- **Authorization:** Authenticated (Employees can only update their own profile)
- **Request Body:** UserDto
```json
{
  "id": 1,
  "userName": "john.doe.updated",
  "role": "Employee",
  "profilePictureUrl": "https://..."
}
```

### Add User to Task/Project
**POST** `/api/User/addUserToTaskAndProject`
- **Authorization:** Authenticated
- **Query Parameters:**
  - `userId` (required)
  - `taskId` (optional)
  - `projectId` (optional)

### Remove User from Task/Project (Admin Only)
**DELETE** `/api/User/removeUserFromTaskAndProject`
- **Authorization:** Administrator role required
- **Query Parameters:**
  - `userId` (required)
  - `taskId` (optional)
  - `projectId` (optional)

### Delete User (Admin Only)
**DELETE** `/api/User/{userId}`
- **Authorization:** Administrator role required

---

## Project Endpoints

### Get All Projects
**GET** `/api/Project`
- **Authorization:** Authenticated
- **Response:** Array of ProjectDto
```json
[
  {
    "id": 1,
    "name": "Website Redesign",
    "description": "Redesign company website"
  }
]
```

### Get Projects for Current User
**GET** `/api/Project/GetProjectsForUser`
- **Authorization:** Authenticated
- **Response:** Array of projects the current user is assigned to

### Get Project by ID
**GET** `/api/Project/{id}`
- **Authorization:** Authenticated
- **Response:** ProjectDto object

### Get Tasks by Project
**GET** `/api/Project/{projectId}/tasks`
- **Authorization:** Authenticated
- **Response:** Array of TaskDto

### Create Project (Admin Only)
**POST** `/api/Project`
- **Authorization:** Administrator role required
- **Query Parameters:**
  - `userId` (required) - Initial user to assign to project
- **Request Body:**
```json
{
  "name": "New Project",
  "description": "Project description"
}
```

### Update Project (Admin Only)
**PUT** `/api/Project/{projectId}`
- **Authorization:** Administrator role required
- **Request Body:** ProjectDto

### Delete Project (Admin Only)
**DELETE** `/api/Project/{projectId}`
- **Authorization:** Administrator role required
- **Note:** Cannot delete projects with unfinished tasks

---

## Task Endpoints

### Get All Tasks
**GET** `/api/Task`
- **Authorization:** Authenticated
- **Response:** Array of TaskDto
```json
[
  {
    "id": 1,
    "title": "Implement login page",
    "description": "Create responsive login page",
    "isFinished": false
  }
]
```

### Get Task by ID
**GET** `/api/Task/{id}`
- **Authorization:** Authenticated
- **Response:** TaskDto object

### Create Task
**POST** `/api/Task`
- **Authorization:** Authenticated (Employees must be part of the project)
- **Query Parameters:**
  - `projectId` (required)
  - `userId` (required) - User to assign task to
- **Request Body:**
```json
{
  "title": "Task title",
  "description": "Task description",
  "isFinished": false
}
```

### Update Task
**PUT** `/api/Task/{taskId}`
- **Authorization:** Authenticated (Employees can only update their own tasks)
- **Query Parameters:**
  - `userId` (required)
- **Request Body:** TaskDto

### Delete Task (Admin Only)
**DELETE** `/api/Task/{taskId}`
- **Authorization:** Administrator role required

---

## Data Models

### UserDto
```typescript
{
  id: number;
  userName: string;
  password?: string; // Only on create/update
  role: 'Employee' | 'Administrator';
  profilePictureUrl?: string;
}
```

### ProjectDto
```typescript
{
  id: number;
  name: string;
  description: string;
}
```

### TaskDto
```typescript
{
  id: number;
  title: string;
  description: string;
  isFinished: boolean;
}
```

---

## JWT Token Structure

The token contains the following claims:
- `id` - User ID
- `userName` - Username
- `role` - User role (Employee or Administrator)
- `exp` - Token expiration timestamp

---

## Error Handling

### Common Error Responses

**400 Bad Request**
```json
{
  "Message": "Validation error message"
}
```

**401 Unauthorized**
```json
{
  "Message": "Invalid credentials"
}
```

**403 Forbidden**
```json
{
  "Message": "Employees can only update their own profile"
}
```

**404 Not Found**
```json
{
  "Message": "Resource not found"
}
```

**422 Unprocessable Entity**
```json
{
  "Message": "User already exists"
}
```

**500 Internal Server Error**
```json
{
  "Message": "Something went wrong while saving"
}
```

---

## Authorization Rules

### Administrators Can:
- Create, update, and delete users
- Create, update, and delete projects
- Delete tasks
- Add/remove users from projects and tasks
- View all projects and tasks

### Employees Can:
- Update their own profile only
- Create tasks in projects they're assigned to
- Update tasks assigned to them
- View projects they're assigned to
- View and complete their own tasks

---

## CORS Configuration

Make sure your .NET backend allows CORS for your frontend origin:
```csharp
// In Program.cs or Startup.cs
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.WithOrigins("http://localhost:8080") // Your frontend URL
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});
```
