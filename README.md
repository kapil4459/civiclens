# CivicLens — AI Triage for Citizen Complaints

> Citizens describe civic problems in any language — CivicLens' AI understands them, classifies the issue, assesses severity, and routes a prioritised ticket to the right municipal department.

---

## Problem Statement

Municipal complaint systems fail citizens and officers alike:

- **For citizens** — reporting requires navigating rigid forms, often only in one language, with no feedback on whether the complaint reached the right department.
- **For officers** — complaints arrive as unstructured text (sometimes with photos) in multiple languages, with no triage. Critical hazards sit in the same queue as cosmetic issues.

## Problem Interpretation

CivicLens is an **AI-powered civic complaint management platform** that closes the loop:

```
Citizen input (any language, optional photo)
  → AI understands & classifies (6 categories)
  → AI assesses severity (4 levels) with justification
  → deterministic department routing
  → structured ticket in MongoDB
  → officer dashboard sorted by priority
```

## Proposed Solution

A single multimodal Gemini call analyses text + optional image and returns a strict JSON contract (`category`, `severity`, `reason`, `department`, `originalLanguage`, `confidence`). The backend validates every field, **overrides the department with a deterministic map** (AI never invents department names), and persists the ticket. Failures never lose complaints — they land in an `Under Review` queue for human triage.

## Key Features

- ✅ Multilingual complaint submission (English + regional languages — AI detects language automatically)
- ✅ Optional photo upload with preview, validation (type/size/magic-bytes) and local or Cloudinary storage
- ✅ AI classification into Roads, Waste, Water, Electricity, Trees, Drainage
- ✅ AI severity assessment (Critical/High/Medium/Low) with one-line reasoning + confidence score
- ✅ Deterministic category → department routing
- ✅ Officer dashboard: live stats, priority-sorted table, collapsible sidebar, filters (severity/category/department/status), description + ticket-ID search
- ✅ Complaint detail view with AI reasoning, confidence, image, review info
- ✅ Graceful degradation: AI outage → `Under Review` queue, never fake results
- ✅ Duplicate-submission guard, input validation, consistent API error format

## Technology Stack

| Layer | Tech |
|---|---|
| Frontend | React 18, Vite, Tailwind CSS, React Router, Axios, Lucide React |
| Backend | Node.js, Express.js (ESM), Multer, Cloudinary (optional) |
| Database | MongoDB Atlas + Mongoose |
| AI | Google Gemini API (`@google/genai` SDK, structured JSON output, multimodal) |

## System Architecture

```
┌─────────────────────────────────────────────────────────┐
│  React SPA (Vite + Tailwind)                            │
│  /submit · /success · /dashboard · /complaints/:id      │
└──────────────┬──────────────────────────────────────────┘
               │ Axios → /api (Vite proxy in dev)
┌──────────────▼──────────────────────────────────────────┐
│  Express API                                             │
│  routes → controllers → services → models                │
│  ├─ uploadService (Multer memoryStorage → local/Cloudinary)│
│  ├─ aiService (Gemini multimodal → validated JSON)       │
│  └─ errorHandler (centralised, Mongo/Multer mapping)     │
└──────────────┬──────────────────────────────────────────┘
               │ Mongoose
        ┌──────▼──────┐        ┌─────────────┐
        │ MongoDB     │        │ Gemini API  │
        │ Atlas       │        │ (text+image)│
        └─────────────┘        └─────────────┘
```

## Application Workflow

1. Citizen opens `/submit`, writes a complaint in any language, optionally attaches a photo.
2. Form validates (10–5000 chars, image ≤ 8 MB, JPG/PNG/WEBP/GIF), shows staged progress (Submitting → Analysing with AI → Generating ticket).
3. `POST /api/complaints` (multipart) → backend stores image bytes → sends text + image to Gemini.
4. Gemini returns strict JSON → backend validates enums, clamps confidence, **maps department deterministically**.
5. Ticket saved to MongoDB (`Pending`) → success page shows ticket ID, category, severity, reasoning, department.
6. Officer opens `/dashboard` → stats + priority-sorted table (Critical → Low); clicks a row for full AI analysis.

## AI Integration Details

- **SDK**: `@google/genai` v3.x — `GoogleGenAI` → `models.generateContent`
- **Structured output**: `responseMimeType: 'application/json'` + `responseJsonSchema` with `enum` constraints on category/severity — the model *cannot* return invalid values
- **Multimodal**: image bytes passed as base64 `inlineData` alongside the text prompt
- **Prompt**: role definition, per-category examples, explicit 4-tier severity rubric (Critical reserved for life-safety), anti-hallucination rules, language detection
- **Model**: `GEMINI_MODEL` env var (default `gemini-3.6-flash`; verified working — `gemini-2.5-flash` is retired for new keys)
- **Reliability**: 60 s timeout, 1 automatic retry on transient errors (503/429/abort), markdown-fence JSON fallback, full validation → any failure routes ticket to `Under Review`

## API Documentation

Base URL: `/api` (dev: `http://localhost:5000/api`, proxied via Vite)

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/health` | Health check — `{ status, uptime, timestamp }` |
| POST | `/api/complaints` | Submit complaint (multipart: `description`, optional `photo`, `originalLanguage`) → AI-triaged ticket |
| GET | `/api/complaints` | List tickets — params: `severity`, `category`, `department`, `status`, `q` (desc or ID), `page`, `limit`. Sorted Critical→Low |
| GET | `/api/complaints/stats` | `{ total, bySeverity, byCategory, byStatus }` |
| GET | `/api/complaints/:id` | Full ticket detail |

**Response format** (consistent):
```json
{ "success": true, "data": { ... }, "meta": { "total": 0, "page": 1, "limit": 20 } }
{ "success": false, "message": "...", "details": ["..."] }
```

**Example:**
```bash
curl -X POST http://localhost:5000/api/complaints \
  -F "description=Exposed live wire sparking near school gate" \
  -F "photo=@photo.jpg;type=image/jpeg"
```

## Database Schema (MongoDB — `complaints` collection)

| Field | Type | Notes |
|---|---|---|
| `description` | String | required, 10–5000 chars, indexed (text) |
| `originalLanguage` | String | AI-detected (e.g. "Hindi", "English") |
| `imageUrl` | String | `/uploads/<uuid>.<ext>` or Cloudinary URL |
| `imagePublicId` | String | Cloudinary cleanup ref |
| `category` | Enum | Roads, Waste, Water, Electricity, Trees, Drainage |
| `severity` | Enum | Critical, High, Medium, Low |
| `reason` | String | AI one-line severity justification |
| `confidence` | Number | 0–1 AI certainty |
| `department` | String | deterministic mapping |
| `status` | Enum | Pending, In Progress, Resolved, Under Review |
| `reviewReason` | String | why human review is needed |
| `createdAt` / `updatedAt` | Date | timestamps |

Indexes: `{severity, createdAt}`, `{category}`, text on `description`, `status`.

## Installation & Local Development

### Prerequisites
- Node.js ≥ 20, npm
- MongoDB Atlas cluster (free tier) **or** none — dev falls back to in-memory MongoDB
- Google AI Studio API key (free tier) for AI features

### Setup
```bash
git clone <repo-url> && cd CivicLens
npm install                      # installs server + client workspaces

# Backend env — copy and fill values
cp .env.example server/.env      # or edit server/.env directly
# Required for Atlas:  MONGODB_URI=mongodb+srv://...
# Required for AI:     GEMINI_API_KEY=...

# Frontend env (optional — only needed for production API URL)
cp client/.env.example client/.env
```

### Run
```bash
npm run dev        # both servers (concurrently)
# or separately:
npm run dev:server # Express on :5000
npm run dev:client # Vite on :5173
```

- Frontend: http://localhost:5173
- API health: http://localhost:5000/api/health

### Tests
```bash
npm test --workspace=server   # 17-check API smoke test (ephemeral MongoDB)
node server/scripts/seed-dev.mjs  # DEV ONLY: submits real complaints through the live API
```

## Environment Variables

| Variable | Where | Required | Purpose |
|---|---|---|---|
| `PORT` | server | no (5000) | API port |
| `NODE_ENV` | server | no | `production` requires `MONGODB_URI` |
| `CLIENT_URL` | server | prod | Allowed CORS origin (your frontend URL) |
| `MONGODB_URI` | server | prod | Atlas connection string (dev: optional, in-memory fallback) |
| `GEMINI_API_KEY` | server | for AI | Google AI Studio key — **backend only, never expose to client** |
| `GEMINI_MODEL` | server | no | Default `gemini-3.6-flash` |
| `CLOUDINARY_*` | server | no | Optional image CDN; local `/uploads` used when unset |
| `VITE_API_URL` | client build | prod | Backend origin for production builds |

## Deployment

### Backend → Render (free tier)
1. Push repo to GitHub.
2. Render Dashboard → **New → Blueprint** → select repo → it reads `render.yaml`.
3. Set env vars in dashboard: `CLIENT_URL` (your Vercel URL), `MONGODB_URI`, `GEMINI_API_KEY`.
4. Health check `/api/health` is configured in the blueprint.

> ⚠️ Render free tier has **ephemeral disk** — uploaded photos in `/uploads` are lost on redeploy. For production durability, configure the three `CLOUDINARY_*` vars.

### Frontend → Vercel
1. Import repo in Vercel → set **Root Directory** to `client`.
2. Build: `npm run build` · Output: `dist`.
3. Set env var `VITE_API_URL=https://<your-render-app>.onrender.com` and redeploy.
4. `client/vercel.json` already handles SPA routing.
5. Finally set backend `CLIENT_URL=https://<your-app>.vercel.app`.

### MongoDB Atlas
- Create free cluster → Database Access (user) → Network Access (`0.0.0.0/0` for dev/demo).
- Connection string → `MONGODB_URI` (append `/civiclens` as db name).

## Limitations & Future Improvements

- **AI quota**: Gemini free tier ≈ 20 req/day/model — heavy demo days may hit `RESOURCE_EXHAUSTED`; tickets safely queue as `Under Review`. Consider a paid key or model fallback chain for production.
- **In-memory pagination/dedupe**: list endpoint sorts in JS (fine at civic-demo scale); move to Mongo aggregation + persistent idempotency keys at volume.
- **No auth/RBAC**: officer dashboard is open — add officer authentication before real municipal deployment.
- **Status workflow**: statuses exist but there's no officer action endpoint yet (assign/resolve) — natural next feature.
- **Cloudinary**: implemented but untested without credentials; local storage verified.
- **i18n UI**: complaint *input* is multilingual; the UI itself is English-only.

## Demo Script (5 mandatory requirements)

| # | Action | Expected result |
|---|---|---|
| 1 | `/submit` — type a complaint in Hindi + attach a photo | Staged AI messages → success page with detected language, category, severity, reasoning, department |
| 2 | Submit "Exposed live wire sparking near school" | `Electricity · Critical · Electrical Department` |
| 3 | Submit garbage/pothole/water complaints | `Waste/Medium`, `Roads/High`, `Water/Critical` — verify on dashboard order |
| 4 | Open `/dashboard` | Stats cards + table sorted Critical→Low; click severity card to filter |
| 5 | Open a ticket | Full text, photo, AI reasoning, confidence %, department, status |

Sample complaints that reliably produce distinct severities: live wire near school (Critical), burst water main flooding buildings (Critical/High), single dead streetlight (Medium), cracked sidewalk tile (Low).

## License

MIT — built as a civic-tech demonstration project.
