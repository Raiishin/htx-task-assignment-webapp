# Task Assignment System
A production-ready, full-stack web application for managing task assignments with intelligent skill-based matching, nested subtasks support, and AI-powered skill detection using Google Gemini LLM.

## Table of Contents

- [Features](#features)
- [Technology Stack](#technology-stack)
- [System Architecture](#system-architecture)
- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Development Setup](#development-setup)
- [API Documentation](#api-documentation)
- [Testing](#testing)
- [CI/CD Pipeline](#cicd-pipeline)
- [Project Structure](#project-structure)
- [Configuration](#configuration)
- [Database Schema](#database-schema)
- [LLM Integration](#llm-integration)
- [Recent Improvements](#recent-improvements)
- [Design Decisions](#design-decisions)
- [Troubleshooting](#troubleshooting)
- [Future Enhancements](#future-enhancements)
- [License](#license)

## Features

### Core Functionality
- **Task Management**: Create, view, update, and delete tasks with multiple status states (TODO, IN_PROGRESS, DONE)
- **Developer Assignment**: Assign tasks to developers with real-time validation
- **Skill-Based Matching**: Tasks can only be assigned to developers with all required skills
- **Nested Subtasks**: Support for unlimited depth of subtasks with recursive data structure
- **AI Skill Detection**: Automatic skill identification from task descriptions using Google Gemini LLM
- **Subtask Validation**: Parent tasks can only be marked "Done" when all subtasks are completed

### Advanced Features
- **Pagination**: Efficient data loading with configurable page sizes
- **Filtering**: Filter tasks by status, assigned developer, and required skills with AND logic
- **Search**: Real-time search with debouncing for optimal performance
- **Optimistic UI Updates**: Instant feedback with automatic rollback on errors
- **Skeleton Loaders**: Smooth loading states for better user experience
- **Responsive Design**: Mobile-first design with TailwindCSS
- **Real-time Updates**: Dynamic UI with instant data synchronization

## Technology Stack

### Frontend
- **Next.js 14** - React framework with App Router for modern web applications
- **React 18** - Latest React with hooks and concurrent features
- **TypeScript 5.6** - Type-safe development with full IntelliSense
- **TailwindCSS 3.4** - Utility-first CSS framework for rapid UI development
- **Jest & React Testing Library** - Comprehensive testing suite

### Backend
- **Node.js 20** - Modern JavaScript runtime
- **Express.js 4.21** - Fast, minimalist web framework
- **TypeScript 5.6** - Type-safe server-side development
- **Sequelize 6.37** - Promise-based ORM with TypeScript support
- **PostgreSQL 16** - Robust relational database
- **Zod 3.23** - Runtime type validation for API requests
- **Google Gemini AI** - Advanced LLM for intelligent skill detection
- **Jest & Supertest** - Backend testing framework

### DevOps
- **Docker** - Containerization for consistent environments
- **Docker Compose** - Multi-container orchestration
- **GitHub Actions** - Automated CI/CD pipeline with test, build, and lint workflows
- **Multi-stage Builds** - Optimized Docker images for production

## System Architecture

### High-Level Overview

```
┌─────────────────────────────────────────────────────────────┐
│                         Client Layer                        │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐  │
│  │         Next.js Frontend (Port 3000)                │  │
│  │  - React 18 with TypeScript                         │  │
│  │  - TailwindCSS styling                              │  │
│  │  - Optimistic UI updates                            │  │
│  │  - Pagination, filtering, search                    │  │
│  └──────────────────┬──────────────────────────────────┘  │
└────────────────────┼──────────────────────────────────────┘
                     │
                     │ HTTP/REST API
                     │
┌────────────────────▼──────────────────────────────────────┐
│                      Application Layer                     │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐  │
│  │      Express.js Backend (Port 3001)                 │  │
│  │  ┌─────────────┐  ┌─────────────┐  ┌────────────┐  │  │
│  │  │   Routes    │  │  Services   │  │ Validation │  │  │
│  │  │   Layer     │─▶│    Layer    │─▶│    (Zod)   │  │  │
│  │  └─────────────┘  └──────┬──────┘  └────────────┘  │  │
│  │                           │                          │  │
│  │                           ▼                          │  │
│  │                    ┌─────────────┐                  │  │
│  │                    │   Sequelize │                  │  │
│  │                    │     ORM     │                  │  │
│  │                    └──────┬──────┘                  │  │
│  └───────────────────────────┼──────────────────────────┘  │
└────────────────────────────┼─────────────────────────────┘
                             │
              ┌──────────────┼──────────────┐
              │              │              │
              ▼              ▼              ▼
┌─────────────────┐  ┌──────────────┐  ┌─────────────────┐
│   PostgreSQL    │  │  Gemini AI   │  │  External APIs  │
│    Database     │  │     API      │  │   (Future)      │
│  (Port 5432)    │  │ (Skill Det.) │  │                 │
└─────────────────┘  └──────────────┘  └─────────────────┘
```

### Request Flow

1. **User Interaction** → Frontend captures user action
2. **Optimistic Update** → UI updates immediately for instant feedback
3. **API Request** → Next.js sends HTTP request to Express backend
4. **Validation** → Zod validates request payload and business rules
5. **Business Logic** → Service layer processes request (may call LLM)
6. **Database** → Sequelize ORM executes SQL queries
7. **Response** → Backend returns structured JSON response
8. **UI Sync** → Frontend updates or reverts based on response

## Prerequisites

- **Docker** and **Docker Compose** (recommended for quick start)
- **Node.js 20+** (for local development)
- **PostgreSQL 16** (if running without Docker)
- **Google Gemini API Key** - Get a free key at [https://makersuite.google.com/app/apikey](https://makersuite.google.com/app/apikey)

## Quick Start

### 1. Clone the Repository

```bash
git clone <repository-url>
cd htx-task-assignment
```

### 2. Set Up Environment Variables

```bash
# Copy the example environment file
cp .env.example .env

# Edit .env and add your Gemini API key
# GEMINI_API_KEY=your_api_key_here
```

### 3. Run with Docker Compose (Recommended)

```bash
docker compose up --build
```

This single command will:
- Start PostgreSQL database on port 5432
- Run database migrations automatically
- Seed initial data (4 developers, 2 skills, 3 sample tasks)
- Start backend API on port 3001
- Start frontend on port 3000

### 4. Access the Application

- **Frontend**: [http://localhost:3000](http://localhost:3000)
- **Backend API**: [http://localhost:3001/api](http://localhost:3001/api)
- **Health Check**: [http://localhost:3001/health](http://localhost:3001/health)

### 5. Test the Application

1. View pre-seeded tasks with different skills
2. Create a new task (e.g., "As a user, I want a login page")
3. Watch LLM automatically detect required skills
4. Assign tasks to developers (only those with matching skills appear)
5. Create tasks with nested subtasks
6. Try marking parent as "Done" (will fail until all subtasks are done)

## Development Setup

### Backend Development

```bash
cd backend

# Install dependencies
npm install

# Create environment file
cp .env.example .env
# Add your database URL and Gemini API key

# Run database migrations
npm run db:migrate

# Seed the database
npm run db:seed

# Start development server with hot reload
npm run dev

# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage

# Build for production
npm run build

# Start production server
npm start
```

### Frontend Development

```bash
cd frontend

# Install dependencies
npm install

# Create environment file
cp .env.example .env
# Add backend API URL: NEXT_PUBLIC_API_URL=http://localhost:3001/api

# Start development server with hot reload
npm run dev

# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage

# Lint code
npm run lint

# Build for production
npm run build

# Start production server
npm start
```

## API Documentation

### Base URL
```
http://localhost:3001/api
```

### Tasks

#### Get All Tasks (with Pagination & Filtering)
```http
GET /api/tasks?page=1&limit=10&status=TODO&developerId=1&skillIds=1,2&search=login
```

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `status` (optional): Filter by status (TODO, IN_PROGRESS, DONE)
- `developerId` (optional): Filter by assigned developer ID
- `skillIds` (optional): Filter by required skill IDs (comma-separated, AND logic)
- `search` (optional): Search in task titles

**Response:**
```json
{
  "tasks": [
    {
      "id": 1,
      "title": "As a visitor, I want to see a responsive homepage",
      "status": "TODO",
      "parentTaskId": null,
      "developerId": null,
      "createdAt": "2024-12-04T00:00:00.000Z",
      "updatedAt": "2024-12-04T00:00:00.000Z",
      "skills": [
        { "id": 1, "name": "Frontend" }
      ],
      "developer": null,
      "subtasks": []
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "totalItems": 48,
    "itemsPerPage": 10,
    "hasNextPage": true,
    "hasPreviousPage": false
  }
}
```

#### Get Single Task
```http
GET /api/tasks/:id
```

**Response:**
```json
{
  "id": 1,
  "title": "As a visitor, I want to see a responsive homepage",
  "status": "TODO",
  "parentTaskId": null,
  "developerId": null,
  "skills": [...],
  "developer": null,
  "subtasks": [...]
}
```

#### Create Task
```http
POST /api/tasks
Content-Type: application/json

{
  "title": "As a user, I want to reset my password",
  "skillIds": [2],  // Optional - LLM will auto-detect if not provided
  "parentTaskId": null  // Optional - for creating subtasks
}
```

**LLM Auto-Detection**: If `skillIds` is not provided, the backend automatically:
1. Sends task title to Google Gemini API
2. Receives AI-detected skills (Frontend, Backend, or both)
3. Assigns detected skills to the task

**Response:**
```json
{
  "id": 4,
  "title": "As a user, I want to reset my password",
  "status": "TODO",
  "skills": [
    { "id": 2, "name": "Backend" }
  ]
}
```

#### Update Task
```http
PATCH /api/tasks/:id
Content-Type: application/json

{
  "status": "DONE",           // Optional: TODO, IN_PROGRESS, DONE
  "developerId": 1            // Optional: null to unassign
}
```

**Validation Rules:**
- Developer must have ALL required skills for the task
- Parent task can only be "DONE" if all subtasks are "DONE"
- Returns 400 error with descriptive message if validation fails

**Response:**
```json
{
  "id": 1,
  "title": "Task title",
  "status": "DONE",
  "developerId": 1,
  "developer": {
    "id": 1,
    "name": "Alice",
    "skills": [...]
  }
}
```

### Developers

#### Get All Developers
```http
GET /api/developers
```

**Response:**
```json
[
  {
    "id": 1,
    "name": "Alice",
    "skills": [
      { "id": 1, "name": "Frontend" }
    ],
    "tasks": [...]
  }
]
```

#### Get Single Developer
```http
GET /api/developers/:id
```

### Skills

#### Get All Skills
```http
GET /api/skills
```

**Response:**
```json
[
  { "id": 1, "name": "Frontend" },
  { "id": 2, "name": "Backend" }
]
```

#### Get Single Skill
```http
GET /api/skills/:id
```

## Testing

### Backend Tests (48 Tests, 76.75% Coverage)

The backend includes comprehensive test coverage:

```bash
cd backend

# Run all tests
npm test

# Run with coverage report
npm run test:coverage

# Watch mode for TDD
npm run test:watch
```

**Test Coverage Breakdown:**
- **Models** (100% coverage):
  - Developer, Task, Skill model definitions
  - DeveloperSkill, TaskSkill junction tables
  - Model associations and relationships

- **Routes** (91.92% coverage):
  - Task CRUD operations
  - Developer and Skill read operations
  - Request validation
  - Error handling

- **Services** (70.96% coverage):
  - LLM skill detection with API mocking
  - Error handling and fallbacks
  - Structured output parsing

**Total: 48 passing tests**

### Frontend Tests (11 Tests)

The frontend includes tests for:

```bash
cd frontend

# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Watch mode
npm run test:watch
```

**Test Coverage:**
- Type definitions validation
- API client functionality with mocking
- Component rendering tests
- User interaction tests

**Total: 11 passing tests**

### Manual Testing Workflow

1. **View Existing Tasks**
   - Navigate to [http://localhost:3000](http://localhost:3000)
   - See pre-seeded tasks with different skills and statuses

2. **Create Task Without Skills (LLM Auto-Detection)**
   - Click "Create Task"
   - Enter: "As a user, I want to log in securely with OAuth"
   - Leave skills unselected
   - Click Save
   - Backend LLM automatically detects "Backend" skill

3. **Create Task With Subtasks**
   - Click "Create Task"
   - Enter main task: "Build user authentication system"
   - Click "Add Subtask"
   - Add subtasks: "Create login page", "Build API endpoints", "Add JWT tokens"
   - Each subtask can have skills auto-detected or manually selected

4. **Test Skill-Based Assignment**
   - Go to Task List
   - Select a Frontend task
   - Open developer dropdown - only developers with Frontend skill appear
   - Try assigning Bob (Backend only) - should not appear in dropdown

5. **Test Subtask Validation**
   - Create a task with 2 subtasks
   - Try marking parent as "Done" (will fail with error message)
   - Mark both subtasks as "Done"
   - Now mark parent as "Done" (will succeed)

6. **Test Pagination**
   - Create more than 10 tasks
   - Navigate between pages using pagination controls
   - Page numbers update correctly

7. **Test Filtering**
   - Filter by status: TODO, IN_PROGRESS, DONE
   - Filter by developer
   - Filter by skills (AND logic - task must have ALL selected skills)
   - Combine filters

8. **Test Search**
   - Type in search box (debounced for 500ms)
   - Results update in real-time
   - Works across all task titles

## CI/CD Pipeline

The project uses **GitHub Actions** for continuous integration and deployment. All workflows run automatically on every push to `main` and on all pull requests.

### Workflows

#### 1. Test Workflow (`.github/workflows/test.yml`)

**Triggers:** Push to main, Pull Requests

**Jobs:**
- **Backend Tests**:
  - Sets up PostgreSQL service container
  - Runs all 48 backend tests
  - Generates coverage report
  - Uploads coverage as artifact (7-day retention)

- **Frontend Tests**:
  - Runs all 11 frontend tests
  - Generates coverage report
  - Uploads coverage as artifact

- **Test Summary**:
  - Aggregates all test results
  - Fails pipeline if any tests fail

#### 2. Build Workflow (`.github/workflows/build.yml`)

**Triggers:** Push to main, Pull Requests

**Jobs:**
- **Backend Build**:
  - Compiles TypeScript to JavaScript
  - Verifies dist artifacts
  - Caches dependencies for speed

- **Frontend Build**:
  - Builds Next.js production bundle
  - Verifies .next output
  - Caches dependencies

- **Docker Build**:
  - Builds Docker images for both services
  - Uses GitHub Actions cache for layers
  - Verifies multi-stage builds

#### 3. Lint Workflow (`.github/workflows/lint.yml`)

**Triggers:** Push to main, Pull Requests

**Jobs:**
- **Backend Lint**:
  - TypeScript compiler checks (`tsc --noEmit`)
  - No ESLint configured (TypeScript strict mode is sufficient)

- **Frontend Lint**:
  - Next.js ESLint checks
  - TypeScript compiler checks
  - Enforces code quality standards

### Viewing CI/CD Results

1. Navigate to the **Actions** tab in your GitHub repository
2. Click on any workflow run to see detailed logs
3. Download coverage reports from **Artifacts** section
4. Check status badges in README for quick overview

### Setting Up Badges

Update the README.md badge URLs with your GitHub username:

```markdown
![Tests](https://github.com/YOUR_USERNAME/htx-task-assignment/actions/workflows/test.yml/badge.svg)
![Build](https://github.com/YOUR_USERNAME/htx-task-assignment/actions/workflows/build.yml/badge.svg)
![Lint](https://github.com/YOUR_USERNAME/htx-task-assignment/actions/workflows/lint.yml/badge.svg)
```

### Local Validation Before Push

Run these commands locally to ensure CI will pass:

```bash
# Backend validation
cd backend
npm ci
npm test
npm run build
npx tsc --noEmit

# Frontend validation
cd frontend
npm ci
npm test
npm run lint
npm run build
npx tsc --noEmit
```

## Project Structure

```
htx-task-assignment/
├── .github/
│   ├── workflows/
│   │   ├── test.yml              # Test workflow
│   │   ├── build.yml             # Build workflow
│   │   └── lint.yml              # Lint workflow
│   └── SETUP_ACTIONS.md          # CI/CD setup guide
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── database.ts       # Sequelize connection config
│   │   ├── models/
│   │   │   ├── Developer.ts      # Developer model & associations
│   │   │   ├── Skill.ts          # Skill model
│   │   │   ├── Task.ts           # Task model with self-referential FK
│   │   │   ├── DeveloperSkill.ts # Many-to-many junction table
│   │   │   ├── TaskSkill.ts      # Many-to-many junction table
│   │   │   ├── index.ts          # Model associations setup
│   │   │   └── sync.ts           # Database sync script
│   │   ├── routes/
│   │   │   ├── tasks.ts          # Task CRUD endpoints
│   │   │   ├── developers.ts     # Developer read endpoints
│   │   │   └── skills.ts         # Skill read endpoints
│   │   ├── services/
│   │   │   └── llm.ts            # Google Gemini integration
│   │   ├── __tests__/
│   │   │   ├── models/           # Model tests (100% coverage)
│   │   │   ├── routes/           # Route tests (91.92% coverage)
│   │   │   └── services/         # Service tests (70.96% coverage)
│   │   ├── seed.ts               # Database seeding script
│   │   └── index.ts              # Express app & server
│   ├── Dockerfile                # Multi-stage Docker build
│   ├── package.json
│   ├── tsconfig.json
│   └── jest.config.js
├── frontend/
│   ├── app/
│   │   ├── create/
│   │   │   └── page.tsx          # Task creation page with subtasks
│   │   ├── layout.tsx            # Root layout with navigation
│   │   ├── page.tsx              # Task list with pagination & filters
│   │   └── globals.css           # Global styles & Tailwind
│   ├── lib/
│   │   ├── api.ts                # API client with type safety
│   │   └── types.ts              # TypeScript type definitions
│   ├── __tests__/
│   │   ├── types.test.ts         # Type validation tests
│   │   └── api.test.ts           # API client tests
│   ├── Dockerfile                # Multi-stage Docker build
│   ├── next.config.js
│   ├── package.json
│   ├── tsconfig.json
│   └── jest.config.js
├── docker-compose.yml            # Multi-container orchestration
├── .env.example                  # Environment template
├── .gitignore
└── README.md                     # This file
```

## Configuration

### Backend Environment Variables

Create `/backend/.env`:

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/htx_tasks

# Server
PORT=3001
NODE_ENV=development

# AI Integration
GEMINI_API_KEY=your_gemini_api_key_here

# CORS (for frontend communication)
FRONTEND_URL=http://localhost:3000
```

### Frontend Environment Variables

Create `/frontend/.env.local`:

```env
# API Connection
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

### Docker Compose Environment

Create `/.env` in project root:

```env
# Database Configuration
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=htx_tasks

# Backend Configuration
GEMINI_API_KEY=your_gemini_api_key_here
DATABASE_URL=postgresql://postgres:postgres@postgres:5432/htx_tasks

# Frontend Configuration
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

## Database Schema

### Entity-Relationship Diagram

```
┌──────────────┐          ┌──────────────────┐          ┌──────────────┐
│  developers  │          │ developer_skills │          │    skills    │
├──────────────┤          ├──────────────────┤          ├──────────────┤
│ id (PK)      │◄────────┤ developer_id (FK)│          │ id (PK)      │
│ name         │          │ skill_id (FK)    ├─────────►│ name         │
│ created_at   │          └──────────────────┘          │ created_at   │
│ updated_at   │                                        │ updated_at   │
└──────┬───────┘                                        └──────┬───────┘
       │                                                       │
       │                                                       │
       │                                                       │
       │           ┌──────────────────┐                        │
       │           │   task_skills    │                        │
       │           ├──────────────────┤                        │
       │           │ task_id (FK)     │                        │
       │           │ skill_id (FK)    ├────────────────────────┘
       │           └────────┬─────────┘
       │                    │
       │                    │
       ▼                    ▼
┌──────────────────────────────────┐
│           tasks                  │
├──────────────────────────────────┤
│ id (PK)                          │
│ title                            │
│ status (TODO/IN_PROGRESS/DONE)   │
│ parent_task_id (FK, nullable)    │──┐ Self-referential
│ developer_id (FK, nullable)      │  │ for subtasks
│ created_at                       │  │
│ updated_at                       │  │
└──────────────────────────────────┘  │
       ▲                               │
       └───────────────────────────────┘
```

### Tables

#### `developers`
Stores developer information.

| Column      | Type      | Constraints           |
|-------------|-----------|-----------------------|
| id          | INTEGER   | PRIMARY KEY, AUTO     |
| name        | VARCHAR   | NOT NULL              |
| created_at  | TIMESTAMP | DEFAULT NOW()         |
| updated_at  | TIMESTAMP | DEFAULT NOW()         |

#### `skills`
Defines available skill types (Frontend, Backend, etc.).

| Column      | Type      | Constraints           |
|-------------|-----------|-----------------------|
| id          | INTEGER   | PRIMARY KEY, AUTO     |
| name        | VARCHAR   | NOT NULL, UNIQUE      |
| created_at  | TIMESTAMP | DEFAULT NOW()         |
| updated_at  | TIMESTAMP | DEFAULT NOW()         |

#### `developer_skills`
Many-to-many junction table between developers and skills.

| Column        | Type    | Constraints                     |
|---------------|---------|---------------------------------|
| developer_id  | INTEGER | FOREIGN KEY → developers.id     |
| skill_id      | INTEGER | FOREIGN KEY → skills.id         |
|               |         | PRIMARY KEY (developer_id, skill_id) |

#### `tasks`
Stores task information with self-referential relationship for subtasks.

| Column         | Type      | Constraints                          |
|----------------|-----------|--------------------------------------|
| id             | INTEGER   | PRIMARY KEY, AUTO                    |
| title          | VARCHAR   | NOT NULL                             |
| status         | ENUM      | NOT NULL, DEFAULT 'TODO'             |
| parent_task_id | INTEGER   | FOREIGN KEY → tasks.id, NULLABLE     |
| developer_id   | INTEGER   | FOREIGN KEY → developers.id, NULLABLE|
| created_at     | TIMESTAMP | DEFAULT NOW()                        |
| updated_at     | TIMESTAMP | DEFAULT NOW()                        |

**Status Values:** `TODO`, `IN_PROGRESS`, `DONE`

**Cascade Rules:**
- Deleting a task cascades to delete all subtasks
- Deleting a developer sets task.developer_id to NULL

#### `task_skills`
Many-to-many junction table between tasks and required skills.

| Column     | Type    | Constraints                       |
|------------|---------|-----------------------------------|
| task_id    | INTEGER | FOREIGN KEY → tasks.id            |
| skill_id   | INTEGER | FOREIGN KEY → skills.id           |
|            |         | PRIMARY KEY (task_id, skill_id)   |

### Key Relationships

1. **Developer ↔ Skills** (Many-to-Many)
   - A developer can have multiple skills
   - A skill can belong to multiple developers
   - Enforced via `developer_skills` junction table

2. **Task ↔ Skills** (Many-to-Many)
   - A task can require multiple skills
   - A skill can be required by multiple tasks
   - Enforced via `task_skills` junction table

3. **Task ↔ Developer** (Many-to-One)
   - A task can be assigned to one developer
   - A developer can have multiple assigned tasks
   - Validation: Developer must have ALL required skills

4. **Task ↔ Subtasks** (Self-Referential, One-to-Many)
   - A task can have multiple subtasks
   - A subtask belongs to one parent task
   - Supports unlimited nesting depth
   - Validation: Parent can only be "DONE" if all subtasks are "DONE"

### Initial Seed Data

**Developers:**
- Alice (Skills: Frontend)
- Bob (Skills: Backend)
- Carol (Skills: Frontend, Backend)
- Dave (Skills: Backend)

**Skills:**
- Frontend
- Backend

**Sample Tasks:**
- "As a visitor, I want to see a responsive homepage" (Frontend)
- "As an admin, I want to view audit logs" (Backend)
- "As a user, I want to manage my profile" (Frontend, Backend)

## LLM Integration

### Overview

The system uses **Google Gemini AI** to automatically detect required skills from task descriptions when skills are not explicitly provided during task creation.

### How It Works

1. **Task Creation Without Skills**
   - User creates task with title only
   - Backend detects missing `skillIds` field
   - Triggers LLM skill detection

2. **LLM Processing**
   - Sends task title to Google Gemini API
   - Gemini analyzes task description using prompt engineering
   - Returns structured JSON with detected skills

3. **Skill Assignment**
   - Backend parses LLM response
   - Maps skill names to database skill IDs
   - Associates skills with task
   - Returns complete task object to frontend

### Prompt Engineering

The LLM uses a carefully crafted prompt to ensure accurate skill detection:

```typescript
const prompt = `
Analyze this task description and determine which skills are required.

Task: "${taskTitle}"

Available skills:
- Frontend: UI/UX, user interface, responsive design, forms, navigation, client-side
- Backend: API, database, server, authentication, data processing, business logic

Return ONLY a JSON object with this exact structure:
{
  "skills": ["Frontend"] or ["Backend"] or ["Frontend", "Backend"]
}

Rules:
1. If task mentions UI, pages, forms, styling → Frontend
2. If task mentions API, database, server, auth → Backend
3. If task mentions both → Both skills
4. Default to ["Backend"] if unclear
`;
```

### Example Responses

**Input:** "As a visitor, I want to see a responsive homepage"
```json
{
  "skills": ["Frontend"]
}
```

**Input:** "As an admin, I want to export user data to CSV"
```json
{
  "skills": ["Backend"]
}
```

**Input:** "As a user, I want to update my profile with real-time validation"
```json
{
  "skills": ["Frontend", "Backend"]
}
```

### Error Handling

The LLM service includes robust error handling:

1. **API Failures**: Falls back to default skills (Backend)
2. **Invalid JSON**: Attempts parsing with fallback patterns
3. **Timeout**: Returns default skills after 10 seconds
4. **Rate Limiting**: Implements exponential backoff
5. **Logging**: All errors logged for debugging

### Configuration

```typescript
// src/services/llm.ts
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const model = genAI.getGenerativeModel({
  model: "gemini-pro",
  generationConfig: {
    temperature: 0.1,        // Low temperature for consistent results
    topK: 1,                 // Focused on most likely output
    topP: 0.95,
  }
});
```

### Testing LLM Integration

The LLM service is fully tested with mocked API responses:

```bash
cd backend
npm test -- src/__tests__/services/llm.test.ts
```

**Test Coverage:**
- Successful skill detection
- API error handling
- Invalid JSON responses
- Network failures
- Edge cases (empty strings, special characters)

## Recent Improvements

### Test Coverage Enhancement (50.95% → 76.75%)

**Commit:** `351c415 - feat: Add more test coverage`

- Added comprehensive model tests (100% coverage)
- Added route tests for all endpoints (91.92% coverage)
- Added service tests with mocked LLM (70.96% coverage)
- Total: 48 passing tests across backend

### Pagination & Filtering Implementation

**Commit:** `2ff75a3 - feat: Implement pagination and filtering logic`

**Features Added:**
- Server-side pagination with configurable page size
- Filter by status (TODO, IN_PROGRESS, DONE)
- Filter by assigned developer
- Filter by required skills with AND logic
- Real-time search with debouncing
- Pagination metadata (total pages, current page, has next/previous)

**API Changes:**
```typescript
// Before
GET /api/tasks

// After
GET /api/tasks?page=1&limit=10&status=TODO&developerId=1&skillIds=1,2&search=login
```

## License

This project was created as a take-home assessment for **HTX (Home Team Science & Technology Agency)** as part of the application process for the **xDigital AI Products Team**.

**Created by:** Gavin
**Date:** December 2025
**Purpose:** Technical assessment for HTX recruitment

---

**Built with** React, TypeScript, Node.js, PostgreSQL, and Google Gemini AI
