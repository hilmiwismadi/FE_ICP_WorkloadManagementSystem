"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import LoadingScreen from "@/components/organisms/LoadingScreen";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  LabelList,
} from "recharts";
import Sidebar from "@/components/sidebar";
import ProtectedRoute from "@/components/protected-route";
import { jwtDecode } from "jwt-decode";
import axios from "axios";
import Cookies from "js-cookie";
import DashboardMetrics from "./DashboardMetrics";

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

interface DivisionMetrics {
  name: string;
  averageWorkload: number;
  color: string;
}

interface JWTPayload {
  user_Id: string;
  email: string;
  role: string;
  employee_Id: string;
  team: string;
  iat: number;
  exp: number;
}

const getImageUrl = (imageUrl: string | undefined): string => {
  if (!imageUrl) {
    return "https://utfs.io/f/B9ZUAXGX2BWYfKxe9sxSbMYdspargO3QN2qImSzoXeBUyTFJ";
  }
  if (imageUrl.startsWith("http")) {
    return imageUrl;
  }
  if (imageUrl.startsWith("/uploads")) {
    return `https://be-icpworkloadmanagementsystem.up.railway.app/api${imageUrl}`;
  }
  return imageUrl;
};

const EmployeeMetricsCard = ({
  title,
  employees,
  type,
  onEmployeeClick,
  userRole,
}: {
  title: string;
  employees: Employee[];
  type: "top" | "bottom";
  onEmployeeClick: (employeeId: string) => void;
  userRole: string | null;
}) => (
  <Card className="w-full bg-white shadow-sm">
    <CardHeader className="pb-2">
      <CardTitle className="text-[0.9vw] font-medium text-gray-800">
        {title}
      </CardTitle>
      <div className="h-[1px] bg-gray-200 mt-2" />
    </CardHeader>
    <CardContent>
      <div className="space-y-[0.5vw] max-h-[13vw] overflow-y-auto pr-2 custom-scrollbar">
        {employees.map((employee, index) => (
          <div
            key={employee.employee_Id}
            className="flex items-center justify-between py-[0.6vw] px-[0.8vw] bg-gray-50 rounded-[0.3vw] cursor-pointer hover:bg-gray-100 transition-colors duration-200 group"
            onClick={() => onEmployeeClick(employee.employee_Id)}
          >
            <div className="flex items-center gap-[0.8vw]">
              <span
                className={`min-w-[1.2vw] text-center text-[0.75vw] font-medium ${
                  type === "top" ? "text-red-600" : "text-green-600"
                }`}
              >
                #{index + 1}
              </span>
              <div className="relative">
                <img
                  src={getImageUrl(employee.image)}
                  alt={employee.name}
                  className="w-[2.5vw] h-[2.5vw] rounded-full object-cover border-2 border-gray-200 group-hover:border-gray-300 transition-colors duration-200"
                />
                <div
                  className={`absolute bottom-0 right-0 w-[0.8vw] h-[0.8vw] rounded-full border-2 border-white ${
                    employee.current_Workload >= 0.8
                      ? "bg-red-500"
                      : employee.current_Workload >= 0.5
                      ? "bg-yellow-500"
                      : "bg-green-500"
                  }`}
                />
              </div>
              <div>
                <p className="text-[0.8vw] font-medium text-gray-700 line-clamp-1">
                  {employee.name}
                </p>
                <div className="flex items-center gap-[0.4vw]">
                  {userRole === "PIC" ? (
                    <span className="text-[0.7vw] text-gray-500 bg-gray-200 px-[0.4vw] py-[0.1vw] rounded-[0.2vw]">
                      {employee.skill || "No skill set"}
                    </span>
                  ) : (
                    <span className="text-[0.7vw] text-gray-500">
                      {employee.team}
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-[0.4vw] justify-end">
                <div className="w-[4vw] h-[0.4vw] bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      (employee.workloadPercentage ?? 0) >= 80
                        ? "bg-red-500"
                        : (employee.workloadPercentage ?? 0) >= 50
                        ? "bg-yellow-500"
                        : "bg-green-500"
                    }`}
                    style={{ width: `${employee.workloadPercentage}%` }}
                  />
                </div>
                <p className="text-[0.8vw] font-medium text-gray-700">
                  {employee.workloadPercentage}%
                </p>
              </div>
              <p className="text-[0.7vw] text-gray-500 mt-[0.2vw]">
                {employee.taskCount} tasks
              </p>
            </div>
          </div>
        ))}
      </div>
    </CardContent>
  </Card>
);

export default function ActivityPage() {
  const router = useRouter();
  const [topEmployees, setTopEmployees] = useState<Employee[]>([]);
  const [bottomEmployees, setBottomEmployees] = useState<Employee[]>([]);
  const [divisionMetrics, setDivisionMetrics] = useState<DivisionMetrics[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [team, setTeam] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [taskData, setTaskData] = useState<Task[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);

  const getBarColor = (index: number) => {
    const colors = ["#22c55e", "#eab308", "#ef4444"];
    return colors[index % colors.length];
  };

  const handleEmployeeClick = (employeeId: string) => {
    router.push(`/activity/${employeeId}`);
  };

  const fetchData = async () => {
    try {
      setIsLoading(true);
      if (!team) return;

      const fetchWithFallback = async (url: string) => {
        try {
          const response = await axios.get(url);
          return response.data.data || response.data;
        } catch (error: any) {
          if (error.response?.status === 404) {
            console.warn(`Data not found for ${url}`);
            return []; // Return empty array for 404 errors
          }
          throw error;
        }
      };

      // Fetch employees for the specific team (for top/bottom workload cards)
      const teamEmployeesData = await fetchWithFallback(
        `https://be-icpworkloadmanagementsystem.up.railway.app/api/emp/read/team/${encodeURIComponent(
          team
        )}`
      );

      // Fetch all employees for division metrics
      const allEmployeesData = await fetchWithFallback(
        "https://be-icpworkloadmanagementsystem.up.railway.app/api/emp/read"
      );

      // Fetch all tasks
      const allTasksData = await fetchWithFallback(
        "https://be-icpworkloadmanagementsystem.up.railway.app/api/task/read"
      );

      // Fetch tasks for the specific team
      const teamTasksData = await fetchWithFallback(
        `https://be-icpworkloadmanagementsystem.up.railway.app/api/task/read/team/${encodeURIComponent(
          team
        )}`
      );

      // Filter employees based on user role
      const filteredTeamEmployees =
        userRole === "Manager"
          ? allEmployeesData.filter((emp: Employee) => {
              const employeeRole = emp.users[0]?.role;
              return (
                employeeRole &&
                employeeRole !== "Manager" &&
                employeeRole !== "PIC"
              );
            })
          : teamEmployeesData.filter((emp: Employee) => {
              const employeeRole = emp.users[0]?.role;
              return (
                employeeRole &&
                employeeRole !== "Manager" &&
                employeeRole !== "PIC"
              );
            });

      setEmployees(filteredTeamEmployees || []);

      // Assign tasks data based on user role
      setTaskData(userRole === "Manager" ? allTasksData : teamTasksData);

      // Process all employees for division metrics
      const filteredAllEmployees = allEmployeesData.filter((emp: Employee) => {
        const employeeRole = emp.users[0]?.role;
        return (
          employeeRole && employeeRole !== "Manager" && employeeRole !== "PIC"
        );
      });

      if (
        !Array.isArray(filteredTeamEmployees) ||
        !Array.isArray(filteredAllEmployees)
      ) {
        throw new Error("Invalid data format received from API");
      }

      // Process team employees for top/bottom cards
      const processedTeamEmployees = filteredTeamEmployees.map(
        (emp: Employee) => {
          const employeeTasks = allTasksData.filter(
            (task: Task) =>
              task.assigns.some(
                (assign) => assign.employee_Id === emp.employee_Id
              ) && task.status === "Ongoing"
          );

          return {
            ...emp,
            taskCount: employeeTasks.length,
            workloadPercentage: Math.round(emp.current_Workload * 100),
          };
        }
      );

      const sortedEmployees = [...processedTeamEmployees].sort(
        (a, b) => (b.workloadPercentage || 0) - (a.workloadPercentage || 0)
      );

      setTopEmployees(sortedEmployees.slice(0, 5));
      setBottomEmployees([...sortedEmployees].reverse().slice(0, 5));

      // Process division metrics
      const divisionData: { [key: string]: number[] } =
        filteredAllEmployees.reduce(
          (acc: { [key: string]: number[] }, emp: Employee) => {
            if (!acc[emp.team]) {
              acc[emp.team] = [];
            }
            const workloadPercentage = Math.round(emp.current_Workload * 100);
            acc[emp.team].push(workloadPercentage);
            return acc;
          },
          {}
        );

      const divisionAverages = Object.entries(divisionData)
        .map(([name, workloads], index) => ({
          name,
          averageWorkload: workloads.length
            ? Math.round(
                workloads.reduce((sum, val) => sum + val, 0) / workloads.length
              )
            : 0,
          color: getBarColor(index),
        }))
        .sort((a, b) => b.averageWorkload - a.averageWorkload);

      setDivisionMetrics(divisionAverages);
      setError(null);
    } catch (error) {
      console.error("Error fetching data:", error);
      setError(
        error instanceof Error
          ? error.message
          : "An error occurred while fetching data"
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Effect to get team from auth token
  useEffect(() => {
    const authStorage = Cookies.get("auth_token");
    if (authStorage) {
      try {
        const userData: JWTPayload = jwtDecode(authStorage);
        setTeam(userData.team);
        setUserRole(userData.role);
      } catch (error) {
        // console.error("Error decoding auth token:", error);
      }
    }
  }, []);

  // Effect to fetch data when team is available
  useEffect(() => {
    if (team) {
      fetchData();
    }
  }, [team]);

  if (isLoading && !divisionMetrics.length) {
    return <LoadingScreen />;
  }

  if (error) {
    return (
      <div className="flex h-screen bg-gray-200">
        <Sidebar />
        <div className="flex-grow p-4">
          <Card className="w-full">
            <CardContent className="p-4">
              <p className="text-red-500">Error: {error}</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <div className="flex h-screen bg-gray-100">
        <Sidebar />
        <div className="flex-grow overflow-auto flex items-start justify-center">
          <div className="flex-1 max-h-screen py-[1.5vw] px-[1vw] ml-[0.417vw] space-y-[0.4vw]">
            <div className="grid grid-cols-12 gap-[1.5vw]">
              <div className="col-span-12 md:col-span-4 space-y-[0.8vw]">
                <EmployeeMetricsCard
                  title="Highest Workload Distribution"
                  employees={topEmployees}
                  type="top"
                  onEmployeeClick={handleEmployeeClick}
                  userRole={userRole}
                />
                <EmployeeMetricsCard
                  title="Lowest Workload Distribution"
                  employees={bottomEmployees}
                  type="bottom"
                  onEmployeeClick={handleEmployeeClick}
                  userRole={userRole}
                />
              </div>

              <div className="col-span-12 md:col-span-8">
                <Card className="w-full h-full bg-white shadow-sm">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-[0.9vw] font-medium text-gray-800">
                      Division Performance Overview
                    </CardTitle>
                    <div className="h-[1px] bg-gray-200 mt-2" />
                  </CardHeader>
                  <CardContent className="h-[30vw] mt-[2vw] px-[1vw] pb-0">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={divisionMetrics}
                        margin={{ top: 20, right: 30, left: 20, bottom: 10 }}
                      >
                        <CartesianGrid
                          strokeDasharray="3 3"
                          stroke="#e5e7eb"
                          horizontal={true}
                          vertical={false}
                        />
                        <XAxis
                          dataKey="name"
                          tick={{ fontSize: "0.7vw", fill: "#4b5563" }}
                          tickLine={false}
                          axisLine={{ stroke: "#e5e7eb" }}
                          interval={0}
                          padding={{ left: 10, right: 10 }}
                        />
                        <YAxis
                          type="number"
                          domain={[0, 100]}
                          tickFormatter={(value) => `${value}%`}
                          tick={{ fontSize: "0.7vw", fill: "#6b7280" }}
                          tickLine={false}
                          axisLine={false}
                          width={40}
                        />
                        <Tooltip
                          cursor={{ fill: "#f3f4f6" }}
                          contentStyle={{
                            fontSize: "0.7vw",
                            borderRadius: "0.3vw",
                            border: "1px solid #e5e7eb",
                            boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
                            padding: "0.5vw 0.8vw",
                          }}
                          formatter={(value) => [`${value}%`, "Workload"]}
                          labelStyle={{ color: "#374151", fontWeight: 500 }}
                        />
                        <Bar
                          dataKey="averageWorkload"
                          radius={[4, 4, 4, 4]}
                          maxBarSize={160}
                        >
                          {divisionMetrics.map((entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={getBarColor(index)}
                            />
                          ))}
                          {/* Add label on top of each bar */}
                          {divisionMetrics.map((entry, index) => (
                            <LabelList
                              key={`label-${index}`}
                              dataKey="averageWorkload"
                              position="top"
                              formatter={(value: any) => `${value}%`}
                              style={{
                                fontSize: "0.7vw",
                                fill: "#4b5563",
                                fontWeight: 500,
                              }}
                            />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>
              <DashboardMetrics
                employees={employees}
                tasks={taskData}
                userRole={userRole}
              />
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
