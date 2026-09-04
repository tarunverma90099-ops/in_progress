'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
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
  lastAttendance?: {
    subject: string;
    year: string;
    branch: string;
    timestamp: string;
  };
}

export default function FacultyProfile() {
  const { id } = useParams();
  const router = useRouter();

  const [selectedFaculty, setSelectedFaculty] = useState<FacultyData | null>(null);
  const [loading, setLoading] = useState(true);
  const [newSubject, setNewSubject] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isRemoveModalOpen, setIsRemoveModalOpen] = useState(false);

  useEffect(() => {
    fetchFaculty();
  }, [id]);

  const fetchFaculty = async () => {
    try {
      const result = await facultyAPI.getById(id as string);
      if (result.success) {
        setSelectedFaculty(result.faculty);
      }
    } catch (error) {
      console.error('Error fetching faculty:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen text-xl">
        Loading...
      </div>
    );
  }

  if (!selectedFaculty) {
    return (
      <div className="flex justify-center items-center h-screen text-xl">
        Faculty not found.
      </div>
    );
  }

  // Add new subject
  const handleAddSubject = async () => {
    if (newSubject.trim() === '') return;
    try {
      const updatedSubjects = [...(selectedFaculty.subjects || []), newSubject];
      await facultyAPI.update(selectedFaculty._id, { subjects: updatedSubjects });
      setSelectedFaculty({ ...selectedFaculty, subjects: updatedSubjects });
      setNewSubject('');
      setIsModalOpen(false);
    } catch (error) {
      console.error('Error adding subject:', error);
    }
  };

  // Remove subject by index
  const handleRemoveSubject = async (index: number) => {
    try {
      const updatedSubjects = selectedFaculty.subjects.filter((_, i) => i !== index);
      await facultyAPI.update(selectedFaculty._id, { subjects: updatedSubjects });
      setSelectedFaculty({ ...selectedFaculty, subjects: updatedSubjects });
    } catch (error) {
      console.error('Error removing subject:', error);
    }
  };

  // Remove entire faculty
  const handleRemoveFaculty = async () => {
    try {
      await facultyAPI.delete(selectedFaculty._id);
      router.push('/college');
    } catch (error) {
      console.error('Error removing faculty:', error);
    }
  };

  // Toggle status
  const handleToggleStatus = async () => {
    try {
      const newStatus = selectedFaculty.status === 'active' ? 'leave' : 'active';
      await facultyAPI.update(selectedFaculty._id, { status: newStatus });
      setSelectedFaculty({ ...selectedFaculty, status: newStatus });
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <button
        onClick={() => router.back()}
        className="flex items-center p-5 gap-2 bg-gray-400 text-white rounded-lg hover:bg-gray-500 transition"
      >
        Go Back to Dashboard
      </button>

      <div className="max-w-3xl mx-auto bg-white shadow-lg rounded-2xl p-8 mt-6">
        {/* Faculty Info */}
        <div className="flex flex-col items-center">
          <img
            src={selectedFaculty.photo}
            alt={selectedFaculty.name}
            className="w-32 h-32 rounded-full mb-4 object-cover"
          />
          <h1 className="text-2xl font-bold">{selectedFaculty.name}</h1>
          <p className="text-gray-600">{selectedFaculty.department}</p>
          <p className="text-gray-500">{selectedFaculty.email}</p>

          {/* Status row */}
          <div className="flex items-center mt-3">
            <button
              onClick={handleToggleStatus}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                selectedFaculty.status === 'active'
                  ? 'bg-green-500 text-white hover:bg-green-600'
                  : 'bg-red-500 text-white hover:bg-red-600'
              }`}
            >
              {selectedFaculty.status === 'active' ? 'Active' : 'On Leave'}
            </button>
          </div>
        </div>

        {/* Subjects Section */}
        <div className="mt-6">
          <h2 className="text-xl font-semibold mb-4">
            Subjects in {new Date().getFullYear()}
          </h2>
          <ul className="space-y-2 text-gray-700">
            {selectedFaculty.subjects?.length > 0 ? (
              selectedFaculty.subjects.map((sub, index) => (
                <li
                  key={index}
                  className="flex justify-between items-center bg-gray-50 px-3 py-2 rounded-lg shadow-sm"
                >
                  <span>{sub}</span>
                  <button
                    onClick={() => handleRemoveSubject(index)}
                    className="ml-6 px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600"
                  >
                    Remove
                  </button>
                </li>
              ))
            ) : (
              <p>No subjects added yet.</p>
            )}
          </ul>

          {/* Center Add Button */}
          <div className="mt-6 flex justify-center">
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              Add Subject
            </button>
          </div>
        </div>

        {/* Attendance Section */}
        <div className="mt-6">
          <h2 className="text-xl font-semibold mb-2">Attendance Overview</h2>
          <p className="text-gray-700">
            Overall Student Attendance: {selectedFaculty.attendance || 'N/A'}
          </p>
        </div>

        {/* Last Attendance Section */}
        {selectedFaculty.lastAttendance && (
          <div className="mt-8 p-4 bg-gray-50 rounded-lg shadow-sm">
            <h2 className="text-lg font-semibold mb-2">Last Attendance Taken</h2>
            <p className="text-gray-700">
              <span className="font-medium">Subject:</span>{' '}
              {selectedFaculty.lastAttendance.subject}
            </p>
            <p className="text-gray-700">
              <span className="font-medium">Year:</span> {selectedFaculty.lastAttendance.year}
            </p>
            <p className="text-gray-700">
              <span className="font-medium">Branch:</span>{' '}
              {selectedFaculty.lastAttendance.branch}
            </p>
            <p className="text-gray-700">
              <span className="font-medium">Timestamp:</span>{' '}
              {selectedFaculty.lastAttendance.timestamp}
            </p>
          </div>
        )}

        {/* Remove Faculty Button */}
        <div className="mt-8 flex justify-center">
          <button
            onClick={() => setIsRemoveModalOpen(true)}
            className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Remove Faculty
          </button>
        </div>
      </div>

      {/* Add Subject Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-96">
            <h2 className="text-lg font-semibold mb-4">Add New Subject</h2>
            <input
              type="text"
              value={newSubject}
              onChange={(e) => setNewSubject(e.target.value)}
              placeholder="Enter subject name"
              className="w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 mb-4"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 bg-gray-400 text-white rounded-lg hover:bg-gray-500"
              >
                Cancel
              </button>
              <button
                onClick={handleAddSubject}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              >
                Add
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Remove Faculty Confirmation Modal */}
      {isRemoveModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-96">
            <h2 className="text-lg font-semibold mb-4 text-red-600">
              This action cannot be undone. Proceed?
            </h2>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setIsRemoveModalOpen(false)}
                className="px-4 py-2 bg-gray-400 text-white rounded-lg hover:bg-gray-500"
              >
                No
              </button>
              <button
                onClick={handleRemoveFaculty}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Yes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
