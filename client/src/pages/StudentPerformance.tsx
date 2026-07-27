import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
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
import { TrendingUp, AlertCircle, CheckCircle, Download, Loader2 } from "lucide-react";
import {
  fetchStudents,
  predictPerformance,
  fetchPredictionHistory,
  type Student,
  type PredictionResult,
  type PredictionHistory,
} from "@/lib/api";

export default function StudentPerformance() {
  const { user } = useAuth();
  const [studentData, setStudentData] = useState<Student | null>(null);
  const [prediction, setPrediction] = useState<PredictionResult | null>(null);
  const [history, setHistory] = useState<PredictionHistory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [user]);

  const loadData = async () => {
    try {
      setLoading(true);
      // Find student by email
      const res = await fetchStudents();
      const matched = res.data.students.find(
        (s) => s.email.toLowerCase() === user?.email?.toLowerCase()
      );

      if (matched) {
        setStudentData(matched);

        // Run fresh prediction
        const pred = await predictPerformance({
          attendance: matched.attendance,
          studyHours: matched.studyHours,
          previousScores: matched.previousScores,
          age: matched.age,
          studentId: matched.id,
        });
        setPrediction(pred.data);

        // Fetch prediction history
        const histRes = await fetchPredictionHistory();
        // Filter to this student's history
        const myHistory = histRes.data.predictions.filter(
          (p) => p.student_id === matched.id
        );
        setHistory(myHistory.slice(0, 5));
      }
    } catch (err) {
      // Silently fail
    } finally {
      setLoading(false);
    }
  };

  const breakdown = prediction?.breakdown;

  const performanceData = studentData
    ? [
        {
          subject: "Attendance",
          score: Math.round((breakdown?.attendance_contribution || 0) * (100 / 30)),
          target: 100,
        },
        {
          subject: "Study Hours",
          score: Math.round((breakdown?.study_hours_contribution || 0) * (100 / 25)),
          target: 100,
        },
        {
          subject: "Prev. Scores",
          score: Math.round((breakdown?.previous_scores_contribution || 0) * (100 / 35)),
          target: 100,
        },
      ]
    : [];

  const trendData = history.map((h, i) => ({
    month: `Run ${history.length - i}`,
    avg: Math.round(h.prediction?.score || 0),
  })).reverse();

  const insights = prediction
    ? [
        {
          type: "strength",
          title: "Predicted Score",
          description: `Your predicted score is ${prediction.score.toFixed(1)}% — Grade ${prediction.grade}`,
          icon: CheckCircle,
        },
        {
          type: "improvement",
          title: "Top Contributor",
          description: (() => {
            if (!breakdown) return "No data yet";
            const max = Math.max(
              breakdown.attendance_contribution,
              breakdown.study_hours_contribution,
              breakdown.previous_scores_contribution
            );
            if (max === breakdown.attendance_contribution) return `Attendance is your strongest factor (${breakdown.attendance_contribution.toFixed(1)} pts)`;
            if (max === breakdown.study_hours_contribution) return `Study hours are your strongest factor (${breakdown.study_hours_contribution.toFixed(1)} pts)`;
            return `Previous scores are your strongest factor (${breakdown.previous_scores_contribution.toFixed(1)} pts)`;
          })(),
          icon: AlertCircle,
        },
        {
          type: "trend",
          title: "Prediction History",
          description: history.length > 0
            ? `You have ${history.length} prediction record(s). Keep improving!`
            : "Run your first performance prediction now.",
          icon: TrendingUp,
        },
      ]
    : [];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-6 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-10 h-10 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-muted-foreground">Loading performance data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-6">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Performance Analytics</h1>
          <p className="text-muted-foreground">Analyze your academic performance and get insights</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2">
          <Download className="w-4 h-4" />
          Export Report
        </Button>
      </div>

      {!studentData && (
        <Card className="p-6 mb-8 border-yellow-200 bg-yellow-50">
          <p className="text-yellow-800 font-medium">No student record linked to your account yet.</p>
          <p className="text-yellow-700 text-sm mt-1">Ask your teacher to add you as a student to see your performance data.</p>
        </Card>
      )}

      {/* Prediction Summary */}
      {prediction && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="p-4 shadow-md text-center">
            <p className="text-sm text-muted-foreground mb-1">Predicted Score</p>
            <p className="text-3xl font-bold text-blue-600">{prediction.score.toFixed(1)}%</p>
          </Card>
          <Card className="p-4 shadow-md text-center">
            <p className="text-sm text-muted-foreground mb-1">Grade</p>
            <p className="text-3xl font-bold text-green-600">{prediction.grade}</p>
          </Card>
          <Card className="p-4 shadow-md text-center">
            <p className="text-sm text-muted-foreground mb-1">Attendance</p>
            <p className="text-3xl font-bold text-foreground">{studentData?.attendance}%</p>
          </Card>
          <Card className="p-4 shadow-md text-center">
            <p className="text-sm text-muted-foreground mb-1">Study Hours/day</p>
            <p className="text-3xl font-bold text-foreground">{studentData?.studyHours}h</p>
          </Card>
        </div>
      )}

      {/* Insights */}
      {insights.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {insights.map((insight, idx) => {
            const Icon = insight.icon;
            return (
              <Card key={idx} className="p-6 shadow-md border-l-4 border-blue-600">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <Icon className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-foreground mb-1">{insight.title}</h3>
                    <p className="text-sm text-muted-foreground">{insight.description}</p>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Charts */}
      {performanceData.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Factor Contribution */}
          <Card className="p-6 shadow-md">
            <h2 className="text-lg font-bold text-foreground mb-6">Factor Contribution (%)</h2>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={performanceData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="subject" stroke="#6B7280" />
                <YAxis stroke="#6B7280" domain={[0, 100]} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#FFFFFF", border: "1px solid #E5E7EB", borderRadius: "8px" }}
                />
                <Legend />
                <Bar dataKey="score" fill="#3B82F6" name="Your Score (%)" radius={[8, 8, 0, 0]} />
                <Bar dataKey="target" fill="#D1D5DB" name="Target (%)" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          {/* Prediction History Trend */}
          <Card className="p-6 shadow-md">
            <h2 className="text-lg font-bold text-foreground mb-6">Prediction History Trend</h2>
            {trendData.length > 1 ? (
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis dataKey="month" stroke="#6B7280" />
                  <YAxis stroke="#6B7280" domain={[0, 100]} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#FFFFFF", border: "1px solid #E5E7EB", borderRadius: "8px" }}
                  />
                  <Line
                    type="monotone"
                    dataKey="avg"
                    stroke="#3B82F6"
                    strokeWidth={2}
                    dot={{ fill: "#3B82F6" }}
                    name="Predicted Score"
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-48 text-muted-foreground">
                Run multiple predictions to see a trend
              </div>
            )}
          </Card>
        </div>
      )}

      {/* Recommendations */}
      {prediction && (
        <Card className="p-6 shadow-md">
          <h2 className="text-lg font-bold text-foreground mb-6">AI Recommendations</h2>
          <div className="space-y-4">
            {studentData && studentData.attendance < 75 && (
              <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                <p className="font-semibold text-foreground mb-2">⚠️ Low Attendance</p>
                <p className="text-sm text-muted-foreground">
                  Your attendance is {studentData.attendance}%, below the recommended 75%. Improving attendance is the fastest way to boost your score.
                </p>
              </div>
            )}
            {studentData && studentData.studyHours < 4 && (
              <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                <p className="font-semibold text-foreground mb-2">⏰ Study More</p>
                <p className="text-sm text-muted-foreground">
                  You study {studentData.studyHours}h/day. Aim for at least 4-6 hours to improve your predicted score significantly.
                </p>
              </div>
            )}
            {prediction.score >= 80 && (
              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <p className="font-semibold text-foreground mb-2">✅ Great Performance</p>
                <p className="text-sm text-muted-foreground">
                  Your predicted score of {prediction.score.toFixed(1)}% is excellent! Keep up the good work.
                </p>
              </div>
            )}
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <p className="font-semibold text-foreground mb-2">📚 Prediction Factors</p>
              <p className="text-sm text-muted-foreground">
                Attendance contributes 30%, study hours 25%, previous scores 35%, and age 10% to your predicted score.
              </p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
