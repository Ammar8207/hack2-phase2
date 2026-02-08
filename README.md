# Phase II Backend - FastAPI + SQLModel

## Setup

1. Install dependencies:
```bash
cd backend
pip install -r requirements.txt
```

2. Configure environment:
```bash
cd backend
cp .env.example .env
# Edit .env with your JWT_SECRET
```

3. Run the server:
```bash
cd backend
uvicorn main:app --reload
```

## API Endpoints

All endpoints require `Authorization: Bearer <JWT>` header.

- `GET /api/{user_id}/tasks` - List all tasks
- `POST /api/{user_id}/tasks` - Create task
- `PUT /api/{user_id}/tasks/{id}` - Update task
- `DELETE /api/{user_id}/tasks/{id}` - Delete task
- `PATCH /api/{user_id}/tasks/{id}/complete` - Mark complete

## Security

- JWT verification on all endpoints
- User ownership enforcement (token user_id must match path user_id)
- SQLModel for type-safe database operations
