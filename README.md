# TaskBoard API

A production-oriented Task Management REST API built with Node.js, Express, MongoDB, and Redis.

---

## Features

- User registration & login with bcrypt password hashing
- Session management via Redis (httpOnly cookies)
- API rate limiting (20 req/min per IP) using Redis
- Task list caching with automatic 5-minute TTL and cache invalidation
- Login attempt throttling (5 attempts → 15-minute lockout)
- Activity analytics counters stored in Redis

---

## Prerequisites

- Node.js >= 18
- MongoDB >= 6 (running locally or remote)
- Redis >= 6 (running locally or remote)

---

## Setup

```bash
# 1. Clone / enter the project

# 2. Install dependencies
npm install

# 3. Configure environment # i have used mongodb database and upstash redis server so use redis url in .env
cp .env.example .env

# Edit .env with your MongoDB URI, Redis config, and secrets

# 4. Start the server
npm start          # production
npm run dev        # development (nodemon)
```



## API Documentation

All responses follow the format:
```json
{ "success": true/false, "message": "...", "data": { ... } }
```

Authentication uses an `httpOnly` cookie (`sessionId`) set automatically on login.

---

### Authentication

#### POST /register
Register a new user.

**Request Body:**
```json
{
  "fullName": "John Doe",
  "email": "john@example.com",
  "password": "secret123"
}
```
**Response `201`:**
```json
{
  "success": true,
  "message": "Registration successful.",
  "data": { "user": { "id": "...", "fullName": "John Doe", "email": "john@example.com" } }
}
```

---

#### POST /login
Authenticate and create a session.

**Request Body:**
```json
{ "email": "john@example.com", "password": "secret123" }
```
**Response `200`:** Sets `sessionId` cookie.
```json
{
  "success": true,
  "message": "Login successful.",
  "data": { "user": { "id": "...", "fullName": "John Doe", "email": "john@example.com" } }
}
```

---

#### POST /logout
*(Requires authentication)*  
Destroy session.

**Response `200`:**
```json
{ "success": true, "message": "Logged out successfully." }
```

---

#### GET /session-info
*(Requires authentication)*  
Returns current session data from Redis.

**Response `200`:**
```json
{
  "success": true,
  "data": {
    "session": {
      "userId": "...",
      "fullName": "John Doe",
      "email": "john@example.com",
      "loginTime": "2024-01-01T12:00:00.000Z"
    }
  }
}
```

---

### Tasks
All task endpoints require authentication (valid session cookie).

#### GET /tasks
List all tasks for the logged-in user.  
First request hits MongoDB; subsequent requests within 5 minutes are served from Redis cache.

**Response `200`:**
```json
{
  "success": true,
  "data": {
    "tasks": [
      {
        "_id": "...",
        "title": "Buy groceries",
        "description": "Milk, eggs, bread",
        "priority": "Low",
        "userId": "...",
        "createdAt": "...",
        "updatedAt": "..."
      }
    ],
    "count": 1
  },
  "meta": { "fromCache": false }
}
```

---

#### POST /tasks
Create a new task.

**Request Body:**
```json
{
  "title": "Buy groceries",
  "description": "Milk, eggs, bread",
  "priority": "Low"
}
```
**Response `201`:**
```json
{ "success": true, "message": "Task created.", "data": { "task": { ... } } }
```

---

#### PUT /tasks/:id
Update an existing task. All fields are optional.

**Request Body:**
```json
{ "title": "Updated title", "priority": "High", "description": "Updated desc" }
```
**Response `200`:**
```json
{ "success": true, "message": "Task updated.", "data": { "task": { ... } } }
```

---

#### DELETE /tasks/:id
Delete a task.

**Response `200`:**
```json
{ "success": true, "message": "Task deleted." }
```

---

### Analytics

#### GET /analytics
*(Requires authentication)*  
Returns cumulative counters from Redis.

**Response `200`:**
```json
{
  "success": true,
  "data": {
    "totalLogins": 42,
    "tasksCreated": 100,
    "tasksUpdated": 35,
    "tasksDeleted": 10
  }
}
```

---

### Health Check

#### GET /health
```json
{ "success": true, "status": "ok", "timestamp": "..." }
```

---

## Redis Key Reference

| Key Pattern                    | Purpose                         | TTL              |
|--------------------------------|---------------------------------|------------------|
| `session:{sessionId}`          | User session data               | `SESSION_EXPIRY` |
| `ratelimit:{ip}`               | Request counter per IP          | `RATE_LIMIT_WINDOW` |
| `cache:tasks:{userId}`         | Cached task list                | `TASK_CACHE_TTL` |
| `loginattempts:{email}`        | Failed login counter            | `LOGIN_BLOCK_DURATION` |
| `analytics:totalLogins`        | Successful login counter        | Persistent       |
| `analytics:tasksCreated`       | Task creation counter           | Persistent       |
| `analytics:tasksUpdated`       | Task update counter             | Persistent       |
| `analytics:tasksDeleted`       | Task deletion counter           | Persistent       |

---

## Error Responses

| Status | Meaning                                      |
|--------|----------------------------------------------|
| `400`  | Validation error / bad request               |
| `401`  | Unauthenticated                              |
| `404`  | Resource not found                           |
| `409`  | Conflict (email already registered)          |
| `423`  | Account locked (too many login attempts)     |
| `429`  | Rate limit exceeded                          |
| `500`  | Internal server error                        |
