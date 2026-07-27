import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Database, ShieldAlert, Loader2, BarChart3, Mail, Calendar, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function AdminDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isImporting, setIsImporting] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);

  // Timetable State
  const [ttRole, setTtRole] = useState<"student" | "teacher">("student");
  const [ttDay, setTtDay] = useState("");
  const [ttTime, setTtTime] = useState("");
  const [ttSubject, setTtSubject] = useState("");
  const [ttClass, setTtClass] = useState("");
  const [ttTeacher, setTtTeacher] = useState("");
  const [isAddingTT, setIsAddingTT] = useState(false);

  // Teacher Assignment State
  const [assignTeacherId, setAssignTeacherId] = useState("");
  const [assignSubject, setAssignSubject] = useState("");
  const [assignClass, setAssignClass] = useState("");
  const [isAssigning, setIsAssigning] = useState(false);

  // Bulk Timetable State
  const [ttImportFile, setTtImportFile] = useState<File | null>(null);
  const [isImportingTT, setIsImportingTT] = useState(false);

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      // Fetch Stats
      const statsRes = await fetch("/api/admin/stats", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const statsData = await statsRes.json();
      if (statsData.success) setStats(statsData.data);

      // Fetch Users
      const usersRes = await fetch("/api/admin/users", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const usersData = await usersRes.json();
      if (usersData.success) setUsers(usersData.data.users);

    } catch (err: any) {
      toast.error("Failed to fetch admin data");
    } finally {
      setLoading(false);
    }
  };

  const handleImport = async () => {
    if (!importFile) {
      toast.error("Please select a CSV file first");
      return;
    }

    try {
      setIsImporting(true);
      const formData = new FormData();
      formData.append("file", importFile);

      const token = localStorage.getItem("token");
      const res = await fetch("/api/admin/import-users", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      });

      const data = await res.json();
      if (data.success) {
        toast.success(data.message);
        setImportFile(null);
        fetchAdminData(); // Refresh list and stats
      } else {
        toast.error(data.message);
      }
    } catch (err) {
      toast.error("Import failed");
    } finally {
      setIsImporting(false);
    }
  };

  const handleAddTimetable = async () => {
    if (!ttDay || !ttTime || !ttSubject) {
      toast.error("Please fill required fields");
      return;
    }

    try {
      setIsAddingTT(true);
      const token = localStorage.getItem("token");
      const res = await fetch("/api/admin/timetable", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          role: ttRole,
          day: ttDay,
          time: ttTime,
          subject: ttSubject,
          class_name: ttClass,
          teacher_id: ttTeacher
        })
      });

      const data = await res.json();
      if (data.success) {
        toast.success("Timetable entry added");
        setTtSubject("");
        setTtTime("");
        fetchAdminData();
      } else {
        toast.error(data.message);
      }
    } catch (err) {
      toast.error("Failed to add timetable");
    } finally {
      setIsAddingTT(false);
    }
  };

  const handleAssignTeacher = async () => {
    if (!assignTeacherId || !assignSubject) {
      toast.error("Please select a teacher and subject");
      return;
    }

    try {
      setIsAssigning(true);
      const token = localStorage.getItem("token");
      const res = await fetch("/api/admin/assign-teacher", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          teacher_id: assignTeacherId,
          subject: assignSubject,
          class: assignClass
        })
      });

      const data = await res.json();
      if (data.success) {
        toast.success("Teacher assigned successfully");
        fetchAdminData();
      } else {
        toast.error(data.message);
      }
    } catch (err) {
      toast.error("Failed to assign teacher");
    } finally {
      setIsAssigning(false);
    }
  };

  const handleImportTimetable = async () => {
    if (!ttImportFile) {
      toast.error("Please select a timetable CSV file");
      return;
    }

    try {
      setIsImportingTT(true);
      const formData = new FormData();
      formData.append("file", ttImportFile);
      formData.append("role", ttRole);
      formData.append("class_name", ttClass);
      formData.append("teacher_id", ttTeacher);

      const token = localStorage.getItem("token");
      const res = await fetch("/api/admin/import-timetable", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      });

      const data = await res.json();
      if (data.success) {
        toast.success(data.message);
        setTtImportFile(null);
      } else {
        toast.error(data.message);
      }
    } catch (err) {
      toast.error("Timetable import failed");
    } finally {
      setIsImportingTT(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Admin Control Center</h1>
        <p className="text-slate-500">System management and analytics</p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="p-6 shadow-sm border-l-4 border-blue-600">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Total Users</p>
              <h3 className="text-2xl font-bold text-slate-900">{stats?.total_users || 0}</h3>
            </div>
          </div>
        </Card>

        <Card className="p-6 shadow-sm border-l-4 border-green-600">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-100 rounded-lg">
              <Users className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Students</p>
              <h3 className="text-2xl font-bold text-slate-900">{stats?.students || 0}</h3>
            </div>
          </div>
        </Card>

        <Card className="p-6 shadow-sm border-l-4 border-purple-600">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-purple-100 rounded-lg">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Teachers</p>
              <h3 className="text-2xl font-bold text-slate-900">{stats?.teachers || 0}</h3>
            </div>
          </div>
        </Card>
      </div>

      {/* User Management Table */}
      <Card className="p-6 shadow-sm mb-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-slate-900">User Directory</h2>
          <Button onClick={fetchAdminData} variant="outline" className="flex gap-2">
            Refresh Data
          </Button>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left py-3 px-4 text-slate-600 font-semibold uppercase text-xs">Name</th>
                  <th className="text-left py-3 px-4 text-slate-600 font-semibold uppercase text-xs">Email</th>
                  <th className="text-left py-3 px-4 text-slate-600 font-semibold uppercase text-xs">Role</th>
                  <th className="text-left py-3 px-4 text-slate-600 font-semibold uppercase text-xs">ID</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u, idx) => (
                  <tr key={idx} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                    <td className="py-4 px-4 font-medium text-slate-900">{u.name}</td>
                    <td className="py-4 px-4 text-slate-600">{u.email}</td>
                    <td className="py-4 px-4">
                      <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${u.role === 'admin' ? 'bg-red-100 text-red-600' :
                        u.role === 'teacher' ? 'bg-purple-100 text-purple-600' :
                          'bg-green-100 text-green-600'
                        }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-slate-400 font-mono text-xs">{u.rollNumber || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Management Tools */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Timetable Scheduler */}
        <Card className="p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <Calendar className="w-5 h-5 text-blue-600" />
            <h3 className="font-bold text-lg">Post Timetable</h3>
          </div>
          <div className="space-y-4">
            <div className="mb-4">
              <label className="text-xs font-medium text-slate-500 uppercase tracking-wider block mb-2">Role</label>
              <Select onValueChange={(v: any) => setTtRole(v)} defaultValue={ttRole}>
                <SelectTrigger className="w-full md:w-[200px] h-10 border-blue-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="student">Student Dashboard</SelectItem>
                  <SelectItem value="teacher">Teacher Schedule</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {ttRole === "student" ? (
                <div className="space-y-2">
                  <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">Class & Section</label>
                  <Input 
                    placeholder="e.g. 11 A or 12 B" 
                    value={ttClass} 
                    onChange={e => setTtClass(e.target.value)}
                    className="h-10 border-slate-200 focus:border-blue-500"
                  />
                </div>
              ) : (
                <div className="space-y-2">
                  <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">Select Teacher</label>
                  <Select onValueChange={setTtTeacher}>
                    <SelectTrigger className="h-10">
                      <SelectValue placeholder="Choose Teacher" />
                    </SelectTrigger>
                    <SelectContent>
                      {users.filter(u => u.role === "teacher").map(t => (
                        <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="space-y-2">
                <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">Timetable CSV File</label>
                <div className="flex flex-col gap-2 p-3 bg-slate-50 rounded-lg border border-dashed border-slate-300">
                  <input
                    type="file"
                    accept=".csv"
                    onChange={(e) => setTtImportFile(e.target.files?.[0] || null)}
                    className="text-[11px] text-slate-500 cursor-pointer"
                  />
                  {ttImportFile && (
                    <Button 
                      size="sm" 
                      onClick={handleImportTimetable} 
                      disabled={isImportingTT}
                      className="w-full mt-1 bg-blue-600 hover:bg-blue-700 text-white font-bold h-9"
                    >
                      {isImportingTT ? "Publishing..." : "Publish Timetable"}
                    </Button>
                  )}
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100">
              <p className="text-[10px] text-slate-400 italic">
                Note: The CSV file just needs 'Time', 'Monday', 'Tuesday', etc. columns.
                {ttRole === "student" ? " Values are for Class " + (ttClass || "[Class]") : " Values are for the selected teacher."}
              </p>
            </div>
          </div>
        </Card>

        {/* Teacher Assignment */}
        <Card className="p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <UserPlus className="w-5 h-5 text-green-600" />
            <h3 className="font-bold text-lg">Assign Teacher to Class</h3>
          </div>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-medium">Select Teacher</label>
              <Select onValueChange={setAssignTeacherId}>
                <SelectTrigger><SelectValue placeholder="Choose a teacher" /></SelectTrigger>
                <SelectContent>
                  {users.filter(u => u.role === "teacher").map(t => (
                    <SelectItem key={t.id} value={t.id}>{t.name} ({t.subject || "No Subject"})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Input placeholder="Assigned Subject" value={assignSubject} onChange={e => setAssignSubject(e.target.value)} />
              <Input placeholder="Assigned Class" value={assignClass} onChange={e => setAssignClass(e.target.value)} />
            </div>

            <Button className="w-full bg-green-600" onClick={handleAssignTeacher} disabled={isAssigning}>
              {isAssigning ? "Assigning..." : "Update Assignment"}
            </Button>

            <div className="mt-4 p-4 bg-green-50 rounded-lg border border-green-100">
              <p className="text-[11px] text-green-700">
                Tip: Assigning a teacher ensures they see the correct class analytical data in their dashboard.
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Maintenance Tools */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <Database className="w-5 h-5 text-slate-700" />
            <h3 className="font-bold">Bulk Import Users (CSV)</h3>
          </div>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <input
                type="file"
                accept=".csv"
                onChange={(e) => setImportFile(e.target.files?.[0] || null)}
                className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
            </div>
            <Button
              onClick={handleImport}
              disabled={!importFile || isImporting}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isImporting ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Importing...</>
              ) : (
                "Import Now"
              )}
            </Button>
            <p className="text-[10px] text-slate-400">
              CSV Headers: name, email, role, class, rollNumber, attendance, studyHours, age, previousScores(csv)
            </p>
          </div>
        </Card>

        <Card className="p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <Database className="w-5 h-5 text-slate-700" />
            <h3 className="font-bold">System Actions</h3>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Button variant="outline" className="w-full justify-start text-xs">Export Users</Button>
            <Button variant="outline" className="w-full justify-start text-xs">Backup DB</Button>
          </div>
        </Card>

        <Card className="p-6 shadow-sm border border-red-100 bg-red-50/30">
          <div className="flex items-center gap-3 mb-4">
            <ShieldAlert className="w-5 h-5 text-red-600" />
            <h3 className="font-bold text-red-900">Security</h3>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Button variant="destructive" className="w-full text-xs">Flush Tokens</Button>
            <Button variant="outline" className="w-full text-xs border-red-200 text-red-700 hover:bg-red-50">Log Viewer</Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
