# Syntex Terrors — Attendance Management System

A full-stack, role-based attendance management system for colleges. Teachers run live
QR-code attendance sessions, students check in by scanning the QR with their camera,
and college admins manage faculty — all backed by **Next.js (App Router)**, **MongoDB
(Mongoose)**, and **JWT authentication**.

## Features

### For Students
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
| Frontend  | React 19, Next.js 16 (App Router), Tailwind CSS 4, Recharts, react-calendar, qrcode.react, html5-qrcode, lucide-react |
| Backend   | Next.js API routes, Mongoose 9, bcryptjs, JSON Web Tokens         |
| Database  | MongoDB (local or Atlas)                                          |

## Project Structure

```
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   └── login/              # Login page (student / teacher / college)
│   │   ├── (dashboard)/
│   │   │   ├── college/            # Admin: directory, add-faculty, faculty profile
│   │   │   ├── student/
│   │   │   │   ├── page.tsx        # Student dashboard
│   │   │   │   └── verify/         # QR scanner / session verification page
│   │   │   └── teacher/
│   │   │       ├── page.tsx        # Teacher dashboard
│   │   │       └── session/[courseName]/  # Live QR session page
│   │   ├── api/                    # REST API (see below)
│   │   ├── globals.css
│   │   ├── layout.tsx              # Root layout (auth provider)
│   │   └── page.tsx                # Redirects to /login
│   ├── components/
│   ├── contexts/AuthContext.tsx    # JWT + user persisted in localStorage
│   ├── lib/
│   │   ├── api.ts                  # Typed fetch client for all endpoints
│   │   └── mongodb.ts              # Cached Mongoose connection
│   └── models/                     # Mongoose schemas
│       ├── User.ts  Faculty.ts  Class.ts  Student.ts
│       ├── AttendanceRecord.ts  StudentAttendance.ts
│       ├── LeaveRequest.ts  Session.ts  index.ts
├── scripts/api-tests.sh            # End-to-end API smoke tests (62 assertions)
├── frontend-analysis/              # Legacy Vite prototype (reference only)
└── mongodb/                        # Local MongoDB notes / helper files
```

## Setup Instructions

### Prerequisites
1. **Node.js** v18+ (tested with v22)
2. **MongoDB** — a local server or a free [MongoDB Atlas](https://www.mongodb.com/atlas) cluster
3. **npm**

### Step 1 — Install dependencies

```bash
git clone <repository-url>
cd syntex-terrors
npm install
```

### Step 2 — Configure environment variables

Copy `.env.example` to `.env.local` in the project root and set the values:

```env
# MongoDB connection (local server)
MONGODB_URI=mongodb://127.0.0.1:27017/syntex-terrors

# Secret used to sign JWTs — change this in production!
JWT_SECRET=change-me-to-a-long-random-string
```

> For MongoDB Atlas, use the SRV string from the Atlas UI:
> `MONGODB_URI=mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net/syntex-terrors`
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

Open http://localhost:3000 (redirects to the login page).

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
| POST   | `/api/auth/register`| `{ email, password, name, role, rollNo?, department? }`  |

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
| POST   | `/api/classes`       | `{ name, teacherId, totalStudents? }`                   |
| GET    | `/api/classes/:id`   | Get one class with students                             |
| PUT    | `/api/classes/:id`   | Update (e.g. rename)                                    |
| DELETE | `/api/classes/:id`   | Delete class + cascade-delete its roster                |

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
| GET    | `/api/attendance`    | Records (`?studentId=&classId=&date=`)                  |
| POST   | `/api/attendance`    | `{ classId, date, attendanceData: [{ studentId, status }] }` — re-marking the same date adjusts aggregates instead of double counting |

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
| POST   | `/api/leave-requests`      | `{ studentId, studentName, rollNo, subject, date, reason, classId, teacherId }` |
| PUT    | `/api/leave-requests/:id`  | `{ status: 'Pending' \| 'Approved' \| 'Rejected' }` |
| DELETE | `/api/leave-requests/:id`  | Delete request                                  |

### Seed
| Method | Path         | Description                                        |
|--------|--------------|----------------------------------------------------|
| POST   | `/api/seed`  | Reset and repopulate the database (idempotent)     |

## Testing

With the dev server running and MongoDB up:

```bash
bash scripts/api-tests.sh          # 62 end-to-end assertions across all endpoints
npm run lint                       # ESLint (react-hooks + next rules) — 0 problems
npm run typecheck                  # tsc --noEmit
npm run build                      # production build check
```

## Database Schema Overview

| Collection           | Purpose                                                        |
|----------------------|----------------------------------------------------------------|
| `users`              | Accounts for students, teachers, and the admin (bcrypt hashes) |
| `faculties`          | Faculty profiles linked to teacher accounts                    |
| `classes`            | Classes/courses with a per-day `sessionHistory`                |
| `students`           | Roster entries (student ↔ class enrollment + aggregate stats)  |
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
- **frontend-analysis/** is the original Vite prototype kept for reference; it is
  excluded from lint and is not part of the Next.js app.

## License

MIT
