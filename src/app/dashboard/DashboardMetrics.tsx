import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
  Legend,
} from "recharts";
import { Users, Briefcase, AlertTriangle } from "lucide-react";

interface Employee {
  employee_Id: string;
  name: string;
  team: string;
  image?: string;
  skill: string;
  current_Workload: number;
  taskCount?: number;
  workloadPercentage?: number;
  users: Array<{
    email: string;
    role: string;
  }>;
}

interface Task {
  task_Id: string;
  type: string;
  status: string;
  workload: number;
  assigns: {
    employee_Id: string;
  }[];
}

interface WorkloadCategory {
  name: string;
  value: number;
  color: string;
}

interface TaskStatusCount {
  status: string;
  count: number;
  color: string;
}

interface DashboardMetricsProps {
  employees: Employee[];
  tasks: Task[];
  userRole: string | null;
}

const DashboardMetrics: React.FC<DashboardMetricsProps> = ({
  employees,
  tasks,
  userRole,
}) => {
  const getWorkloadCategories = (employees: Employee[]): WorkloadCategory[] => {
    const categories = {
      low: 0,
      medium: 0,
      high: 0,
    };

    employees.forEach((emp) => {
      const workload = emp.current_Workload * 100;
      if (workload < 50) categories.low++;
      else if (workload < 80) categories.medium++;
      else categories.high++;
    });

    return [
      { name: "Low Load (<50%)", value: categories.low, color: "#22c55e" },
      {
        name: "Medium Load (50-80%)",
        value: categories.medium,
        color: "#eab308",
      },
      { name: "High Load (>80%)", value: categories.high, color: "#ef4444" },
    ];
  };

  const getTasksByStatus = (tasks: Task[]): TaskStatusCount[] => {
    const statusCount = {
      Ongoing: 0,
      Done: 0,
      Approved: 0,
    };

    tasks.forEach((task) => {
      if (statusCount.hasOwnProperty(task.status)) {
        statusCount[task.status as keyof typeof statusCount]++;
      }
    });

    return [
      { status: "Ongoing", count: statusCount.Ongoing, color: "#f59e0b" }, // amber-500
      { status: "Done", count: statusCount.Done, color: "#3b82f6" }, // blue-500
      { status: "Approved", count: statusCount.Approved, color: "#22c55e" }, // green-500
    ];
  };

  return (
    <div className="col-span-12 mb-[1.5vw]">
      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-[1.5vw] mb-[1.5vw]">
        <Card className="bg-white shadow-sm">
          <CardContent className="flex items-center p-[1vw]">
            <div className="rounded-full p-[0.8vw] bg-blue-100">
              <Users className="w-[1.2vw] h-[1.2vw] text-blue-600" />
            </div>
            <div className="ml-[1vw]">
              <p className="text-[0.7vw] text-gray-500">
                Total Employees{" "}
                {userRole === "PIC" ? (
                  <strong>
                    (
                    {Array.from(new Set(employees.map((emp) => emp.team))).join(
                      ", "
                    )}
                    )
                  </strong>
                ) : null}
              </p>

              <h3 className="text-[1.2vw] font-semibold text-gray-900">
                {employees.length}
              </h3>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-sm">
          <CardContent className="flex items-center p-[1vw]">
            <div className="rounded-full p-[0.8vw] bg-green-100">
              <Briefcase className="w-[1.2vw] h-[1.2vw] text-green-600" />
            </div>
            <div className="ml-[1vw]">
              <p className="text-[0.7vw] text-gray-500">
                Active Tasks <strong>(Ongoing)</strong>
              </p>
              <h3 className="text-[1.2vw] font-semibold text-gray-900">
                {tasks.filter((t) => t.status === "Ongoing").length}
              </h3>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-sm">
          <CardContent className="flex items-center p-[1vw]">
            <div className="rounded-full p-[0.8vw] bg-red-100">
              <AlertTriangle className="w-[1.2vw] h-[1.2vw] text-red-600" />
            </div>
            <div className="ml-[1vw]">
              <p className="text-[0.7vw] text-gray-500">
                Employee with <strong>High Workload ({">"}80%)</strong>
              </p>
              <h3 className="text-[1.2vw] font-semibold text-gray-900">
                {employees.filter((e) => e.current_Workload >= 0.8).length}
              </h3>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-2 gap-[1.5vw]">
        {/* Workload Distribution Pie Chart */}
        <Card className="bg-white shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-[0.9vw] font-medium text-gray-800">
              Employee Workload Distribution
            </CardTitle>
            <div className="h-[1px] bg-gray-200 mt-2" />
          </CardHeader>
          <CardContent className="h-[20vw]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={getWorkloadCategories(employees)}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {getWorkloadCategories(employees).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    fontSize: "0.7vw",
                    borderRadius: "0.3vw",
                    border: "1px solid #e5e7eb",
                    boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
                    padding: "0.5vw 0.8vw",
                  }}
                />
                <Legend wrapperStyle={{ fontSize: "0.7vw" }} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Task Status Distribution Bar Chart */}
        <Card className="bg-white shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-[0.9vw] font-medium text-gray-800">
              Task Status Distribution
            </CardTitle>
            <div className="h-[1px] bg-gray-200 mt-2" />
          </CardHeader>
          <CardContent className="h-[20vw] mt-[0.8vw] pb-[0.3vw]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={getTasksByStatus(tasks)}
                margin={{ top: 20, right: 30, left: 0, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis
                  dataKey="status"
                  tick={{ fontSize: "0.7vw", fill: "#4b5563" }}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: "0.7vw", fill: "#6b7280" }}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    fontSize: "0.7vw",
                    borderRadius: "0.3vw",
                    border: "1px solid #e5e7eb",
                    boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
                    padding: "0.5vw 0.8vw",
                  }}
                />
                <Bar dataKey="count">
                  {getTasksByStatus(tasks).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DashboardMetrics;
