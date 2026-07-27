import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Download, TrendingUp, Loader2 } from "lucide-react";
import { fetchStudents, predictPerformance, type Student, type PredictionResult } from "@/lib/api";

interface StudentWithPrediction extends Student {
  prediction?: PredictionResult;
  trend: "up" | "down" | "stable";
}

export default function TeacherStudentTracking() {
  const [students, setStudents] = useState<StudentWithPrediction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadStudents();
  }, []);

  const loadStudents = async () => {
    try {
      setLoading(true);
      const res = await fetchStudents();
      const studentsData = res.data.students;

      // Run predictions for each student
      const withPredictions: StudentWithPrediction[] = await Promise.all(
        studentsData.map(async (s) => {
          try {
            const pred = await predictPerformance({
              attendance: s.attendance,
              studyHours: s.studyHours,
              previousScores: s.previousScores,
              age: s.age,
            });
            return {
              ...s,
              prediction: pred.data,
              trend: pred.data.score >= 80 ? "up" : pred.data.score >= 60 ? "stable" : "down",
            };
          } catch {
            return { ...s, trend: "stable" as const };
          }
        })
      );

      setStudents(withPredictions);
    } catch (err: any) {
      setError(err.message || "Failed to load students");
    } finally {
      setLoading(false);
    }
  };

  // Compute summary stats
  const totalStudents = students.length;
  const avgScore = totalStudents > 0
    ? (students.reduce((sum, s) => sum + (s.prediction?.score || 0), 0) / totalStudents).toFixed(1)
    : "0";
  const avgAttendance = totalStudents > 0
    ? (students.reduce((sum, s) => sum + s.attendance, 0) / totalStudents).toFixed(0)
    : "0";
  const topPerformer = students.length > 0
    ? students.reduce((best, s) => (s.prediction?.score || 0) > (best.prediction?.score || 0) ? s : best, students[0])
    : null;

  // Performance distribution
  const classPerformanceData = [
    { name: "Excellent (80+)", count: students.filter(s => (s.prediction?.score || 0) >= 80).length },
    { name: "Good (60-79)", count: students.filter(s => { const sc = s.prediction?.score || 0; return sc >= 60 && sc < 80; }).length },
    { name: "Average (40-59)", count: students.filter(s => { const sc = s.prediction?.score || 0; return sc >= 40 && sc < 60; }).length },
    { name: "Below 40", count: students.filter(s => (s.prediction?.score || 0) < 40).length },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-6 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-10 h-10 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-muted-foreground">Loading student data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-6">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Student Performance Tracking</h1>
          <p className="text-muted-foreground">Monitor and analyze class performance</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2">
          <Download className="w-4 h-4" />
          Export Report
        </Button>
      </div>

      {error && (
        <Card className="p-4 mb-6 border-red-200 bg-red-50">
          <p className="text-red-700">{error}</p>
        </Card>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card className="p-6 shadow-md">
          <p className="text-sm text-muted-foreground mb-2">Total Students</p>
          <p className="text-3xl font-bold text-foreground">{totalStudents}</p>
        </Card>
        <Card className="p-6 shadow-md">
          <p className="text-sm text-muted-foreground mb-2">Avg Predicted Score</p>
          <p className="text-3xl font-bold text-blue-600">{avgScore}%</p>
        </Card>
        <Card className="p-6 shadow-md">
          <p className="text-sm text-muted-foreground mb-2">Avg Attendance</p>
          <p className="text-3xl font-bold text-green-600">{avgAttendance}%</p>
        </Card>
        <Card className="p-6 shadow-md">
          <p className="text-sm text-muted-foreground mb-2">Top Performer</p>
          <p className="text-lg font-bold text-foreground">{topPerformer?.name || "N/A"}</p>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Performance Distribution */}
        <Card className="p-6 shadow-md">
          <h2 className="text-lg font-bold text-foreground mb-6">Performance Distribution</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={classPerformanceData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="name" stroke="#6B7280" angle={-45} textAnchor="end" height={80} />
              <YAxis stroke="#6B7280" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#FFFFFF",
                  border: "1px solid #E5E7EB",
                  borderRadius: "8px",
                }}
              />
              <Bar dataKey="count" fill="#3B82F6" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Student Scores Bar Chart */}
        <Card className="p-6 shadow-md">
          <h2 className="text-lg font-bold text-foreground mb-6">Individual Predicted Scores</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={students.map(s => ({ name: s.name.split(" ")[0], score: s.prediction?.score || 0, attendance: s.attendance }))}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="name" stroke="#6B7280" />
              <YAxis stroke="#6B7280" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#FFFFFF",
                  border: "1px solid #E5E7EB",
                  borderRadius: "8px",
                }}
              />
              <Legend />
              <Bar dataKey="score" fill="#3B82F6" name="Predicted Score" radius={[8, 8, 0, 0]} />
              <Bar dataKey="attendance" fill="#10B981" name="Attendance" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Student Performance Table */}
      <Card className="p-6 shadow-md">
        <h2 className="text-lg font-bold text-foreground mb-6">Individual Student Performance</h2>
        {students.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">No students found. Add students from the Students section.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 font-semibold text-foreground">Student Name</th>
                  <th className="text-center py-3 px-4 font-semibold text-foreground">Predicted Score</th>
                  <th className="text-center py-3 px-4 font-semibold text-foreground">Grade</th>
                  <th className="text-center py-3 px-4 font-semibold text-foreground">Attendance</th>
                  <th className="text-center py-3 px-4 font-semibold text-foreground">Trend</th>
                </tr>
              </thead>
              <tbody>
                {students.map((student, idx) => (
                  <tr
                    key={student.id || idx}
                    className="border-b border-border hover:bg-blue-50 transition-colors"
                  >
                    <td className="py-4 px-4 text-foreground font-medium">{student.name}</td>
                    <td className="py-4 px-4 text-center">
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
                          (student.prediction?.score || 0) >= 80
                            ? "bg-green-100 text-green-700"
                            : (student.prediction?.score || 0) >= 60
                            ? "bg-blue-100 text-blue-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {student.prediction?.score?.toFixed(1) || "N/A"}%
                      </span>
                    </td>
                    <td className="py-4 px-4 text-center font-bold text-foreground">
                      {student.prediction?.grade || "N/A"}
                    </td>
                    <td className="py-4 px-4 text-center text-foreground">{student.attendance}%</td>
                    <td className="py-4 px-4 text-center">
                      <div className="flex items-center justify-center">
                        {student.trend === "up" && (
                          <TrendingUp className="w-5 h-5 text-green-600" />
                        )}
                        {student.trend === "down" && (
                          <TrendingUp className="w-5 h-5 text-red-600 rotate-180" />
                        )}
                        {student.trend === "stable" && (
                          <div className="w-5 h-5 text-gray-600">—</div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
