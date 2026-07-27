import { useState } from "react";
import { useLocation } from "wouter";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export default function LoginPage() {
  const [, setLocation] = useLocation();
  const { login } = useAuth();

  const [role, setRole] = useState<"student" | "teacher" | "admin">("student");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      toast.error("Please fill in all fields");
      return;
    }

    setIsLoading(true);
    try {
      await login(email, password, role);
      toast.success("Login successful!");

      if (role === "student") {
        setLocation("/student-dashboard");
      } else if (role === "teacher") {
        setLocation("/teacher-dashboard");
      } else {
        setLocation("/admin-dashboard");
      }
    } catch (error: any) {
      toast.error(error.message || "Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-lg">
        <div className="p-8">

          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-blue-600 rounded-lg flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-bold text-white">📚</span>
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-2">SPP</h1>
            <p className="text-muted-foreground">
              Student Performance Predictor
            </p>
          </div>

          {/* Role Selection */}
          <div className="mb-6">
            <p className="text-sm font-medium text-foreground mb-3">
              Login as:
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setRole("student")}
                className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all ${
                  role === "student"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-foreground hover:bg-gray-200"
                }`}
              >
                Student
              </button>

              <button
                type="button"
                onClick={() => setRole("teacher")}
                className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all ${
                  role === "teacher"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-foreground hover:bg-gray-200"
                }`}
              >
                Teacher
              </button>

              <button
                type="button"
                onClick={() => setRole("admin")}
                className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all ${
                  role === "admin"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-foreground hover:bg-gray-200"
                }`}
              >
                Admin
              </button>
            </div>
          </div>

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Email
              </label>
              <Input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Password
              </label>
              <Input
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 flex items-center justify-center gap-2"
              disabled={isLoading}
            >
              {isLoading && (
                <Loader2 className="w-4 h-4 animate-spin" />
              )}
              {isLoading ? "Signing in..." : "Sign In"}
            </Button>
          </form>

          {/* Divider */}
          <div className="my-6 flex items-center gap-3">
            <div className="flex-1 h-px bg-border"></div>
            <span className="text-sm text-muted-foreground">or</span>
            <div className="flex-1 h-px bg-border"></div>
          </div>

          {/* Sign Up Link */}
          <p className="text-center text-sm text-muted-foreground">
            Don't have an account?{" "}
            <button
              type="button"
              onClick={() => setLocation("/signup-page")}
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              Sign up here
            </button>
          </p>

        </div>
      </Card>
    </div>
  );
}