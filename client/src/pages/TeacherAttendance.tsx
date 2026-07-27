import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, Save, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { fetchStudents, updateStudent, type Student } from "@/lib/api";

export default function TeacherAttendance() {
  const [students, setStudents] = useState<Student[]>([]);
  const [attendance, setAttendance] = useState<Record<string, boolean>>({});
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
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
      // Initialize all as present by default
      const init: Record<string, boolean> = {};
      res.data.students.forEach((s) => {
        init[s.id] = true;
      });
      setAttendance(init);
    } catch (err: any) {
      toast.error(err.message || "Failed to load students");
    } finally {
      setLoading(false);
    }
  };

  const toggleAttendance = (studentId: string) => {
    setAttendance((prev) => ({
      ...prev,
      [studentId]: !prev[studentId],
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const recordsToSave = [];
      
      // Update each student's attendance in the backend
      for (const student of students) {
        const isPresent = attendance[student.id];
        
        recordsToSave.push({
          student_id: student.id,
          status: isPresent ? "present" : "absent",
          date: selectedDate
        });

        // Simple attendance update: adjust overall attendance percentage
        // In a real app you'd have a per-day attendance model linked to totals
        const newAttendance = isPresent
          ? Math.min(student.attendance + 1, 100)
          : Math.max(student.attendance - 1, 0);
        await updateStudent(student.id, { attendance: newAttendance } as any);
      }
      
      // Also log it in the attendance collection
      const { markAttendance } = await import("@/lib/api");
      await markAttendance(recordsToSave);

      toast.success(`Attendance saved for ${selectedDate}`);
      // Reload to get updated data
      await loadStudents();
    } catch (err: any) {
      toast.error(err.message || "Failed to save attendance");
    } finally {
      setSaving(false);
    }
  };


  const presentCount = Object.values(attendance).filter((v) => v).length;
  const absentCount = students.length - presentCount;

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
        <h1 className="text-3xl font-bold text-foreground mb-2">Mark Attendance</h1>
        <p className="text-muted-foreground">Record attendance for your class</p>
      </div>

      {/* Date Selection */}
      <Card className="p-6 shadow-md mb-8">
        <div className="flex items-center gap-4">
          <label className="font-semibold text-foreground">Select Date:</label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
        </div>
      </Card>

      {/* Attendance Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="p-6 shadow-md">
          <p className="text-sm text-muted-foreground mb-2">Total Students</p>
          <p className="text-3xl font-bold text-foreground">{students.length}</p>
        </Card>
        <Card className="p-6 shadow-md">
          <p className="text-sm text-muted-foreground mb-2">Present</p>
          <p className="text-3xl font-bold text-green-600">{presentCount}</p>
        </Card>
        <Card className="p-6 shadow-md">
          <p className="text-sm text-muted-foreground mb-2">Absent</p>
          <p className="text-3xl font-bold text-red-600">{absentCount}</p>
        </Card>
      </div>

      {/* Attendance Marking */}
      <Card className="p-6 shadow-md mb-8">
        <h2 className="text-lg font-bold text-foreground mb-6">Student Attendance</h2>
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
                    Current Attendance: {student.attendance}%
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      if (!attendance[student.id]) toggleAttendance(student.id);
                    }}
                    className={`p-3 rounded-lg transition-all ${
                      attendance[student.id]
                        ? "bg-green-100 text-green-600"
                        : "bg-gray-100 text-gray-400 hover:bg-green-100 hover:text-green-600"
                    }`}
                  >
                    <CheckCircle className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => {
                      if (attendance[student.id]) toggleAttendance(student.id);
                    }}
                    className={`p-3 rounded-lg transition-all ${
                      !attendance[student.id]
                        ? "bg-red-100 text-red-600"
                        : "bg-gray-100 text-gray-400 hover:bg-red-100 hover:text-red-600"
                    }`}
                  >
                    <XCircle className="w-5 h-5" />
                  </button>
                </div>
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
          {saving ? "Saving..." : "Save Attendance"}
        </Button>
      </Card>
    </div>
  );
}
