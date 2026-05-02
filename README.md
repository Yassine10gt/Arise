# ARISE

Structured performance system for body and mind.

ARISE is a Human Performance System that unifies physical training and cognitive habits into one structured operating layer. It tracks weekly output, compares trends week-over-week, and turns real activity into a performance score with coaching insights.

## Product Overview

ARISE is built for consistency and progression, not checklists.

- Dual modules: Training (Physical) and Mental (Cognitive / Habits)
- Weekly storage model with week-over-week comparison
- ARISE Score that reflects volume, intensity, consistency, and focus quality
- Coaching insights generated from actual tracked patterns
- Analyse dashboard for weekly + monthly views

## Core Features

- Training tracking (sport-specific, fast input)
  - Gym, Running, Tennis, Padel, Football, Boxing, Swimming, Custom
  - Compact structured inputs (sliders, chips, quick selectors)
- Mental tracking (structured modules, not checkboxes)
  - Reading, Meditation, Breathing, Gratitude, Journaling, Custom habit modules
- Weekly comparison system
  - Current week vs previous week deltas, trends, and balance signals
- Performance dashboard
  - Training metrics, Mental metrics, monthly progress view, and insights
- AI coaching suggestions
  - Short, actionable guidance based on real usage patterns

## Why This Exists

Most habit trackers stop at “did you do it?” and produce shallow feedback. ARISE is designed as a performance system: structured inputs, meaningful aggregation, and weekly comparison that makes progress visible and decisions easier.

## Tech Stack

- React (Vite)
- Tailwind CSS
- Supabase (Auth now, database next)
- Vercel (deployment)

## Setup

### 1) Install dependencies

```bash
npm install
```

### 2) Configure environment variables

Create a `.env` file in the project root:

```bash
VITE_SUPABASE_URL=YOUR_SUPABASE_PROJECT_URL
VITE_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
```

### 3) Run locally

```bash
npm run dev
```

## Authentication

Supabase Auth powers:

- Email/password signup + login
- Session persistence (returning users stay signed in)
- Forgot password flow (reset email)
- Reset password flow (password update via Supabase)
- Logout (Supabase sign-out)

## Current Status

Actively under development with a focus on:

- Performance tracking quality (inputs, scoring, comparisons)
- Premium UX across mobile and desktop
- Coaching logic that stays short, data-driven, and actionable

## Roadmap

- Coaching improvements (higher-signal pattern detection)
- Mobile optimization and gesture-first ergonomics
- Advanced analytics and deeper comparisons
- Database-backed Training and Mental data linked to `user_id`

## Visual Style

Clean, premium, minimal. Built to feel like a serious personal operating system, not a gamified tracker.

