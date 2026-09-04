# Syntex Terrors - Attendance Management System

A comprehensive full-stack attendance management system built with **Next.js** (App Router), **MongoDB** via **Mongoose**, and **React**.

## Features

### For Students
- **Dashboard Overview**: View overall attendance percentage and subject-wise breakdown
- **Attendance Calendar**: Interactive calendar showing daily attendance status
- **Leave Requests**: Submit and track leave requests
- **Attendance Simulator**: Project future attendance based on planned absences

### For Teachers
- **Class Management**: Create, rename, and remove classes
- **Student Roster**: Add/remove students and view their attendance
- **Attendance Sessions**: Generate QR codes for live attendance tracking
- **Leave Request Management**: Approve or reject student leave requests
- **Analytics**: View attendance trends with charts

### For College Admin
- **Faculty Management**: Add, view, and manage faculty members
- **Faculty Profiles**: View detailed faculty information and subjects
- **Dashboard Statistics**: Overview of active teachers and scheduled classes

## Tech Stack

- **Frontend**: React 19, Next.js 16, Tailwind CSS 4, Recharts, React Calendar, QRCode
- **Backend**: Next.js API Routes, Mongoose, JWT Authentication
- **Database**: MongoDB

## Project Structure

```
├── src/
│   ├── app/
│   │   ├── (auth)/          # Auth-related pages
│   │   │   └── login/       # Login page
│   │   ├── (dashboard)/     # Dashboard pages
│   │   │   ├── college/     # College admin dashboard
│   │   │   ├── student/     # Student dashboard
│   │   │   └── teacher/     # Teacher dashboard
│   │   ├── api/             # API routes
│   │   │   ├── auth/        # Authentication endpoints
│   │   │   ├── attendance/  # Attendance CRUD
│   │   │   ├── classes/     # Class management
│   │   │   ├── faculty/     # Faculty management
│   │   │   ├── leave-requests/  # Leave requests
│   │   │   ├── seed/        # Database seeding
│   │   │   ├── sessions/    # Live session management
│   │   │   └── students/    # Student management
│   │   ├── globals.css      # Global styles
│   │   ├── layout.tsx       # Root layout
│   │   └── page.tsx         # Home page
│   ├── components/          # Reusable components
│   ├── contexts/            # React contexts
│   ├── lib/                 # Utility functions
│   │   ├── api.ts           # API client
│   │   └── mongodb.ts       # MongoDB connection
│   └── models/              # Mongoose models
│       ├── AttendanceRecord.ts
│       ├── Class.ts
│       ├── Faculty.ts
│       ├── LeaveRequest.ts
│       ├── Session.ts
│       ├── Student.ts
│       ├── StudentAttendance.ts
│       └── User.ts
├── package.json
└── README.md
```

## Setup Instructions

### Prerequisites

1. **Node.js** (v18 or higher)
2. **MongoDB** (local installation or MongoDB Atlas)
3. **npm** or **yarn**

### Step 1: Clone and Install Dependencies

```bash
# Clone the repository
git clone <repository-url>
cd syntex-terrors

# Install dependencies
npm install
```

### Step 2: Configure Environment Variables

Create a `.env` file in the root directory:

```env
# MongoDB Connection
MONGODB_URI=mongodb://localhost:27017/syntex-terrors

# JWT Secret (change this in production)
JWT_SECRET=your-super-secret-jwt-key-change-in-production

# PostgreSQL (existing - can be ignored if not using)
DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:5432/app_db
```

### Step 3: Start MongoDB

**Option A: Local MongoDB**

Make sure MongoDB is running locally on port 27017:

```bash
# macOS (using Homebrew)
brew services start mongodb-community

# Linux
sudo systemctl start mongod

# Windows
net start MongoDB
```

**Option B: MongoDB Atlas**

1. Create a free account at [mongodb.com/atlas](https://www.mongodb.com/atlas)
2. Create a new cluster
3. Get the connection string and update `MONGODB_URI` in `.env`

### Step 4: Seed the Database

Run the seed endpoint to populate the database with initial data:

```bash
# Start the development server
npm run dev

# In another terminal, seed the database
curl -X POST http://localhost:3000/api/seed
```

Or use the seed API directly from the frontend.

### Step 5: Run the Application

```bash
# Development mode
npm run dev

# Production mode
npm run build
npm run start
```

The application will be available at `http://localhost:3000`

## Test Credentials

After seeding the database, you can use these credentials:

### Admin Login
- Email: `admin@college.edu`
- Password: `password123`

### Teacher Login
- Email: `sweta.choubey@college.edu`
- Password: `password123`

### Student Login
- Email: `nitish@student.edu`
- Password: `password123`

## API Endpoints

### Authentication
- `POST /api/auth/login` - Login user
- `POST /api/auth/register` - Register new user

### Faculty
- `GET /api/faculty` - Get all faculty
- `GET /api/faculty/:id` - Get faculty by ID
- `POST /api/faculty` - Create faculty
- `PUT /api/faculty/:id` - Update faculty
- `DELETE /api/faculty/:id` - Delete faculty

### Classes
- `GET /api/classes` - Get all classes
- `GET /api/classes/:id` - Get class by ID
- `POST /api/classes` - Create class
- `PUT /api/classes/:id` - Update class
- `DELETE /api/classes/:id` - Delete class

### Students
- `GET /api/students?classId=:id` - Get students by class
- `POST /api/students` - Add student to class
- `PUT /api/students/:id` - Update student
- `DELETE /api/students/:id` - Remove student

### Attendance
- `GET /api/attendance` - Get attendance records
- `POST /api/attendance` - Mark attendance

### Leave Requests
- `GET /api/leave-requests` - Get leave requests
- `POST /api/leave-requests` - Create leave request
- `PUT /api/leave-requests/:id` - Update request status
- `DELETE /api/leave-requests/:id` - Delete request

### Sessions
- `GET /api/sessions` - Get sessions
- `GET /api/sessions/:id` - Get session by ID
- `POST /api/sessions` - Create session
- `PUT /api/sessions/:id` - Update session
- `DELETE /api/sessions/:id` - End session

## Features

### QR Code Attendance
Teachers can generate QR codes for live attendance sessions. The QR code expires after a configurable duration (default 7 seconds).

### Real-time Analytics
Both students and teachers can view attendance trends using interactive charts built with Recharts.

### Role-based Access Control
The system supports three roles: Student, Teacher, and College Admin, each with their own dashboard and permissions.

## Development

### Adding New Features

1. Create new API routes in `src/app/api/`
2. Create new pages in `src/app/(dashboard)/`
3. Add new models in `src/models/` if needed
4. Update the API client in `src/lib/api.ts`

### Database Schema

The MongoDB database contains the following collections:
- **users**: User accounts (students, teachers, admins)
- **faculties**: Faculty profiles
- **classes**: Classes/courses
- **students**: Student enrollment in classes
- **attendancerecords**: Daily attendance records
- **studentattendances**: Subject-wise attendance stats
- **leaverequests**: Leave request submissions
- **sessions**: Live QR code sessions

## License

MIT License
