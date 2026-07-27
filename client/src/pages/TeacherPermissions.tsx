import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, Clock, Loader2 } from "lucide-react";
import { fetchPermissions, updatePermissionStatus } from "@/lib/api";
import { toast } from "sonner";

export default function TeacherPermissions() {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPermissions();
  }, []);

  const loadPermissions = async () => {
    try {
      setLoading(true);
      const res = await fetchPermissions();
      setRequests(res.data.permissions);
    } catch (err: any) {
      toast.error(err.message || "Failed to load permissions");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: string) => {
    try {
      await updatePermissionStatus(id, "approved");
      toast.success("Permission approved");
      loadPermissions();
    } catch (err: any) {
      toast.error(err.message || "Failed to approve permission");
    }
  };

  const handleReject = async (id: string) => {
    try {
      await updatePermissionStatus(id, "rejected");
      toast.success("Permission rejected");
      loadPermissions();
    } catch (err: any) {
      toast.error(err.message || "Failed to reject permission");
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

  const pendingRequests = requests.filter((r) => r.status.toLowerCase() === "pending");

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
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Permission Requests</h1>
        <p className="text-muted-foreground">Manage student leave and permission requests</p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="p-6 shadow-md">
          <p className="text-sm text-muted-foreground mb-2">Total Requests</p>
          <p className="text-3xl font-bold text-foreground">{requests.length}</p>
        </Card>
        <Card className="p-6 shadow-md">
          <p className="text-sm text-muted-foreground mb-2">Pending</p>
          <p className="text-3xl font-bold text-yellow-600">{pendingRequests.length}</p>
        </Card>
        <Card className="p-6 shadow-md">
          <p className="text-sm text-muted-foreground mb-2">Approved</p>
          <p className="text-3xl font-bold text-green-600">
            {requests.filter((r) => r.status.toLowerCase() === "approved").length}
          </p>
        </Card>
      </div>

      {/* Pending Requests */}
      {pendingRequests.length > 0 && (
        <Card className="p-6 shadow-md mb-8">
          <h2 className="text-lg font-bold text-foreground mb-6">Pending Requests</h2>
          <div className="space-y-4">
            {pendingRequests.map((request) => (
              <div
                key={request.id}
                className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-semibold text-foreground">{request.student_name}</p>
                    <p className="text-sm text-blue-600 font-medium">To: {request.teacher_name || "Any"}</p>
                    <p className="text-sm text-muted-foreground">{request.type}</p>
                  </div>
                  <span className="text-xs bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full">
                    {request.date}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mb-4">Reason: {request.reason}</p>
                <div className="flex gap-2">
                  <Button
                    onClick={() => handleApprove(request.id)}
                    className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Approve
                  </Button>
                  <Button
                    onClick={() => handleReject(request.id)}
                    variant="outline"
                    className="text-red-600 hover:text-red-700 border-red-300"
                  >
                    <XCircle className="w-4 h-4" />
                    Reject
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* All Requests History */}
      <Card className="p-6 shadow-md">
        <h2 className="text-lg font-bold text-foreground mb-6">All Requests</h2>
        {requests.length === 0 ? (
          <p className="text-muted-foreground text-center py-6">No permission requests found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 font-semibold text-foreground">
                    Student Name
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-foreground">Teacher</th>
                  <th className="text-left py-3 px-4 font-semibold text-foreground">Type</th>
                  <th className="text-left py-3 px-4 font-semibold text-foreground">Date</th>
                  <th className="text-left py-3 px-4 font-semibold text-foreground">Reason</th>
                  <th className="text-left py-3 px-4 font-semibold text-foreground">Status</th>
                </tr>
              </thead>
              <tbody>
                {requests.map((request) => (
                  <tr
                    key={request.id}
                    className="border-b border-border hover:bg-blue-50 transition-colors"
                  >
                    <td className="py-4 px-4 text-foreground font-medium">
                      {request.student_name}
                    </td>
                    <td className="py-4 px-4 text-blue-600 font-medium">
                      {request.teacher_name || "—"}
                    </td>
                    <td className="py-4 px-4 text-muted-foreground">{request.type}</td>
                    <td className="py-4 px-4 text-muted-foreground">{request.date}</td>
                    <td className="py-4 px-4 text-muted-foreground text-sm">{request.reason}</td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(request.status)}
                        <span
                          className={`text-sm font-semibold capitalize ${
                            request.status.toLowerCase() === "approved"
                              ? "text-green-600"
                              : request.status.toLowerCase() === "pending"
                              ? "text-yellow-600"
                              : "text-red-600"
                          }`}
                        >
                          {request.status}
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
