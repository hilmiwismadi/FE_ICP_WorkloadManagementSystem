"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import SearchBar from "@/components/organisms/SearchBarActivity";
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
} from "recharts";
import Sidebar from "@/components/sidebar";
import ProtectedRoute from "@/components/protected-route";
import { jwtDecode } from "jwt-decode";
import axios from "axios";
import Cookies from "js-cookie";

interface Employee {
  employee_Id: string;
  name: string;
  role: string;
  team: string;
  current_Workload: number;
  taskCount?: number;
  workloadPercentage?: number;
}

interface Task {
  task_Id: string;
  type: string;
  status: string;
  workload: number;
  employee_Id: string;
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

const EmployeeMetricsCard = ({
  title,
  employees,
  type,
  onEmployeeClick,
}: {
  title: string;
  employees: Employee[];
  type: "top" | "bottom";
  onEmployeeClick: (employeeId: string) => void;
}) => (
  <Card className="w-full">
    <CardHeader>
      <CardTitle className="text-[1.25vw] font-semibold">{title}</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="space-y-[0.625vw] max-h-[13vw] overflow-y-auto pr-2">
        {employees.map((employee, index) => (
          <div
            key={employee.employee_Id}
            className="flex items-center justify-between py-[0.5vw] px-[1.5vw] bg-gray-50 rounded-[1vw] cursor-pointer hover:bg-gray-100 transition-colors duration-200"
            onClick={() => onEmployeeClick(employee.employee_Id)}
          >
            <div className="flex items-center gap-[0.8vw]">
              <span
                className={`text-[1vw] font-bold ${
                  type === "top" ? "text-red-500" : "text-green-500"
                }`}
              >
                #{index + 1}
              </span>
              <div>
                <p className="font-medium">{employee.name}</p>
                <p className="text-[0.8vw] text-gray-500">{employee.role}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-semibold">{employee.workloadPercentage}%</p>
              <p className="text-[0.8vw] text-gray-500">
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

      // Fetch employees for specific team (for top/bottom workload cards)
      const teamEmployeesResponse = await axios.get(
        `https://be-icpworkloadmanagementsystem.up.railway.app/api/emp/read/team/${encodeURIComponent(team)}`
      );

      // Fetch all employees for division metrics
      const allEmployeesResponse = await axios.get(
        "https://be-icpworkloadmanagementsystem.up.railway.app/api/emp/read"
      );
      
      const tasksResponse = await axios.get(
        "https://be-icpworkloadmanagementsystem.up.railway.app/api/task/read"
      );

      const teamEmployeesResult = await teamEmployeesResponse.data;
      const allEmployeesResult = await allEmployeesResponse.data;
      const tasksResult = await tasksResponse.data;

      const teamEmployeesData = teamEmployeesResult.data || teamEmployeesResult;
      const allEmployeesData = allEmployeesResult.data || allEmployeesResult;
      const tasksData = tasksResult.data || tasksResult;

      if (!Array.isArray(teamEmployeesData) || !Array.isArray(allEmployeesData)) {
        throw new Error("Invalid data format received from API");
      }

      // Process team employees for top/bottom cards
      const processedTeamEmployees = teamEmployeesData.map((emp: Employee) => {
        const employeeTasks = tasksData.filter(
          (task: Task) =>
            task.employee_Id === emp.employee_Id && task.status === "Ongoing"
        );

        return {
          ...emp,
          taskCount: employeeTasks.length,
          workloadPercentage: Math.round((emp.current_Workload / 15) * 100),
        };
      });

      const sortedEmployees = [...processedTeamEmployees].sort(
        (a, b) => (b.workloadPercentage || 0) - (a.workloadPercentage || 0)
      );

      setTopEmployees(sortedEmployees.slice(0, 5));
      setBottomEmployees([...sortedEmployees].reverse().slice(0, 5));

      // Process all employees for division metrics
      const divisionData: { [key: string]: number[] } = allEmployeesData.reduce(
        (acc: { [key: string]: number[] }, emp: Employee) => {
          if (!acc[emp.team]) {
            acc[emp.team] = [];
          }
          const workloadPercentage = Math.round((emp.current_Workload / 15) * 100);
          acc[emp.team].push(workloadPercentage);
          return acc;
        },
        {}
      );

      const divisionAverages = Object.entries(divisionData)
        .map(([name, workloads], index) => ({
          name,
          averageWorkload: Math.round(
            workloads.reduce((sum, val) => sum + val, 0) / workloads.length
          ),
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
        console.log("Decoded token data:", userData);
        console.log("Team from decoded token:", userData.team);
        setTeam(userData.team);
      } catch (error) {
        console.error("Error decoding auth token:", error);
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
      <div className="flex h-screen bg-gray-200">
        <Sidebar />
        <div className="flex-grow overflow-auto flex items-start justify-center">
          <div className="flex-1 max-h-screen py-[1vw] px-[1.667vw] ml-[0.417vw] w-[80vw] space-y-[0.5vw] transition-all duration-300 ease-in-out">
            <SearchBar />
            <div className="grid grid-cols-12 gap-[2vw]">
              <div className="col-span-12 md:col-span-4 space-y-[1vw]">
                <EmployeeMetricsCard
                  title="Employee with Highest Workload"
                  employees={topEmployees}
                  type="top"
                  onEmployeeClick={handleEmployeeClick}
                />
                <EmployeeMetricsCard
                  title="Employee with Lowest Workload"
                  employees={bottomEmployees}
                  type="bottom"
                  onEmployeeClick={handleEmployeeClick}
                />
              </div>

              <div className="col-span-12 md:col-span-8">
                <Card className="w-full h-full">
                  <CardHeader>
                    <CardTitle className="text-[1.25vw] font-semibold">
                      Division Performance Rankings
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="h-[30vw]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={divisionMetrics}
                        layout="vertical"
                        margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" domain={[0, 100]} />
                        <YAxis dataKey="name" type="category" />
                        <Tooltip />
                        <Bar dataKey="averageWorkload" radius={[0, 4, 4, 0]}>
                          {divisionMetrics.map((entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={getBarColor(index)}
                            />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
