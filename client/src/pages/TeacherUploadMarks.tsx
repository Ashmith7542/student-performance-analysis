import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Save, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { fetchStudents, updateStudent, type Student } from "@/lib/api";

export default function TeacherUploadMarks() {
  const [students, setStudents] = useState<Student[]>([]);
  const [marks, setMarks] = useState<Record<string, string>>({});
  const [selectedSubject, setSelectedSubject] = useState("Physics");
  const [examType, setExamType] = useState("Internal Marks");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadStudents();
  }, []);

  const loadStudents = async () => {
    try {
      setLoading(true);
      const res = await fetchStudents();
      setStudents(res.data.students);
    } catch (err: any) {
      toast.error(err.message || "Failed to load students");
    } finally {
      setLoading(false);
    }
  };

  const handleMarkChange = (studentId: string, value: string) => {
    setMarks((prev) => ({
      ...prev,
      [studentId]: value,
    }));
  };

  const handleSave = async () => {
    const entries = Object.entries(marks).filter(([_, v]) => v !== "");
    if (entries.length === 0) {
      toast.error("Please enter at least one student's marks");
      return;
    }

    setSaving(true);
    try {
      for (const [studentId, markStr] of entries) {
        const markValue = parseFloat(markStr);
        if (isNaN(markValue) || markValue < 0 || markValue > 100) continue;

        const student = students.find((s) => s.id === studentId);
        if (!student) continue;

        // Append to previousScores
        const updatedScores = [...(student.previousScores || []), markValue];
        await updateStudent(studentId, { previousScores: updatedScores } as any);
      }
      toast.success(`Marks saved for ${selectedSubject} (${examType})`);
      setMarks({});
      await loadStudents();
    } catch (err: any) {
      toast.error(err.message || "Failed to save marks");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-6 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-10 h-10 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-muted-foreground">Loading students...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Upload Marks</h1>
        <p className="text-muted-foreground">Submit student marks for evaluation</p>
      </div>

      {/* Subject Selection */}
      <Card className="p-6 shadow-md mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Exam Type</label>
            <select
              value={examType}
              onChange={(e) => setExamType(e.target.value)}
              className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
            >
              <option>Internal Marks</option>
              <option>External Marks</option>
              <option>Practical Marks</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Marks Entry */}
      <Card className="p-6 shadow-md mb-8">
        <h2 className="text-lg font-bold text-foreground mb-6">Enter Marks (Out of 100)</h2>
        {students.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">No students found. Add students first.</p>
        ) : (
          <div className="space-y-3 mb-6">
            {students.map((student) => (
              <div
                key={student.id}
                className="flex items-center justify-between p-4 bg-white border border-border rounded-lg hover:bg-blue-50 transition-colors"
              >
                <div>
                  <p className="font-semibold text-foreground">{student.name}</p>
                  <p className="text-sm text-muted-foreground">
                    Previous scores: {student.previousScores?.length || 0} entries
                  </p>
                </div>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  placeholder="Marks"
                  value={marks[student.id] || ""}
                  onChange={(e) => handleMarkChange(student.id, e.target.value)}
                  className="w-24"
                />
              </div>
            ))}
          </div>
        )}
        <Button
          onClick={handleSave}
          disabled={saving || students.length === 0}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center gap-2"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {saving ? "Saving..." : "Save Marks"}
        </Button>
      </Card>
    </div>
  );
}
