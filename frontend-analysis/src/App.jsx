import { useState } from "react";
import { Routes, Route } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import StudentDashboard from "./pages/StudentDashboard";
import TeacherDashboard from "./pages/TeacherDashboard";
import CollegeDashboard from "./pages/CollegeDashboard";
import FacultyProfile from "./pages/FacultyProfile";
import AddFacultyForm from "./pages/AddFacultyForm";
import LiveSessionPage from "./pages/LiveSessionPage";

function App() {
  const [faculty, setFaculty] = useState([
    {
      id: 1,
      name: "Dr. sweta choubey",
      email: "sweta.choubey@college.edu",
      department: "basic science and humanities",
      status: "active",
      photo:
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR0mpEAFXv-iIa50q5rA2L6nnHGy_akXDFyQQ&s",
      subjects: ["env. chemistry"],
      attendance: "99%",
      lastAttendance: {
        subject: "env.chemistry",
        year: "1st Year",
        branch: "ET&T",
        timestamp: "2026-09-10 10:30 AM",
      },
    },
    {
      id: 2,
      name: "Prof. prashant sahu",
      email: "prashant.sahu@college.edu",
      department: "env. chemistry",
      status: "leave",
      photo:
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR0mpEAFXv-iIa50q5rA2L6nnHGy_akXDFyQQ&s",
      subjects: ["env. chemistry"],
      attendance: "78%",
      lastAttendance: {
        subject: "env. chemistry",
        year: "1st Year",
        branch: "cse ds",
        timestamp: "2026-09-10 02:45 PM",
      },
    },
    {
      id: 3,
      name: "Dr. shashi bala kindo",
      email: "shashi.kindo@college.edu",
      department: "env. chemistry",
      status: "active",
      photo:
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR0mpEAFXv-iIa50q5rA2L6nnHGy_akXDFyQQ&s",
      subjects: ["Linear Algebra", "Probability & Statistics"],
      attendance: "88%",
      lastAttendance: {
        subject: "case study",
        year: "1st Year",
        branch: "cse",
        timestamp: "2025-09-22 11:15 AM",
      },
    },
  ]);
  

  // ---- Function to add new faculty ----
  const addFaculty = (newFaculty) => {
    setFaculty((prev) => [...prev, newFaculty]);
  };

  // ---- Function to update faculty (subjects, attendance, etc.) ----
  const updateFaculty = (id, updatedData) => {
    setFaculty((prev) =>
      prev.map((f) => (f.id === id ? { ...f, ...updatedData } : f))
    );
  };

  // ---- Function to remove faculty ----
  const removeFaculty = (id) => {
    setFaculty((prev) => prev.filter((f) => f.id !== id));
  };

  return (
    <Routes>
      <Route path="/" element={<LoginPage />} />
      <Route path="/student" element={<StudentDashboard />} />
      <Route path="/teacher" element={<TeacherDashboard />} />
      <Route path="/teacher/session/:courseName" element={<LiveSessionPage />} />

      {/* Pass faculty + functions down */}
      <Route
        path="/college"
        element={<CollegeDashboard faculty={faculty} addFaculty={addFaculty} />}
      />
      <Route
        path="/faculty/:id"
        element={
          <FacultyProfile
            faculty={faculty}
            updateFaculty={updateFaculty}
            removeFaculty={removeFaculty}
          />
        }
      />
      <Route
        path="/add-faculty"
        element={<AddFacultyForm addFaculty={addFaculty} />}
      />
    </Routes>
  );
}

export default App;
