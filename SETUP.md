# Quick Setup Guide

## Prerequisites
1. Install Docker and Docker Compose
2. Get a free Google Gemini API key: https://makersuite.google.com/app/apikey

## Setup Steps

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd htx-task-assignment
   ```

2. **Configure API Key**
   ```bash
   cp .env.example .env
   # Edit .env and add your GEMINI_API_KEY
   ```

3. **Start the application**
   ```bash
   docker compose up --build
   ```

4. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:3001/api
   - Database: localhost:5432

## What Gets Installed

- PostgreSQL 16 (database)
- Node.js backend API (Express + Prisma)
- React frontend (Vite + TailwindCSS)

## Initial Data

The system will automatically create:
- 4 developers (Alice, Bob, Carol, Dave)
- 2 skills (Frontend, Backend)
- 3 sample tasks

## Testing

1. Go to http://localhost:3000
2. View the task list
3. Click "Create Task" to create new tasks
4. Try creating tasks without specifying skills (LLM will detect them)
5. Create tasks with subtasks
6. Assign developers to tasks
7. Update task status

## Stopping the Application

```bash
docker-compose down
```

## Troubleshooting

If you encounter issues:

```bash
# View logs
docker-compose logs

# Restart services
docker-compose restart

# Rebuild everything
docker-compose down
docker-compose up --build
```
