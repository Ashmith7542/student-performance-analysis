import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Clock, MapPin, Loader2 } from "lucide-react";
import { fetchTimetable } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export default function StudentTimetable() {
  const { user } = useAuth();
  const [timetableData, setTimetableData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTimetable();
  }, []);

  const loadTimetable = async () => {
    try {
      setLoading(true);
      // Construct class name: Prefer "Year Section" or "Class Section" format
      let studentClass = user?.class || "";
      if (user?.section) {
        // If it's just a number like "11", and we have section "C", make it "11 C"
        studentClass = `${studentClass} ${user.section}`.trim();
      } else if (user?.year && user?.section) {
        studentClass = `${user.year} ${user.section}`.trim();
      }
      
      const res = await fetchTimetable({ 
        role: "student", 
        class_name: studentClass 
      });
      setTimetableData(res.data.timetables);
    } catch (err: any) {
      toast.error(err.message || "Failed to load timetable");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-6 flex justify-center items-center">
        <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-6">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Weekly Timetable</h1>
          <p className="text-muted-foreground">Your class schedule for this week</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2">
          <Download className="w-4 h-4" />
          Download
        </Button>
      </div>

      {timetableData.length === 0 ? (
        <Card className="p-12 text-center shadow-md">
          <p className="text-muted-foreground text-lg">No classes scheduled yet.</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
          {days.map((day) => {
            const dayClasses = timetableData.filter((item) => item.day === day);
            return (
              <Card key={day} className="p-4 shadow-md">
                <h2 className="text-lg font-bold text-foreground mb-4 pb-4 border-b border-border">
                  {day}
                </h2>
                <div className="space-y-3">
                  {dayClasses.map((cls, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-blue-50 rounded-lg border border-blue-200 hover:shadow-md transition-shadow"
                    >
                      <p className="font-semibold text-foreground text-sm mb-2">{cls.subject}</p>
                      <div className="space-y-1 text-xs text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <Clock className="w-3 h-3" />
                          {cls.time}
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="w-3 h-3" />
                          {cls.room}
                        </div>
                      </div>
                    </div>
                  ))}
                  {dayClasses.length === 0 && (
                     <p className="text-xs text-muted-foreground text-center py-4">Free. No classes.</p>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
