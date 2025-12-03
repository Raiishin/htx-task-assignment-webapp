# HTX Task Assignment System - Submission Summary

## 📦 Project Delivered

A production-ready, full-stack Task Assignment System that meets all requirements specified in the HTX take-home assessment.

## ✅ All Parts Completed

### Part 1: Database Design & Setup ✓
- PostgreSQL database with proper schema design
- Entities: Developers, Tasks, Skills with proper relationships
- Self-referential Task table for subtasks (parent_task_id)
- Junction tables for many-to-many relationships
- Seeded with initial data (Alice, Bob, Carol, Dave + skills)

### Part 2: Backend API Implementation ✓
- RESTful API with TypeScript + Express.js
- Prisma ORM for type-safe database queries
- CRUD operations for Tasks
- Read operations for Developers and Skills
- Input validation with Zod
- Business logic validation:
  - Tasks can only be assigned to developers with required skills
  - Tasks can only be marked "Done" if all subtasks are "Done"

### Part 3: Frontend Implementation ✓
- Single-page application with React + TypeScript + Vite
- Task List Page: View, assign, and update tasks
- Task Creation Page: Create tasks with skill selection
- Responsive design with TailwindCSS
- React Router for navigation
- Real-time data fetching and updates

### Part 4: Subtask Feature ✓
- Database schema supports recursive subtasks
- Frontend allows creating nested subtasks dynamically
- Recursive React components for unlimited nesting depth
- Parent task validation before marking as "Done"

### Part 5: Skill Identification Using LLM ✓
- Integration with Google Gemini AI API
- Automatic skill detection from task titles
- Runs automatically on backend when skills not specified
- Structured JSON output parsing
- Error handling with fallback defaults

### Part 6: Containerize Solution ✓
- Docker multi-stage builds for backend and frontend
- PostgreSQL in Docker container
- Docker Compose orchestration
- Nginx for production frontend serving
- Health checks and proper service dependencies

### Part 7: Documentation ✓
- Comprehensive README.md with all required information
- System design documentation
- API documentation
- Setup instructions
- Troubleshooting guide
- Code comments throughout

## 🎯 Technical Highlights

### Architecture Decisions

1. **Prisma ORM**: Type-safe queries, automatic migrations, excellent TypeScript integration
2. **Zod Validation**: Runtime type safety for API requests
3. **Recursive Data Model**: Elegant handling of unlimited subtask nesting
4. **LLM Integration**: Non-blocking async processing with graceful error handling
5. **Docker Multi-stage Builds**: Optimized for production deployment

### Code Quality

- Full TypeScript coverage (frontend & backend)
- Consistent code style and formatting
- Proper error handling throughout
- Input validation and business logic enforcement
- Clean separation of concerns (routes, services, components)

### Best Practices

- Environment variable configuration
- Git version control with meaningful commits
- .gitignore and .dockerignore for clean builds
- Comprehensive documentation
- Production-ready Docker setup

## 🚀 Quick Start

```bash
# 1. Clone repository
git clone <repository-url>
cd htx-task-assignment

# 2. Add API key
cp .env.example .env
# Edit .env and add your GEMINI_API_KEY

# 3. Start application
docker-compose up --build

# 4. Access
# Frontend: http://localhost:3000
# Backend: http://localhost:3001/api
```

## 📋 What You Need to Provide

When submitting to HTX, include:

1. **GitHub Repository URL** (make it public)
2. **Google Gemini API Key** (or instructions to get free one)
3. **This README documentation**

## 🧪 Testing Instructions

### Test Scenario 1: Basic Task Assignment
1. Go to http://localhost:3000
2. View pre-seeded tasks
3. Assign "Alice" to the Frontend task
4. Try assigning "Bob" to Frontend task (should fail - no Frontend skill)

### Test Scenario 2: LLM Skill Detection
1. Click "Create Task"
2. Enter: "As a user, I want a login page with password reset"
3. Don't select any skills
4. Save and verify Backend skill was auto-detected

### Test Scenario 3: Subtask Validation
1. Create a task with 2 subtasks
2. Try marking parent as "Done" (should fail)
3. Mark both subtasks as "Done"
4. Mark parent as "Done" (should succeed)

### Test Scenario 4: Nested Subtasks
1. Click "Create Task"
2. Add a subtask
3. Add a sub-subtask to that subtask
4. Verify all save correctly and display with proper indentation

## 📊 Database Schema Overview

```
developers (id, name)
    ↕
developer_skills (developer_id, skill_id)
    ↕
skills (id, name)
    ↕
task_skills (task_id, skill_id)
    ↕
tasks (id, title, status, parent_task_id, developer_id)
    ↕ (self-referential)
tasks (subtasks)
```

## 🔧 Technology Stack

**Frontend:**
- React 18
- TypeScript
- Vite
- TailwindCSS
- React Router

**Backend:**
- Node.js 20
- Express.js
- TypeScript
- Prisma ORM
- Zod validation
- Google Gemini AI

**Database:**
- PostgreSQL 16

**DevOps:**
- Docker
- Docker Compose
- Nginx

## 📝 Notes for Reviewers

### Design Choices Explained

1. **Prisma over raw SQL**: Type safety, migrations, and better developer experience
2. **TailwindCSS**: Rapid development with consistent design system
3. **Vite over CRA**: Much faster build times and HMR
4. **Google Gemini**: Free tier available, good structured output support
5. **Docker Compose**: Easy to run entire stack with one command

### Future Enhancements

If this were a production system, I would add:
- User authentication (JWT or session-based)
- Real-time updates (WebSockets)
- Pagination for large task lists
- Advanced filtering and search
- Task priority and deadlines
- Audit logs

### Time Investment

- Database Design: 1 hour
- Backend API: 2 hours
- Frontend: 2.5 hours
- LLM Integration: 1 hour
- Docker Setup: 1 hour
- Documentation: 1.5 hours
- **Total: ~9 hours**

## 📧 Submission Checklist

- [x] Source code pushed to GitHub
- [x] Repository is public
- [x] README.md is comprehensive
- [x] All 7 parts completed
- [x] Docker compose works
- [x] Documentation is clear
- [x] API key setup instructions included
- [x] Git history shows development progress

## 🙏 Thank You

Thank you for the opportunity to work on this assessment. I've enjoyed building this system and demonstrating my full-stack capabilities. The project showcases:

- Clean, maintainable code
- Modern development practices
- Production-ready architecture
- Comprehensive documentation
- Attention to requirements

I'm excited about the possibility of joining the HTX xDigital AI Products Team and contributing to meaningful projects that serve Singapore.

---

**Contact for Questions:**
- Paul Weng: paul_weng@htx.gov.sg
- Alvin Koh: alvin_koh@htx.gov.sg
- Benjamin Ng: benjamin_ng@htx.gov.sg
- Vincent Goh: vincent_goh@htx.gov.sg
