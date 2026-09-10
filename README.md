# Track Attend — Attendance Management System

A full-stack, role-based attendance monitoring and analytics platform for colleges and
schools. Teachers run live QR-code attendance sessions, students check in by scanning
the QR with their camera, and college admins prove attendance compliance — all backed
by **Next.js (App Router)**, **MongoDB (Mongoose)**, and **JWT authentication**.

The public landing page at `/` is built on the design system described in
[Design System](#design-system); the internal dashboards consume the same tokens.

## Features

### Marketing site (`/`)
- **Landing page** — sticky glass navbar, hero with a live product mock, social proof,
  feature bento, four-step product tour, role benefits, customer stories, FAQ
  and a walkthrough request form
- **Design system reference** at `/design-system` — colour ramps, type scale,
  components, surfaces, motion recipes and the accessibility rules

### For Students
- **Self-registration** — students create their own account at `/register`
  (name, email, roll number, password), then pick their courses
- **Course registration** — the *My Courses* tab lists the courses the student is
  enrolled in plus the courses still open, with live seat counts. **Attendance can
  only ever be recorded for a course the student is registered in**
- **Dashboard overview** — overall attendance percentage and subject-wise breakdown,
  with a "safe / below 75%" indicator
- **QR check-in** — scan the QR code shown by the teacher (camera scanner via
  `html5-qrcode`), or enter the session code manually. Attendance is marked
  server-side in real time; duplicate scans are idempotent
- **Attendance calendar** — month view with per-day status dots (present / absent /
  leave) and a per-day subject breakdown
- **Weekly trend chart** — last 7 days attendance trend per subject (Recharts)
- **Attendance simulator** — project how missing future classes affects your percentage
- **Leave requests** — submit leave requests and track their approval status

### For Teachers
- **Class management** — create, rename, and remove classes (removal cascades to the roster)
- **Student roster** — add / remove students, view per-student attendance, download CSV
- **Live QR sessions** — start a session, show an auto-rotating QR code, watch live
  check-ins, and end the session to finalize attendance (scanned → Present, rest → Absent)
- **Manual attendance entry** — mark a single student Present/Absent for a date
- **Class calendar & analytics** — see session dates and daily present counts
- **Leave request management** — approve or reject student leave requests (with a
  pending-count badge)

### For College Admins
- **Faculty management** — searchable faculty directory (search by name or department)
- **Add faculty** — creating a faculty member also provisions a teacher login
  (default password `faculty123`)
- **Faculty profiles** — view and edit subjects, status, attendance summary
- **Dashboard stats** — total faculty, active faculty, and recent attendance

## Tech Stack

| Layer     | Technology                                                        |
|-----------|-------------------------------------------------------------------|
| Frontend  | React 19, Next.js 16 (App Router), Tailwind CSS 4, Motion (Framer Motion), Recharts, react-calendar, qrcode.react, html5-qrcode, lucide-react, Inter + Geist Mono (self-hosted) |
| Backend   | Next.js API routes, Mongoose 9, bcryptjs, JSON Web Tokens         |
| Database  | MongoDB (local or Atlas)                                          |

## Project Structure

```
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── login/              # Login page (student / teacher / college)
│   │   │   └── register/           # Student self-registration
│   │   ├── (dashboard)/
│   │   │   ├── college/            # Admin: directory, add-faculty, faculty profile
│   │   │   ├── student/
│   │   │   │   ├── page.tsx        # Student dashboard
│   │   │   │   └── verify/         # QR scanner / session verification page
│   │   │   └── teacher/
│   │   │       ├── page.tsx        # Teacher dashboard
│   │   │       └── session/[courseName]/  # Live QR session page
│   │   ├── (marketing)/
│   │   │   ├── page.tsx            # Landing page (route "/")
│   │   │   └── design-system/      # Living styleguide
│   │   ├── api/                    # REST API (see below)
│   │   ├── globals.css             # Design tokens + primitives
│   │   └── layout.tsx              # Root layout (fonts, metadata, auth)
│   ├── components/
│   │   ├── brand/                  # Logo lockup + mark
│   │   ├── marketing/              # Landing sections
│   │   │   ├── Hero.tsx  SocialProof.tsx  Features.tsx
│   │   │   ├── ProductShowcase.tsx  Audiences.tsx  Testimonials.tsx
│   │   │   ├── Faq.tsx  FinalCta.tsx
│   │   │   ├── SiteNav.tsx  SiteFooter.tsx
│   │   │   └── mockups/            # Presentation-only product screenshots
│   │   ├── motion/                 # Reveal, ScrollProgress, CountUp
│   │   └── ui/                     # Button, Badge, Card, Container, …
│   ├── content/landing.ts          # All landing copy, typed
│   ├── hooks/                      # useActiveSection, useScrolled
│   ├── contexts/AuthContext.tsx    # JWT + user persisted in localStorage
│   ├── lib/
│   │   ├── api.ts                  # Typed fetch client for all endpoints
│   │   ├── attendance.ts           # Enrollment checks + attendance aggregate updates
│   │   ├── http.ts                 # Route wrapper: DB connect, validation, error mapping
│   │   └── mongodb.ts              # Cached Mongoose connection
│   └── models/                     # Mongoose schemas
│       ├── User.ts  Faculty.ts  Class.ts  Student.ts
│       ├── AttendanceRecord.ts  StudentAttendance.ts
│       ├── LeaveRequest.ts  Session.ts  index.ts
├── scripts/                        # Design-QA tooling (not part of the build)
│   ├── browser.mjs                 # Shared headless-Chromium launcher
│   ├── screenshot.mjs              # Renders pages to screenshots/
│   ├── responsive-audit.mjs        # Overflow / tap-target / heading audit
│   └── contrast-audit.mjs          # WCAG AA contrast sweep
└── tests/                          # API handler tests (npm test)
    ├── api.test.ts                 # 28 end-to-end route assertions
    ├── memory-models.ts            # In-memory stand-in for the Mongoose models
    └── mongodb-stub.ts
```

## Design System

The visual language is shared by the marketing site and every internal page, and is
documented at **`/design-system`** — a living page rendered from the same components
that ship, not a static export.

### Where things live

| Concern | Source of truth |
|---------|-----------------|
| Colour, type, motion, elevation tokens | `@theme` block in `src/app/globals.css` |
| Reveal, glass, grid and gradient primitives | `@layer components` in `src/app/globals.css` |
| Buttons, badges, cards, containers | `src/components/ui/*` |
| Scroll reveals, progress bar, counters | `src/components/motion/*` |
| Landing copy (headlines, feature copy, FAQ) | `src/content/landing.ts` |

### Tokens

Brand indigo (`brand-50…950`), accent cyan (`accent-*`) and three semantic status
colours — present green, absent rose, leave amber. Type is Inter Variable with Geist
Mono for session codes, roll numbers and timestamps; both are **self-hosted** through
`@fontsource-variable`, so there is no render-blocking request to Google Fonts.

### Motion

- `.reveal` + `<Reveal>` — a single IntersectionObserver per element toggles
  `data-revealed`; delays are read from a `--reveal-delay` custom property.
- `motion/react` handles the hero's scroll-linked tilt, the tab and billing pills
  (`layoutId`) and the FAQ height animation.
- Ambient motion (`animate-float`, `animate-drift`, `animate-scanline`) is decorative.
- **Every** animation is disabled under `prefers-reduced-motion: reduce`, and the
  reveal effect never hides content when JavaScript is off (a `<noscript>` rule in the
  root layout restores it, so no DOM mutation is needed before hydration).

### Accessibility

- Skip link, labelled landmarks (`main`, every `nav`, every `section`) and a visible
  2px focus ring on all interactive elements.
- AA contrast verified by script, not by eye — `npm run audit:contrast` resolves each
  text node's effective background (compositing translucent layers through a canvas,
  so Tailwind v4's `oklch` palette is measured correctly).
- Decorative product mocks are exposed as single labelled images (`role="img"`) so
  screen readers get one useful sentence instead of a wall of fake timestamps.

### Design QA tooling

```bash
npm run dev                       # or: npm run build && npm run start
npm run screenshots               # full-page + per-section PNGs → screenshots/
npm run audit:responsive         # overflow, tap targets, heading order, 320→1920px
npm run audit:contrast           # WCAG AA sweep across the marketing + app routes
```

These scripts drive a headless browser, which is **not** a project dependency — that
keeps ~50 MB of Chromium out of everyone's `npm install`. Pick one:

```bash
# A) Use a Chrome you already have
CHROME_PATH="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" npm run screenshots

# B) Install a bundled Chromium (no download from Google's CDN needed)
npm i -D @sparticuz/chromium puppeteer-core

# C) Any other Chromium/Chrome build
CHROME_PATH=/usr/bin/chromium npm run audit:contrast
```

`scripts/browser.mjs` resolves the browser in that order and prints the install
command if it finds none. Output lands in `screenshots/`, which is git-ignored.

### Reusing the system on new pages

```tsx
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Surface } from "@/components/ui/Card";
import { Reveal } from "@/components/motion/Reveal";

<Container>
  <SectionHeading align="left" eyebrow="Reports" title="Monthly register" />
  <Reveal delay={80}>
    <Surface className="p-6">…</Surface>
  </Reveal>
</Container>
```

Two conventions worth keeping:

1. **Add a variant, don't recolour from outside.** Utility classes from a `className`
   prop tie with a component's own utilities, and the stylesheet order decides the
   winner — which has already produced invisible white-on-white text once. Extend the
   `VARIANT` map instead.
2. **Don't set colour on `h1–h4` globally.** Dark panels inherit `text-white` from a
   wrapper; a global heading colour would override that inheritance and render the
   heading invisible.

## Setup Instructions

### Prerequisites
1. **Node.js** v18+ (tested with v22)
2. **MongoDB** — a local server or a free [MongoDB Atlas](https://www.mongodb.com/atlas) cluster
3. **npm**

### Step 1 — Install dependencies

```bash
git clone <repository-url>
cd in_progress
npm install
```

### Step 2 — Configure environment variables

Copy `.env.example` to `.env.local` and fill in the values:

```env
# MongoDB connection (local server)
MONGODB_URI=mongodb://127.0.0.1:27017/track-attend

# Secret used to sign JWTs — change this in production!
JWT_SECRET=change-me-to-a-long-random-string
```

> For MongoDB Atlas, use the SRV string from the Atlas UI:
> `MONGODB_URI=mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net/track-attend`
> (URL-encode special characters in the password.)

Both variables are required. This makes a missing configuration fail clearly instead
of silently attempting a local database that may not be running.

### Step 3 — Start MongoDB

**Local MongoDB**

```bash
# macOS (Homebrew)
brew services start mongodb-community

# Linux (systemd)
sudo systemctl start mongod

# Windows
net start MongoDB
```

**MongoDB Atlas** — create a free cluster and copy the connection string into `MONGODB_URI`.

### Step 4 — Seed the database

```bash
npm run dev

# In another shell:
curl -X POST http://localhost:3000/api/seed
```

The seeder wipes all collections and creates a coherent dataset: 1 admin,
3 teachers (with faculty profiles), 7 student users, 2 classes
(*Digital Circuits* and *Embedded System*), ~6 weeks of weekday attendance records,
subject-wise attendance aggregates, and 4 leave requests (pending / approved / rejected).
Seeding is idempotent — run it any time to reset to a known state.

### Step 5 — Run the app

```bash
# Development
npm run dev

# Production
npm run build
npm run start
```

Open http://localhost:3000 for the landing page, or /login for the app.

## Test Credentials (after seeding)

All seeded accounts use the password **`password123`**.

| Role    | Email                        |
|---------|------------------------------|
| Admin   | `admin@college.edu`          |
| Teacher | `sweta.choubey@college.edu`  |
| Teacher | `prashant.sahu@college.edu`  |
| Teacher | `shashi.kindo@college.edu`   |
| Student | `nitish@student.edu`         |
| Student | `tarun@student.edu`          |
| Student | `prakhar@student.edu`        |

(Additional seeded students: `tilak@`, `mukesh@`, `anitesh@`, `khilesh@` `@student.edu`.)

Faculty accounts created through **Add Faculty** use the password `faculty123`.

## How the QR Attendance Flow Works

1. **Teacher** opens *Take Attendance* on a class → the live session page
   (`/teacher/session/<class>`), picks a QR lifespan, and starts the session.
   A session document is created via `POST /api/sessions` (10-minute window).
2. The QR payload encodes `<origin>/student/verify?session=<sessionId>&course=<class>`
   and rotates every *n* seconds (default 7) to discourage screenshot sharing.
3. **Student** scans it from the dashboard button *Scan QR to Mark Attendance*
   (`/student/verify`). The camera scanner extracts the session id and calls
   `PUT /api/sessions/:id { studentId }`, which validates the session is active
   and the student is enrolled, then marks them **Present** immediately.
4. The teacher sees live check-ins (polled every 3 s). **End Session** (or expiry)
   finalizes the session via `PUT /api/sessions/:id { action: 'end' }`:
   scanned students → Present, everyone else on the roster → Absent, and the class
   session history is updated.

The in-app scanner requires camera permission (HTTPS or localhost). On devices
without a camera the page falls back to manual session-code entry.

## API Reference

All endpoints return JSON. Errors use `{ "error": "message" }` with an appropriate status.

### Health
| Method | Path          | Description              |
|--------|---------------|--------------------------|
| GET    | `/api/health` | DB connectivity check    |

### Auth
| Method | Path                | Description                                              |
|--------|---------------------|----------------------------------------------------------|
| POST   | `/api/auth/login`   | `{ email, password, role }` → `{ token, user }`          |
| POST   | `/api/auth/register`| `{ email, password, name, role, rollNo?, department?, phone? }` → 201. Validates email format, 8-char minimum password, and requires `rollNo` for students |

### Faculty
| Method | Path                 | Description                                             |
|--------|----------------------|---------------------------------------------------------|
| GET    | `/api/faculty`       | List all (`?search=&filterBy=name\|department`)         |
| POST   | `/api/faculty`       | Create faculty + linked teacher account                 |
| GET    | `/api/faculty/:id`   | Get one faculty                                         |
| PUT    | `/api/faculty/:id`   | Update faculty                                          |
| DELETE | `/api/faculty/:id`   | Delete faculty (and its linked account)                 |

### Classes
| Method | Path                 | Description                                             |
|--------|----------------------|---------------------------------------------------------|
| GET    | `/api/classes`       | List classes (`?teacherId=`), each with its students    |
| POST   | `/api/classes`       | `{ name, teacherId, capacity? }` (capacity default 60)  |
| GET    | `/api/classes/:id`   | Get one class with students                             |
| PUT    | `/api/classes/:id`   | Update (e.g. rename)                                    |
| DELETE | `/api/classes/:id`   | Delete class + cascade-delete its roster                |

### Enrollments (student course registration)
| Method | Path                    | Description                                          |
|--------|-------------------------|------------------------------------------------------|
| GET    | `/api/enrollments`      | `?userId=` → the student's courses + courses open to register for |
| POST   | `/api/enrollments`      | `{ userId, classId, rollNo? }` — register a student for a course (checks role, capacity, duplicates) |
| DELETE | `/api/enrollments`      | `?userId=&classId=` — withdraw from a course         |

### Students
| Method | Path                 | Description                                             |
|--------|----------------------|---------------------------------------------------------|
| GET    | `/api/students`      | `?classId=` roster, or `?userId=` a user's enrollments (includes class name/teacher) |
| POST   | `/api/students`      | `{ classId, name, rollNo, email? }` — links an existing user account by email |
| PUT    | `/api/students/:id`  | Update student                                          |
| DELETE | `/api/students/:id`  | Remove student from class                               |

### Attendance
| Method | Path                 | Description                                             |
|--------|----------------------|---------------------------------------------------------|
| GET    | `/api/attendance`    | Records (`?studentId=&classId=&date=`). `studentId` accepts a comma-separated list so several enrollments load in one request |
| POST   | `/api/attendance`    | `{ classId, date, attendanceData: [{ studentId, status }] }` — **every student must be enrolled in `classId`** or the whole batch is rejected with 403. Re-marking the same date adjusts aggregates instead of double counting |

### Sessions (live QR attendance)
| Method | Path                 | Description                                             |
|--------|----------------------|---------------------------------------------------------|
| GET    | `/api/sessions`      | List sessions (`?classId=&teacherId=`)                  |
| POST   | `/api/sessions`      | `{ classId, teacherId, duration? }` (ms, default 10 min)|
| GET    | `/api/sessions/:id`  | Session + scanned student details (auto-expires)        |
| PUT    | `/api/sessions/:id`  | `{ studentId }` → QR check-in; `{ action: 'end' }` → finalize attendance |
| DELETE | `/api/sessions/:id`  | Delete session                                          |

### Leave Requests
| Method | Path                       | Description                                     |
|--------|----------------------------|-------------------------------------------------|
| GET    | `/api/leave-requests`      | `?studentId=&teacherId=&classId=&status=`       |
| POST   | `/api/leave-requests`      | `{ studentId, classId, date, reason }` — requires enrollment; name/roll/subject/teacher are resolved server-side |
| PUT    | `/api/leave-requests/:id`  | `{ status: 'Pending' \| 'Approved' \| 'Rejected' }` — approving writes a `Leave` attendance record for that date |
| DELETE | `/api/leave-requests/:id`  | Delete request                                  |

### Seed
| Method | Path         | Description                                        |
|--------|--------------|----------------------------------------------------|
| POST   | `/api/seed`  | Reset and repopulate the database (idempotent)     |

## Testing

```bash
npm test                           # 39 end-to-end assertions on the API route handlers
npm run lint                       # ESLint (react-hooks + next rules)
npm run typecheck                  # tsc --noEmit
npm run build                      # production build check

# Design QA (needs a running server + a Chromium build — see Design System)
npm run screenshots                # page and section PNGs
npm run audit:responsive           # 320px → 1920px overflow and target audit
npm run audit:contrast             # WCAG AA contrast sweep
```

`npm test` needs no database: `tests/memory-models.ts` provides an in-memory
stand-in for the Mongoose models, and the real route handlers are driven against
it with actual `Request` objects. The suite covers registration validation,
course-registration rules (capacity, duplicates, closed enrollment, role checks),
every path where attendance is gated on enrollment, and the login
regressions described below.

## Database Schema Overview

| Collection           | Purpose                                                        |
|----------------------|----------------------------------------------------------------|
| `users`              | Accounts for students, teachers, and the admin (bcrypt hashes) |
| `faculties`          | Faculty profiles linked to teacher accounts                    |
| `classes`            | Courses with `capacity`, `enrollmentOpen`, and a per-day `sessionHistory` |
| `students`           | **Enrollments** (student ↔ course + aggregate stats). A row here is what authorises attendance for that course |
| `attendancerecords`  | One record per (student, class, date) — unique index           |
| `studentattendances` | Subject-wise aggregates + full per-date history                |
| `leaverequests`      | Leave submissions with Pending/Approved/Rejected status        |
| `sessions`           | Live QR sessions with expiry and scanned-student list          |

## Development Notes

- **Adding endpoints** — create `route.ts` files under `src/app/api/...`, then add a
  typed wrapper in `src/lib/api.ts`.
- **Connections** — `src/lib/mongodb.ts` caches a single Mongoose connection across
  hot reloads (standard Next.js pattern).
- **Auth** — login issues a 7-day JWT; the token and user are persisted in
  `localStorage` by `AuthContext` and used for client-side route protection.
  API routes currently trust client-provided IDs; wire a `verifyToken` middleware
  before exposing this publicly.
- **Route handlers** are wrapped by `route()` from `src/lib/http.ts`, which connects
  to MongoDB, maps `HttpError` / validation / duplicate-key errors to the right
  status codes, and keeps handlers free of repetitive try/catch blocks.
- **Email matching** — stored addresses are not guaranteed to be normalised
  (Mongoose's `lowercase`/`trim` setters do not apply to query filters, bulk
  writes, or rows written before the setter existed), so every email lookup goes
  through `emailFilter()` in `src/lib/http.ts`, which matches case-insensitively
  and escapes regex metacharacters. Use it for any new email lookup — a plain
  equality match will reject valid logins.
- **Bulk attendance** — marking a roster uses `bulkUpsertAttendance()`, which
  issues a fixed number of round trips (one read plus three bulk writes) instead
  of ~4 queries per student.
- **The enrollment rule** lives in `requireEnrollment()` (`src/lib/attendance.ts`)
  and is enforced by every write path: batch attendance, QR check-in, session
  finalization, and leave requests.

## License

MIT
