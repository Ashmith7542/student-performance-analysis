// Centralized API client for Flask backend
const API_BASE = "/api";

function getAuthHeaders(): Record<string, string> {
  const token = localStorage.getItem("token");
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
}

interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data: T;
}

async function apiRequest<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      ...getAuthHeaders(),
      ...(options.headers || {}),
    },
  });
  const data: ApiResponse<T> = await res.json();
  if (!data.success) {
    throw new Error(data.message || "API request failed");
  }
  return data;
}

// ── Auth ──────────────────────────────────────────────

export async function loginUser(email: string, password: string, role: string) {
  return apiRequest<{ token: string; user: any }>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password, role }),
  });
}

export async function registerUser(userData: any) {
  return apiRequest<{ token: string; user: any }>("/auth/register", {
    method: "POST",
    body: JSON.stringify(userData),
  });
}

export async function fetchCurrentUser() {
  return apiRequest<any>("/auth/me");
}

// ── Students ─────────────────────────────────────────

export interface Student {
  id: string;
  name: string;
  age: number;
  gender: string;
  studyHours: number;
  attendance: number;
  previousScores: number[];
  class: string;
  email: string;
  created_at: string;
}

export async function fetchStudents(classFilter?: string) {
  const query = classFilter ? `?class=${encodeURIComponent(classFilter)}` : "";
  return apiRequest<{ students: Student[] }>(`/students${query}`);
}

export async function fetchStudent(id: string) {
  return apiRequest<{ student: Student }>(`/students/${id}`);
}

export async function createStudent(student: Omit<Student, "id" | "created_at">) {
  return apiRequest<{ student: Student }>("/students", {
    method: "POST",
    body: JSON.stringify(student),
  });
}

export async function updateStudent(id: string, fields: Partial<Student>) {
  return apiRequest<{ student: Student }>(`/students/${id}`, {
    method: "PUT",
    body: JSON.stringify(fields),
  });
}

export async function deleteStudent(id: string) {
  return apiRequest(`/students/${id}`, {
    method: "DELETE",
  });
}

// ── Predictions ──────────────────────────────────────

export interface PredictionInput {
  attendance: number;
  studyHours: number;
  previousScores: number[];
  age: number;
  studentId?: string;
}

export interface PredictionResult {
  score: number;
  grade: string;
  breakdown: {
    attendance_contribution: number;
    study_hours_contribution: number;
    previous_scores_contribution: number;
    age_contribution: number;
  };
}

export interface PredictionHistory {
  id: string;
  student_id: string;
  prediction: PredictionResult;
  created_at: string;
}

export async function predictPerformance(input: PredictionInput) {
  return apiRequest<PredictionResult>("/predict", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function fetchPredictionHistory() {
  return apiRequest<{ predictions: PredictionHistory[] }>("/predict/history");
}

// ── Attendance ───────────────────────────────────────

export async function fetchAttendance(studentId?: string) {
  const query = studentId ? `?student_id=${studentId}` : "";
  return apiRequest<{ records: any[] }>(`/attendance${query}`);
}

export async function markAttendance(records: { student_id: string; status: string; date: string }[]) {
  return apiRequest("/attendance", {
    method: "POST",
    body: JSON.stringify({ records }),
  });
}

// ── Notes ────────────────────────────────────────────

export async function fetchNotes(subject?: string) {
  const query = subject ? `?subject=${encodeURIComponent(subject)}` : "";
  return apiRequest<{ notes: any[] }>(`/notes${query}`);
}

export async function uploadNote(noteData: { title: string; subject: string; description: string; file_url: string; department?: string }) {
  return apiRequest("/notes", {
    method: "POST",
    body: JSON.stringify(noteData),
  });
}

// ── Permissions ──────────────────────────────────────

export async function fetchPermissions() {
  return apiRequest<{ permissions: any[] }>("/permissions");
}

export async function requestPermission(permData: { type: string; reason: string; date: string; student_name: string; teacher_name: string }) {
  return apiRequest("/permissions", {
    method: "POST",
    body: JSON.stringify(permData),
  });
}

export async function updatePermissionStatus(id: string, status: "approved" | "rejected") {
  return apiRequest(`/permissions/${id}/status`, {
    method: "PUT",
    body: JSON.stringify({ status }),
  });
}

// ── Timetable ────────────────────────────────────────

export async function fetchTimetable(params?: { role?: string; class_name?: string; teacher_id?: string }) {
  const queryParts = [];
  if (params?.role) queryParts.push(`role=${encodeURIComponent(params.role)}`);
  if (params?.class_name) queryParts.push(`class_name=${encodeURIComponent(params.class_name)}`);
  if (params?.teacher_id) queryParts.push(`teacher_id=${encodeURIComponent(params.teacher_id)}`);
  
  const query = queryParts.length > 0 ? `?${queryParts.join("&")}` : "";
  return apiRequest<{ timetables: any[] }>(`/timetable${query}`);
}

export async function createTimetable(data: { role: string; class_name?: string; teacher_id?: string; day: string; subject: string; time: string; room: string }) {
  return apiRequest("/timetable", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

// ── Health ───────────────────────────────────────────

export async function checkHealth() {
  return apiRequest<{ status: string; database: string }>("/health");
}
