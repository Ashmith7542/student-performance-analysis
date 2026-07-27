import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import Navbar from "./components/Navbar";
import AppSidebar from "./components/AppSidebar";
import GeminiChatBot from "./components/GeminiChatBot";
import { useState } from "react";

// Auth Pages
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
// Student Pages
import StudentDashboard from "./pages/StudentDashboard";
import StudentTimetable from "./pages/StudentTimetable";
import StudentPermissions from "./pages/StudentPermissions";
import StudentMarks from "./pages/StudentMarks";
import StudentResults from "./pages/StudentResults";
import StudentPerformance from "./pages/StudentPerformance";
import StudentNotes from "./pages/StudentNotes";

// Teacher Pages
import TeacherDashboard from "./pages/TeacherDashboard";
import TeacherTimetable from "./pages/TeacherTimetable";
import TeacherPermissions from "./pages/TeacherPermissions";
import TeacherAttendance from "./pages/TeacherAttendance";
import TeacherUploadMarks from "./pages/TeacherUploadMarks";
import TeacherUploadNotes from "./pages/TeacherUploadNotes";
import TeacherStudentTracking from "./pages/TeacherStudentTracking";
import AdminDashboard from "./pages/AdminDashboard";

function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // make sure to consider if you need authentication for certain routes
  return (
    <div className="flex h-screen bg-background">
      <AppSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 flex flex-col overflow-hidden lg:ml-64">
        <Navbar onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
      <GeminiChatBot />
    </div>
  );
}

function Router() {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="mt-4 text-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <Switch>
        <Route path="/login-page" component={LoginPage} />
        <Route path="/signup-page" component={SignupPage} />
        <Route component={LoginPage} />
      </Switch>
    );
  }

  return (
    <ProtectedLayout>
      <Switch>
        {/* Student Routes */}
        <Route path="/student-dashboard" component={StudentDashboard} />
        <Route path="/student/timetable" component={StudentTimetable} />
        <Route path="/student/permissions" component={StudentPermissions} />
        <Route path="/student/marks" component={StudentMarks} />
        <Route path="/student/results" component={StudentResults} />
        <Route path="/student/performance" component={StudentPerformance} />
        <Route path="/student/notes" component={StudentNotes} />

        {/* Teacher Routes */}
        <Route path="/teacher-dashboard" component={TeacherDashboard} />
        <Route path="/teacher/timetable" component={TeacherTimetable} />
        <Route path="/teacher/permissions" component={TeacherPermissions} />
        <Route path="/teacher/attendance" component={TeacherAttendance} />
        <Route path="/teacher/upload-marks" component={TeacherUploadMarks} />
        <Route path="/teacher/upload-notes" component={TeacherUploadNotes} />
        <Route path="/teacher/student-tracking" component={TeacherStudentTracking} />

        {/* Admin Routes */}
        <Route path="/admin-dashboard" component={AdminDashboard} />

        {/* Fallback */}
        <Route component={NotFound} />
      </Switch>
    </ProtectedLayout>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
