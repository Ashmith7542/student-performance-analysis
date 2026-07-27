import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Download, Calendar } from "lucide-react";

const engagementData = [
  { week: "Week 1", engagement: 65, retention: 45 },
  { week: "Week 2", engagement: 72, retention: 52 },
  { week: "Week 3", engagement: 68, retention: 48 },
  { week: "Week 4", engagement: 85, retention: 65 },
  { week: "Week 5", engagement: 92, retention: 78 },
  { week: "Week 6", engagement: 88, retention: 72 },
];

const completionTrendData = [
  { month: "January", completions: 145 },
  { month: "February", completions: 168 },
  { month: "March", completions: 192 },
  { month: "April", completions: 215 },
  { month: "May", completions: 238 },
  { month: "June", completions: 267 },
];

const departmentPerformanceData = [
  { department: "Engineering", avgScore: 82, completion: 85 },
  { department: "Marketing", avgScore: 78, completion: 80 },
  { department: "Sales", avgScore: 75, completion: 72 },
  { department: "HR", avgScore: 88, completion: 92 },
  { department: "Finance", avgScore: 80, completion: 78 },
];

export default function Analytics() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-white sticky top-0 z-40">
        <div className="flex items-center justify-between p-6">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Analytics</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Detailed insights and performance metrics.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm">
              <Calendar className="w-4 h-4 mr-2" />
              Date Range
            </Button>
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="p-6">
            <p className="text-sm text-muted-foreground">Avg. Engagement</p>
            <p className="text-3xl font-bold text-foreground mt-2">81%</p>
            <p className="text-xs text-primary mt-2">↑ 8% from last period</p>
          </Card>
          <Card className="p-6">
            <p className="text-sm text-muted-foreground">Retention Rate</p>
            <p className="text-3xl font-bold text-foreground mt-2">72%</p>
            <p className="text-xs text-primary mt-2">↑ 5% from last period</p>
          </Card>
          <Card className="p-6">
            <p className="text-sm text-muted-foreground">Avg. Score</p>
            <p className="text-3xl font-bold text-foreground mt-2">80.6</p>
            <p className="text-xs text-primary mt-2">↑ 2.3 points</p>
          </Card>
          <Card className="p-6">
            <p className="text-sm text-muted-foreground">Time to Complete</p>
            <p className="text-3xl font-bold text-foreground mt-2">14.2h</p>
            <p className="text-xs text-primary mt-2">↓ 1.5h faster</p>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Engagement & Retention Trend */}
          <Card className="p-6">
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-foreground">
                Engagement & Retention Trend
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                Weekly performance metrics
              </p>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={engagementData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="week" stroke="#6B7280" />
                <YAxis stroke="#6B7280" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#FFFFFF",
                    border: "1px solid #E5E7EB",
                    borderRadius: "8px",
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="engagement"
                  stroke="#10B981"
                  strokeWidth={2}
                  dot={{ fill: "#10B981" }}
                />
                <Line
                  type="monotone"
                  dataKey="retention"
                  stroke="#6EE7B7"
                  strokeWidth={2}
                  dot={{ fill: "#6EE7B7" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </Card>

          {/* Completion Trend */}
          <Card className="p-6">
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-foreground">
                Completion Trend
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                Monthly course completions
              </p>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={completionTrendData}>
                <defs>
                  <linearGradient id="colorCompletions" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="month" stroke="#6B7280" />
                <YAxis stroke="#6B7280" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#FFFFFF",
                    border: "1px solid #E5E7EB",
                    borderRadius: "8px",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="completions"
                  stroke="#10B981"
                  fillOpacity={1}
                  fill="url(#colorCompletions)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </Card>
        </div>

        {/* Department Performance */}
        <Card className="p-6">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-foreground">
              Department Performance
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Average scores and completion rates by department
            </p>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={departmentPerformanceData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="department" stroke="#6B7280" />
              <YAxis stroke="#6B7280" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#FFFFFF",
                  border: "1px solid #E5E7EB",
                  borderRadius: "8px",
                }}
              />
              <Legend />
              <Bar dataKey="avgScore" fill="#10B981" radius={[8, 8, 0, 0]} />
              <Bar dataKey="completion" fill="#6EE7B7" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>
    </div>
  );
}
