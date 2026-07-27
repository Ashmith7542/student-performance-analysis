import { useState } from "react";
import { useAuth, type UserRole } from "@/contexts/AuthContext";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { BookOpen } from "lucide-react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [selectedRole, setSelectedRole] = useState<UserRole>("student");

  const { login } = useAuth();
  const [, setLocation] = useLocation();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    login(email, password, selectedRole);
    setLocation(
      selectedRole === "student"
        ? "/student-dashboard"
        : "/teacher-dashboard"
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-8 shadow-xl">

        {/* Logo Section */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="p-3 bg-blue-600 rounded-lg">
            <BookOpen className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">SPP</h1>
            <p className="text-xs text-muted-foreground">
              Student Performance Predictor
            </p>
          </div>
        </div>

        {/* Welcome Text */}
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-foreground mb-2">
            Welcome Back
          </h2>
          <p className="text-sm text-muted-foreground">
            Sign in to your account to continue
          </p>
        </div>

        {/* Role Selection */}
        <div className="grid grid-cols-2 gap-3 mb-8">
          <button
            type="button"
            onClick={() => setSelectedRole("student")}
            className={`p-3 rounded-lg border-2 transition-all ${
              selectedRole === "student"
                ? "border-blue-600 bg-blue-50"
                : "border-border bg-background hover:border-blue-300"
            }`}
          >
            <p className="font-semibold text-sm text-foreground">Student</p>
          </button>

          <button
            type="button"
            onClick={() => setSelectedRole("teacher")}
            className={`p-3 rounded-lg border-2 transition-all ${
              selectedRole === "teacher"
                ? "border-blue-600 bg-blue-50"
                : "border-border bg-background hover:border-blue-300"
            }`}
          >
            <p className="font-semibold text-sm text-foreground">Teacher</p>
          </button>
        </div>

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Email Address
            </label>
            <Input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
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
              required
            />
          </div>

          <Button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
          >
            Sign In
          </Button>
        </form>

        {/* Signup Link */}
        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            Don't have an account?{" "}
            <a
              href="/signup"
              className="text-blue-600 hover:text-blue-700 font-semibold"
            >
              Sign up here
            </a>
          </p>
        </div>

      </Card>
    </div>
  );
}