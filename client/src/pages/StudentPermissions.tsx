import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CheckCircle, Clock, XCircle, Plus, Loader2 } from "lucide-react";
import { fetchPermissions, requestPermission } from "@/lib/api";
import { toast } from "sonner";

export default function StudentPermissions() {
  const { user } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    type: "Full Day Leave",
    teacher_name: "",
    date: "",
    reason: "",
  });

  useEffect(() => {
    loadPermissions();
  }, []);

  const loadPermissions = async () => {
    try {
      setLoading(true);
      const res = await fetchPermissions();
      setHistory(res.data.permissions);
    } catch (err: any) {
      toast.error(err.message || "Failed to fetch permissions");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.date || !formData.reason || !formData.teacher_name) {
      toast.error("Please fill in all fields");
      return;
    }
    
    setSubmitting(true);
    try {
      await requestPermission({
        type: formData.type,
        teacher_name: formData.teacher_name,
        date: formData.date,
        reason: formData.reason,
        student_name: user?.name || "Student"
      });
      toast.success("Request submitted successfully");
      setShowForm(false);
      setFormData({ type: "Full Day Leave", teacher_name: "", date: "", reason: "" });
      loadPermissions();
    } catch (err: any) {
      toast.error(err.message || "Failed to submit request");
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case "approved":
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case "pending":
        return <Clock className="w-5 h-5 text-yellow-600" />;
      case "rejected":
        return <XCircle className="w-5 h-5 text-red-600" />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-6">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Permissions & Leave</h1>
          <p className="text-muted-foreground">Apply for leave or special permissions</p>
        </div>
        <Button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          {showForm ? "Cancel" : "New Request"}
        </Button>
      </div>

      {/* Application Form */}
      {showForm && (
        <Card className="p-6 shadow-md mb-8">
          <h2 className="text-lg font-bold text-foreground mb-6">Apply for Permission</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Type</label>
                <select
                  value={formData.type}
                  onChange={(e) =>
                    setFormData({ ...formData, type: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                >
                  <option>Full Day Leave</option>
                  <option>Half Day</option>
                  <option>Permission</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Teacher Name</label>
                <Input
                  type="text"
                  placeholder="Enter teacher's name"
                  value={formData.teacher_name}
                  onChange={(e) =>
                    setFormData({ ...formData, teacher_name: e.target.value })
                  }
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Date</label>
                <Input
                  type="date"
                  value={formData.date}
                  onChange={(e) =>
                    setFormData({ ...formData, date: e.target.value })
                  }
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Reason</label>
              <textarea
                value={formData.reason}
                onChange={(e) =>
                  setFormData({ ...formData, reason: e.target.value })
                }
                placeholder="Enter reason for leave/permission"
                className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                rows={4}
                required
              />
            </div>
            <div className="flex gap-3">
              <Button type="submit" disabled={submitting} className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2">
                {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                {submitting ? "Submitting..." : "Submit Request"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowForm(false)}
              >
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Permission History */}
      <Card className="p-6 shadow-md">
        <h2 className="text-lg font-bold text-foreground mb-6">Permission History</h2>
        {loading ? (
          <div className="flex justify-center p-8">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        ) : history.length === 0 ? (
          <p className="text-muted-foreground text-center py-6">No permission requests found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 font-semibold text-foreground">Type</th>
                  <th className="text-left py-3 px-4 font-semibold text-foreground">Teacher</th>
                  <th className="text-left py-3 px-4 font-semibold text-foreground">Date</th>
                  <th className="text-left py-3 px-4 font-semibold text-foreground">Reason</th>
                  <th className="text-left py-3 px-4 font-semibold text-foreground">Applied On</th>
                  <th className="text-left py-3 px-4 font-semibold text-foreground">Status</th>
                </tr>
              </thead>
              <tbody>
                {history.map((permission) => (
                  <tr
                    key={permission.id}
                    className="border-b border-border hover:bg-blue-50 transition-colors"
                  >
                    <td className="py-4 px-4 text-foreground font-medium">{permission.type}</td>
                    <td className="py-4 px-4 text-foreground">{permission.teacher_name || "—"}</td>
                    <td className="py-4 px-4 text-foreground">{permission.date}</td>
                    <td className="py-4 px-4 text-muted-foreground">{permission.reason}</td>
                    <td className="py-4 px-4 text-muted-foreground text-sm">
                      {permission.created_at ? new Date(permission.created_at).toLocaleDateString() : "N/A"}
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(permission.status)}
                        <span
                          className={`text-sm font-semibold capitalize ${
                            permission.status.toLowerCase() === "approved"
                              ? "text-green-600"
                              : permission.status.toLowerCase() === "pending"
                              ? "text-yellow-600"
                              : "text-red-600"
                          }`}
                        >
                          {permission.status}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
