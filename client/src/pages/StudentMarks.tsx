import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Loader2 } from "lucide-react";
import {
  fetchStudents,
  fetchPredictionHistory,
  type Student,
  type PredictionHistory,
} from "@/lib/api";

export default function StudentMarks() {
  const { user } = useAuth();
  const [studentData, setStudentData] = useState<Student | null>(null);
  const [predictions, setPredictions] = useState<PredictionHistory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [user]);

  const loadData = async () => {
    try {
      setLoading(true);
      const studRes = await fetchStudents();
      const matched = studRes.data.students.find(
        (s) => s.email.toLowerCase() === user?.email?.toLowerCase()
      );
      if (matched) {
        setStudentData(matched);
        const histRes = await fetchPredictionHistory();
        setPredictions(
          histRes.data.predictions.filter((p) => p.student_id === matched.id)
        );
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  };

  // Build marks-like rows from previousScores
  const scores = studentData?.previousScores || [];
  const totalScore = scores.reduce((sum, s) => sum + s, 0);
  const avgScore = scores.length > 0 ? (totalScore / scores.length).toFixed(1) : "N/A";

  const getGrade = (pct: number) => {
    if (pct >= 90) return { label: "A+", cls: "bg-green-100 text-green-700" };
    if (pct >= 80) return { label: "A", cls: "bg-green-100 text-green-700" };
    if (pct >= 70) return { label: "B+", cls: "bg-blue-100 text-blue-700" };
    if (pct >= 60) return { label: "B", cls: "bg-blue-100 text-blue-700" };
    return { label: "C", cls: "bg-yellow-100 text-yellow-700" };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-6 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-10 h-10 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-muted-foreground">Loading marks...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-6">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Your Marks</h1>
          <p className="text-muted-foreground">Exam scores and performance records</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2">
          <Download className="w-4 h-4" />
          Download Marksheet
        </Button>
      </div>

      {!studentData ? (
        <Card className="p-6 bg-yellow-50 border-yellow-200">
          <p className="text-yellow-800 font-medium">No student record linked to your account.</p>
          <p className="text-yellow-700 text-sm mt-1">Ask your teacher to add you and upload marks.</p>
        </Card>
      ) : (
        <>
          {/* Overall Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="p-6 shadow-md">
              <p className="text-sm text-muted-foreground mb-2">Total Scores Recorded</p>
              <p className="text-3xl font-bold text-foreground">{scores.length}</p>
            </Card>
            <Card className="p-6 shadow-md">
              <p className="text-sm text-muted-foreground mb-2">Average Score</p>
              <p className="text-3xl font-bold text-blue-600">{avgScore}%</p>
            </Card>
            <Card className="p-6 shadow-md">
              <p className="text-sm text-muted-foreground mb-2">Attendance</p>
              <p className="text-3xl font-bold text-green-600">{studentData.attendance}%</p>
            </Card>
          </div>

          {/* Scores Table */}
          {scores.length > 0 ? (
            <Card className="p-6 shadow-md mb-8">
              <h2 className="text-lg font-bold text-foreground mb-6">Score History</h2>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-4 font-semibold text-foreground">#</th>
                      <th className="text-center py-3 px-4 font-semibold text-foreground">Score</th>
                      <th className="text-center py-3 px-4 font-semibold text-foreground">Grade</th>
                      <th className="text-center py-3 px-4 font-semibold text-foreground">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {scores.map((score, idx) => {
                      const grade = getGrade(score);
                      return (
                        <tr key={idx} className="border-b border-border hover:bg-blue-50 transition-colors">
                          <td className="py-4 px-4 text-foreground font-medium">Exam {idx + 1}</td>
                          <td className="py-4 px-4 text-center text-foreground font-semibold">{score}/100</td>
                          <td className="py-4 px-4 text-center">
                            <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${grade.cls}`}>
                              {grade.label}
                            </span>
                          </td>
                          <td className="py-4 px-4 text-center">
                            <span className={`text-sm font-medium ${score >= 40 ? "text-green-600" : "text-red-600"}`}>
                              {score >= 40 ? "Pass" : "Fail"}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </Card>
          ) : (
            <Card className="p-6 shadow-md mb-8 text-center">
              <p className="text-muted-foreground">No marks uploaded yet. Check back after your teacher submits marks.</p>
            </Card>
          )}

          {/* Prediction Results */}
          {predictions.length > 0 && (
            <Card className="p-6 shadow-md">
              <h2 className="text-lg font-bold text-foreground mb-6">Prediction History</h2>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-4 font-semibold text-foreground">Date</th>
                      <th className="text-center py-3 px-4 font-semibold text-foreground">Predicted Score</th>
                      <th className="text-center py-3 px-4 font-semibold text-foreground">Grade</th>
                    </tr>
                  </thead>
                  <tbody>
                    {predictions.map((p, idx) => {
                      const grade = getGrade(p.prediction?.score || 0);
                      return (
                        <tr key={idx} className="border-b border-border hover:bg-blue-50 transition-colors">
                          <td className="py-4 px-4 text-foreground">{p.created_at ? new Date(p.created_at).toLocaleDateString() : "N/A"}</td>
                          <td className="py-4 px-4 text-center font-semibold text-blue-600">
                            {p.prediction?.score?.toFixed(1) || "N/A"}%
                          </td>
                          <td className="py-4 px-4 text-center">
                            <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${grade.cls}`}>
                              {p.prediction?.grade || "N/A"}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
