import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  Calendar,
  Lock,
  FileText,
  BarChart3,
  BookOpen,
  MessageSquare,
  Users,
  Upload,
  TrendingUp,
  X,
} from "lucide-react";

interface SidebarProps {
  isOpen: boolean;
  onClose?: () => void;
}

export default function AppSidebar({ isOpen, onClose }: SidebarProps) {
  const { user } = useAuth();
  const [, setLocation] = useLocation();

  const studentMenuItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, path: "/student-dashboard" },
    { id: "timetable", label: "Timetable", icon: Calendar, path: "/student/timetable" },
    { id: "permissions", label: "Permissions", icon: Lock, path: "/student/permissions" },
    { id: "marks", label: "Marks", icon: FileText, path: "/student/marks" },
    { id: "results", label: "Results", icon: BarChart3, path: "/student/results" },
    { id: "performance", label: "Performance", icon: TrendingUp, path: "/student/performance" },
    { id: "notes", label: "Notes", icon: BookOpen, path: "/student/notes" },
  ];

  const teacherMenuItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, path: "/teacher-dashboard" },
    { id: "timetable", label: "Timetable", icon: Calendar, path: "/teacher/timetable" },
    { id: "permissions", label: "Permissions", icon: Lock, path: "/teacher/permissions" },
    { id: "attendance", label: "Attendance", icon: Users, path: "/teacher/attendance" },
    { id: "marks", label: "Upload Marks", icon: Upload, path: "/teacher/upload-marks" },
    { id: "notes", label: "Upload Notes", icon: Upload, path: "/teacher/upload-notes" },
    { id: "tracking", label: "Student Tracking", icon: TrendingUp, path: "/teacher/student-tracking" },
  ];

  const adminMenuItems = [
    { id: "dashboard", label: "Admin Dashboard", icon: LayoutDashboard, path: "/admin-dashboard" },
    { id: "users", label: "All Users", icon: Users, path: "/admin-dashboard" }, // Shared for now
  ];

  const menuItems = user?.role === "student" 
    ? studentMenuItems 
    : user?.role === "teacher" 
    ? teacherMenuItems 
    : adminMenuItems;

  const handleNavigation = (path: string) => {
    setLocation(path);
    onClose?.();
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 lg:hidden z-30"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-screen w-64 bg-white border-r border-border transition-transform duration-300 lg:translate-x-0 z-40 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Close Button (Mobile) */}
        <div className="lg:hidden p-4 border-b border-border flex justify-end">
          <button
            onClick={onClose}
            className="p-2 hover:bg-muted rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-foreground" />
          </button>
        </div>

        {/* Navigation Menu */}
        <nav className="p-4 space-y-2 overflow-y-auto h-[calc(100vh-80px)]">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => handleNavigation(item.path)}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-foreground hover:bg-blue-50 hover:text-blue-600 transition-all"
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </button>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
