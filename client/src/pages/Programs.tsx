import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Filter, Download, MoreVertical, Plus, Clock, Users } from "lucide-react";

const programsData = [
  {
    id: 1,
    name: "Compliance Training 2024",
    category: "Compliance",
    learners: 342,
    completion: 85,
    status: "Active",
    startDate: "Jan 15, 2024",
    endDate: "Dec 31, 2024",
  },
  {
    id: 2,
    name: "Leadership Development",
    category: "Professional Development",
    learners: 128,
    completion: 72,
    status: "Active",
    startDate: "Feb 01, 2024",
    endDate: "Jun 30, 2024",
  },
  {
    id: 3,
    name: "Technical Skills - Python",
    category: "Technical",
    learners: 95,
    completion: 58,
    status: "Active",
    startDate: "Mar 10, 2024",
    endDate: "Aug 31, 2024",
  },
  {
    id: 4,
    name: "Soft Skills Workshop",
    category: "Soft Skills",
    learners: 215,
    completion: 91,
    status: "Completed",
    startDate: "Jan 01, 2024",
    endDate: "Mar 31, 2024",
  },
  {
    id: 5,
    name: "Data Analytics Fundamentals",
    category: "Technical",
    learners: 87,
    completion: 45,
    status: "Active",
    startDate: "Apr 15, 2024",
    endDate: "Sep 30, 2024",
  },
];

export default function Programs() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-white sticky top-0 z-40">
        <div className="flex items-center justify-between p-6">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Programs</h1>
            <p className="text-sm text-muted-foreground mt-1">
              View and manage all training programs.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
            <Button size="sm">
              <Plus className="w-4 h-4 mr-2" />
              New Program
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="p-6">
            <p className="text-sm text-muted-foreground">Total Programs</p>
            <p className="text-3xl font-bold text-foreground mt-2">24</p>
          </Card>
          <Card className="p-6">
            <p className="text-sm text-muted-foreground">Active Programs</p>
            <p className="text-3xl font-bold text-foreground mt-2">18</p>
          </Card>
          <Card className="p-6">
            <p className="text-sm text-muted-foreground">Total Enrollments</p>
            <p className="text-3xl font-bold text-foreground mt-2">867</p>
          </Card>
          <Card className="p-6">
            <p className="text-sm text-muted-foreground">Avg. Completion</p>
            <p className="text-3xl font-bold text-foreground mt-2">70%</p>
          </Card>
        </div>

        {/* Programs Table */}
        <Card className="p-6">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-foreground">
                All Programs
              </h2>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search programs..."
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
                    Program Name
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-foreground">
                    Category
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-foreground">
                    Learners
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-foreground">
                    Completion
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-foreground">
                    Status
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-foreground">
                    Duration
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-foreground">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {programsData.map((program) => (
                  <tr
                    key={program.id}
                    className="border-b border-border hover:bg-muted/50 transition-colors"
                  >
                    <td className="py-4 px-4 font-medium text-foreground">
                      {program.name}
                    </td>
                    <td className="py-4 px-4 text-muted-foreground">
                      <span className="inline-block px-3 py-1 rounded-full text-xs bg-secondary/10 text-secondary-foreground">
                        {program.category}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-foreground flex items-center gap-2">
                      <Users className="w-4 h-4 text-muted-foreground" />
                      {program.learners}
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary transition-all"
                            style={{ width: `${program.completion}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium text-foreground">
                          {program.completion}%
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                          program.status === "Active"
                            ? "bg-primary/10 text-primary"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {program.status}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-sm text-muted-foreground flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {program.startDate} - {program.endDate}
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
