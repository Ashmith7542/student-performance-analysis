import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import {
  Calendar,
  Lock,
  Users,
  Upload,
  TrendingUp,
  ArrowRight,
  Loader2,
} from "lucide-react";
import { useLocation } from "wouter";
import { fetchStudents, predictPerformance, type Student } from "@/lib/api";

const teacherFunctionalCards = [
  { id: "timetable", title: "Timetable", description: "View your class schedule", icon: Calendar, path: "/teacher/timetable" },
  { id: "attendance", title: "Attendance", description: "Mark and track attendance", icon: Users, path: "/teacher/attendance" },
  { id: "upload-marks", title: "Upload Marks", description: "Submit student marks", icon: Upload, path: "/teacher/upload-marks" },
  { id: "upload-notes", title: "Upload Notes", description: "Share study materials", icon: Upload, path: "/teacher/upload-notes" },
  { id: "permissions", title: "Permissions", description: "Manage student requests", icon: Lock, path: "/teacher/permissions" },
  { id: "tracking", title: "Student Tracking", description: "Monitor class performance", icon: TrendingUp, path: "/teacher/student-tracking" },
];

export default function TeacherDashboard() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();

  const [students, setStudents] = useState<Student[]>([]);
  const [predictions, setPredictions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const res = await fetchStudents();
      const studentsData = res.data.students;
      setStudents(studentsData);

      // Run predictions for all to build charts
      const preds = await Promise.all(
        studentsData.map(async (s: Student) => {
          try {
            const pred = await predictPerformance({
              attendance: s.attendance,
              studyHours: s.studyHours,
              previousScores: s.previousScores,
              age: s.age,
            });
            return { ...pred.data, studentName: s.name };
          } catch {
            return null;
          }
        })
      );
      setPredictions(preds.filter(Boolean));
    } catch {
      // fail silently
    } finally {
      setLoading(false);
    }
  };

  const avgAttendance = students.length > 0 
    ? students.reduce((sum, s) => sum + s.attendance, 0) / students.length 
    : 0;

  const attendanceData = [
    { name: "Present Avg", value: Math.round(avgAttendance), color: "#3B82F6" },
    { name: "Absent Avg", value: Math.round(100 - avgAttendance), color: "#EF4444" },
  ];

  // Distribution
  const excellent = predictions.filter((p) => p.score >= 80).length;
  const good = predictions.filter((p) => p.score >= 60 && p.score < 80).length;
  const average = predictions.filter((p) => p.score >= 40 && p.score < 60).length;
  const needsImprovement = predictions.filter((p) => p.score < 40).length;

  const classPerformanceData = [
    { name: "Excellent", value: excellent },
    { name: "Good", value: good },
    { name: "Average", value: average },
    { name: "Needs Improvement", value: needsImprovement },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-6 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-10 h-10 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-muted-foreground">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Welcome, Professor {user?.name?.split(" ")[1] || user?.name || ""} 👋
        </h1>
        <p className="text-muted-foreground">
          Manage your classes and monitor student performance
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <Card className="lg:col-span-2 p-6 shadow-md">
          <h2 className="text-lg font-bold text-foreground mb-6">Your Details</h2>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Name</p>
              <p className="text-lg font-semibold text-foreground">{user?.name}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Role</p>
              <p className="text-lg font-semibold text-foreground capitalize">{user?.role}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Subject</p>
              <p className="text-lg font-semibold text-foreground">{user?.subject || "—"}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Department</p>
              <p className="text-lg font-semibold text-foreground">{user?.department || "—"}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Total Students</p>
              <p className="text-lg font-semibold text-foreground">{students.length}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Email</p>
              <p className="text-lg font-semibold text-foreground text-blue-600">{user?.email}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Teacher ID / Roll No</p>
              <p className="text-lg font-semibold text-foreground">{user?.rollNumber || "—"}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6 shadow-md">
          <h2 className="text-lg font-bold text-foreground mb-6">Avg Class Attendance</h2>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={attendanceData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={2}
                dataKey="value"
              >
                {attendanceData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-4 space-y-2">
            {attendanceData.map((item) => (
              <div key={item.name} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-muted-foreground">{item.name}</span>
                </div>
                <span className="font-semibold text-foreground">{item.value}%</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card className="p-6 shadow-md">
          <h2 className="text-lg font-bold text-foreground mb-6">Class Performance Distribution</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={classPerformanceData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="name" stroke="#6B7280" angle={-45} textAnchor="end" height={80} />
              <YAxis stroke="#6B7280" />
              <Tooltip
                contentStyle={{ backgroundColor: "#FFFFFF", border: "1px solid #E5E7EB", borderRadius: "8px" }}
              />
              <Bar dataKey="value" fill="#3B82F6" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-6 shadow-md">
          <h2 className="text-lg font-bold text-foreground mb-6">Top Students (Predicted)</h2>
          {predictions.length > 0 ? (
            <div className="space-y-4">
              {[...predictions]
                .sort((a, b) => b.score - a.score)
                .slice(0, 5)
                .map((pred, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                        {idx + 1}
                      </div>
                      <div>
                        <p className="font-semibold text-foreground">{pred.studentName}</p>
                        <p className="text-xs text-muted-foreground">Score: {pred.score.toFixed(1)}%</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-green-600 font-bold">{pred.grade}</span>
                    </div>
                  </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-8">No predictions available</p>
          )}
        </Card>
      </div>

      <div>
        <h2 className="text-lg font-bold text-foreground mb-6">Quick Access</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {teacherFunctionalCards.map((card) => {
            const Icon = card.icon;
            return (
              <Card
                key={card.id}
                className="p-6 shadow-md hover:shadow-lg hover:scale-105 transition-all cursor-pointer"
                onClick={() => setLocation(card.path)}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <Icon className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
                <h3 className="text-lg font-bold text-foreground mb-2">{card.title}</h3>
                <p className="text-sm text-muted-foreground mb-4">{card.description}</p>
                <Button variant="ghost" className="text-blue-600 hover:text-blue-700 p-0 flex items-center gap-2">
                  Access <ArrowRight className="w-4 h-4" />
                </Button>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
