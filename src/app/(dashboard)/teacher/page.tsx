'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Calendar from 'react-calendar';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import {
  LogOut,
  Users,
  ClipboardList,
  PlayCircle,
  PlusCircle,
  X,
  MoreVertical,
  Trash2,
  AlertTriangle,
  UserPlus,
  Edit,
  CalendarPlus,
  Calendar as CalendarIcon,
  MailCheck,
  Check,
  XCircle,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

// --- MOCK DATA GENERATION & CONFIG ---
const generateFullSessionHistory = (totalStudents: number) => {
  const history = [];
  const startDate = new Date('2025-08-01');
  const today = new Date('2025-09-25');
  const blankDate = '2025-09-26';

  for (let d = new Date(startDate); d <= today; d.setDate(d.getDate() + 1)) {
    const dateStr = d.toISOString().split('T')[0];
    if (d.getDay() === 0 || d.getDay() === 6 || dateStr === blankDate) continue;
    const present = Math.floor(totalStudents * (0.6 + Math.random() * 0.4));
    history.push({ date: dateStr, present });
  }
  return history;
};

const initialLeaveRequests = [
  {
    id: 1,
    studentName: 'Prakhar',
    rollNo: 104,
    subject: 'BEE',
    date: '2025-09-29',
    reason: 'Medical appointment',
    status: 'Pending',
  },
  {
    id: 2,
    studentName: 'Tarun',
    rollNo: 102,
    subject: 'BEE',
    date: '2025-09-26',
    reason: "Scheduled doctor's appointment.",
    status: 'Pending',
  },
  {
    id: 3,
    studentName: 'Tilak',
    rollNo: 204,
    subject: 'Embedded System',
    date: '2025-09-23',
    reason: 'Personal work',
    status: 'Approved',
  },
  {
    id: 4,
    studentName: 'Khilesh',
    rollNo: 201,
    subject: 'Embedded System',
    date: '2025-09-22',
    reason: 'Not feeling well',
    status: 'Rejected',
  },
];

const MiniCircularProgress = ({ percentage, size = 32 }: { percentage: number; size?: number }) => {
  const radius = size / 2 - 4;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;
  const color = percentage >= 75 ? 'text-green-600' : 'text-red-600';
  return (
    <div
      className="relative flex items-center justify-center"
      style={{ width: size, height: size }}
    >
      <svg className="transform -rotate-90 w-full h-full">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth="4"
          fill="transparent"
          className="text-gray-200"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth="4"
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className={`transition-all duration-500 ease-in-out ${color}`}
        />
      </svg>
      <span className={`absolute text-xs font-bold ${color}`}>{Math.round(percentage)}</span>
    </div>
  );
};

interface ClassData {
  totalStudents: number;
  sessionHistory: { date: string; present: number }[];
}

const WeeklyTrendChart = ({ classes }: { classes: Record<string, ClassData> }) => {
  const classNames = Object.keys(classes);
  const last7DaysData = useMemo(() => {
    const data = [];
    const today = new Date('2025-09-25');

    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const entry: Record<string, string | number | null> = {
        date: date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }),
      };

      classNames.forEach((className) => {
        const classData = classes[className];
        const session = classData.sessionHistory.find((s) => s.date === dateStr);

        if (session) {
          entry[className] = parseFloat(
            ((session.present / classData.totalStudents) * 100).toFixed(1)
          );
        } else {
          let lastKnownValue = null;
          const reversedHistory = [...classData.sessionHistory].reverse();
          const lastSessionBeforeDate = reversedHistory.find((s) => new Date(s.date) < date);

          if (lastSessionBeforeDate) {
            lastKnownValue = parseFloat(
              ((lastSessionBeforeDate.present / classData.totalStudents) * 100).toFixed(1)
            );
          }
          entry[className] = lastKnownValue;
        }
      });
      data.push(entry);
    }
    return data;
  }, [classes]);

  const subjectColors: Record<string, string> = {
    'Digital Circuits': '#8884d8',
    'Embedded System': '#82ca9d',
  };

  return (
    <div className="bg-white shadow-2xl rounded-2xl p-6">
      <h3 className="text-xl font-bold mb-4">Last 7 Days Attendance Percentage</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={last7DaysData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis unit="%" domain={[50, 100]} />
          <Tooltip />
          <Legend />
          {classNames.map((name) => (
            <Line
              key={name}
              type="monotone"
              dataKey={name}
              stroke={subjectColors[name] || '#000000'}
              strokeWidth={3}
              dot={{ r: 4 }}
              activeDot={{ r: 8 }}
              connectNulls
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

interface StudentData {
  name: string;
  rollNo: number;
  attended: number;
  total: number;
  email?: string;
}

export default function TeacherDashboard() {
  const [activeView, setActiveView] = useState('overview');
  const router = useRouter();
  const { logout } = useAuth();

  const [studentsBySubject, setStudentsBySubject] = useState<Record<string, StudentData[]>>({
    'Digital Circuits': [
      { name: 'Nitish', rollNo: 101, attended: 18, total: 20 },
      { name: 'Tilak', rollNo: 102, attended: 14, total: 20 },
      { name: 'Mukesh', rollNo: 103, attended: 20, total: 20 },
      { name: 'Prakhar', rollNo: 104, attended: 9, total: 20 },
      { name: 'Anitesh', rollNo: 105, attended: 16, total: 20 },
    ],
    'Embedded System': [
      { name: 'Tarun', rollNo: 201, attended: 15, total: 20 },
      { name: 'Tilak', rollNo: 202, attended: 19, total: 20 },
      { name: 'Nitish', rollNo: 203, attended: 14, total: 20 },
      { name: 'Mukesh', rollNo: 204, attended: 17, total: 20 },
      { name: 'Anitesh', rollNo: 205, attended: 18, total: 20 },
    ],
  });

  const atRiskStudents = useMemo(() => {
    const students: (StudentData & { subject: string })[] = [];
    const seen = new Set<number>();
    Object.keys(studentsBySubject).forEach((subject) => {
      studentsBySubject[subject].forEach((student) => {
        const percentage = (student.attended / student.total) * 100;
        if (percentage < 75 && !seen.has(student.rollNo)) {
          students.push({ ...student, subject });
          seen.add(student.rollNo);
        }
      });
    });
    return students;
  }, [studentsBySubject]);

  const handleRemoveStudent = (subject: string, rollNoToRemove: number) => {
    setStudentsBySubject((prev) => ({
      ...prev,
      [subject]: prev[subject].filter((s) => s.rollNo !== rollNoToRemove),
    }));
  };

  const [classes, setClasses] = useState<Record<string, ClassData>>({
    'Digital Circuits': { totalStudents: 40, sessionHistory: generateFullSessionHistory(40) },
    'Embedded System': { totalStudents: 35, sessionHistory: generateFullSessionHistory(35) },
  });

  const sessionDates = useMemo(() => {
    const dates = new Set<string>();
    Object.values(classes).forEach((classData) => {
      classData.sessionHistory.forEach((session) => dates.add(session.date));
    });
    return dates;
  }, [classes]);

  const [openMenuKey, setOpenMenuKey] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newClassName, setNewClassName] = useState('');
  const [isAttendanceModalOpen, setIsAttendanceModalOpen] = useState(false);
  const [selectedConstraints, setSelectedConstraints] = useState<string[]>([]);
  const [attendanceSubject, setAttendanceSubject] = useState<string | null>(null);
  const [isAtRiskModalOpen, setIsAtRiskModalOpen] = useState(false);
  const [isAddStudentModalOpen, setIsAddStudentModalOpen] = useState(false);
  const [isRenameModalOpen, setIsRenameModalOpen] = useState(false);
  const [isManualEntryModalOpen, setIsManualEntryModalOpen] = useState(false);
  const [currentClass, setCurrentClass] = useState<string | null>(null);
  const [currentStudent, setCurrentStudent] = useState<StudentData | null>(null);
  const [currentSubject, setCurrentSubject] = useState<string | null>(null);
  const [manualEntryData, setManualEntryData] = useState({
    date: new Date().toISOString().split('T')[0],
    status: 'Present',
    reason: '',
  });
  const [newStudent, setNewStudent] = useState({ name: '', rollNo: '', email: '' });
  const [renameValue, setRenameValue] = useState('');
  const [selectedCalendarDate, setSelectedCalendarDate] = useState<Date>(new Date('2025-09-25'));
  const [leaveRequests, setLeaveRequests] = useState(initialLeaveRequests);
  const pendingLeaveCount = useMemo(
    () => leaveRequests.filter((req) => req.status === 'Pending').length,
    [leaveRequests]
  );

  const calculatePercentage = (present: number, total: number) =>
    total > 0 ? parseFloat(((present / total) * 100).toFixed(1)) : 0;

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const toggleConstraint = (constraint: string) => {
    setSelectedConstraints((prev) =>
      prev.includes(constraint) ? prev.filter((c) => c !== constraint) : [...prev, constraint]
    );
  };

  const handleContinueAttendance = () => {
    if (attendanceSubject) {
      router.push(`/teacher/session/${encodeURIComponent(attendanceSubject)}`);
      setIsAttendanceModalOpen(false);
      setSelectedConstraints([]);
      setAttendanceSubject(null);
    }
  };

  const handleAddClass = () => {
    if (newClassName.trim() !== '') {
      const subjectKey = newClassName.trim();
      setClasses((prev) => ({
        ...prev,
        [subjectKey]: {
          totalStudents: 40,
          sessionHistory: [{ date: new Date().toISOString().split('T')[0], present: 0 }],
        },
      }));
      setStudentsBySubject((prev) => ({ ...prev, [subjectKey]: [] }));
      setNewClassName('');
      setIsModalOpen(false);
    }
  };

  const handleRemoveClass = (subjectKey: string) => {
    setClasses((prev) => {
      const newClasses = { ...prev };
      delete newClasses[subjectKey];
      return newClasses;
    });
    setStudentsBySubject((prev) => {
      const newStudents = { ...prev };
      delete newStudents[subjectKey];
      return newStudents;
    });
    setOpenMenuKey(null);
  };

  const handleAddStudentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudent.name || !newStudent.rollNo) return;
    setStudentsBySubject((prev) => ({
      ...prev,
      [currentClass!]: [
        ...(prev[currentClass!] || []),
        { ...newStudent, attended: 0, total: 0, rollNo: parseInt(newStudent.rollNo) },
      ],
    }));
    setNewStudent({ name: '', rollNo: '', email: '' });
    setIsAddStudentModalOpen(false);
    setCurrentClass(null);
  };

  const handleRenameSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newName = renameValue.trim();
    if (!newName || newName === currentClass) return;
    setClasses((prev) => {
      const newClasses = { ...prev };
      const data = newClasses[currentClass!];
      delete newClasses[currentClass!];
      newClasses[newName] = data;
      return newClasses;
    });
    setStudentsBySubject((prev) => {
      const newStudents = { ...prev };
      const data = newStudents[currentClass!];
      delete newStudents[currentClass!];
      newStudents[newName] = data;
      return newStudents;
    });
    setRenameValue('');
    setIsRenameModalOpen(false);
    setCurrentClass(null);
  };

  const handleManualEntrySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStudentsBySubject((prev) => {
      const newStudents = { ...prev };
      const studentList = newStudents[currentSubject!];
      const studentIndex = studentList.findIndex((s) => s.rollNo === currentStudent!.rollNo);
      if (studentIndex !== -1) {
        const updatedStudent = { ...studentList[studentIndex] };
        updatedStudent.total += 1;
        if (manualEntryData.status === 'Present') {
          updatedStudent.attended += 1;
        }
        studentList[studentIndex] = updatedStudent;
      }
      return newStudents;
    });
    setIsManualEntryModalOpen(false);
    setCurrentStudent(null);
    setCurrentSubject(null);
    setManualEntryData({
      date: new Date().toISOString().split('T')[0],
      status: 'Present',
      reason: '',
    });
  };

  const handleLeaveRequestAction = (requestId: number, newStatus: string) => {
    setLeaveRequests((prev) =>
      prev.map((req) => (req.id === requestId ? { ...req, status: newStatus } : req))
    );
  };

  const downloadCSV = (subject: string) => {
    const students = studentsBySubject[subject];
    if (!students || students.length === 0) {
      alert('No data available for ' + subject);
      return;
    }

    let csv = 'Name,Roll No,Attended,Total,Percentage\n';
    students.forEach((student) => {
      const percentage = calculatePercentage(student.attended, student.total);
      csv += `"${student.name}",${student.rollNo},${student.attended},${student.total},${percentage}%\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${subject.replace(/\s+/g, '_')}_attendance.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const renderOverview = () => {
    const classEntries = Object.entries(classes);
    return (
      <div>
        <div className="mb-8 flex flex-wrap justify-center gap-4">
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <PlusCircle size={18} /> Start New Class
          </button>
          <button
            onClick={() => setIsAtRiskModalOpen(true)}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <AlertTriangle size={18} /> View At-Risk Students
          </button>
        </div>
        <p className="text-gray-600 mb-6">Here&apos;s an overview of your recent classes:</p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {classEntries.map(([subject, classData]) => {
            const latestSession =
              classData.sessionHistory.length > 0
                ? classData.sessionHistory[classData.sessionHistory.length - 1]
                : { present: 0, totalStudents: classData.totalStudents, date: 'N/A' };
            const attendancePercent = calculatePercentage(
              latestSession.present,
              classData.totalStudents
            );
            return (
              <div
                key={subject}
                className="bg-white shadow-lg rounded-2xl p-6 flex flex-col relative"
              >
                <div className="absolute top-4 right-4">
                  <button
                    onClick={() => setOpenMenuKey(openMenuKey === subject ? null : subject)}
                  >
                    <MoreVertical size={20} className="text-gray-500" />
                  </button>
                  {openMenuKey === subject && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-20 py-1">
                      <button
                        onClick={() => {
                          setIsRenameModalOpen(true);
                          setCurrentClass(subject);
                          setRenameValue(subject);
                          setOpenMenuKey(null);
                        }}
                        className="flex items-center gap-3 w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        <Edit size={16} /> Rename Class
                      </button>
                      <button
                        onClick={() => handleRemoveClass(subject)}
                        className="flex items-center gap-3 w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                      >
                        <Trash2 size={16} /> Remove Class
                      </button>
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold mb-1">{subject}</h3>
                  <p className="text-gray-500 text-sm mb-2">Last class: {latestSession.date}</p>
                  <p className="text-gray-600">
                    {latestSession.present}/{classData.totalStudents} present
                  </p>
                  <p
                    className={`mt-3 text-lg font-bold ${
                      attendancePercent >= 75 ? 'text-green-600' : 'text-red-600'
                    }`}
                  >
                    {attendancePercent}%
                  </p>
                </div>
                <button
                  onClick={() => {
                    setAttendanceSubject(subject);
                    setIsAttendanceModalOpen(true);
                  }}
                  className="mt-4 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center justify-center gap-2"
                >
                  <PlayCircle size={18} /> Take Attendance
                </button>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderStudentsView = () => (
    <div>
      <p className="text-gray-600 mb-6">
        Manage student rosters and manually add attendance entries if needed.
      </p>
      <div className="space-y-12">
        {Object.keys(studentsBySubject).map((subject) => (
          <div key={subject}>
            <h2 className="text-2xl font-bold mb-4 text-gray-800">{subject}</h2>
            <div className="bg-white shadow-lg rounded-2xl overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Roll No
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Attendance
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {studentsBySubject[subject].map((student) => (
                    <tr key={student.rollNo}>
                      <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                        {student.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                        {student.rollNo}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <MiniCircularProgress
                          percentage={calculatePercentage(student.attended, student.total)}
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <button
                          onClick={() => {
                            setCurrentStudent(student);
                            setCurrentSubject(subject);
                            setIsManualEntryModalOpen(true);
                          }}
                          className="p-2 rounded-full bg-green-100 text-green-700 hover:bg-green-200"
                          title="Add Manual Entry"
                        >
                          <CalendarPlus size={16} />
                        </button>
                        <button
                          onClick={() => handleRemoveStudent(subject, student.rollNo)}
                          className="ml-2 p-2 rounded-full bg-red-100 text-red-700 hover:bg-red-200"
                          title="Remove Student"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="p-4 flex justify-between">
                <button
                  onClick={() => downloadCSV(subject)}
                  className="flex items-center gap-2 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
                >
                  <ClipboardList size={18} /> Download Data
                </button>
                <button
                  onClick={() => {
                    setIsAddStudentModalOpen(true);
                    setCurrentClass(subject);
                  }}
                  className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <UserPlus size={18} /> Add Student
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderCalendarView = () => {
    const formatDate = (date: Date) => date.toISOString().split('T')[0];
    const getTileContent = ({ date, view }: { date: Date; view: string }) => {
      if (view === 'month' && sessionDates.has(formatDate(date))) {
        return <div className="h-2 w-2 mx-auto mt-1 bg-blue-500 rounded-full"></div>;
      }
      return null;
    };
    const sessionsOnSelectedDate = Object.entries(classes)
      .map(([subject, data]) => {
        const session = data.sessionHistory.find((s) => s.date === formatDate(selectedCalendarDate));
        return session ? { subject, ...session, totalStudents: data.totalStudents } : null;
      })
      .filter(Boolean);

    return (
      <div className="space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          <div className="lg:col-span-2 bg-white shadow-lg rounded-2xl p-4">
            <style>{`.react-calendar { width: 100%; border: none; font-family: 'Inter', sans-serif; } .react-calendar__navigation button { font-size: 1.2rem; font-weight: bold; } .react-calendar__tile { font-size: 1rem; padding: 1.5em 0.5em; border-radius: 8px; } .react-calendar__tile--active { background: #10B981 !important; color: white !important; }`}</style>
            <Calendar
              onChange={(value) => setSelectedCalendarDate(value as Date)}
              value={selectedCalendarDate}
              tileContent={getTileContent}
              className="w-full border-0"
            />
          </div>
          <div className="bg-white shadow-lg rounded-2xl p-6">
            <h3 className="text-xl font-bold mb-4">
              Classes on{' '}
              <span className="text-green-600">
                {selectedCalendarDate.toLocaleDateString('en-GB')}
              </span>
            </h3>
            {sessionsOnSelectedDate.length > 0 ? (
              <ul className="space-y-3">
                {sessionsOnSelectedDate.map((sessionData) => {
                  if (!sessionData) return null;
                  return (
                    <li
                      key={sessionData.subject}
                      className="flex justify-between items-center text-sm p-3 bg-gray-50 rounded-lg"
                    >
                      <span className="font-semibold">{sessionData.subject}</span>
                      <span className="font-bold">
                        {sessionData.present}/{sessionData.totalStudents} (
                        {calculatePercentage(sessionData.present, sessionData.totalStudents)}%)
                      </span>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className="text-gray-500 text-sm">No classes were scheduled on this day.</p>
            )}
          </div>
        </div>
        <WeeklyTrendChart classes={classes} />
      </div>
    );
  };

  const renderLeaveRequestsView = () => {
    const [filter, setFilter] = useState('Pending');
    const filteredRequests = leaveRequests.filter(
      (req) => filter === 'All' || req.status === filter
    );

    return (
      <div>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Manage Leave Requests</h2>
          <div className="flex gap-2 p-1 bg-gray-200 rounded-lg">
            {['Pending', 'Approved', 'All'].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-1 rounded-md text-sm font-semibold ${
                  filter === f
                    ? 'bg-white shadow'
                    : 'text-gray-600 hover:bg-gray-300'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
        <div className="space-y-4">
          {filteredRequests.length > 0 ? (
            filteredRequests.map((req) => (
              <div
                key={req.id}
                className="bg-white shadow-lg rounded-2xl p-6 border-l-4 border-yellow-500"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-bold text-lg text-gray-800">
                      {req.studentName}{' '}
                      <span className="text-sm text-gray-500 font-normal">
                        (Roll: {req.rollNo})
                      </span>
                    </p>
                    <p className="text-sm font-semibold text-blue-600">{req.subject}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(req.date).toDateString()}
                    </p>
                  </div>
                  <span
                    className={`font-bold px-2 py-1 rounded-full text-xs ${
                      req.status === 'Approved'
                        ? 'bg-green-100 text-green-800'
                        : req.status === 'Rejected'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}
                  >
                    {req.status}
                  </span>
                </div>
                <p className="text-gray-600 mt-4 text-sm italic border-l-2 border-gray-200 pl-3">
                  &quot;{req.reason}&quot;
                </p>
                {req.status === 'Pending' && (
                  <div className="flex justify-end gap-3 mt-4">
                    <button
                      onClick={() => handleLeaveRequestAction(req.id, 'Rejected')}
                      className="flex items-center gap-2 px-3 py-1 rounded-lg bg-red-500 text-white hover:bg-red-600 text-sm"
                    >
                      <XCircle size={14} />
                      Reject
                    </button>
                    <button
                      onClick={() => handleLeaveRequestAction(req.id, 'Approved')}
                      className="flex items-center gap-2 px-3 py-1 rounded-lg bg-green-500 text-white hover:bg-green-600 text-sm"
                    >
                      <Check size={14} />
                      Approve
                    </button>
                  </div>
                )}
              </div>
            ))
          ) : (
            <p className="text-center text-gray-500 py-8">
              No {filter.toLowerCase()} requests found.
            </p>
          )}
        </div>
      </div>
    );
  };

  const ActiveViewComponent = () => {
    switch (activeView) {
      case 'overview':
        return renderOverview();
      case 'students':
        return renderStudentsView();
      case 'calendar':
        return renderCalendarView();
      case 'leave':
        return renderLeaveRequestsView();
      default:
        return renderOverview();
    }
  };

  return (
    <div className="min-h-screen flex bg-gray-100">
      {/* Modals */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg p-6 w-96">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Start New Class</h2>
              <button onClick={() => setIsModalOpen(false)}>
                <X size={20} className="text-gray-600 hover:text-black" />
              </button>
            </div>
            <input
              type="text"
              value={newClassName}
              onChange={(e) => setNewClassName(e.target.value)}
              placeholder="Enter class name"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 rounded-lg bg-gray-300 hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={handleAddClass}
                className="px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700"
              >
                Add Class
              </button>
            </div>
          </div>
        </div>
      )}

      {isAtRiskModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-lg max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-red-600">At-Risk Students Report</h2>
              <button onClick={() => setIsAtRiskModalOpen(false)}>
                <X size={20} className="text-gray-600 hover:text-black" />
              </button>
            </div>
            <div className="overflow-y-auto">
              {atRiskStudents.length > 0 ? (
                <ul className="space-y-2">
                  {atRiskStudents.map((student, idx) => (
                    <li key={idx} className="p-3 bg-red-50 rounded-lg border border-red-200">
                      <span className="font-bold">{student.name}</span> (Roll: {student.rollNo}) is
                      at risk in <span className="font-semibold">{student.subject}</span> with{' '}
                      {calculatePercentage(student.attended, student.total)}% attendance.
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-center text-gray-500 py-4">No students are currently at risk.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {isAddStudentModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <form onSubmit={handleAddStudentSubmit} className="bg-white rounded-xl shadow-lg p-6 w-96">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Add Student to {currentClass}</h2>
              <button type="button" onClick={() => setIsAddStudentModalOpen(false)}>
                <X size={20} className="text-gray-600 hover:text-black" />
              </button>
            </div>
            <div className="space-y-4">
              <input
                required
                type="text"
                value={newStudent.name}
                onChange={(e) => setNewStudent({ ...newStudent, name: e.target.value })}
                placeholder="Student Name"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              <input
                required
                type="number"
                value={newStudent.rollNo}
                onChange={(e) => setNewStudent({ ...newStudent, rollNo: e.target.value })}
                placeholder="Roll No"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              <input
                required
                type="email"
                value={newStudent.email}
                onChange={(e) => setNewStudent({ ...newStudent, email: e.target.value })}
                placeholder="Email"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <button
                type="button"
                onClick={() => setIsAddStudentModalOpen(false)}
                className="px-4 py-2 rounded-lg bg-gray-300 hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700"
              >
                Add Student
              </button>
            </div>
          </form>
        </div>
      )}

      {isRenameModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <form onSubmit={handleRenameSubmit} className="bg-white rounded-xl shadow-lg p-6 w-96">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Rename Class</h2>
              <button type="button" onClick={() => setIsRenameModalOpen(false)}>
                <X size={20} className="text-gray-600 hover:text-black" />
              </button>
            </div>
            <input
              required
              type="text"
              value={renameValue}
              onChange={(e) => setRenameValue(e.target.value)}
              placeholder="Enter new class name"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsRenameModalOpen(false)}
                className="px-4 py-2 rounded-lg bg-gray-300 hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700"
              >
                Rename
              </button>
            </div>
          </form>
        </div>
      )}

      {isManualEntryModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 backdrop-blur-sm">
          <form onSubmit={handleManualEntrySubmit} className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-lg">
            <div className="flex justify-between items-center mb-6 pb-3 border-b">
              <div className="flex items-center gap-3">
                <div className="bg-green-100 p-2 rounded-full">
                  <CalendarPlus size={20} className="text-green-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-800">Add Manual Entry</h2>
              </div>
              <button
                type="button"
                onClick={() => setIsManualEntryModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>
            <div className="space-y-6">
              <p>
                For <strong className="text-green-700">{currentStudent?.name}</strong> in{' '}
                <strong className="text-green-700">{currentSubject}</strong>
              </p>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date of Class
                </label>
                <input
                  type="date"
                  required
                  value={manualEntryData.date}
                  onChange={(e) =>
                    setManualEntryData({ ...manualEntryData, date: e.target.value })
                  }
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                />
              </div>
              <div className="flex items-center gap-8">
                <label className="block text-sm font-medium text-gray-700">Status</label>
                <div className="flex gap-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="Present"
                      checked={manualEntryData.status === 'Present'}
                      onChange={(e) =>
                        setManualEntryData({ ...manualEntryData, status: e.target.value })
                      }
                      className="form-radio h-4 w-4 text-green-600"
                    />
                    <span className="ml-2">Present</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="Absent"
                      checked={manualEntryData.status === 'Absent'}
                      onChange={(e) =>
                        setManualEntryData({ ...manualEntryData, status: e.target.value })
                      }
                      className="form-radio h-4 w-4 text-red-600"
                    />
                    <span className="ml-2">Absent</span>
                  </label>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Reason (Required)
                </label>
                <textarea
                  required
                  value={manualEntryData.reason}
                  onChange={(e) =>
                    setManualEntryData({ ...manualEntryData, reason: e.target.value })
                  }
                  rows={3}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                />
              </div>
            </div>
            <div className="flex justify-end gap-4 mt-8 pt-4 border-t">
              <button
                type="button"
                onClick={() => setIsManualEntryModalOpen(false)}
                className="px-5 py-2 rounded-lg bg-gray-200 text-gray-800 font-semibold hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!manualEntryData.reason}
                className="px-5 py-2 rounded-lg bg-green-600 text-white font-semibold hover:bg-green-700 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-green-600"
              >
                Submit Entry
              </button>
            </div>
          </form>
        </div>
      )}

      {isAttendanceModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg p-6 w-96">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Select Attendance Constraints</h2>
              <button onClick={() => setIsAttendanceModalOpen(false)}>
                <X size={20} className="text-gray-600 hover:text-black" />
              </button>
            </div>
            <div className="space-y-3 mb-6">
              {['Face', 'Biometrics', 'Location'].map((constraint) => (
                <label key={constraint} className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedConstraints.includes(constraint)}
                    onChange={() => toggleConstraint(constraint)}
                    className="w-4 h-4 text-green-600"
                  />
                  <span className="text-gray-700">{constraint}</span>
                </label>
              ))}
            </div>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setIsAttendanceModalOpen(false)}
                className="px-4 py-2 rounded-lg bg-gray-300 hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={handleContinueAttendance}
                className="px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700"
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      )}

      <aside className="w-64 bg-green-700 text-white flex flex-col p-6">
        <h2 className="text-2xl font-bold mb-8">Teacher Dashboard</h2>
        <nav className="flex-1 space-y-4">
          <button
            onClick={() => setActiveView('overview')}
            className={`flex items-center gap-2 p-2 rounded w-full text-left ${
              activeView === 'overview' ? 'bg-green-600' : 'hover:bg-green-600'
            }`}
          >
            <ClipboardList className="w-5 h-5" /> Classes
          </button>
          <button
            onClick={() => setActiveView('students')}
            className={`flex items-center gap-2 p-2 rounded w-full text-left ${
              activeView === 'students' ? 'bg-green-600' : 'hover:bg-green-600'
            }`}
          >
            <Users className="w-5 h-5" /> Students
          </button>
          <button
            onClick={() => setActiveView('calendar')}
            className={`flex items-center gap-2 p-2 rounded w-full text-left ${
              activeView === 'calendar' ? 'bg-green-600' : 'hover:bg-green-600'
            }`}
          >
            <CalendarIcon className="w-5 h-5" /> Class Calendar
          </button>
          <button
            onClick={() => setActiveView('leave')}
            className={`relative flex items-center gap-2 p-2 rounded w-full text-left ${
              activeView === 'leave' ? 'bg-green-600' : 'hover:bg-green-600'
            }`}
          >
            <MailCheck className="w-5 h-5" /> Leave Requests
            {pendingLeaveCount > 0 && (
              <span className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold">
                {pendingLeaveCount}
              </span>
            )}
          </button>
        </nav>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 bg-red-500 px-3 py-2 rounded hover:bg-red-600"
        >
          <LogOut className="w-5 h-5" /> Logout
        </button>
      </aside>
      <main className="flex-1 p-8">
        <h1 className="text-3xl font-bold mb-6">Welcome, Teacher</h1>
        <ActiveViewComponent />
      </main>
    </div>
  );
}
