'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { facultyAPI } from '@/lib/api';

export default function AddFacultyForm() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    department: '',
    status: 'active',
    photo: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await facultyAPI.create(formData);
      router.push('/college');
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to add faculty';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-8">
      <div className="bg-white shadow-lg rounded-2xl p-8 w-full max-w-md">
        <h2 className="text-2xl font-bold text-center mb-6">Add Faculty</h2>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-300 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium mb-1">Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          {/* Department */}
          <div>
            <label className="block text-sm font-medium mb-1">Department</label>
            <input
              type="text"
              name="department"
              value={formData.department}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium mb-1">Status</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              <option value="active">Active</option>
              <option value="leave">On Leave</option>
            </select>
          </div>

          {/* Photo URL */}
          <div>
            <label className="block text-sm font-medium mb-1">Photo URL (optional)</label>
            <input
              type="url"
              name="photo"
              value={formData.photo}
              onChange={handleChange}
              placeholder="https://..."
              className="w-full px-4 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg shadow hover:bg-blue-600 transition disabled:opacity-50"
          >
            {loading ? 'Adding Faculty...' : 'Add Faculty'}
          </button>
        </form>

        <button
          onClick={() => router.back()}
          className="mt-4 w-full bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 transition"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
