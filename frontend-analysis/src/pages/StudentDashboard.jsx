import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Calendar from 'react-calendar';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import {
  LogOut,
  LayoutDashboard,
  AlertTriangle,
  ShieldCheck,
  X,
  TrendingUp,
  Send,
  ClipboardCheck,
  Calculator,
  Calendar as CalendarIcon,
} from "lucide-react";

// --- MOCK DATA GENERATION ---
const subjects = ["mathematics", "env. chemistry", "pcs", "BEE", "engineering graphics"];
const subjectColors = { Mathematics: '#8884d8', "Env. Chemistry": '#82ca9d', PCS: '#ffc658', BEE: '#ff8042', "Engineering Graphics": '#0088FE' };

const generateInitialHistory = () => {
    const pcs = {};
    const startDate = new Date('2026-08-01');
    const endDate = new Date('2026-09-10'); // Generate data up to yesterday

    for (let d = startDate; d <= endDate; d.setDate(d.getDate() + 1)) {
        if (d.getDay() === 0 || d.getDay() === 6) continue; // Skip weekends

        const dateStr = d.toISOString().split('T')[0];
        pcs[dateStr] = {};
        subjects.forEach(subject => {
            const rand = Math.random();
            if (rand < 0.05) pcs[dateStr][subject] = 'Leave';
            else if (rand < 0.2) pcs[dateStr][subject] = 'Absent';
            else pcs[dateStr][subject] = 'Present';
        });
    }
    return pcs;
};

const initialAttendanceHistory = generateInitialHistory();

const initialLeaveRequests = [
    { subject: 'pcs', date: '2026-09-24', reason: 'Medical check-up.', status: 'Approved' },
    { subject: 'engineering graphics', date: '2026-09-26', reason: 'Family function.', status: 'Pending' },
];

// Helper components
const CircularProgress = ({ percentage }) => {
  const radius = 50;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;
  const color = percentage >= 75 ? "text-green-600" : "text-red-600";

  return (
    <div className="relative flex items-center justify-center w-32 h-32">
      <svg className="transform -rotate-90 w-full h-full">
        <circle cx="64" cy="64" r={radius} stroke="currentColor" strokeWidth="10" 
        fill="transparent" className="text-gray-200" />
        <circle cx="64" cy="64" r={radius} stroke="currentColor" strokeWidth="10" 
        fill="transparent" strokeDasharray={circumference} strokeDashoffset={offset} 
        className={`transition-all duration-500 ease-in-out ${color}`} />
      </svg>
      <span className={`absolute text-2xl font-bold ${color}`}>{percentage}%</span>
    </div>
  );
};

const AttendanceStatusModal = ({ isOpen, onClose, percentage }) => {
  if (!isOpen) return null;
  const isSafe = percentage >= 75;
  const statusColor = isSafe ? "text-green-600" : "text-red-600";
  const Icon = isSafe ? ShieldCheck : AlertTriangle;
  return (
    <div onClick={onClose} className="fixed inset-0 bg-black bg-opacity-50 flex items-center 
    justify-center z-50">
      <div onClick={(e) => e.stopPropagation()} className="bg-white rounded-2xl shadow-lg p-8 
      w-full max-w-md text-center relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
          <X size={24} />
        </button>
        <Icon size={48} className={`mx-auto mb-4 ${statusColor}`} />
        <h3 className={`text-2xl font-bold mb-2 ${statusColor}`}>{isSafe ? "Attendance Status: Safe" : 
         "Attendance Warning"}
        </h3>
        <p className="text-gray-600">{isSafe ? `Congratulations! Your overall attendance is ${percentage}%,
         which is above the required threshold.` : `Your overall attendance is ${percentage}%, 
         which is below the required 75%. Please attend classes regularly.`}
        </p>
        <button onClick={onClose} className="mt-6 bg-blue-700 text-white px-6 py-2 rounded-lg 
        hover:bg-blue-600">Got it
        </button>
      </div>
    </div>
  );
};

export default function StudentDashboard() {
  const [activeView, setActiveView] = useState("overview");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSimulatorModalOpen, setIsSimulatorModalOpen] = useState(false);
  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);
  const navigate = useNavigate();

  const [attendance] = useState([
    { subject: "Mathematics", attended: 18, total: 20 }, { subject: "env. chemistry", attended: 15, total: 20 },
    { subject: "pcs", attended: 10, total: 20 }, { subject: "BEE", attended: 20, total: 20 },
    { subject: "engineering graphics", attended: 12, total: 20 },
  ]);
  const [leaveRequests, setLeaveRequests] = useState(initialLeaveRequests);
  const [attendanceHistory, setAttendanceHistory] = useState(initialAttendanceHistory);
  const [selectedDate, setSelectedDate] = useState(new Date('2026-09-11'));

  const calculatePercentage = (attended, total) => total > 0 ? parseFloat(((attended / total) * 100).toFixed(1)) : 0;
  const calculateClassesNeeded = (attended, total) => {
    if (total === 0 || (attended / total) * 100 >= 75) return 0;
    return Math.ceil(3 * total - 4 * attended);
  };
  const overallPercentage = useMemo(() => {
    const totalAttended = attendance.reduce((sum, subj) => sum + subj.attended, 0);
    const totalClasses = attendance.reduce((sum, subj) => sum + subj.total, 0);
    return calculatePercentage(totalAttended, totalClasses);
  }, [attendance]);
  const handleLeaveSubmit = (newRequest) => {
    setLeaveRequests(prev => [newRequest, ...prev]); setIsLeaveModalOpen(false);
  };

  const renderOverview = () => (
    <div>
       <div className="mb-8 text-center">
        <button onClick={() => setIsSimulatorModalOpen(true)} className="bg-blue-600 text-white 
        font-bold px-8 py-4 rounded-xl shadow-lg hover:bg-blue-700 transition-transform transform 
        hover:scale-105 flex items-center gap-3 mx-auto text-lg">
          <Calculator size={24} /> Attendance Simulator
        </button>
      </div>
      <div className="bg-white shadow-lg rounded-2xl p-6 mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Overall Attendance</h2>
          <p className="text-gray-600">Your combined attendance across all subjects.</p>
        </div>

        <div className="flex items-center gap-4"><CircularProgress percentage={overallPercentage} />
        <button onClick={() => setIsModalOpen(true)} 
         className="text-gray-400 hover:text-blue-700">{overallPercentage < 75 ? 
         <AlertTriangle size={24} /> : <ShieldCheck size={24} />}
        </button>
        </div>
      </div>
      <h2 className="text-xl font-bold mb-4">Subject-wise Overview</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {attendance.map((subj, idx) => {
            const percentage = calculatePercentage(subj.attended, subj.total);
            const needsImprovement = percentage < 75;
            const classesNeeded = needsImprovement ? calculateClassesNeeded(subj.attended, subj.total) : 0;
            return (
              <div key={idx} className="bg-white shadow-lg rounded-2xl p-6 flex flex-col items-center">
                <h3 className="text-xl font-semibold mb-2">{subj.subject}</h3>
                <p className="text-gray-600">{subj.attended}/{subj.total} classes attended</p>
                <p className={`mt-3 text-lg font-bold ${needsImprovement ? "text-red-600" : 
                  "text-green-600"}`}>{percentage}%</p>
                {needsImprovement && (
                  <div className="mt-4 text-center text-xs bg-yellow-100 
                    text-yellow-800 p-2 rounded-lg flex items-center gap-2"><TrendingUp size={16}/>
                    <span>Attend the next <strong>{classesNeeded}</strong> class{classesNeeded > 1 ? 
                    'es' : ''} to reach 75%.</span>
                  </div>)}
              </div>
            )
        })}
      </div>
    </div>
  );

  const renderAttendanceCalendar = () => {
    const formatDate = (date) => date.toISOString().split('T')[0];
    const getTileContent = ({ date, view }) => {
        if (view === 'month') {
            const dateStr = formatDate(date);
            const dayData = attendanceHistory[dateStr];
            if (dayData) {
                const statuses = Object.values(dayData);
                const isLeave = statuses.includes('Leave');
                const isAbsent = statuses.includes('Absent');
                const isFullPresent = !isAbsent && !isLeave;
                if (isLeave) return <div className="h-2 w-2 mx-auto mt-1 bg-blue-500 rounded-full"></div>;
                if (isFullPresent) return <div className="h-2 w-2 mx-auto mt-1 bg-green-500 rounded-full"></div>;
                if (isAbsent) return <div className="h-2 w-2 mx-auto mt-1 bg-orange-500 rounded-full"></div>;
            }
        } return null;
    };
    const selectedDayData = attendanceHistory[formatDate(selectedDate)];

    return (
        <div className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                <div className="lg:col-span-2 bg-white shadow-lg rounded-2xl p-4">
                    <style>{`
                        .react-calendar { width: 100%; border: none; font-family: 'Inter', sans-serif; }
                        .react-calendar__navigation button { font-size: 1.2rem; font-weight: bold; }
                        .react-calendar__tile { font-size: 1rem; padding: 1.5em 0.5em; border-radius: 8px; transition: all 0.2s ease; }
                        .react-calendar__tile:hover { background: #f0f0f0; }
                        .react-calendar__tile--active { background: #2563eb !important; color: white !important; font-weight: bold; }
                        .react-calendar__tile--now { background: #dbeafe !important; font-weight: bold; }
                        .react-calendar__month-view__days__day--weekend { color: #ef4444; }
                    `}</style>
                    <Calendar onChange={setSelectedDate} value={selectedDate} tileContent={getTileContent} className="w-full border-0" />
                </div>
                <div className="bg-white shadow-lg rounded-2xl p-6">
                    <h3 className="text-xl font-bold mb-4">Details for <span className="text-orange-600">{selectedDate.toLocaleDateString('en-GB')}</span></h3>
                    {selectedDayData ? (
                        <ul className="space-y-3">
                            {Object.entries(selectedDayData).map(([subject, status]) => (
                                <li key={subject} className="flex justify-between items-center text-sm">
                                  <span className="font-semibold">{subject}</span>
                                  <span className={`font-bold px-2 py-1 rounded-full text-xs 
                                  ${status === 'Present' ? 'bg-green-100 text-green-800' :
                                     status === 'Absent' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'}`}>{status}
                                  </span>
                                </li>
                            ))}
                        </ul>
                    ) : <p className="text-gray-500 text-sm">No attendance data for this day.</p>}
                </div>
            </div>
            <WeeklyTrendChart pcs={attendanceHistory} />
        </div>
    )
  };

  const renderLeaveRequests = () => (
    <div>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Leave Requests</h2>
          
          <button onClick={() => setIsLeaveModalOpen(true)} className="bg-orange-600 text-white 
          font-bold px-4 py-2 rounded-lg hover:bg-orange-700 flex items-center gap-2">
            <Send size={16} /> Request New Leave
          </button>
        </div>
        <div className="bg-white shadow-lg rounded-2xl p-6">
            <table className="w-full text-left">
                <thead>
                  <tr className="border-b">
                    <th className="p-4">Subject</th>
                    <th className="p-4">Date</th>
                    <th className="p-4">Reason</th>
                    <th className="p-4">Status</th>
                  </tr>
                </thead>
                <tbody>{leaveRequests.map((req, idx) => (
                  <tr key={idx} 
                        className="border-b last:border-b-0">
                      <td className="p-4 
                        font-semibold">{req.subject}
                    </td>
                    <td className="p-4">{req.date}
                    </td>
                    <td className="p-4 text-sm text-gray-600">{req.reason}
                    </td>
                    <td className="p-4">
                      <span className={`font-bold px-2 py-1 
                        rounded-full text-xs ${req.status === 'Approved' ? 'bg-green-100 text-green-800' : 
                        req.status === 'Rejected' ? 'bg-red-100 text-red-800' : 
                        'bg-yellow-100 text-yellow-800'}`}>{req.status}
                      </span>
                    </td>
                  </tr>))}
                </tbody>
            </table>
        </div>
    </div>
  );
  const handleLogout = () => navigate("/");
  const ActiveViewComponent = () => {
    switch(activeView) {
        case 'overview': return renderOverview(); case 'attendance': return renderAttendanceCalendar(); case 'leave': return renderLeaveRequests(); default: return renderOverview();
    }
  }

  return (
    <div className="min-h-screen flex bg-gray-100">
      <AttendanceStatusModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}
       percentage={overallPercentage} />
      {isSimulatorModalOpen && <AttendanceSimulatorModal attendance={attendance} onClose={() => 
        setIsSimulatorModalOpen(false)} />}
      {isLeaveModalOpen && <LeaveRequestModal subjects={attendance.map(a => a.subject)}
       onSubmit={handleLeaveSubmit} onClose={() => setIsLeaveModalOpen(false)} />}
      <aside className="w-64 bg-orange-700 text-white flex flex-col p-6">
        <h2 className="text-2xl font-bold mb-8">Student Dashboard</h2>
        <nav className="flex-1 space-y-4">
          <button onClick={() => setActiveView("overview")} className={`flex items-center gap-2 
            p-2 rounded w-full text-left ${activeView === "overview" ? "bg-orange-600" : 
            "hover:bg-orange-600"}`}><LayoutDashboard className="w-5 h-5" /> Overview
          </button>
          <button onClick={() => setActiveView("attendance")} className={`flex items-center 
            gap-2 p-2 rounded w-full text-left ${activeView === "attendance" ? "bg-orange-600" : 
            "hover:bg-orange-600"}`}><CalendarIcon className="w-5 h-5" /> Attendance
          </button>
          <button onClick={() => setActiveView("leave")} className={`flex items-center gap-2 
            p-2 rounded w-full text-left ${activeView === "leave" ? "bg-orange-600" : 
            "hover:bg-orange-600"}`}><ClipboardCheck className="w-5 h-5" /> Leave Requests
          </button>
        </nav>
        <button onClick={handleLogout} className="flex items-center gap-2 bg-red-500 px-3 py-2 
          rounded hover:bg-red-600"><LogOut className="w-5 h-5" /> Logout
        </button>
      </aside>
      <main className="flex-1 p-8">
        <h1 className="text-3xl font-bold mb-6">Welcome, Student</h1>
        <ActiveViewComponent />
      </main>
    </div>
  );
}

const AttendanceSimulatorModal = ({ attendance, onClose }) => {
    const [plannedMisses, setPlannedMisses] = useState({});
    const calculateProjected = (subj, misses) => {
        const futureClasses = 5;
        const attended = subj.attended + (futureClasses - (misses || 0));
        const total = subj.total + futureClasses;
        return total > 0 ? parseFloat(((attended / total) * 100).toFixed(1)) : 0;
    };
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-2xl max-h-[90vh] flex 
            flex-col">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-2xl font-bold">Attendance Simulator</h2>
                  
                  <button onClick={onClose}><X size={24} />
                  </button>
                </div>
                <div className="overflow-y-auto">
                  <p className="text-gray-600 mb-6 text-sm">See how missing future classes 
                    will impact your attendance.</p>
                    <div className="space-y-4">
                    {attendance.map(subj => {
                        const projectedPercentage = calculateProjected(subj, plannedMisses[subj.subject]);
                        return (
                            <div key={subj.subject} className="grid grid-cols-3 items-center gap-4 p-4 
                              rounded-lg bg-gray-50 border">
                                <span className="font-semibold">{subj.subject}</span>
                                <div className="text-center">
                                  <label className="text-xs text-gray-500">Classes I'll miss (of 5):
                                  </label>
                                  <input type="number" min="0" max="5" defaultValue="0" 
                                  onChange={(e) => setPlannedMisses({...plannedMisses, [subj.subject]: 
                                  parseInt(e.target.value) || 0})} className="w-20 text-center 
                                  border-gray-300 rounded-md shadow-sm" />
                                </div>
                                <div className="text-right">
                                  <p className="text-xs text-gray-500">Projected Attendance</p>
                                  <p className={`text-2xl font-bold ${projectedPercentage < 75 ? 
                                    'text-red-500' : 'text-green-600'}`}>{projectedPercentage}%
                                  </p>
                                </div>
                            </div>
                        )
                    })}
                </div></div>
            </div>
        </div>
    )
}

const LeaveRequestModal = ({ subjects, onSubmit, onClose }) => {
    const [leaveData, setLeaveData] = useState({ subject: subjects[0], date: '', reason: '' });
    const handleSubmit = (e) => { e.preventDefault(); onSubmit({ ...leaveData, status: 'Pending' }); }
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-lg">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold">Request Leave of Absence</h2>
                  
                  <button type="button" onClick={onClose}><X size={24} />
                  </button>
                </div>
                <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Subject
                      </label>
                      <select value={leaveData.subject} onChange={
                        e => setLeaveData({...leaveData, subject: e.target.value})} 
                        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 
                        focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm 
                        rounded-md">{subjects.map(s => <option key={s}>{s}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Date of Absence</label>
                      <input type="date" required value={leaveData.date} onChange={
                        e => setLeaveData({...leaveData, date: e.target.value})} className="mt-1 
                        block w-full border-gray-300 rounded-md shadow-sm"/>
                    </div>
                    <div><label className="block text-sm font-medium text-gray-700">Reason</label>
                    <textarea required value={leaveData.reason} onChange={
                      e => setLeaveData({...leaveData, reason: e.target.value})} 
                      rows="3" className="mt-1 block w-full border-gray-300 rounded-md shadow-sm">
                    </textarea>
                    </div>
                </div>
                 <div className="flex justify-end gap-4 mt-8">
                    <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg 
                    bg-gray-200 hover:bg-gray-300">Cancel
                    </button>

                    <button type="submit" className="px-4 py-2 rounded-lg bg-blue-600 text-white
                    hover:bg-blue-700">Submit Request
                    </button>
                  </div>
            </form>
        </div>
    )
}

const WeeklyTrendChart = ({ pcs }) => {
    const last7DaysData = useMemo(() => {
        const data = [];
        const today = new Date('2025-09-25');
        for (let i = 6; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];
            const dayData = pcs[dateStr] || {};
            
            const entry = { name: date.toLocaleDateString('en-GB', { weekday: 'short' }) };
            subjects.forEach(subject => {
                entry[subject] = dayData[subject] === 'Present' ? 100 : (dayData[subject] === 'Leave' ? 50 : 0);
            });
            data.push(entry);
        }
        return data;
    }, [history]);
    
    return (
        <div className="bg-white shadow-lg rounded-2xl p-6">
            <h3 className="text-xl font-bold mb-4">Last 7 Days Attendance Trend</h3>
            <ResponsiveContainer width="100%" height={300}>
                <LineChart data={last7DaysData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis unit="%" />
                    <Tooltip />
                    <Legend />
                    {subjects.map(subject => (
                        <Line key={subject} type="monotone" dataKey={subject} stroke={subjectColors[subject]} strokeWidth={2} />
                    ))}
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
};