# Backend API

## Local development

```bash
cd backend
npm install
cp .env.example .env
npm run dev
```

## API routes

- GET /health
- GET /api/v1
- POST /api/v1/auth/register
- POST /api/v1/auth/login
- GET /api/v1/tasks
- POST /api/v1/tasks
- PUT /api/v1/tasks/:id
- DELETE /api/v1/tasks/:id

## Auth

JWT tokens are issued on login and registration. Include them in the Authorization header as:

```http
Authorization: Bearer <token>
```
