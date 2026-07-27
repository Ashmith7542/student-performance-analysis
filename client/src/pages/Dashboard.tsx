import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  Users,
  BookOpen,
  TrendingUp,
  Award,
  Search,
  Filter,
  Download,
  MoreVertical,
} from "lucide-react";

// Sample data for charts
const trainingData = [
  { name: "Jan", completed: 65, inProgress: 45, notStarted: 30 },
  { name: "Feb", completed: 78, inProgress: 52, notStarted: 25 },
  { name: "Mar", completed: 92, inProgress: 48, notStarted: 18 },
  { name: "Apr", completed: 85, inProgress: 55, notStarted: 22 },
  { name: "May", completed: 98, inProgress: 42, notStarted: 15 },
  { name: "Jun", completed: 110, inProgress: 38, notStarted: 12 },
];

const programsData = [
  { name: "Compliance Training", value: 35, color: "#10B981" },
  { name: "Leadership Development", value: 28, color: "#6EE7B7" },
  { name: "Technical Skills", value: 22, color: "#A7F3D0" },
  { name: "Soft Skills", value: 15, color: "#D1FAE5" },
];

const learnerProgressData = [
  {
    id: 1,
    name: "John Smith",
    program: "Compliance Training",
    progress: 85,
    status: "In Progress",
  },
  {
    id: 2,
    name: "Sarah Johnson",
    program: "Leadership Development",
    progress: 100,
    status: "Completed",
  },
  {
    id: 3,
    name: "Michael Chen",
    program: "Technical Skills",
    progress: 60,
    status: "In Progress",
  },
  {
    id: 4,
    name: "Emma Davis",
    program: "Soft Skills",
    progress: 45,
    status: "In Progress",
  },
  {
    id: 5,
    name: "Robert Wilson",
    program: "Compliance Training",
    progress: 100,
    status: "Completed",
  },
];

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-white sticky top-0 z-40">
        <div className="flex items-center justify-between p-6">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Welcome back! Here's your learning analytics overview.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6">
        {/* Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Total Learners
                </p>
                <p className="text-3xl font-bold text-foreground mt-2">1,248</p>
                <p className="text-xs text-primary mt-2">↑ 12% from last month</p>
              </div>
              <div className="p-3 bg-primary/10 rounded-lg">
                <Users className="w-6 h-6 text-primary" />
              </div>
            </div>
          </Card>

          <Card className="p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Active Programs
                </p>
                <p className="text-3xl font-bold text-foreground mt-2">24</p>
                <p className="text-xs text-primary mt-2">↑ 3 new this month</p>
              </div>
              <div className="p-3 bg-primary/10 rounded-lg">
                <BookOpen className="w-6 h-6 text-primary" />
              </div>
            </div>
          </Card>

          <Card className="p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Completion Rate
                </p>
                <p className="text-3xl font-bold text-foreground mt-2">78%</p>
                <p className="text-xs text-primary mt-2">↑ 5% improvement</p>
              </div>
              <div className="p-3 bg-primary/10 rounded-lg">
                <TrendingUp className="w-6 h-6 text-primary" />
              </div>
            </div>
          </Card>

          <Card className="p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Certifications
                </p>
                <p className="text-3xl font-bold text-foreground mt-2">312</p>
                <p className="text-xs text-primary mt-2">↑ 28 this week</p>
              </div>
              <div className="p-3 bg-primary/10 rounded-lg">
                <Award className="w-6 h-6 text-primary" />
              </div>
            </div>
          </Card>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Training Progress Chart */}
          <Card className="lg:col-span-2 p-6">
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-foreground">
                Training Progress
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                Learner completion trends over time
              </p>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={trainingData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="name" stroke="#6B7280" />
                <YAxis stroke="#6B7280" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#FFFFFF",
                    border: "1px solid #E5E7EB",
                    borderRadius: "8px",
                  }}
                />
                <Legend />
                <Bar dataKey="completed" fill="#10B981" radius={[8, 8, 0, 0]} />
                <Bar dataKey="inProgress" fill="#6EE7B7" radius={[8, 8, 0, 0]} />
                <Bar
                  dataKey="notStarted"
                  fill="#D1FAE5"
                  radius={[8, 8, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          {/* Program Distribution */}
          <Card className="p-6">
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-foreground">
                Program Distribution
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                Enrollment by program type
              </p>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={programsData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {programsData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </div>

        {/* Learner Progress Table */}
        <Card className="p-6">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-foreground">
                Learner Progress
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                Individual learner completion status
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search learners..."
                  className="pl-10 w-64"
                />
              </div>
              <Button variant="outline" size="sm">
                <Filter className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 font-semibold text-foreground">
                    Learner Name
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-foreground">
                    Program
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-foreground">
                    Progress
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-foreground">
                    Status
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-foreground">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {learnerProgressData.map((learner) => (
                  <tr
                    key={learner.id}
                    className="border-b border-border hover:bg-muted/50 transition-colors"
                  >
                    <td className="py-4 px-4 text-foreground">{learner.name}</td>
                    <td className="py-4 px-4 text-muted-foreground">
                      {learner.program}
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary transition-all"
                            style={{ width: `${learner.progress}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium text-foreground">
                          {learner.progress}%
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                          learner.status === "Completed"
                            ? "bg-primary/10 text-primary"
                            : "bg-secondary/10 text-secondary-foreground"
                        }`}
                      >
                        {learner.status}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <button className="p-1 hover:bg-muted rounded-lg transition-colors">
                        <MoreVertical className="w-4 h-4 text-muted-foreground" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}
