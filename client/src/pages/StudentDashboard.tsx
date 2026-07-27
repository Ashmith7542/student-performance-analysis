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
  FileText,
  BarChart3,
  BookOpen,
  TrendingUp,
  ArrowRight,
  Loader2,
} from "lucide-react";
import { useLocation } from "wouter";
import { fetchStudents, predictPerformance, type Student, type PredictionResult } from "@/lib/api";

const functionalCards = [
  { id: "timetable", title: "Timetable", description: "View your weekly class schedule", icon: Calendar, path: "/student/timetable" },
  { id: "permissions", title: "Permissions", description: "Apply for leave or permissions", icon: Lock, path: "/student/permissions" },
  { id: "marks", title: "Marks", description: "Check your internal and external marks", icon: FileText, path: "/student/marks" },
  { id: "results", title: "Results", description: "View your semester results", icon: BarChart3, path: "/student/results" },
  { id: "performance", title: "Performance", description: "Analyze your academic performance", icon: TrendingUp, path: "/student/performance" },
  { id: "notes", title: "Notes", description: "Download study materials and notes", icon: BookOpen, path: "/student/notes" },
];

export default function StudentDashboard() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [studentData, setStudentData] = useState<Student | null>(null);
  const [prediction, setPrediction] = useState<PredictionResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStudentData();
  }, [user]);

  const loadStudentData = async () => {
    try {
      setLoading(true);
      // Find the student record that matches the logged-in user's email
      const res = await fetchStudents();
      const matched = res.data.students.find(
        (s) => s.email.toLowerCase() === user?.email?.toLowerCase()
      );

      if (matched) {
        setStudentData(matched);
        // Run prediction for this student
        const pred = await predictPerformance({
          attendance: matched.attendance,
          studyHours: matched.studyHours,
          previousScores: matched.previousScores,
          age: matched.age,
          studentId: matched.id,
        });
        setPrediction(pred.data);
      }
    } catch (err) {
      // Silently fail - user may not have a student record yet
    } finally {
      setLoading(false);
    }
  };

  const attendanceData = studentData
    ? [
        { name: "Present", value: Math.round(studentData.attendance), color: "#3B82F6" },
        { name: "Absent", value: Math.round(100 - studentData.attendance), color: "#EF4444" },
      ]
    : [
        { name: "Present", value: 75, color: "#3B82F6" },
        { name: "Absent", value: 25, color: "#EF4444" },
      ];

  const performanceData = prediction
    ? [
        { subject: "Attendance", score: Math.round(prediction.breakdown.attendance_contribution * (100 / 30)) },
        { subject: "Study Hours", score: Math.round(prediction.breakdown.study_hours_contribution * (100 / 25)) },
        { subject: "Prev. Scores", score: Math.round(prediction.breakdown.previous_scores_contribution * (100 / 35)) },
        { subject: "Overall", score: Math.round(prediction.score) },
      ]
    : [
        { subject: "Attendance", score: 0 },
        { subject: "Study Hours", score: 0 },
        { subject: "Prev. Scores", score: 0 },
        { subject: "Overall", score: 0 },
      ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-6">
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Welcome, {user?.name?.split(" ")[0]} 👋
        </h1>
        <p className="text-muted-foreground">
          Here's your academic overview for this semester
        </p>
      </div>

      {/* Top Section - User Details & Attendance */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* User Details Card */}
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
              <p className="text-sm text-muted-foreground mb-1">Class</p>
              <p className="text-lg font-semibold text-foreground">{user?.class || studentData?.class || "—"}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Study Hours/day</p>
              <p className="text-lg font-semibold text-foreground">
                {studentData ? `${studentData.studyHours}h` : "—"}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Email</p>
              <p className="text-lg font-semibold text-foreground text-blue-600">{user?.email}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Roll Number</p>
              <p className="text-lg font-semibold text-foreground">{user?.rollNumber || "—"}</p>
            </div>
            {prediction && (
              <div>
                <p className="text-sm text-muted-foreground mb-1">Predicted Grade</p>
                <p className="text-lg font-bold text-green-600">{prediction.grade} ({prediction.score.toFixed(1)}%)</p>
              </div>
            )}
          </div>
        </Card>

        {/* Attendance Card */}
        <Card className="p-6 shadow-md">
          <h2 className="text-lg font-bold text-foreground mb-2">Attendance</h2>
          {loading ? (
            <div className="flex items-center justify-center h-48">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie
                    data={attendanceData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {attendanceData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="mt-2 space-y-2">
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
            </>
          )}
        </Card>
      </div>

      {/* Performance Chart */}
      <Card className="p-6 shadow-md mb-8">
        <h2 className="text-lg font-bold text-foreground mb-6">
          Performance Breakdown
          {!studentData && !loading && (
            <span className="text-sm font-normal text-muted-foreground ml-2">(No student record linked yet)</span>
          )}
        </h2>
        {loading ? (
          <div className="flex items-center justify-center h-48">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={performanceData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="subject" stroke="#6B7280" />
              <YAxis stroke="#6B7280" domain={[0, 100]} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#FFFFFF",
                  border: "1px solid #E5E7EB",
                  borderRadius: "8px",
                }}
              />
              <Bar dataKey="score" fill="#3B82F6" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </Card>

      {/* Functional Cards Grid */}
      <div>
        <h2 className="text-lg font-bold text-foreground mb-6">Quick Access</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {functionalCards.map((card) => {
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
                <Button
                  variant="ghost"
                  className="text-blue-600 hover:text-blue-700 p-0 flex items-center gap-2"
                >
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
