# SkillSync — DBMS Level 3 Project

**Team:** Shamanth Shekar K (PES1UG24AM258) and Satyanarayana K (PES1UG24AM257)

SkillSync helps students discover collaborators by combining relational skill matching with project descriptions, application workflows, and team formation.

## Stack
- Next.js (web interface and API route handlers)
- PostgreSQL (required SQL database)
- PostgreSQL full-text search included; pgvector is an optional extension for semantic similarity
- Git/GitHub for version control

## Prerequisites
Node.js 20+, PostgreSQL 15+, npm, and `psql`.

## Setup
1. Create a PostgreSQL database named `skillsync`.
2. Copy `.env.example` to `.env.local` and set `DATABASE_URL`. Never commit real credentials.
3. Run:
   ```bash
   psql "$DATABASE_URL" -f database/schema.sql
   psql "$DATABASE_URL" -f database/seed.sql
   ```
4. Install and start:
   ```bash
   npm install
   npm run dev
   ```
5. Open http://localhost:3000. API endpoints: `/api/students`, `/api/projects`, `/api/matches?student_id=1&project_id=1`.

## Advanced database concepts demonstrated
1. Transactions (`BEGIN`/`COMMIT` in schema and query examples)
2. View (`project_summary`)
3. Trigger (`trg_application_accept`)
4. Indexes (join/filter indexes)
5. Full-text search (GIN index and `to_tsvector`)
6. Constraints and referential integrity (PK, FK, UNIQUE, CHECK, NOT NULL)
7. Aggregation and explainable matching endpoint

## Core relational schema
- STUDENT(student_id PK, name, email UNIQUE, department, year, experience_level)
- SKILL(skill_id PK, skill_name UNIQUE, category)
- STUDENT_SKILL(student_id PK/FK, skill_id PK/FK, proficiency, years_experience)
- PROJECT(project_id PK, title, description, owner_id FK, status, created_at)
- PROJECT_SKILL(project_id PK/FK, skill_id PK/FK, required_level)
- APPLICATION(application_id PK, project_id FK, student_id FK, status, applied_at)
- TEAM(team_id PK, project_id FK UNIQUE, created_at)
- TEAM_MEMBER(team_id PK/FK, student_id PK/FK, role)

## Important limitation / remaining work
This is a working project scaffold, not a finished production deployment. Before final submission, add tested authentication with at least Student and Admin roles, connect the project search UI to the API, add application/team management forms, run all SQL against your own PostgreSQL instance, and capture genuine screenshots/test results. Do not report tests as passed until executed.
