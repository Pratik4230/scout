# Scout — Product & Engineering Specification

> **Status:** Living document — source of truth for building Scout  
> **Product name:** Scout  
> **Repo:** `scout` (Turborepo monorepo)  
> **Last updated:** 2026-06-24

---

## Table of Contents

1. [Vision](#1-vision)
2. [Core Loop](#2-core-loop)
3. [Workflow Phases](#3-workflow-phases)
4. [SaaS & Multi-Tenancy](#4-saas--multi-tenancy)
5. [Technology Stack](#5-technology-stack)
6. [Monorepo Architecture](#6-monorepo-architecture)
7. [Database Schema (Draft)](#7-database-schema-draft)
8. [GitHub Integration](#8-github-integration)
9. [AI Capabilities](#9-ai-capabilities)
10. [Inngest Workflows](#10-inngest-workflows)
11. [Product Pages & UX](#11-product-pages--ux)
12. [Billing & Plans](#12-billing--plans)
13. [API Surface (tRPC)](#13-api-surface-trpc)
14. [Environment Variables](#14-environment-variables)
15. [Implementation Phases](#15-implementation-phases)
16. [Deliverables Checklist](#16-deliverables-checklist)
17. [Open Decisions & Clarifications](#17-open-decisions--clarifications)

---

## 1. Vision

**Scout** is an AI-assisted product delivery platform that helps software teams move features from idea to production through a structured workflow.

> Great software is not shipped by code generation alone. Every successful feature follows a process:

```
Request → Product Thinking → PRD → Tasks → Implementation → Review → Fixes → Approval → Release
```

Scout manages the **entire software delivery lifecycle** — from customer feature request through PRD, engineering tasks, GitHub-backed implementation, AI-powered QA review, human approval, and release.

### What the platform does

When a customer submits a feature request, the platform must:

1. Understand the request (product owner / customer context)
2. Ask follow-up questions when context is missing
3. Educate users when a similar offering may already exist
4. Decline or defer requests that should not be built
5. Generate a structured **Product Requirements Document (PRD)**
6. Break the PRD into actionable **engineering tasks**
7. Connect work to a **GitHub repository**
8. Track implementation through **pull requests**
9. Run **AI-powered code reviews** against requirements
10. Send issues back for fixes and **re-review** until ready
11. Allow a **human reviewer** to approve the final release
12. Mark the feature as **shipped**

The AI agent acts as a **QA and engineering reviewer** — not a syntax checker. It evaluates whether implementation satisfies product requirements and is production-ready. **Humans remain the final decision makers.**

---

## 2. Core Loop

The most important implementation focus:

```
Feature Request
    → PRD
    → Tasks
    → Code (PR on GitHub)
    → AI Review
    → Fixes (if needed)
    → Re-Review (loop)
    → Human Approval
    → Shipped
```

### Feature lifecycle states

| State | Description |
|-------|-------------|
| `submitted` | Request received, initial intake |
| `clarifying` | AI gathering missing context via Q&A |
| `declined` | Request rejected (duplicate, out of scope, not build-worthy) |
| `prd_draft` | PRD generation in progress |
| `prd_ready` | PRD complete, awaiting team review |
| `planning` | Tasks being generated / reviewed |
| `plan_approved` | Engineering plan approved, ready for dev |
| `in_development` | Work in progress, PR(s) open |
| `ai_reviewing` | QA agent analyzing PR against PRD |
| `fix_needed` | Blocking/non-blocking issues found, awaiting fixes |
| `ready_for_approval` | AI review passed, awaiting human sign-off |
| `approved` | Human approved release |
| `shipped` | Feature released |
| `rejected` | Human rejected release |

---

## 3. Workflow Phases

### Phase 1 — Product Discovery

**Input channels (future-facing; MVP may start with in-app form):**

- Email
- Support ticket
- Customer service call notes
- In-app feature request form

**AI Agent responsibilities:**

- Gather missing requirements via follow-up questions
- Detect if request duplicates an existing feature → educate user
- Determine if request should proceed or be declined
- Generate structured PRD when approved to proceed

**PRD must include:**

| Section | Description |
|---------|-------------|
| Problem statement | What pain exists and for whom |
| Goals | What success looks like |
| Non-goals | Explicit scope boundaries |
| User stories | As a [role], I want [action], so that [benefit] |
| Acceptance criteria | Testable conditions for done |
| Edge cases | Boundary conditions and failure modes |
| Success metrics | How we measure impact post-ship |

### Phase 2 — Planning

- Scout Agent converts PRD → engineering tasks
- Tasks organized on a **Kanban board**
- Software team reviews and **approves the plan** before development

**Kanban columns (suggested):**

`Backlog` → `To Do` → `In Progress` → `In Review` → `Done`

### Phase 3 — Development

- GitHub repository connected per project
- Developers or coding agents implement against PRD
- Pull requests created with changes meeting PRD scope
- PRs linked to feature request + tasks

### Phase 4 — AI Review Loop

**QA Agent reviews PR against:**

- PRD requirements
- Acceptance criteria
- Engineering tasks completion
- Security concerns
- Performance considerations
- Edge cases
- Code quality

**Issue categories:**

| Category | Behavior |
|----------|----------|
| `blocking` | Feature cannot proceed until resolved |
| `non_blocking` | Should fix but not a ship blocker |

**If problems found:**

1. Feature → `fix_needed`
2. Developers/agents update implementation
3. QA Agent re-reviews
4. Loop until `ready_for_approval`

**Output:** Actionable feedback explaining *why* each issue exists.

### Phase 5 — Human Approval

Human reviewer verifies:

- PRD accuracy and completeness
- Task completion
- Pull request(s)
- AI review history
- Outstanding issues (especially non-blocking)

**Actions:** Approve → `shipped` | Reject → back to appropriate state

Only **approved** features can move to **Shipped**.

---

## 4. SaaS & Multi-Tenancy

Every **workspace (organization)** is an isolated tenant with its own:

| Resource | Scoped to workspace |
|----------|---------------------|
| Users & roles | ✓ |
| Projects | ✓ |
| Repositories | ✓ |
| Feature requests | ✓ |
| PRDs | ✓ |
| Tasks | ✓ |
| Review history | ✓ |
| Billing status | ✓ |

### Suggested roles

| Role | Permissions |
|------|-------------|
| `owner` | Billing, delete workspace, all admin |
| `admin` | Manage members, projects, integrations |
| `member` | Create/edit features, tasks, PRDs |
| `reviewer` | Human approval gate, view all review history |
| `viewer` | Read-only access |

### Auth

- **Better Auth** for authentication (email/password, OAuth providers as needed)
- Session scoped to user; workspace selected via active org context
- All tRPC procedures must enforce workspace membership + role

---

## 5. Technology Stack

| Layer | Choice | Notes |
|-------|--------|-------|
| Monorepo | **Turborepo** + **pnpm** | Already initialized (`create-turbo`) |
| Web app | **Next.js 16** (App Router) | `apps/web` |
| API | **tRPC** | Type-safe procedures in shared package |
| UI | **Shadcn UI** | In `packages/ui` |
| Auth | **Better Auth** | `packages/auth` |
| Payments | **Razorpay** | Subscriptions + usage billing |
| GitHub | **Octokit** + **Webhooks** | Real PR data only — no hardcoded mocks |
| AI | **Vercel AI SDK** | All agent workflows |
| Background jobs | **Inngest** | Long-running async workflows |
| Database | **PostgreSQL** | Neon via Vercel marketplace |
| ORM | **Drizzle** | Serverless-friendly, pairs well with tRPC |
| Hosting | **Vercel** | Single project → `apps/web` root |

### Confirmed stack decisions

- **PostgreSQL + Drizzle** — primary database and ORM
- **GitHub App** — org installs, webhooks, fine-grained permissions (not PAT)
- **Vercel AI SDK** — model access via **Vercel AI Gateway** and/or **OpenRouter** (flexible routing per task)

---

## 6. Monorepo Architecture

### Current structure (initialized)

```
scout/
├── apps/
│   ├── web/          # Next.js — primary deploy target
│   └── docs/         # Optional — remove if unused
├── packages/
│   ├── ui/           # Shadcn components
│   ├── eslint-config/
│   └── typescript-config/
├── turbo.json
└── pnpm-workspace.yaml
```

### Target structure (to build)

```
scout/
├── apps/
│   └── web/                    # Next.js app
│       ├── app/                # App Router pages
│       │   ├── (marketing)/    # Landing, pricing
│       │   ├── (auth)/         # Login, signup
│       │   ├── (dashboard)/    # Authenticated app
│       │   └── api/
│       │       ├── trpc/[trpc]/ # tRPC HTTP handler
│       │       ├── auth/[...all]/ # Better Auth
│       │       ├── inngest/    # Inngest serve endpoint
│       │       └── webhooks/
│       │           └── github/ # GitHub webhook receiver
│       └── ...
│
├── packages/
│   ├── api/                    # tRPC routers, procedures, context
│   ├── auth/                   # Better Auth server config + client
│   ├── db/                     # Drizzle schema, migrations, client
│   ├── ui/                     # Shadcn + shared components
│   ├── validators/             # Shared Zod schemas
│   ├── github/                 # Octokit client, webhook verification, PR helpers
│   ├── ai/                     # AI SDK prompts, agents, review logic
│   ├── billing/                # Razorpay integration, plan limits
│   ├── inngest/                # Inngest functions + event definitions
│   ├── eslint-config/
│   └── typescript-config/
│
├── docs/
│   └── SCOUT-SPEC.md           # This file
├── turbo.json
└── pnpm-workspace.yaml
```

### Package dependency graph

```
apps/web
  ├── @repo/api
  ├── @repo/auth
  ├── @repo/db
  ├── @repo/ui
  ├── @repo/validators
  ├── @repo/github
  ├── @repo/ai
  ├── @repo/billing
  └── @repo/inngest

@repo/api
  ├── @repo/db
  ├── @repo/auth
  ├── @repo/validators
  ├── @repo/github
  ├── @repo/ai
  └── @repo/billing

@repo/inngest
  ├── @repo/db
  ├── @repo/ai
  └── @repo/github
```

### Vercel deployment

- **One Vercel project** pointing to `apps/web`
- Build command: `cd ../.. && turbo run build --filter=web`
- Install: `pnpm install` from monorepo root
- Inngest, GitHub webhooks, Razorpay callbacks → API routes in same app

---

## 7. Database Schema (Draft)

> Drizzle + PostgreSQL. IDs as `uuid` or `cuid` — pick one convention and stick to it.

### Core entities

```
User                    # Better Auth managed + app profile
Organization            # Workspace / tenant
OrganizationMember      # userId + orgId + role
Subscription            # Razorpay plan, status, period
UsageRecord             # AI credits, review counts per period

Project                 # Belongs to org
Repository              # GitHub repo linked to project
RepositoryInstallation  # GitHub App installation metadata

FeatureRequest          # Intake record + source channel
ClarificationThread     # AI Q&A messages for discovery
FeatureRequestStatus    # Lifecycle state + history

PRD                     # Versioned PRD content (JSON + markdown)
PRDVersion              # Audit trail of PRD edits

Task                    # Engineering task from PRD
TaskBoard               # Kanban column mapping

PullRequest             # Synced from GitHub (real data)
PullRequestFile         # Changed files + diffs cache
PullRequestReview       # AI + human review records
ReviewIssue             # Individual findings (blocking/non-blocking)

WorkflowRun             # Inngest job status for UI progress
AuditLog                # Key actions for compliance
```

### Key relationships

```
Organization 1──* Project 1──* FeatureRequest 1──1 PRD
FeatureRequest 1──* Task
FeatureRequest 1──* PullRequest (via linked branch/PR)
PullRequest 1──* PullRequestReview 1──* ReviewIssue
Project 1──* Repository
```

### Indexes to plan early

- `(organizationId, status)` on FeatureRequest
- `(featureRequestId, createdAt)` on PullRequestReview
- `(pullRequestId)` on ReviewIssue
- `(organizationId, githubRepoId)` unique on Repository

---

## 8. GitHub Integration

**Mandatory:** Real GitHub data via Octokit. **No hardcoded PR data.**

### Capabilities

| Capability | Implementation |
|------------|----------------|
| Connect repositories | GitHub App install flow per org |
| Receive webhook events | `POST /api/webhooks/github` |
| Track pull requests | Sync on `pull_request` events |
| Fetch changed files | Octokit `pulls.listFiles` |
| Analyze diffs | Patch content → AI review input |
| Generate AI reviews | Inngest job → store + optional PR comment |
| Post review comments | Octokit `pulls.createReview` |
| Track review status | DB state + webhook updates |

### Webhook events to handle

- `pull_request` — opened, synchronize, closed, reopened
- `pull_request_review` — human reviews on GitHub (optional sync)
- `installation` / `installation_repositories` — app install changes
- `push` — optional, for branch tracking

### Security

- Verify webhook signature (`X-Hub-Signature-256`)
- Store installation tokens encrypted; refresh via GitHub App
- Scope Octokit calls to installed repos only

### Public GitHub repository (deliverable)

- Scout's own source must be **public on GitHub**
- README with full setup instructions

---

## 9. AI Capabilities

Powered by **Vercel AI SDK**. Use structured outputs (Zod schemas) where possible.

| Capability | Trigger | Input | Output |
|------------|---------|-------|--------|
| Requirement clarification | Feature submitted | Request text + history | Follow-up questions |
| Duplicate detection | Discovery phase | Request + existing features catalog | Educate / proceed / decline |
| PRD generation | Clarification complete | Full context thread | Structured PRD JSON |
| Task generation | PRD approved | PRD sections | Task list with estimates |
| Repository analysis | PR opened / sync | Diff + file tree context | Relevant file summary |
| Code review (QA) | PR ready for review | PRD + tasks + diff | Issues with severity + rationale |
| Re-review | PR updated after fixes | Previous issues + new diff | Updated issue list |
| Release readiness | Pre-approval | All reviews + PRD | Go/no-go summary |

### AI quality bar

- Feedback must be **actionable** and explain **why**
- Reference specific PRD acceptance criteria when flagging gaps
- Distinguish product gaps vs code style vs security vs performance
- Respect plan limits (AI review credits per billing tier)

### Model strategy (confirmed)

- **Vercel AI SDK** as the unified interface
- Route models through **Vercel AI Gateway** and/or **OpenRouter** (pick per workflow — e.g. cheaper model for clarification, stronger model for code review)
- Log token usage per workspace for billing and plan limits

---

## 10. Inngest Workflows

Long-running processes run via **Inngest**. Progress surfaced in UI via `WorkflowRun` records.

| Function | Event trigger | Steps |
|----------|---------------|-------|
| `prd/generate` | `feature/prd.requested` | Load context → AI PRD → save → notify |
| `tasks/generate` | `prd/approved` | Parse PRD → AI tasks → create board items |
| `repo/analyze` | `pr/opened` | Fetch files → summarize context for review |
| `review/run` | `pr/review.requested` | Load PRD + diff → AI review → save issues |
| `review/rerun` | `pr/synchronize` | Compare fixes → delta review |
| `release/check` | `feature/approval.requested` | Aggregate reviews → readiness report |

### UI progress

- Each workflow writes status: `pending` → `running` → `completed` | `failed`
- Dashboard shows step name + percentage or step count
- Failed jobs: retry button + error message (no secrets)

### Inngest dev setup

```bash
npx inngest-cli@latest dev
# Points to http://localhost:3000/api/inngest
```

---

## 11. Product Pages & UX

Polished SaaS experience. Shadcn + TanStack Query v5 for all API calls.

| Page | Route (suggested) | Purpose |
|------|-------------------|---------|
| Landing | `/` | Marketing, value prop, CTA |
| Auth | `/login`, `/signup` | Better Auth flows |
| Dashboard | `/dashboard` | Workspace overview, active features |
| Workspace settings | `/settings/workspace` | Members, roles, general |
| Projects | `/projects`, `/projects/[id]` | Project list + detail |
| Feature requests | `/projects/[id]/features` | Intake list |
| Feature detail | `/projects/[id]/features/[fid]` | Lifecycle + Q&A thread |
| PRD editor | `/projects/[id]/features/[fid]/prd` | View/edit PRD |
| Task board | `/projects/[id]/features/[fid]/board` | Kanban |
| GitHub integration | `/settings/integrations/github` | Connect repos |
| PR reviews | `/projects/[id]/features/[fid]/reviews` | PR list + AI findings |
| Review history | `/projects/[id]/features/[fid]/history` | Full audit trail |
| Billing | `/settings/billing` | Plans, Razorpay, usage |
| Final approval | `/projects/[id]/features/[fid]/approve` | Human gate |
| Shipped | `/projects/[id]/shipped` | Completed features |

---

## 12. Billing & Plans

**Razorpay** for India (INR). Per-workspace subscription.

### Payment roadmap

| Region | Provider | Status |
|--------|----------|--------|
| India | **Razorpay** | v1 — INR only |
| International | **Dodo Payments** | Future — not in initial build |

### Suggested tiers (pricing TBD)

| Plan | Price | Repos | AI review credits/mo | Features |
|------|-------|-------|----------------------|----------|
| Free | ₹0 | 1 | 10 | Basic workflow |
| Pro | TBD | 5 | 100 | Kanban, GitHub sync |
| Team | TBD | Unlimited | 500 | Human approval, priority |
| Enterprise | Custom | Unlimited | Unlimited | Premium workflows, SSO (future) |

### Trials

- **Limited free trials** on paid plans (duration and limits TBD when pricing is set)

### Usage limits to enforce

- AI review credits per billing period
- Repository connection count
- Active feature requests (Free tier cap)
- Premium features: re-review automation, release readiness report, etc.

### Razorpay flows

- Subscription create / cancel / webhook for payment status
- Webhook: `POST /api/webhooks/razorpay`
- Sync `Subscription.status` → feature gates in tRPC middleware
- All amounts in **INR (₹)**

---

## 13. API Surface (tRPC)

Organize routers by domain. All mutations check org membership + plan limits.

```
appRouter
├── auth          # session, switch org
├── organization  # CRUD, members, invites
├── project       # CRUD
├── feature       # requests, status transitions, clarification
├── prd           # get, update, approve, versions
├── task          # CRUD, board moves
├── github        # install, list repos, link to project
├── pullRequest   # list, sync, link to feature
├── review        # trigger AI review, list issues, resolve
├── approval      # human approve/reject
├── billing       # plan, usage, checkout
└── workflow      # Inngest job status for UI
```

### Middleware layers

1. `isAuthed` — valid session
2. `hasOrgAccess` — member of active org
3. `hasRole(role)` — permission check
4. `withinPlanLimits` — billing gates

---

## 14. Environment Variables

Document in README; never commit secrets.

```bash
# App
NEXT_PUBLIC_APP_URL=

# Database (Neon)
DATABASE_URL=

# Better Auth
BETTER_AUTH_SECRET=
BETTER_AUTH_URL=

# GitHub App
GITHUB_APP_ID=
GITHUB_APP_PRIVATE_KEY=
GITHUB_WEBHOOK_SECRET=
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=

# AI (Vercel AI SDK — Gateway and/or OpenRouter)
AI_GATEWAY_API_KEY=
OPENROUTER_API_KEY=            # optional if using OpenRouter directly

# Inngest
INNGEST_EVENT_KEY=
INNGEST_SIGNING_KEY=

# Razorpay
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
RAZORPAY_WEBHOOK_SECRET=
```

---

## 15. Implementation Phases

Build incrementally. Each phase should be deployable.

### Phase 0 — Foundation (current → week 1)

- [x] Turborepo + Next.js (`create-turbo`)
- [ ] Add `packages/db` (Drizzle + PostgreSQL)
- [ ] Add `packages/api` (tRPC)
- [ ] Add `packages/auth` (Better Auth)
- [ ] Shadcn in `packages/ui`
- [ ] Basic layout: marketing + dashboard shell
- [ ] Vercel deploy + Neon database
- [ ] `vercel link` + env setup

### Phase 1 — Multi-tenant core

- [ ] Organization + member models
- [ ] Workspace switcher UI
- [ ] Project CRUD
- [ ] Role-based access in tRPC

### Phase 2 — Product Discovery

- [ ] Feature request intake (in-app form first)
- [ ] Clarification Q&A thread (AI)
- [ ] PRD generation (Inngest + AI SDK)
- [ ] PRD editor UI
- [ ] Decline / duplicate detection flow

### Phase 3 — Planning

- [ ] Task generation from PRD
- [ ] Kanban board UI
- [ ] Plan approval workflow

### Phase 4 — GitHub

- [ ] GitHub App registration
- [ ] OAuth / install flow
- [ ] Webhook handler
- [ ] PR sync (real Octokit data)
- [ ] Link PRs to features

### Phase 5 — AI Review Loop

- [ ] Diff fetch + cache
- [ ] AI review agent (Inngest)
- [ ] Issue list UI (blocking / non-blocking)
- [ ] Fix-needed state + re-review on PR sync
- [ ] Optional: post comments to GitHub PR

### Phase 6 — Human approval & ship

- [ ] Approval page with full context
- [ ] Approve / reject actions
- [ ] Shipped state + celebration UI

### Phase 7 — Billing

- [ ] Razorpay plans + checkout
- [ ] Webhook handling
- [ ] Usage metering (AI credits)
- [ ] Plan limit enforcement

### Phase 8 — Polish & deliverables

- [ ] Landing page
- [ ] Public GitHub repo
- [ ] README (overview, stack, architecture, setup, env, schema, GitHub, Inngest, AI)
- [ ] Demo video
- [ ] Production deploy on Vercel

---

## 16. Deliverables Checklist

| Requirement | Status |
|-------------|--------|
| tRPC monorepo | 🟡 In progress (turbo done, tRPC pending) |
| Next.js web app | 🟡 Scaffolded |
| PostgreSQL + ORM | ⬜ Not started |
| Better Auth | ⬜ Not started |
| Shadcn UI | 🟡 Basic `packages/ui` only |
| GitHub + webhooks (real data) | ⬜ Not started |
| AI SDK agents | ⬜ Not started |
| Inngest workflows | ⬜ Not started |
| Razorpay billing | ⬜ Not started |
| Multi-tenant SaaS | ⬜ Not started |
| Public GitHub repo | ⬜ Not started |
| Live Vercel deployment | ⬜ Not started |
| Demo video | ⬜ Not started |
| README (full) | ⬜ Not started |

---

## 17. Decisions Log

### Confirmed

| # | Decision |
|---|----------|
| 1 | **Product name:** Scout (repo and product) |
| 4 | **Database:** PostgreSQL + Drizzle |
| 5 | **AI:** Vercel AI SDK via AI Gateway and/or OpenRouter |
| 6 | **GitHub:** GitHub App |
| 8 | **Razorpay pricing:** Decide later |
| 9 | **Currency:** INR only for v1; Dodo Payments for international later |
| 10 | **Trials:** Limited free trials on paid plans |

### Still open (see explanations below)

| # | Topic | Recommended MVP default |
|---|-------|-------------------------|
| 2 | How users submit feature requests in v1 | In-app form only |
| 3 | How Scout detects duplicate / existing features | Auto-compare against shipped features + PRDs in workspace |
| 7 | Where AI review results appear | Scout UI first; GitHub PR comments as stretch |
| 11 | Who can give final human approval | Any workspace member with `reviewer` role |

---

### Clarification #2 — Feature request intake (MVP)

**What this means:** When someone wants a new feature, *how do they tell Scout?*

| Option | Example | Complexity |
|--------|---------|------------|
| **A. In-app form only** | User logs into Scout → "New feature request" → types description | Low — build this first |
| **B. Email / ticket ingestion** | Customer emails `features@yourcompany.com` → Scout auto-creates a request | High — needs email parsing, Resend/SendGrid inbound, etc. |

**Recommendation for MVP:** Option A (in-app form). Add email/ticket channels in a later phase.

---

### Clarification #3 — "Educate if offering already exists"

**What this means:** Your spec says if a user asks for something you already have, Scout should *tell them* instead of building duplicate work.

**How should Scout know what already exists?**

| Option | How it works |
|--------|----------------|
| **A. Product catalog** | Admin manually maintains a list of current product capabilities per workspace |
| **B. Workspace history** | AI compares the request against features already **shipped** in Scout (PRDs, titles, descriptions) — no extra setup |

**Recommendation for MVP:** Option B — use shipped features + PRDs already in the workspace. Simpler and stays accurate as you ship.

---

### Clarification #11 — Who approves the final release?

**What this means:** At Phase 5, a human must approve before a feature is marked **Shipped**. Who is allowed to click Approve?

| Option | How it works |
|--------|----------------|
| **A. Role-based** | Anyone in the workspace with the `reviewer` role can approve any feature |
| **B. Assignee per feature** | Each feature has one named approver (e.g. product lead); only they can approve |

**Recommendation for MVP:** Option A — role-based. Add per-feature assignees later if teams need it.

---

## Appendix A — README Outline (for final delivery)

When README is written, it must include:

1. Project overview
2. Tech stack
3. Architecture diagram (monorepo + data flow)
4. Setup instructions (clone, pnpm install, db migrate, dev)
5. Environment variables (table)
6. Database schema notes (or link to this doc)
7. GitHub App setup (webhook URL, permissions)
8. Inngest workflow explanation
9. AI features implemented (with prompts/agents summary)
10. Demo video link
11. Live deployment URL

---

## Appendix B — Feature Request → PRD Prompt Structure (sketch)

```
System: You are a product manager agent for Scout...

Context:
- Organization: {orgName}
- Project: {projectName}
- Existing shipped features: {catalog}
- User request: {requestText}
- Clarification history: {messages}

Output JSON schema:
{
  problemStatement, goals, nonGoals,
  userStories[], acceptanceCriteria[],
  edgeCases[], successMetrics[]
}
```

---

*This document should be updated as decisions are made and phases complete.*
