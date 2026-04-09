# CareerOS

A dual-dashboard career platform with HR (Recruiter) and User (Candidate) experiences.

## Tech Stack
- **Next.js 16** (App Router) + TypeScript
- **Tailwind CSS** (theme: `#FAF9F6` bg, `#4AD66D` primary, `#A8F0C6` accent)
- **NextAuth** for authentication (JWT, roles: `USER` | `HR`)
- **Prisma** + **SQLite** (local dev; swap `DATABASE_URL` for Postgres/Supabase in production)

## Getting Started

### 1. Install dependencies
```bash
npm install
```

### 2. Configure environment
Copy `.env.example` to `.env` (or use the provided `.env`):
```
DATABASE_URL="file:./dev.db"
NEXTAUTH_SECRET="careeros-mvp-secret-key-2024"
NEXTAUTH_URL="http://localhost:3000"
```

### 3. Set up the database
```bash
npx prisma db push
npx tsx prisma/seed.ts
```

### 4. Start the dev server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Demo Accounts

| Role | Email | Password |
|------|-------|----------|
| HR (Recruiter) | hr@careeros.com | password123 |
| User (Candidate) | alice@example.com | password123 |
| User (Candidate) | bob@example.com | password123 |

## App Structure

```
/login              — Login
/register           — Register (choose USER or HR role)

/dashboard/job             — Job board (browse jobs)
/dashboard/job/apply       — Apply to a job (AI match scoring, ≥80% gate)
/dashboard/job/applications — My applications
/dashboard/job/resume-analyzer — Resume analyzer (ATS score, tips)
/dashboard/job/hr           — HR dashboard (HR role only)
/dashboard/job/hr/create    — Create a new job (HR only)
/dashboard/job/hr/[id]/applicants — View ranked applicants (HR only)

/dashboard/career           — Career dashboard
/dashboard/career/mapper    — Career mapper (skills → career fit)
/dashboard/career/compare   — Compare two careers
/dashboard/career/skill-gap — Skill gap + learning plan
```

## Key Features

### Job System (Execution Engine)
- **HR**: Create jobs with required/optional skills, salary range, experience, location
- **HR**: View applicants with AI-ranked match scores; shortlist top candidates (≥85%)
- **User**: Browse jobs, compute AI match score (resume vs JD)
- **User**: Apply gate — match score **≥80%** required to apply
- **User**: 1-click apply if profile + resume already saved
- **Resume Analyzer**: ATS score, missing keywords, improvement tips, role suggestions

### Career System (Decision Engine)
- **Career Mapper**: Input skills/interests/experience → career fit score, roadmap, next best skill, success probability
- **Career Comparison**: Compare two careers on salary, demand, stress, work-life balance
- **Skill Gap Planner**: Missing skills list + timeline + learning plan

## AI Implementation

The AI layer lives in `src/lib/ai/index.ts`. For MVP it uses **deterministic keyword-overlap scoring** — no external API keys needed.

> **TODO**: Swap `computeMatchScore`, `analyzeResume`, `mapCareer`, etc. for OpenAI GPT-4 calls when ready.

## Production / Supabase Migration

1. Create a Supabase project and copy the Postgres connection string.
2. Update `.env`: `DATABASE_URL="postgresql://..."`
3. Run: `npx prisma migrate deploy`
4. Set `NEXTAUTH_URL` to your production domain.
