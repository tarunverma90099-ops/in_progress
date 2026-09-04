const API_BASE = '/api';

interface FetchOptions {
  method?: string;
  body?: unknown;
  headers?: Record<string, string>;
}

async function apiRequest(endpoint: string, options: FetchOptions = {}) {
  const { method = 'GET', body, headers = {} } = options;

  const config: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
  };

  if (body) {
    config.body = JSON.stringify(body);
  }

  const response = await fetch(`${API_BASE}${endpoint}`, config);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'API request failed');
  }

  return data;
}

// Auth API
export const authAPI = {
  login: (email: string, password: string, role: string) =>
    apiRequest('/auth/login', {
      method: 'POST',
      body: { email, password, role },
    }),

  register: (userData: {
    email: string;
    password: string;
    name: string;
    role: string;
    rollNo?: string;
    department?: string;
  }) =>
    apiRequest('/auth/register', {
      method: 'POST',
      body: userData,
    }),
};

// Faculty API
export const facultyAPI = {
  getAll: (search?: string, filterBy?: string) => {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (filterBy) params.append('filterBy', filterBy);
    const query = params.toString();
    return apiRequest(`/faculty${query ? `?${query}` : ''}`);
  },

  getById: (id: string) => apiRequest(`/faculty/${id}`),

  create: (facultyData: {
    name: string;
    email: string;
    department: string;
    status?: string;
    photo?: string;
  }) =>
    apiRequest('/faculty', {
      method: 'POST',
      body: facultyData,
    }),

  update: (id: string, updates: Record<string, unknown>) =>
    apiRequest(`/faculty/${id}`, {
      method: 'PUT',
      body: updates,
    }),

  delete: (id: string) =>
    apiRequest(`/faculty/${id}`, {
      method: 'DELETE',
    }),
};

// Classes API
export const classesAPI = {
  getAll: (teacherId?: string) => {
    const params = teacherId ? `?teacherId=${teacherId}` : '';
    return apiRequest(`/classes${params}`);
  },

  getById: (id: string) => apiRequest(`/classes/${id}`),

  create: (classData: { name: string; teacherId: string; totalStudents?: number }) =>
    apiRequest('/classes', {
      method: 'POST',
      body: classData,
    }),

  update: (id: string, updates: Record<string, unknown>) =>
    apiRequest(`/classes/${id}`, {
      method: 'PUT',
      body: updates,
    }),

  delete: (id: string) =>
    apiRequest(`/classes/${id}`, {
      method: 'DELETE',
    }),
};

// Students API
export const studentsAPI = {
  getByClass: (classId: string) => apiRequest(`/students?classId=${classId}`),

  create: (studentData: {
    classId: string;
    name: string;
    rollNo: number;
    email?: string;
  }) =>
    apiRequest('/students', {
      method: 'POST',
      body: studentData,
    }),

  update: (id: string, updates: Record<string, unknown>) =>
    apiRequest(`/students/${id}`, {
      method: 'PUT',
      body: updates,
    }),

  delete: (id: string) =>
    apiRequest(`/students/${id}`, {
      method: 'DELETE',
    }),
};

// Attendance API
export const attendanceAPI = {
  get: (params: { studentId?: string; classId?: string; date?: string }) => {
    const queryParams = new URLSearchParams();
    if (params.studentId) queryParams.append('studentId', params.studentId);
    if (params.classId) queryParams.append('classId', params.classId);
    if (params.date) queryParams.append('date', params.date);
    return apiRequest(`/attendance?${queryParams.toString()}`);
  },

  mark: (data: {
    classId: string;
    date: string;
    attendanceData: { studentId: string; status: string }[];
  }) =>
    apiRequest('/attendance', {
      method: 'POST',
      body: data,
    }),
};

// Leave Requests API
export const leaveRequestsAPI = {
  getAll: (params: {
    studentId?: string;
    teacherId?: string;
    classId?: string;
    status?: string;
  }) => {
    const queryParams = new URLSearchParams();
    if (params.studentId) queryParams.append('studentId', params.studentId);
    if (params.teacherId) queryParams.append('teacherId', params.teacherId);
    if (params.classId) queryParams.append('classId', params.classId);
    if (params.status) queryParams.append('status', params.status);
    return apiRequest(`/leave-requests?${queryParams.toString()}`);
  },

  create: (requestData: {
    studentId: string;
    studentName: string;
    rollNo: number;
    subject: string;
    date: string;
    reason: string;
    classId: string;
    teacherId: string;
  }) =>
    apiRequest('/leave-requests', {
      method: 'POST',
      body: requestData,
    }),

  updateStatus: (id: string, status: string) =>
    apiRequest(`/leave-requests/${id}`, {
      method: 'PUT',
      body: { status },
    }),

  delete: (id: string) =>
    apiRequest(`/leave-requests/${id}`, {
      method: 'DELETE',
    }),
};

// Sessions API
export const sessionsAPI = {
  getAll: (params: { classId?: string; teacherId?: string }) => {
    const queryParams = new URLSearchParams();
    if (params.classId) queryParams.append('classId', params.classId);
    if (params.teacherId) queryParams.append('teacherId', params.teacherId);
    return apiRequest(`/sessions?${queryParams.toString()}`);
  },

  getById: (id: string) => apiRequest(`/sessions/${id}`),

  create: (sessionData: { classId: string; teacherId: string; duration?: number }) =>
    apiRequest('/sessions', {
      method: 'POST',
      body: sessionData,
    }),

  update: (id: string, updates: Record<string, unknown>) =>
    apiRequest(`/sessions/${id}`, {
      method: 'PUT',
      body: updates,
    }),

  delete: (id: string) =>
    apiRequest(`/sessions/${id}`, {
      method: 'DELETE',
    }),
};

// Seed API
export const seedAPI = {
  seed: () => apiRequest('/seed', { method: 'POST' }),
};
