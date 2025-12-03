# Task Assignment System

A full-stack web application for managing task assignments with skill-based matching, subtask support, and AI-powered skill detection.

## 🎯 Features

- **Task Management**: Create, view, and update tasks with multiple statuses
- **Skill-Based Assignment**: Assign tasks only to developers with matching skills
- **Nested Subtasks**: Support for unlimited depth of subtasks
- **AI Skill Detection**: Automatic skill identification using Google Gemini LLM
- **Validation**: Tasks can only be marked "Done" if all subtasks are completed
- **Real-time Updates**: Dynamic UI with instant feedback

## 🏗️ Architecture

### Tech Stack

**Frontend:**
- Next.js 14 with App Router
- React 18 with TypeScript
- TailwindCSS (styling)

**Backend:**
- Node.js with Express
- TypeScript
- Sequelize ORM
- PostgreSQL database
- Google Gemini AI API

**DevOps:**
- Docker & Docker Compose
- Multi-stage Docker builds

### System Design

```
┌─────────────────┐      ┌─────────────────┐      ┌─────────────────┐
│                 │      │                 │      │                 │
│    Frontend     │─────▶│     Backend     │─────▶│   PostgreSQL    │
│  (Next.js App)  │      │   (Express API) │      │    Database     │
│                 │      │                 │      │                 │
└─────────────────┘      └────────┬────────┘      └─────────────────┘
                                  │
                                  │
                         ┌────────▼────────┐
                         │                 │
                         │  Gemini AI API  │
                         │ (Skill Detection)│
                         │                 │
                         └─────────────────┘
```

### Database Schema

**Key Entities:**
- `developers`: Store developer information
- `skills`: Define available skills (Frontend, Backend)
- `developer_skills`: Many-to-many relationship between developers and skills
- `tasks`: Store task information with self-referential parent-child relationship
- `task_skills`: Many-to-many relationship between tasks and required skills

**Key Relationships:**
- A developer can have multiple skills
- A task can require multiple skills
- A task can have multiple subtasks (recursive)
- A task can only be assigned to developers with ALL required skills
- A task can only be marked "Done" if all its subtasks are "Done"

## 📋 Prerequisites

- Docker and Docker Compose
- Node.js 20+ (for local development)
- Google Gemini API key (free tier available)

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone <repository-url>
cd htx-task-assignment
```

### 2. Set Up Environment Variables

```bash
# Copy environment file
cp .env.example .env

# Edit .env and add your Gemini API key
# Get a free API key from: https://makersuite.google.com/app/apikey
```

### 3. Run with Docker Compose

```bash
docker-compose up --build
```

This will:
- Start PostgreSQL database on port 5432
- Run database migrations
- Seed initial data (developers and sample tasks)
- Start backend API on port 3001
- Start frontend on port 3000

### 4. Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001/api
- **Health Check**: http://localhost:3001/health

## 🛠️ Development Setup

### Backend Development

```bash
cd backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Run database sync (creates tables)
npm run db:migrate

# Seed database
npm run db:seed

# Start development server
npm run dev
```

### Frontend Development

```bash
cd frontend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Start development server
npm run dev
```

## 📡 API Documentation

### Tasks

**GET /api/tasks**
- Returns all tasks with skills, developers, and subtasks

**GET /api/tasks/:id**
- Returns a single task by ID

**POST /api/tasks**
- Creates a new task
- Body: `{ title: string, skillIds?: number[], parentTaskId?: number }`
- If `skillIds` is not provided, LLM will automatically detect required skills

**PATCH /api/tasks/:id**
- Updates a task
- Body: `{ status?: 'TODO' | 'IN_PROGRESS' | 'DONE', developerId?: number | null }`
- Validates:
  - Developer has required skills
  - All subtasks are "Done" before marking parent as "Done"

### Developers

**GET /api/developers**
- Returns all developers with their skills and assigned tasks

**GET /api/developers/:id**
- Returns a single developer by ID

### Skills

**GET /api/skills**
- Returns all skills

**GET /api/skills/:id**
- Returns a single skill by ID

## 🤖 LLM Integration

### How It Works

When a task is created without specified skills, the backend automatically:

1. Sends the task title to Google Gemini API
2. Receives AI-generated skill recommendations (Frontend, Backend, or both)
3. Assigns the detected skills to the task

### Prompt Engineering

The LLM prompt is carefully designed to:
- Analyze task descriptions in user story format
- Identify UI/UX requirements → Frontend skill
- Identify server/database requirements → Backend skill
- Return structured JSON responses
- Handle edge cases with default fallbacks

### Example

**Input Task:**
```
"As a visitor, I want to see a responsive homepage so that I can 
easily navigate on both desktop and mobile devices."
```

**LLM Output:**
```json
{
  "skills": ["Frontend"]
}
```

## 🗂️ Project Structure

```
htx-task-assignment/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── database.ts        # Sequelize connection
│   │   ├── models/
│   │   │   ├── Developer.ts       # Developer model
│   │   │   ├── Skill.ts           # Skill model
│   │   │   ├── Task.ts            # Task model
│   │   │   ├── DeveloperSkill.ts  # Junction model
│   │   │   ├── TaskSkill.ts       # Junction model
│   │   │   ├── index.ts           # Model associations
│   │   │   └── sync.ts            # DB sync script
│   │   ├── routes/
│   │   │   ├── tasks.ts           # Task endpoints
│   │   │   ├── developers.ts      # Developer endpoints
│   │   │   └── skills.ts          # Skill endpoints
│   │   ├── services/
│   │   │   └── llm.ts             # LLM integration
│   │   ├── seed.ts                # Seed script
│   │   └── index.ts               # Express app
│   ├── Dockerfile
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── app/
│   │   ├── create/
│   │   │   └── page.tsx           # Create task page
│   │   ├── layout.tsx             # Root layout
│   │   ├── page.tsx               # Task list page
│   │   └── globals.css            # Global styles
│   ├── lib/
│   │   ├── api.ts                 # API client
│   │   └── types.ts               # TypeScript types
│   ├── Dockerfile
│   ├── next.config.js
│   └── package.json
├── docker-compose.yml
└── README.md
```

## 🔧 Configuration

### Backend Environment Variables

```env
DATABASE_URL=postgresql://user:password@host:port/database
PORT=3001
GEMINI_API_KEY=your_api_key_here
```

### Frontend Environment Variables

```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

## 🎨 Design Decisions

### 1. **Sequelize ORM**
   - Widely adopted and mature ORM for Node.js
   - Great TypeScript support with decorators
   - Flexible query interface
   - Built-in migration support

### 2. **Zod for Validation**
   - Runtime type validation
   - API request validation
   - Type inference from schemas

### 3. **Recursive Subtasks**
   - Self-referential foreign key in database
   - Recursive React components for unlimited nesting
   - Cascading delete for data integrity

### 4. **LLM Integration**
   - Google Gemini (free tier available)
   - Structured JSON output parsing
   - Fallback to default skills on error
   - Async processing doesn't block task creation

### 5. **Docker Multi-Stage Builds**
   - Smaller production images
   - Faster builds with layer caching
   - Separation of build and runtime dependencies

### 6. **TailwindCSS**
   - Utility-first styling
   - Consistent design system
   - Smaller bundle sizes in production

### 7. **Next.js App Router**
   - Modern React framework with server components
   - Built-in routing without external libraries
   - Optimized builds and performance
   - Better SEO capabilities

## 🧪 Testing the Application

### Sample Workflow

1. **View Existing Tasks**
   - Navigate to http://localhost:3000
   - See pre-seeded tasks with different skills

2. **Create a Task Without Skills**
   - Click "Create Task"
   - Enter: "As a user, I want to log in securely"
   - Click Save
   - LLM automatically detects Backend skill

3. **Create a Task With Subtasks**
   - Click "Create Task"
   - Enter main task
   - Click "Add Subtask"
   - Create nested subtasks
   - Skills can be specified or auto-detected

4. **Assign a Developer**
   - Go to Task List
   - Select a developer from dropdown
   - Only developers with matching skills appear

5. **Update Task Status**
   - Try marking parent task as "Done" (will fail if subtasks not done)
   - Mark all subtasks as "Done"
   - Then mark parent as "Done" (will succeed)

## 🐛 Troubleshooting

### Database Connection Issues

```bash
# Check if PostgreSQL is running
docker-compose ps

# View logs
docker-compose logs postgres
```

### Backend Not Starting

```bash
# Check backend logs
docker-compose logs backend

# Rebuild containers
docker-compose up --build backend
```

### LLM Not Working

- Verify your Gemini API key in `.env`
- Check backend logs for API errors
- Test with: https://makersuite.google.com/app/apikey

### Frontend Not Loading

```bash
# Check frontend logs
docker-compose logs frontend

# Verify backend is accessible
curl http://localhost:3001/health
```

## 📊 Database Seeding

Initial data includes:

**Developers:**
- Alice (Frontend)
- Bob (Backend)
- Carol (Frontend, Backend)
- Dave (Backend)

**Skills:**
- Frontend
- Backend

**Sample Tasks:**
- Responsive homepage (Frontend)
- Audit logs (Backend)
- Profile management (Frontend, Backend)

## 🔒 Security Considerations

- Environment variables for sensitive data
- CORS enabled for frontend-backend communication
- Input validation with Zod
- SQL injection protection via Prisma
- API key not exposed to frontend

## 🚦 Future Enhancements

- User authentication and authorization
- Task priority and deadlines
- Task comments and attachments
- Email notifications
- Advanced filtering and search
- Task analytics dashboard
- More skill types
- Task history and audit logs

## 📝 License

This project is created as a take-home assessment for HTX.

## 👥 Contact

For questions or issues, contact the HTX recruitment team.

---

Built with ❤️ using React, TypeScript, Node.js, and AI
