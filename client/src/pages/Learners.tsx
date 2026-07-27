import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Filter, Download, MoreVertical, Plus, Loader2, Trash2 } from "lucide-react";
import { fetchStudents, createStudent, deleteStudent, type Student } from "@/lib/api";
import { toast } from "sonner";

export default function Learners() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [newStudent, setNewStudent] = useState({
    name: "",
    email: "",
    class: "",
    attendance: 80,
    studyHours: 4,
    age: 18,
  });

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

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createStudent(newStudent);
      toast.success("Student added successfully");
      setIsAdding(false);
      loadStudents();
    } catch (err: any) {
      toast.error(err.message || "Failed to add student");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this student?")) return;
    try {
      await deleteStudent(id);
      toast.success("Student deleted");
      loadStudents();
    } catch (err: any) {
      toast.error(err.message || "Failed to delete student");
    }
  };

  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(search.toLowerCase()) || 
    s.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-white sticky top-0 z-40">
        <div className="flex items-center justify-between p-6">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Students</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Manage and track all students in your classes.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
            <Button size="sm" onClick={() => setIsAdding(!isAdding)}>
              <Plus className="w-4 h-4 mr-2" />
              {isAdding ? "Cancel" : "Add Student"}
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6">
        {isAdding && (
          <Card className="p-6 mb-8 border-blue-200 shadow-lg">
            <h2 className="text-lg font-bold mb-4">Add New Student</h2>
            <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input 
                placeholder="Name" 
                value={newStudent.name} 
                onChange={e => setNewStudent({...newStudent, name: e.target.value})} 
                required 
              />
              <Input 
                placeholder="Email" 
                type="email"
                value={newStudent.email} 
                onChange={e => setNewStudent({...newStudent, email: e.target.value})} 
                required 
              />
              <Input 
                placeholder="Class (e.g. 12th Grade)" 
                value={newStudent.class} 
                onChange={e => setNewStudent({...newStudent, class: e.target.value})} 
                required 
              />
              <Input 
                placeholder="Age" 
                type="number"
                value={newStudent.age} 
                onChange={e => setNewStudent({...newStudent, age: parseInt(e.target.value)})} 
                required 
              />
              <Input 
                placeholder="Study Hours/Day" 
                type="number"
                value={newStudent.studyHours} 
                onChange={e => setNewStudent({...newStudent, studyHours: parseInt(e.target.value)})} 
                required 
              />
              <Button type="submit" className="bg-blue-600">Create Record</Button>
            </form>
          </Card>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="p-6">
            <p className="text-sm text-muted-foreground">Total Students</p>
            <p className="text-3xl font-bold text-foreground mt-2">{students.length}</p>
          </Card>
          <Card className="p-6">
            <p className="text-sm text-muted-foreground">Avg. Attendance</p>
            <p className="text-3xl font-bold text-foreground mt-2">
              {students.length > 0 
                ? (students.reduce((acc, s) => acc + s.attendance, 0) / students.length).toFixed(1)
                : 0}%
            </p>
          </Card>
          <Card className="p-6">
            <p className="text-sm text-muted-foreground">Active Predictions</p>
            <p className="text-3xl font-bold text-foreground mt-2">Live</p>
          </Card>
        </div>

        {/* Learners Table */}
        <Card className="p-6">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-foreground">
                Main Directory
              </h2>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search students..."
                  className="pl-10 w-64"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            {loading ? (
              <div className="flex justify-center p-12">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
              </div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 font-semibold text-foreground">Name</th>
                    <th className="text-left py-3 px-4 font-semibold text-foreground">Email</th>
                    <th className="text-left py-3 px-4 font-semibold text-foreground">Class</th>
                    <th className="text-center py-3 px-4 font-semibold text-foreground">Attendance</th>
                    <th className="text-center py-3 px-4 font-semibold text-foreground">Scores Recorded</th>
                    <th className="text-right py-3 px-4 font-semibold text-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStudents.map((student) => (
                    <tr
                      key={student.id}
                      className="border-b border-border hover:bg-muted/50 transition-colors"
                    >
                      <td className="py-4 px-4 font-medium text-foreground">{student.name}</td>
                      <td className="py-4 px-4 text-muted-foreground">{student.email}</td>
                      <td className="py-4 px-4 text-muted-foreground">{student.class}</td>
                      <td className="py-4 px-4 text-center text-foreground">{student.attendance}%</td>
                      <td className="py-4 px-4 text-center text-foreground">{student.previousScores?.length || 0}</td>
                      <td className="py-4 px-4 text-right">
                        <button 
                          onClick={() => handleDelete(student.id)}
                          className="p-1 hover:bg-red-50 rounded-lg transition-colors group"
                        >
                          <Trash2 className="w-4 h-4 text-muted-foreground group-hover:text-red-600" />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {filteredStudents.length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-muted-foreground">No students found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
