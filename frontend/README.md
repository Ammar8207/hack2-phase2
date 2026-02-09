# Phase II Frontend - Next.js App Router

## Setup

1. Install dependencies:
```bash
cd frontend
npm install
```

2. Configure environment:
```bash
# .env.local is already created with:
BETTER_AUTH_SECRET=your-secret-key-change-in-production
BETTER_AUTH_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:8000
```

3. Run the development server:
```bash
npm run dev
```

## Features

- Better Auth integration for authentication
- Task CRUD operations (Create, Read, Update, Delete)
- Mark tasks as complete
- User-specific task management
- JWT-based API authentication

## Project Structure

```
frontend/
├── app/
│   ├── api/auth/[...all]/route.ts  # Better Auth handler
│   └── page.tsx                     # Main task list page
├── components/
│   ├── TaskForm.tsx                 # Create/Edit task form
│   └── TaskItem.tsx                 # Task display component
├── lib/
│   ├── auth.ts                      # Better Auth server config
│   ├── auth-client.ts               # Better Auth client
│   └── api.ts                       # Backend API client
└── types/
    └── task.ts                      # TypeScript types
```

## Usage

1. Start the backend server (see backend README)
2. Start the frontend: `npm run dev`
3. Open http://localhost:3000
4. Sign in with Better Auth
5. Create and manage your tasks
