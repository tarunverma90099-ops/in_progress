'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { facultyAPI } from '@/lib/api';

interface FacultyData {
  _id: string;
  name: string;
  email: string;
  department: string;
  status: 'active' | 'leave';
  photo: string;
  subjects: string[];
  attendance: string;
}

export default function CollegeDashboard() {
  const router = useRouter();
  const { logout } = useAuth();

  const [faculty, setFaculty] = useState<FacultyData[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBy, setFilterBy] = useState('name');
  const [loading, setLoading] = useState(true);

  const fetchFaculty = useCallback(async () => {
    try {
      const result = await facultyAPI.getAll();
      if (result.success) {
        setFaculty(result.faculty);
      }
    } catch (error) {
      console.error('Error fetching faculty:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void Promise.resolve().then(() => fetchFaculty());
  }, [fetchFaculty]);

  // Stats
  const totalFaculty = faculty.length;
  const activeFaculty = faculty.filter((f) => f.status === 'active').length;
  const totalClassesToday = 12;

  // Mock last attendance
  const lastAttendance = {
    faculty: 'Dr. Sweta Choubey',
    yearBranch: '1st Year, CSE',
    subject: 'Environmental Chemistry',
    time: '10:30 AM',
  };

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const goToDetails = (id: string) => {
    router.push(`/college/faculty/${id}`);
  };

  const goToAddFaculty = () => {
    router.push('/college/add-faculty');
  };

  // Filter faculty
  const filteredFaculty = faculty.filter((prof) => {
    if (filterBy === 'name') {
      return prof.name.toLowerCase().includes(searchTerm.toLowerCase());
    } else if (filterBy === 'department') {
      return prof.department.toLowerCase().includes(searchTerm.toLowerCase());
    }
    return true;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading faculty data...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8 relative">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-center flex-1">Faculty Profiles</h1>
        <button
          onClick={goToAddFaculty}
          className="ml-4 px-4 py-2 bg-blue-500 text-white rounded-lg shadow hover:bg-blue-600 transition"
        >
          Add Faculty
        </button>
      </div>

      {/* Combined Stats Card */}
      <div className="bg-white shadow-md rounded-xl p-6 mb-8">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
          <div>
            <h2 className="text-lg font-semibold text-gray-600">Total Faculty</h2>
            <p className="text-3xl font-bold text-blue-600">{totalFaculty}</p>
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-600">Active Teachers Today</h2>
            <p className="text-3xl font-bold text-green-600">{activeFaculty}</p>
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-600">Total Classes Scheduled Today</h2>
            <p className="text-3xl font-bold text-purple-600">{totalClassesToday}</p>
          </div>
        </div>
      </div>

      {/* Last Attendance Card */}
      <div className="flex justify-center">
        <div className="bg-white shadow-md rounded-xl p-6 mb-10 w-full sm:w-2/3 lg:w-1/2 text-center">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Last Attendance Taken</h2>
          <p>
            <span className="font-semibold">Faculty:</span> {lastAttendance.faculty}
          </p>
          <p>
            <span className="font-semibold">Year & Branch:</span> {lastAttendance.yearBranch}
          </p>
          <p>
            <span className="font-semibold">Subject:</span> {lastAttendance.subject}
          </p>
          <p>
            <span className="font-semibold">Time:</span> {lastAttendance.time}
          </p>
        </div>
      </div>

      {/* Search Bar + Filters */}
      <div className="flex justify-center mb-6 gap-3">
        <input
          type="text"
          placeholder={`Search by ${filterBy}`}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full max-w-md px-4 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        <select
          value={filterBy}
          onChange={(e) => setFilterBy(e.target.value)}
          className="px-4 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
        >
          <option value="name">Faculty Name</option>
          <option value="department">Department</option>
        </select>
      </div>

      {/* Faculty Cards */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filteredFaculty.map((prof) => (
          <div
            key={prof._id}
            className="bg-white shadow-lg rounded-2xl p-6 flex flex-col items-center"
          >
            {/* eslint-disable-next-line @next/next/no-img-element -- faculty photo URLs are arbitrary user-supplied hosts */}
            <img
              src={prof.photo}
              alt={prof.name}
              className="w-24 h-24 rounded-full mb-4 object-cover"
            />
            <h2 className="text-xl font-semibold">{prof.name}</h2>
            <p className="text-gray-600">{prof.department}</p>
            <p className="text-sm text-gray-500">{prof.email}</p>
            <div className="flex items-center mt-3">
              <p
                className={`font-medium flex items-center gap-2 ${
                  prof.status === 'active' ? 'text-green-600' : 'text-red-600'
                }`}
              >
                <span
                  className={`w-3 h-3 rounded-full ${
                    prof.status === 'active' ? 'bg-green-500' : 'bg-red-500'
                  }`}
                ></span>
                Status: {prof.status === 'active' ? 'Active' : 'On Leave'}
              </p>
            </div>
            <button
              onClick={() => goToDetails(prof._id)}
              className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg shadow hover:bg-blue-600 transition"
            >
              Details
            </button>
          </div>
        ))}
      </div>

      {/* Logout Button */}
      <button
        onClick={handleLogout}
        className="fixed bottom-6 left-6 px-10 py-4 bg-red-500 text-white rounded-lg shadow-md hover:bg-red-600 transition"
      >
        Logout
      </button>
    </div>
  );
}
