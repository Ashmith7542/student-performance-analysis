import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Award, Loader2 } from "lucide-react";
import { fetchStudents, fetchPredictionHistory, type Student, type PredictionHistory } from "@/lib/api";

export default function StudentResults() {
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

  const getStatus = (score: number) => (score >= 40 ? "Pass" : "Fail");

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-6 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-10 h-10 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-muted-foreground">Loading results...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-6">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Prediction Results</h1>
          <p className="text-muted-foreground">Your academic results and performance</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2">
          <Download className="w-4 h-4" />
          Download Results
        </Button>
      </div>

      {!studentData ? (
        <Card className="p-6 bg-yellow-50 border-yellow-200">
          <p className="text-yellow-800 font-medium">No student record linked to your account.</p>
          <p className="text-yellow-700 text-sm mt-1">Ask your teacher to add you and generate predictions.</p>
        </Card>
      ) : predictions.length === 0 ? (
        <Card className="p-6 bg-blue-50 border-blue-200 text-center">
          <p className="text-blue-800 font-medium">No prediction results yet.</p>
          <p className="text-blue-700 text-sm mt-1">Your teacher needs to generate predictions for you.</p>
        </Card>
      ) : (
        <div className="space-y-8">
          {predictions.map((result, idx) => (
            <Card key={idx} className="p-6 shadow-md">
              <div className="flex items-center justify-between mb-6 pb-6 border-b border-border">
                <div>
                  <h2 className="text-2xl font-bold text-foreground">
                    Prediction Run {predictions.length - idx}
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    {result.created_at ? new Date(result.created_at).toLocaleString() : ""}
                  </p>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground mb-1">Score</p>
                    <p className="text-2xl font-bold text-blue-600">
                      {result.prediction.score.toFixed(1)}%
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground mb-1">Status</p>
                    <p
                      className={`text-2xl font-bold flex items-center gap-1 ${
                        result.prediction.score >= 40 ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      <Award className="w-5 h-5" />
                      {getStatus(result.prediction.score)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-4 font-semibold text-foreground">Factor</th>
                      <th className="text-center py-3 px-4 font-semibold text-foreground">Contribution</th>
                      <th className="text-center py-3 px-4 font-semibold text-foreground">Max points</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-border hover:bg-blue-50 transition-colors">
                      <td className="py-4 px-4 text-foreground font-medium">Attendance</td>
                      <td className="py-4 px-4 text-center text-foreground">
                        {result.prediction.breakdown?.attendance_contribution?.toFixed(1) || 0}
                      </td>
                      <td className="py-4 px-4 text-center text-foreground">30</td>
                    </tr>
                    <tr className="border-b border-border hover:bg-blue-50 transition-colors">
                      <td className="py-4 px-4 text-foreground font-medium">Study Hours</td>
                      <td className="py-4 px-4 text-center text-foreground">
                        {result.prediction.breakdown?.study_hours_contribution?.toFixed(1) || 0}
                      </td>
                      <td className="py-4 px-4 text-center text-foreground">25</td>
                    </tr>
                    <tr className="border-b border-border hover:bg-blue-50 transition-colors">
                      <td className="py-4 px-4 text-foreground font-medium">Previous Scores</td>
                      <td className="py-4 px-4 text-center text-foreground">
                        {result.prediction.breakdown?.previous_scores_contribution?.toFixed(1) || 0}
                      </td>
                      <td className="py-4 px-4 text-center text-foreground">35</td>
                    </tr>
                    <tr className="border-b border-border hover:bg-blue-50 transition-colors">
                      <td className="py-4 px-4 text-foreground font-medium">Age Bonus</td>
                      <td className="py-4 px-4 text-center text-foreground">
                        {result.prediction.breakdown?.age_contribution?.toFixed(1) || 0}
                      </td>
                      <td className="py-4 px-4 text-center text-foreground">10</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
